# Booking API 500 Error - Troubleshooting Guide

**Error:** `https://www.samawellnesstherapy.com/api/admin/bookings` returns HTTP 500

**Last Updated:** 2026-06-22

---

## 🎯 Root Cause

The API is trying to insert booking records into database columns that **may not exist** in your Supabase instance. This happens when Phase 4 migrations haven't been fully applied.

**What's Missing:**
- `payment_status` column
- `booking_status` column
- `payment_deadline` column
- `session_type` column
- `room_id` column

---

## 🔧 QUICK FIX (5 minutes)

### Step 1: Go to Supabase Dashboard

1. Open https://app.supabase.com
2. Select your project
3. Go to **SQL Editor** (left sidebar)

### Step 2: Run This Migration Script

Copy and paste **ALL** of this into the SQL Editor and click **Run**:

```sql
-- ============================================================================
-- ADD MISSING COLUMNS TO BOOKINGS TABLE
-- ============================================================================

-- Add payment_status column
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) 
  DEFAULT 'pending' 
  CHECK (payment_status IN ('pending', 'paid', 'refunded', 'charged', 'cancelled'));

-- Add payment_deadline column
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_deadline TIMESTAMPTZ;

-- Add booking_status column
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_status VARCHAR(50) 
  DEFAULT 'scheduled' 
  CHECK (booking_status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'expired'));

-- Add session_type column
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS session_type VARCHAR(50) 
  DEFAULT 'single' 
  CHECK (session_type IN ('single', 'group', 'couple'));

-- Add room_id column (foreign key to clinic_rooms)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS room_id UUID 
  REFERENCES clinic_rooms(id) ON DELETE SET NULL;

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_deadline ON bookings(payment_deadline);
CREATE INDEX IF NOT EXISTS idx_bookings_session_type ON bookings(session_type);
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY & POLICIES
-- ============================================================================

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS bookings_read_policy ON bookings;
DROP POLICY IF EXISTS bookings_insert_policy ON bookings;
DROP POLICY IF EXISTS bookings_update_policy ON bookings;

-- Create new policies
CREATE POLICY bookings_read_policy ON bookings
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY bookings_insert_policy ON bookings
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY bookings_update_policy ON bookings
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

COMMIT;
```

### Step 3: Verify the Schema

After running the migration, verify it worked by running this query:

```sql
-- Check that all required columns exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'bookings'
ORDER BY ordinal_position;
```

**Expected output should include:**
```
 column_name      | data_type   | is_nullable | column_default
──────────────────┼─────────────┼─────────────┼────────────────
 id               | bigint      | NO          |
 client_id        | bigint      | NO          |
 therapist_id     | bigint      | NO          |
 session_date     | timestamp   | NO          |
 duration_minutes | integer     | YES         | 50
 status           | varchar     | YES         | 'scheduled'
 notes            | text        | YES         |
 created_at       | timestamp   | YES         | now()
 updated_at       | timestamp   | YES         | now()
 payment_status   | varchar     | YES         | 'pending'        ✓ NEW
 booking_status   | varchar     | YES         | 'scheduled'      ✓ NEW
 payment_deadline | timestamptz | YES         |                  ✓ NEW
 session_type     | varchar     | YES         | 'single'         ✓ NEW
 room_id          | uuid        | YES         |                  ✓ NEW
```

### Step 4: Test Booking Again

Try booking a session through the dashboard. The 500 error should be gone! ✅

---

## 🐛 Still Getting 500 Error?

### A. Check Server Logs

The API now returns better error details. Look for:

```json
{
  "error": "Failed to create booking",
  "details": "specific database error message",
  "hint": "Check if all columns exist in bookings table",
  "code": "database error code"
}
```

**Common Error Codes:**
- `23502` = NOT NULL constraint violation (a required field is missing)
- `23503` = Foreign key violation (client_id or therapist_id doesn't exist)
- `23505` = Unique constraint violation
- `42703` = Column doesn't exist (migration wasn't applied correctly)

### B. Verify Prerequisites

Before booking, ensure:

1. **Client exists** with correct ID:
   ```sql
   SELECT id, name, status FROM clients WHERE id = <your_client_id>;
   ```

2. **Therapist exists** with correct ID:
   ```sql
   SELECT id, name FROM therapists WHERE id = <your_therapist_id>;
   ```

3. **Clinic exists** (if using clinic_id):
   ```sql
   SELECT id, name FROM clinics WHERE id = <your_clinic_id>;
   ```

4. **Room exists** (if selecting a room):
   ```sql
   SELECT id, room_name FROM clinic_rooms WHERE clinic_id = <your_clinic_id>;
   ```

### C. Check RLS Policies

If you're still getting permission errors, verify RLS policies:

```sql
SELECT policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'bookings';
```

Should show 3 policies:
- `bookings_read_policy` (SELECT)
- `bookings_insert_policy` (INSERT)
- `bookings_update_policy` (UPDATE)

---

## 📋 Booking Request Format

When testing via cURL or API client, send:

```json
POST /api/admin/bookings

{
  "client_id": 1,
  "therapist_id": 1,
  "session_date": "2026-06-25T14:00:00Z",
  "duration_minutes": 60,
  "session_type": "single",
  "clinic_id": 1,
  "room_id": "uuid-here-or-null",
  "notes": "Optional notes"
}
```

**Required fields:**
- `client_id` — Integer
- `therapist_id` — Integer
- `session_date` — ISO 8601 timestamp
- `duration_minutes` — Integer (minutes)
- `clinic_id` — Integer

**Optional fields:**
- `session_type` — "single" | "group" | "couple" (default: "single")
- `room_id` — UUID (from clinic_rooms table)
- `notes` — String

---

## 🚀 Alternative: Apply All Migrations

If you want to apply ALL pending migrations at once:

```bash
# Via Supabase CLI
supabase db push

# OR manually in SQL Editor, run all migration files in order:
# 1. 20260611_phase4_clinical_scheduling.sql
# 2. 20260617_add_auto_completion_fields.sql
# 3. 20260622_add_bookings_rls_policies.sql
```

---

## ✅ Verification Checklist

After applying the fix, confirm:

- [ ] All 5 new columns exist in bookings table
- [ ] Indexes are created (check Performance → Indexes in Supabase)
- [ ] RLS is enabled on bookings table
- [ ] RLS policies include authenticated users
- [ ] Test booking goes through without 500 error
- [ ] Booking appears in client's record with `booking_scheduled` status
- [ ] Session time shows correctly in dashboard

---

## 📞 Support

If issues persist:

1. **Check git logs:** `git log --oneline | head -5` (should include recent booking fixes)
2. **Verify environment:** Check `.env.local` has correct `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
3. **Check recent commits:** Latest should include enhanced error logging
4. **Run:** `npm run build` to ensure no TypeScript errors

---

**Last Modified:** 2026-06-22  
**API Endpoint:** `/api/admin/bookings`  
**Status:** Fixed with enhanced error logging (commit: 095fad1)
