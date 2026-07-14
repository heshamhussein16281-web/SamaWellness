-- Phase 6: Slot Reservation & Hold System (10-minute timeout)
-- Created: 2026-07-13
-- Purpose: Add support for draft bookings with 10-minute hold before payment verification
--
-- WORKFLOW:
-- 1. Reception selects slot → creates booking with booking_status='draft', hold_expires_at=NOW+10min
-- 2. Shows PaymentVerificationModal
-- 3. If verified within 10min → booking_status='confirmed', hold_expires_at=NULL
-- 4. If NOT verified within 10min → booking shows as pending verification
-- 5. Reception must explicitly verify or release (no auto-release)

-- ============================================================================
-- 1. UPDATE BOOKING_STATUS ENUM TO INCLUDE 'draft' STATE
-- ============================================================================

-- Note: We need to drop and recreate the CHECK constraint to add 'draft'
-- First, get all existing bookings data
-- Then drop the old constraint and add new one with 'draft' included

-- Step 1: Drop the existing CHECK constraint on booking_status
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_booking_status_check;

-- Step 2: Add new CHECK constraint with 'draft' state for temporary holds
ALTER TABLE bookings ADD CONSTRAINT bookings_booking_status_check
  CHECK (booking_status IN ('draft', 'scheduled', 'confirmed', 'completed', 'cancelled', 'expired'));

-- Comment explaining the new 'draft' state
COMMENT ON COLUMN bookings.booking_status IS
'Status of the booking:
- draft: Slot selected by reception, held for 10 minutes pending payment verification
- scheduled: Booking confirmed and scheduled
- confirmed: Payment verified, booking confirmed (alias for scheduled)
- completed: Session has occurred
- cancelled: Booking was cancelled
- expired: Hold expired without payment verification';

-- ============================================================================
-- 2. ADD HOLD_EXPIRES_AT COLUMN
-- ============================================================================

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS hold_expires_at TIMESTAMPTZ
  COMMENT 'When the draft booking hold expires (NULL if not in draft state). Used for 10-minute timeout after slot selection.';

-- Index for efficient pending verification queries
CREATE INDEX IF NOT EXISTS idx_bookings_draft_pending ON bookings(booking_status, hold_expires_at, payment_status)
  WHERE booking_status = 'draft' AND payment_status != 'paid';

COMMENT ON INDEX idx_bookings_draft_pending IS
'Index for finding pending verifications: draft bookings where hold has expired and payment not verified';

-- Index for excluding held slots from available slots query
CREATE INDEX IF NOT EXISTS idx_bookings_held_slots ON bookings(therapist_id, session_date, start_time)
  WHERE booking_status IN ('draft', 'confirmed') AND hold_expires_at > CURRENT_TIMESTAMP;

COMMENT ON INDEX idx_bookings_held_slots IS
'Index for excluding currently-held slots from available slots query';

-- ============================================================================
-- 3. ADD CONFIRMED_AT FIELD (optional but helpful for audit)
-- ============================================================================

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ
  COMMENT 'When the booking was confirmed (payment verified). NULL until payment verified.';

-- ============================================================================
-- 4. VERIFICATION
-- ============================================================================

-- Verify migration
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'bookings'
AND column_name IN ('booking_status', 'hold_expires_at', 'confirmed_at')
ORDER BY ordinal_position;
