# Apply Database Migrations to Supabase

Your intake form is failing because the database is missing required columns. These steps will fix it.

## Required Columns for Intake Form

The intake form needs these columns to exist in the `clients` table:
- `gender` VARCHAR(50)
- `language` VARCHAR(255)
- `concern` TEXT
- `preferences` TEXT
- `status` VARCHAR(50) ← **CRITICAL: This replaced `stage` for new features**
- `client_since` TIMESTAMPTZ
- `is_recurring` BOOLEAN

## How to Apply Migrations

### Via Supabase Dashboard (Easiest)

1. Go to: https://app.supabase.com/projects
2. Click your project: `aelgbqybcvmuzlbmkwia`
3. Go to **SQL Editor** → **New Query**
4. Copy-paste migrations in this order:

**1. First - Clinical Intake Fields:**
```sql
-- File: supabase/migrations/20260614_add_intake_clinical_fields.sql
ALTER TABLE clients ADD COLUMN IF NOT EXISTS gender VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS language VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS concern TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS preferences TEXT;
CREATE INDEX IF NOT EXISTS idx_clients_gender ON clients(gender);
CREATE INDEX IF NOT EXISTS idx_clients_language ON clients(language);
```

Click **Execute**. Wait for success.

**2. Second - Phase 4 Clinical Scheduling:**
```sql
-- File: supabase/migrations/20260611_phase4_clinical_scheduling.sql
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'intake' CHECK (status IN ('intake', 'assessment_pending', 'ready_for_booking', 'booking_scheduled', 'payment_pending', 'active', 'completed', 'inactive', 'booking_expired'));
ALTER TABLE clients ADD COLUMN IF NOT EXISTS last_session_date TIMESTAMPTZ;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS total_sessions_completed INT DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS total_amount_paid DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS client_since TIMESTAMPTZ DEFAULT now();
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_is_recurring ON clients(is_recurring);
CREATE INDEX IF NOT EXISTS idx_clients_client_since ON clients(client_since);
```

Click **Execute**. Wait for success.

**3. Third - RLS Policies:**
```sql
-- File: supabase/migrations/20260618_add_clients_rls_policies.sql
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS clients_read_policy ON clients
  FOR SELECT
  USING (true);
CREATE POLICY IF NOT EXISTS clients_insert_policy ON clients
  FOR INSERT
  WITH CHECK (true);
CREATE POLICY IF NOT EXISTS clients_update_policy ON clients
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
CREATE POLICY IF NOT EXISTS clients_delete_policy ON clients
  FOR DELETE
  USING (true);
```

Click **Execute**. Wait for success.

## Verify the Fix

1. Go back to your app: http://localhost:3002
2. Go to **Clients** → **+ New Client Intake**
3. Fill out the form:
   - Name: Test Client
   - Phone: 01001234567 (11 digits)
   - Therapist Route: Assessment
   - Click Submit
4. Go to **Clients** list and verify the new client appears

If you see the client in the list, the fix worked!

## Troubleshooting

**"Column already exists" errors?**
- The migration uses `IF NOT EXISTS`, so if columns exist, they'll be skipped. That's fine.

**"Still not working"?**
- Verify in Supabase Dashboard → **Table Editor** → `clients` table
- Look for columns: `status`, `client_since`, `gender`, `language`, `concern`, `preferences`
- If they're missing, the migration didn't apply. Try again.

**"Connection refused"?**
- Restart your dev server: `npm run dev`
- Check `http://localhost:3002` is accessible
