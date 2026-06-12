# Quick Deployment Guide - Phase 4 & 5

## ⚡ Fastest Method: Supabase Dashboard (2 minutes)

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com/project/aelgbqybcvmuzlbmkwia/sql
   - Login with your account

2. **Create Query 1: Clinics Table**
   - Click "New query"
   - Paste this SQL:

```sql
CREATE TABLE IF NOT EXISTS clinics (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_clinics_name ON clinics(name);
CREATE INDEX IF NOT EXISTS idx_clinics_email ON clinics(email);
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
INSERT INTO clinics (name, location, email) VALUES ('Main Clinic', 'Cairo', 'info@sama-wellness.com') ON CONFLICT DO NOTHING;
```

   - Click **Run** or press `Ctrl+Enter`
   - Wait for success message ✅

3. **Create Query 2: Therapist Hourly Rate**
   - Click "New query"
   - Paste this SQL:

```sql
ALTER TABLE therapists ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2) DEFAULT 2000.00;
CREATE INDEX IF NOT EXISTS idx_therapists_hourly_rate ON therapists(hourly_rate);
UPDATE therapists SET hourly_rate = 3000 WHERE name LIKE 'Sama%' AND hourly_rate = 2000;
UPDATE therapists SET hourly_rate = 2000 WHERE hourly_rate IS NULL OR hourly_rate = 0;
```

   - Click **Run**
   - Wait for success ✅

4. **Create Query 3: Phase 4 & 5 Main Migration**
   - Click "New query"
   - Open this file: `supabase/migrations/20260611_phase4_clinical_scheduling.sql`
   - Copy ALL content (lines 1-203)
   - Paste into query editor
   - Click **Run**
   - Wait for success ✅ (this one is large, may take 10-20 seconds)

5. **Verify Deployment**
   - Click "New query"
   - Paste:
```sql
SELECT COUNT(*) as table_count FROM information_schema.tables 
WHERE table_schema='public' 
AND table_name IN ('therapist_availability', 'therapist_specializations', 
                    'clinic_rooms', 'session_notes', 'payment_records', 
                    'client_status_history');
```
   - Should return `6` ✅

---

## Alternative: Direct Database Connection (psql)

If you have psql installed:

```bash
# Get your connection string from Supabase settings
# Project Settings → Database → URI → Copy

export DB_URL="postgresql://postgres:YOUR_PASSWORD@db.aelgbqybcvmuzlbmkwia.supabase.co:5432/postgres"

# Run migrations
psql "$DB_URL" < supabase/migrations/20260609_create_clinics_table.sql
psql "$DB_URL" < supabase/migrations/20260611_add_therapist_hourly_rate.sql
psql "$DB_URL" < supabase/migrations/20260611_phase4_clinical_scheduling.sql

# Verify
psql "$DB_URL" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('therapist_availability', 'therapist_specializations', 'clinic_rooms', 'session_notes', 'payment_records', 'client_status_history');"
```

---

## After Deployment: 3 Quick Steps

### 1. Configure Cron Jobs

Add to `vercel.json`:

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

### 2. Deploy to Vercel

```bash
vercel deploy --prod
```

### 3. Test the System

Open your app and test:
- Create a new client (intake form)
- View client profile
- Check available slots
- Create a booking

---

## Troubleshooting

**Error: "relation clinics does not exist"**
- Verify Query 1 ran successfully
- Check in SQL editor: `SELECT * FROM clinics;`

**Error: "column already exists"**
- Migrations use `IF NOT EXISTS` and `IF NOT EXISTS`
- Safe to re-run

**Error: "foreign key constraint fails"**
- Make sure migrations ran in order: 1 → 2 → 3
- Clinics must exist before Phase 4 migration

**Cron jobs not working**
- Verify X-Cron-Secret header matches CRON_SECRET env var
- Check Vercel function logs

---

## ✅ Success Checklist

- [ ] Query 1 (Clinics) executed successfully
- [ ] Query 2 (Hourly rate) executed successfully
- [ ] Query 3 (Phase 4 & 5) executed successfully
- [ ] Verification query returned 6
- [ ] Cron jobs added to vercel.json
- [ ] Deployed to production
- [ ] Tested intake form
- [ ] Tested client profile
- [ ] Tested available slots

**You're done!** 🎉
