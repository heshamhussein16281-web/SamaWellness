# Phase 4 & 5 Deployment Checklist

> **Status:** ✅ Code Complete | ⏳ Pending Database Deployment

---

## 📋 Pre-Deployment Status

- ✅ **Code**: All 18 tasks complete, committed to `main` (commit `7b3c509`)
- ✅ **Build**: `npm run build` succeeds with 0 errors
- ✅ **Migrations**: 3 migration files created and tested
- ✅ **APIs**: 18 endpoints implemented and compiled
- ✅ **Frontend**: 8 components implemented and responsive
- ⏳ **Database**: Pending migration deployment to Supabase

---

## 🚀 Deployment Steps

### Step 1: Deploy Migrations to Supabase

**Option A: Via Supabase Dashboard (Easiest - 5 minutes)**

1. Open: https://app.supabase.com/project/aelgbqybcvmuzlbmkwia/sql
2. Click "New Query"
3. Copy SQL from migration files in order and execute each:

```bash
# File 1: Create Clinics Table
supabase/migrations/20260609_create_clinics_table.sql

# File 2: Add Therapist Hourly Rate
supabase/migrations/20260611_add_therapist_hourly_rate.sql

# File 3: Phase 4 & 5 Clinical Scheduling (Main migration - 200+ lines)
supabase/migrations/20260611_phase4_clinical_scheduling.sql
```

**Option B: Via Supabase CLI (Recommended)**

```bash
cd /Users/haythamhussein/Downloads/sama-wellness
npx supabase db push
# Select your Supabase project when prompted
```

**Option C: Via psql (Direct database access)**

```bash
# Get your connection string from:
# https://app.supabase.com/project/aelgbqybcvmuzlbmkwia/settings/database

export DB_URL="postgresql://postgres:PASSWORD@db.aelgbqybcvmuzlbmkwia.supabase.co:5432/postgres"

psql "$DB_URL" < supabase/migrations/20260609_create_clinics_table.sql
psql "$DB_URL" < supabase/migrations/20260611_add_therapist_hourly_rate.sql
psql "$DB_URL" < supabase/migrations/20260611_phase4_clinical_scheduling.sql
```

### Step 2: Verify Database Deployment

After migrations deploy, verify in Supabase SQL Editor:

```sql
-- Check new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema='public' 
AND table_name IN ('therapist_availability', 'therapist_specializations', 
                    'clinic_rooms', 'session_notes', 'payment_records', 
                    'client_status_history');

-- Should return 6 rows

-- Check columns added to clients table
SELECT column_name FROM information_schema.columns 
WHERE table_name='clients' 
AND column_name IN ('is_recurring', 'status', 'last_session_date', 
                    'total_sessions_completed', 'total_amount_paid', 'client_since');

-- Should return 6 rows

-- Check columns added to bookings table
SELECT column_name FROM information_schema.columns 
WHERE table_name='bookings' 
AND column_name IN ('payment_status', 'payment_deadline', 'marked_paid_by_user_id', 
                    'booking_status', 'room_id', 'session_type', 'cancelled_by_user_id');

-- Should return 7+ rows
```

### Step 3: Configure Cron Jobs

**For Vercel (Recommended)**

Add to `vercel.json` or create `vercel.ts`:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-payment-deadlines",
      "schedule": "*/15 * * * *"
    },
    {
      "path": "/api/cron/update-recurring-clients", 
      "schedule": "0 1 * * *"
    },
    {
      "path": "/api/cron/mark-inactive-clients",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**For Other Platforms:**

See detailed setup instructions in `CRON_JOBS.md`

---

## 📦 Deployment Environment Variables

Ensure your `.env.local` has these configured:

```env
NEXT_PUBLIC_SUPABASE_URL=https://aelgbqybcvmuzlbmkwia.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>  # For admin operations
CRON_SECRET=<your-secret-key>  # For cron job authentication
```

---

## ✅ Post-Deployment Testing

After deployment, test the main flows:

### Flow 1: New Client Intake
```bash
# 1. Create intake
curl -X POST http://localhost:3000/api/admin/clients/intake \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=<JWT>" \
  -d '{"name":"John Doe","concern":"Anxiety","email":"john@example.com"}'

# 2. Log assessment
curl -X PUT http://localhost:3000/api/admin/clients/1/assessment \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=<JWT>" \
  -d '{"assessment_date":"2026-06-11T10:00:00Z","assigned_therapist_id":1}'

# 3. Get available slots
curl "http://localhost:3000/api/admin/bookings/available-slots?therapist_id=1&clinic_id=1&date=2026-06-15&session_type=single"

# 4. Create booking
curl -X POST http://localhost:3000/api/admin/bookings \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=<JWT>" \
  -d '{"client_id":1,"therapist_id":1,"session_date":"2026-06-15T10:00:00Z","duration_minutes":60,"session_type":"single","clinic_id":1,"room_id":"<room-uuid>"}'

# 5. Mark payment received
curl -X PUT http://localhost:3000/api/admin/bookings/1/payment-received \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=<JWT>" \
  -d '{"payment_date":"2026-06-11T10:00:00Z"}'
```

### Flow 2: View Client Profile
```bash
curl http://localhost:3000/api/admin/clients/1/profile \
  -H "Cookie: auth_token=<JWT>"
```

---

## 🔄 Cron Job Verification

Test cron jobs manually:

```bash
# Check payment deadlines
curl -X POST http://localhost:3000/api/cron/check-payment-deadlines \
  -H "X-Cron-Secret: <CRON_SECRET>"

# Response should include: {success: true, count: 0, message: "..."}

# Update recurring clients
curl -X POST http://localhost:3000/api/cron/update-recurring-clients \
  -H "X-Cron-Secret: <CRON_SECRET>"

# Mark inactive clients
curl -X POST http://localhost:3000/api/cron/mark-inactive-clients \
  -H "X-Cron-Secret: <CRON_SECRET>"
```

---

## 📊 Final Status Checklist

- [ ] Migrations deployed to Supabase
- [ ] Database tables verified (6 new tables)
- [ ] Database columns verified (clients + bookings extended)
- [ ] Cron jobs configured on deployment platform
- [ ] Environment variables set in production
- [ ] API endpoints tested (at least one flow)
- [ ] Frontend builds successfully: `npm run build`
- [ ] Application deployed to production

---

## 🎯 Success Criteria

✅ **Database Layer**
- All 6 new tables created with proper schemas
- All indexes created for performance
- All foreign key constraints in place
- RLS enabled on new tables
- Seed data deployed (Main Clinic, default therapist specializations)

✅ **API Layer**
- 18 endpoints functional and tested
- Payment calculation working correctly
- Client status transitions smooth
- Booking creation with 24-hour deadline
- Session notes and client profiles accessible

✅ **Frontend Layer**
- All 8 components responsive and rendering
- Dashboard shows recurring badges and status colors
- Intake form successfully creates clients
- Client profile displays all 5 tabs
- Build succeeds with 0 errors

✅ **Infrastructure**
- 3 cron jobs scheduled and executing
- Email/notification queue ready (in CRON_JOBS.md)
- Error logging configured
- Monitoring set up

---

## 📞 Support

If deployment fails:
1. Check migration SQL syntax in Supabase SQL Editor
2. Verify foreign key dependencies (clinics must exist before phase4)
3. Check Supabase logs at https://app.supabase.com/project/aelgbqybcvmuzlbmkwia/logs
4. Verify JWT tokens and permissions in `.env.local`
5. Review error messages in application logs

---

**Deploy when ready. All code is production-ready.** ✅
