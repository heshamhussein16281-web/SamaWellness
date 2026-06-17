# Auto-Completion Implementation Guide

## Overview
This document outlines the complete implementation of automatic session status transitions for both new and recurring clients.

---

## Architecture

### Status Transitions

#### NEW CLIENTS (Assessment Route)
```
intake
  ↓ (Verify Payment)
assessment_pending
  ↓ (Sama completes assessment, assigns therapist)
ready_for_booking
  ↓ (Admin/Reception searches and books)
booking_scheduled
  ↓ [AUTO - when session_start_time passes]
active
  ↓ [AUTO - when session_end_time passes]
completed
```

#### NEW CLIENTS (Direct Selection Route)
```
intake
  ↓ (Verify Payment)
payment_verified
  ↓ (Book Session)
booking_scheduled
  ↓ [AUTO - when session_start_time passes]
active
  ↓ [AUTO - when session_end_time passes]
completed
```

#### RECURRING CLIENTS
```
[Search client with status: ready_for_booking]
  ↓ (Book Session)
booking_scheduled
  ↓ [AUTO - when session_start_time passes]
active
  ↓ [AUTO - when session_end_time passes]
completed
```

---

## Database Changes

### Migration File
**File:** `supabase/migrations/20260617_add_auto_completion_fields.sql`

**New Columns on `bookings` table:**
- `session_start_time` (TIMESTAMPTZ) - When session starts
- `session_end_time` (TIMESTAMPTZ) - When session ends
- `auto_completed_at` (TIMESTAMPTZ) - When auto-completed
- `auto_completed` (BOOLEAN) - Flag for auto vs manual completion

**New Indexes:**
- `idx_bookings_session_start_time`
- `idx_bookings_session_end_time`
- `idx_bookings_auto_completed`
- `idx_bookings_pending_auto_transition`

---

## API Endpoints

### 1. Create Booking (`POST /api/admin/bookings`)
**Updated to:**
- Calculate `session_start_time` from `session_date`
- Calculate `session_end_time` from `session_start_time + duration_minutes`
- Set both fields when creating booking

**File:** `app/api/admin/bookings/route.ts` (lines 106-129)

---

### 2. Auto-Transition (`POST /api/admin/bookings/auto-transition`)
**New endpoint for background jobs**

**File:** `app/api/admin/bookings/auto-transition/route.ts`

**Functionality:**
1. Finds `booking_scheduled` bookings where `session_start_time <= NOW()`
2. Transitions them to `active`
3. Finds `active` bookings where `session_end_time <= NOW()`
4. Transitions them to `completed`
5. Updates client records:
   - `last_session_date`
   - `total_sessions_completed`
   - `is_recurring` = true
   - `status` = 'completed'

**Logging:**
- Creates `client_status_history` entries for each transition
- Logs message: "Auto-transitioned when session started/ended"

**Security:**
- Uses `SUPABASE_SERVICE_ROLE_KEY` (backend-only)
- No JWT verification required
- Can be called by cron jobs or scheduled tasks

---

### 3. Manual Trigger (`POST /api/admin/test/trigger-auto-transition`)
**For testing auto-transitions without waiting for cron**

**File:** `app/api/admin/test/trigger-auto-transition/route.ts`

**Requirements:**
- JWT authentication required
- Requires `manage_bookings` or `view_all_clients` permission

**Response:**
```json
{
  "success": true,
  "message": "Manual auto-transition triggered",
  "result": {
    "success": true,
    "message": "Auto-transition completed. Transitioned X bookings.",
    "transitionedCount": 5,
    "timestamp": "2026-06-17T10:30:00Z"
  }
}
```

---

## Component Updates

### BookingCalendarModal.tsx
**File:** `app/dashboard/clinical/clients/BookingCalendarModal.tsx` (line 198)

**Change:**
```typescript
// BEFORE
status: isRecurring ? 'booking_scheduled' : 'payment_pending',

// AFTER
status: 'booking_scheduled',
```

**Reason:** Both new and recurring clients transition to `booking_scheduled` after booking

---

## Scheduler Setup

### Option 1: Vercel Cron (Recommended)
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/admin/bookings/auto-transition",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### Option 2: External Service
Configure UptimeRobot, EasyCron, or similar to call:
```
POST /api/admin/bookings/auto-transition
Every 5 minutes
```

### Option 3: Node.js Cron (Development)
Use `node-cron` package to schedule locally

---

## How It Works: Step-by-Step Example

### Scenario: New Client Books First Session

**Timeline:**
- **10:00 AM:** Reception books session for 2:00 PM today
  - `session_date` = "2026-06-17T14:00:00Z"
  - `duration_minutes` = 60
  - `session_start_time` = "2026-06-17T14:00:00Z"
  - `session_end_time` = "2026-06-17T15:00:00Z"
  - `booking_status` = "scheduled"
  - `client.status` = "booking_scheduled"

