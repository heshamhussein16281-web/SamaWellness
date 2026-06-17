# Auto-Completion System Setup Checklist

## ✅ Implementation Complete
- [x] Database migration file created
- [x] Auto-transition API endpoint created
- [x] Manual trigger endpoint created (for testing)
- [x] Booking creation updated to calculate session times
- [x] BookingCalendarModal updated to set correct status
- [x] TypeScript compilation successful

---

## 🔧 Setup Steps (Required)

### Step 1: Apply Database Migration
Run this SQL migration against your Supabase database:

```bash
# Option 1: Via Supabase Dashboard
# 1. Go to Supabase Dashboard → SQL Editor
# 2. Create new query
# 3. Copy contents of: supabase/migrations/20260617_add_auto_completion_fields.sql
# 4. Run query

# Option 2: Via CLI
supabase migration up
```

**Verify migration succeeded:**
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name IN ('session_start_time', 'session_end_time', 'auto_completed');
-- Should return 3 rows
```

---

### Step 2: Deploy Code
```bash
# Commit changes
git add .
git commit -m "feat: implement auto-completion for client sessions

- Add session_start_time and session_end_time to bookings
- Create auto-transition endpoint for scheduled status changes
- Update booking creation to calculate session times
- Add manual trigger endpoint for testing
- Both new and recurring clients auto-complete sessions"

# Push to production
git push origin main
```

---

### Step 3: Configure Scheduler/Cron Job

#### Option A: Vercel (if deployed on Vercel)
1. Create/update `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/admin/bookings/auto-transition",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

2. Deploy with Vercel CLI:
```bash
vercel deploy
```

3. Verify in Vercel Dashboard → Cron Jobs

#### Option B: External Service (UptimeRobot, EasyCron, etc.)
1. Create account on cron service
2. Add new cron job:
   - **URL:** `https://yourdomain.com/api/admin/bookings/auto-transition`
   - **Method:** POST
   - **Frequency:** Every 5 minutes
   - **Headers:** None (no auth required for this endpoint)

#### Option C: Self-Hosted Server
1. Use `node-cron` or similar package
2. Create scheduler script
3. Run on your server

---

### Step 4: Test Auto-Completion
```bash
# Manual test (before cron is set up)
curl -X POST http://localhost:3000/api/admin/test/trigger-auto-transition \
  -H "Cookie: auth=<your-jwt-token>"
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Manual auto-transition triggered",
  "result": {
    "success": true,
    "message": "Auto-transition completed. Transitioned X bookings.",
    "transitionedCount": 0,
    "timestamp": "2026-06-17T..."
  }
}
```

---

### Step 5: Monitor System
Create a test booking:
1. Admin dashboard → Clients
2. Create new test client
3. Complete intake and payment verification
4. Book a session for 1 minute from now
5. Wait 2 minutes
6. Check client status (should auto-transition to `active`)
7. Book another session and monitor `booking_status` changes

---

## 🧪 Testing Checklist

### Test 1: Session Auto-Start
- [ ] Book session for 1 minute from now
- [ ] Verify `booking_status` = `scheduled`
- [ ] Wait 2 minutes
- [ ] Refresh page
- [ ] Verify `booking_status` → `active`
- [ ] Verify `client.status` → `active`

### Test 2: Session Auto-Complete
- [ ] Book session for duration 1 minute, starting 1 minute from now
- [ ] Verify booking created with correct `session_start_time` and `session_end_time`
- [ ] Wait for auto-transition to `active`
- [ ] Wait for auto-transition to `completed`
- [ ] Verify `auto_completed` = true
- [ ] Verify `client.is_recurring` = true

### Test 3: Recurring Booking
- [ ] Book a completed session for same client (should be `is_recurring` = true)
- [ ] Verify next booking automatically transitions
- [ ] Verify client ready for search again

### Test 4: Manual Trigger
- [ ] Create booking for 30 seconds ago
- [ ] Call `/api/admin/test/trigger-auto-transition`
- [ ] Verify booking auto-transitioned

---

## 📊 Monitoring Dashboard

### Check Cron Job Health
```sql
-- Sessions that should have started but haven't
SELECT id, client_id, session_start_time, booking_status 
FROM bookings 
WHERE booking_status = 'scheduled' 
  AND session_start_time < NOW() - INTERVAL '5 minutes'
  AND cancelled_at IS NULL
LIMIT 10;

-- Sessions that should be completed
SELECT id, client_id, session_end_time, booking_status 
FROM bookings 
WHERE booking_status = 'active' 
  AND session_end_time < NOW() - INTERVAL '5 minutes'
  AND cancelled_at IS NULL
LIMIT 10;
```

### Check Auto-Completion Activity
```sql
-- Bookings completed today
SELECT COUNT(*) as completed_today
FROM bookings 
WHERE auto_completed = true 
  AND DATE(auto_completed_at) = CURRENT_DATE;

-- Recent status transitions
SELECT 
  client_id, 
  old_status, 
  new_status, 
  reason, 
  created_at
FROM client_status_history 
WHERE reason LIKE 'Auto-transitioned%'
ORDER BY created_at DESC
LIMIT 20;
```

---

## 🚨 Troubleshooting

### Issue: Bookings not auto-transitioning

**Check 1: Is cron job configured?**
```bash
# Vercel
vercel env list  # Check if CRON_SECRET is set

# External: Check your cron service dashboard
```

**Check 2: Are session times calculated?**
```sql
SELECT id, session_date, session_start_time, session_end_time 
FROM bookings 
WHERE id = <booking_id>;
```

**Check 3: Manual trigger works?**
```bash
curl -X POST https://yourdomain.com/api/admin/test/trigger-auto-transition \
  -H "Cookie: auth=<token>"
```

**Check 4: Are bookings cancelled?**
```sql
SELECT id, session_start_time, cancelled_at 
FROM bookings 
WHERE booking_status = 'scheduled' 
  AND session_start_time < NOW();
-- If cancelled_at is NOT NULL, they won't auto-transition
```

---

## 📝 Documentation

Key files for reference:
- `AUTO_COMPLETION_IMPLEMENTATION.md` - Technical details
- `CRON_SETUP.md` - Scheduler setup options
- `supabase/migrations/20260617_add_auto_completion_fields.sql` - DB changes
- `app/api/admin/bookings/auto-transition/route.ts` - Auto-transition logic
- `app/api/admin/bookings/route.ts` - Booking creation with time calculation

---

## 🎉 Success Criteria

✅ System is working when:
1. New bookings have `session_start_time` and `session_end_time` calculated
2. Cron job runs every 5 minutes without errors
3. Bookings auto-transition from `scheduled` → `active` when time passes
4. Bookings auto-transition from `active` → `completed` when time passes
5. Client `is_recurring` flag set to true after first session completion
6. Client status history records auto-transitions with proper reason

---

## 💡 Notes

- **Time Zone:** All times are stored in UTC (TIMESTAMPTZ)
- **Cron Frequency:** 5-minute interval recommended (adjust based on precision needs)
- **Manual Trigger:** Can be called anytime to force transitions (useful for testing)
- **Cancellations:** Cancelled bookings (`cancelled_at IS NOT NULL`) are never auto-transitioned
- **Idempotent:** Safe to call multiple times (won't double-transition)

