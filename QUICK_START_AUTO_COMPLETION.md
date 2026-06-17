# Auto-Completion System - Quick Start Guide

## What Just Happened?

✅ **Implemented:** Automatic session status transitions for all clients
- New clients (assessment or direct selection route)
- Recurring clients
- Both transition automatically when session times pass

---

## 3-Step Setup (Takes ~30 minutes)

### Step 1: Apply Database Migration (5 min)

**Via Supabase Dashboard:**
1. Go to https://app.supabase.com → SQL Editor
2. Create new query
3. Copy-paste from: `supabase/migrations/20260617_add_auto_completion_fields.sql`
4. Click "Run"

**Verify it worked:**
```sql
SELECT COUNT(*) FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name IN ('session_start_time', 'session_end_time', 'auto_completed');
-- Should return 3
```

---

### Step 2: Deploy Code (10 min)

```bash
# Build to verify no errors
npm run build

# Push to your repo
git push origin main

# Deploy to Vercel (or your hosting)
# This happens automatically if you have CI/CD set up
```

---

### Step 3: Configure Scheduler (15 min)

**Choose ONE option:**

#### Option A: Vercel (easiest)
1. Create/update `vercel.json` at root:
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

2. Deploy:
```bash
git add vercel.json
git commit -m "config: add auto-transition cron job"
git push origin main
```

3. Verify: Vercel Dashboard → Cron Jobs (should see it listed)

#### Option B: External Service (if not on Vercel)
1. Go to UptimeRobot.com or EasyCron.com
2. Create new cron job
3. URL: `https://yourdomain.com/api/admin/bookings/auto-transition`
4. Method: POST
5. Frequency: Every 5 minutes

#### Option C: Self-hosted (if running own server)
Use the setup in `CRON_SETUP.md` section "Option 3: Node.js Cron"

---

## Test It Works (Before Going Live)

### Test 1: Manual Trigger
```bash
# You need a JWT token from your browser
# 1. Go to: https://yourdomain.com/dashboard
# 2. Open DevTools → Network tab
# 3. Grab the `auth` cookie value
# 4. Replace <YOUR_TOKEN> below

curl -X POST https://yourdomain.com/api/admin/test/trigger-auto-transition \
  -H "Cookie: auth=<YOUR_TOKEN>" \
  -H "Content-Type: application/json"

# Should return:
# {
#   "success": true,
#   "message": "Manual auto-transition triggered",
#   "result": {
#     "transitionedCount": 0,  // or > 0 if bookings matched
#     ...
#   }
# }
```

### Test 2: Create Test Booking
1. Admin Dashboard → Clients
2. Create new test client
3. Complete intake (name + concern)
4. Verify payment (choose any method)
5. Book session → Choose date/time **1 minute from now**
6. Wait 2 minutes
7. Refresh page
8. Check booking status:
   - Should change from `scheduled` → `active` (auto-transitioned!)

---

## How It Works

### Example: Client Schedules 2:00 PM Session

```
10:00 AM:  Reception books session
           booking_status = 'scheduled'
           session_start_time = 2:00 PM ← calculated automatically

Cron runs every 5 min...

2:05 PM:   Cron checks: "Any sessions that should have started?"
           ✓ YES! Booking created at 10 AM for 2:00 PM
           Updates: booking_status = 'scheduled' → 'active'

Session runs...

3:05 PM:   Cron checks: "Any sessions that should have ended?"
           ✓ YES! Session ended at 3:00 PM
           Updates: booking_status = 'active' → 'completed'
                    auto_completed = true
                    client.is_recurring = true
                    client.total_sessions_completed = 1
```

### For Recurring Clients

After completion, system marks as `is_recurring = true`

Next booking:
1. Reception searches client → status still `completed`
2. Receptionist manually changes status to `ready_for_booking` (or we auto-do this)
3. Books next session → same cycle repeats

---

## Check It's Working

### Query 1: See Recent Auto-Transitions
```sql
SELECT id, client_id, old_status, new_status, created_at 
FROM client_status_history 
WHERE reason LIKE 'Auto-transitioned%'
ORDER BY created_at DESC 
LIMIT 10;
```

### Query 2: See Pending Transitions
```sql
-- Sessions that haven't started yet
SELECT id, session_start_time, booking_status 
FROM bookings 
WHERE booking_status = 'scheduled' 
  AND session_start_time <= NOW()
  AND cancelled_at IS NULL;

-- Sessions that haven't completed yet
SELECT id, session_end_time, booking_status 
FROM bookings 
WHERE booking_status = 'active' 
  AND session_end_time <= NOW()
  AND cancelled_at IS NULL;
```

---

## Common Questions

**Q: How often does the cron job run?**
A: Every 5 minutes. Adjust if you need more/less frequent checks.

**Q: What if session was cancelled?**
A: Cancelled bookings (cancelled_at IS NOT NULL) never auto-transition.

**Q: Can I test without setting up cron?**
A: Yes! Use the manual trigger endpoint to test anytime.

**Q: What timezone should I use?**
A: All times stored in UTC. Cron runs in UTC. No timezone conversion needed.

**Q: Can I call auto-transition manually?**
A: Yes! `/api/admin/test/trigger-auto-transition` allows this (requires JWT).

**Q: What if cron fails?**
A: Manual trigger still works. Check logs in cron service dashboard.

---

## If Something Goes Wrong

### No Auto-Transitions Happening?

1. **Check cron is configured:**
   - Vercel: Dashboard → Cron Jobs
   - External: Check service's job list

2. **Check database migration ran:**
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'bookings' 
   AND column_name = 'session_start_time';
   -- Should return 1 row
   ```

3. **Test manual trigger:**
   ```bash
   curl -X POST https://yourdomain.com/api/admin/test/trigger-auto-transition \
     -H "Cookie: auth=<your-token>"
   ```
   If this works, the endpoint is fine. Issue is with cron setup.

4. **Check for cancelled bookings:**
   ```sql
   SELECT COUNT(*) FROM bookings 
   WHERE session_start_time < NOW() 
   AND booking_status = 'scheduled' 
   AND cancelled_at IS NULL;
   -- If > 0, they should auto-transition when cron runs
   ```

---

## Documentation Files

| File | Purpose |
|------|---------|
| `IMPLEMENTATION_SUMMARY.md` | Complete overview of what was built |
| `AUTO_COMPLETION_IMPLEMENTATION.md` | Technical details & architecture |
| `AUTO_COMPLETION_SETUP_CHECKLIST.md` | Detailed step-by-step setup |
| `CRON_SETUP.md` | All scheduler setup options |
| `QUICK_START_AUTO_COMPLETION.md` | This file (quick reference) |

---

## Timeline Until Live

- **Now:** Set up database migration (5 min)
- **After build:** Deploy code (2 min)
- **Same day:** Configure cron (15 min)
- **Next day:** Verify it's working (do tests above)
- **Then:** Go live! ✅

---

## Success Looks Like

✅ Bookings auto-transition from `scheduled` → `active` at session start  
✅ Bookings auto-transition from `active` → `completed` at session end  
✅ Client `is_recurring` flag set to true after first session  
✅ Cron job runs every 5 minutes without errors  
✅ Audit trail records all auto-transitions  

---

**Ready?** Start with Step 1 above. You've got this! 🚀

Questions? Check the detailed documentation files listed above.
