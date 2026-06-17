# Auto-Completion Cron Job Setup

## Overview
The auto-completion system requires a background job to run periodically (every 1-5 minutes) to transition booking statuses:
- `booking_scheduled` → `active` (when session starts)
- `active` → `completed` (when session ends)

## API Endpoint
**URL:** `POST /api/admin/bookings/auto-transition`

**Authentication:** Requires `SUPABASE_SERVICE_ROLE_KEY` (backend-only, no JWT needed)

**Response:**
```json
{
  "success": true,
  "message": "Auto-transition completed. Transitioned X bookings.",
  "transitionedCount": 5,
  "timestamp": "2026-06-17T10:30:00Z"
}
```

---

## Setup Options

### Option 1: Vercel Cron Jobs (Recommended if deployed on Vercel)

1. Create `/app/api/cron/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const cronSecret = request.headers.get('authorization');
  if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/bookings/auto-transition`,
      { method: 'POST' }
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}
```

2. Configure in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

3. Set environment variables:
```
CRON_SECRET=your-secret-key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

---

### Option 2: External Cron Service (UptimeRobot, EasyCron, etc.)

1. Set `CRON_SECRET` in `.env.local`:
```
CRON_SECRET=your-secret-key
```

2. Configure external service to call:
```
POST https://yourdomain.com/api/admin/bookings/auto-transition
Headers:
  Authorization: Bearer your-secret-key
```

3. Set frequency: Every 5 minutes

---

### Option 3: Node.js Cron (For local development)

Install package:
```bash
npm install node-cron
```

Create `lib/cron.ts`:
```typescript
import cron from 'node-cron';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export function startCronJobs() {
  // Run auto-transition every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('[Cron] Running auto-transition job');
    
    // TODO: Implement the same logic as /api/admin/bookings/auto-transition
    // This is for development only. For production, use Vercel or external service.
  });
}
```

---

### Option 4: Supabase Edge Functions (Advanced)

If using Supabase, deploy as Edge Function:

1. Create `supabase/functions/auto-transition/index.ts`
2. Call it via cron using `pg_cron` extension

---

## Testing the Endpoint

### Manual Test (Development)
```bash
curl -X POST http://localhost:3000/api/admin/bookings/auto-transition \
  -H "Content-Type: application/json"
```

### With Vercel Cron
The cron job will automatically execute at the scheduled time.

### Check Logs
Monitor execution in:
- Vercel Dashboard → Cron Jobs
- Application logs
- Console output

---

## Monitoring

### Indicators of Success
- Bookings transition from `booking_scheduled` → `active` at session start
- Bookings transition from `active` → `completed` at session end
- `client_status_history` records created for each transition
- Recurring clients remain at `ready_for_booking` after session completion

### Troubleshooting

**Transitions not happening:**
1. Check cron job is configured and running
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
3. Check application logs for errors
4. Manually trigger: `POST /api/admin/bookings/auto-transition`

**Too many transitions:**
1. Reduce cron frequency (increase interval)
2. Add logging to track duplicate transitions

**Missed transitions:**
1. Increase cron frequency (run more often)
2. Ensure time zones are correctly configured

---

## Database Checks

View pending transitions:
```sql
-- Bookings waiting to transition to active
SELECT id, client_id, session_start_time, booking_status 
FROM bookings 
WHERE booking_status = 'scheduled' 
  AND session_start_time <= NOW()
  AND cancelled_at IS NULL;

-- Bookings waiting to transition to completed
SELECT id, client_id, session_end_time, booking_status 
FROM bookings 
WHERE booking_status = 'active' 
  AND session_end_time <= NOW()
  AND cancelled_at IS NULL;
```
