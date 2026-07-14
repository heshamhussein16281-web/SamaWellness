-- Add clinic_id to bookings table
-- Fixes queries in clinic bookings endpoint and available-slots endpoint
-- that filter by clinic_id

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS clinic_id BIGINT REFERENCES clinics(id) ON DELETE CASCADE
  COMMENT 'Which clinic this booking is for. Enables querying all bookings for a clinic.';

-- Index for efficient clinic-level queries
CREATE INDEX IF NOT EXISTS idx_bookings_clinic_id ON bookings(clinic_id);

-- Index for clinic + date range queries (used by available-slots)
CREATE INDEX IF NOT EXISTS idx_bookings_clinic_date ON bookings(clinic_id, session_date, booking_status);

-- Verify migration
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'bookings'
AND column_name = 'clinic_id';