- **1:55 PM:** Cron job runs `/api/admin/bookings/auto-transition`
  - Checks: Are any `booking_scheduled` bookings past their `session_start_time`?
  - No matches yet

- **2:05 PM:** Cron job runs `/api/admin/bookings/auto-transition`
  - Checks: Are any `booking_scheduled` bookings past their `session_start_time`?
  - **MATCH!** Session starts at 2:00 PM, now 2:05 PM
  - Updates booking:
    - `booking_status` = "active"
    - `client.status` = "active"
  - Creates audit: "Auto-transitioned when session started"

- **3:05 PM:** Cron job runs `/api/admin/bookings/auto-transition`
  - Checks: Are any `active` bookings past their `session_end_time`?
  - **MATCH!** Session ends at 3:00 PM, now 3:05 PM
  - Updates booking:
    - `booking_status` = "completed"
    - `auto_completed` = true
    - `auto_completed_at` = "2026-06-17T15:05:00Z"
  - Updates client:
    - `status` = "completed"
    - `last_session_date` = "2026-06-17T15:05:00Z"
    - `total_sessions_completed` = 1
    - `is_recurring` = true
  - Creates audit: "Auto-transitioned when session ended"

---

## Testing

### Test 1: Manual Trigger
```bash
curl -X POST http://localhost:3000/api/admin/test/trigger-auto-transition \
  -H "Cookie: auth=your-jwt-token"
```

### Test 2: Check Pending Transitions
```sql
-- Find bookings ready to start
SELECT id, client_id, session_start_time, booking_status 
FROM bookings 
WHERE booking_status = 'scheduled' 
  AND session_start_time <= NOW()
  AND cancelled_at IS NULL;

-- Find bookings ready to complete
SELECT id, client_id, session_end_time, booking_status 
FROM bookings 
WHERE booking_status = 'active' 
  AND session_end_time <= NOW()
  AND cancelled_at IS NULL;
```

### Test 3: Monitor Audit Trail
```sql
SELECT * FROM client_status_history 
WHERE reason LIKE 'Auto-transitioned%'
ORDER BY created_at DESC
LIMIT 20;
```

---

## Monitoring & Alerts

### Key Metrics
1. Number of bookings auto-transitioned per run
2. Time between session start and transition to `active`
3. Time between session end and transition to `completed`
4. Failures in auto-transition process

### Recommended Checks
- Monitor cron job execution logs
- Alert if no transitions occur in 1 hour (possible cron failure)
- Alert if transition times are > 10 minutes off (timezone issue)

---

## Troubleshooting

### Auto-transitions not happening
1. **Check cron job is running:**
   - Vercel: Dashboard → Cron Jobs
   - External: Check service status

2. **Verify database fields exist:**
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'bookings' 
   AND column_name IN ('session_start_time', 'session_end_time');
   ```

3. **Check for cancelled bookings:**
   ```sql
   SELECT COUNT(*) FROM bookings 
   WHERE session_start_time <= NOW() 
   AND booking_status = 'scheduled' 
   AND cancelled_at IS NULL;
   ```

4. **Test manual trigger:**
   - Call `/api/admin/test/trigger-auto-transition`
   - Check response and logs

### Time zone issues
- Ensure all timestamps are stored in UTC (TIMESTAMPTZ)
- Verify cron job timezone matches database timezone
- Use `NOW()` (not `CURRENT_DATE`) in queries

### Delayed transitions
- Reduce cron interval (run more frequently)
- Check database query performance
- Monitor service response times

---

## Files Created/Updated

### New Files
1. `supabase/migrations/20260617_add_auto_completion_fields.sql`
2. `app/api/admin/bookings/auto-transition/route.ts`
3. `app/api/admin/test/trigger-auto-transition/route.ts`
4. `CRON_SETUP.md`
5. `AUTO_COMPLETION_IMPLEMENTATION.md` (this file)

### Updated Files
1. `app/api/admin/bookings/route.ts` - Added session time calculation
2. `app/dashboard/clinical/clients/BookingCalendarModal.tsx` - Fixed status setting

---

## Next Steps

1. **Deploy migration:** Run SQL migration against Supabase
2. **Deploy API changes:** Deploy updated booking endpoints
3. **Configure scheduler:** Set up cron job (Vercel or external)
4. **Test:** Use manual trigger to verify auto-transitions work
5. **Monitor:** Watch logs for successful transitions
6. **Complete Assessment Workflow:** Create endpoint to complete assessment and assign therapist

---

## Future Enhancements

1. **Email notifications:** Notify clients before session starts
2. **No-show handling:** Mark as cancelled if no-show detected
3. **Rescheduling:** Auto-suggest rescheduling for no-shows
4. **Payment reminders:** Auto-email 24hr before session for recurring clients
5. **Dashboard widget:** Show pending transitions and cron health

