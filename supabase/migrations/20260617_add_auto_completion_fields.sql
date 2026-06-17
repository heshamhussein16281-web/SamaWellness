-- Auto-Completion Fields Migration
-- Created: 2026-06-17
-- Purpose: Add session timing fields for automatic status transitions

-- ============================================================================
-- 1. EXTEND BOOKINGS TABLE WITH AUTO-COMPLETION FIELDS
-- ============================================================================

-- Add session timing fields
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS session_start_time TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS session_end_time TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS auto_completed_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS auto_completed BOOLEAN DEFAULT false;

-- Add indexes for auto-completion queries
CREATE INDEX IF NOT EXISTS idx_bookings_session_start_time ON bookings(session_start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_session_end_time ON bookings(session_end_time);
CREATE INDEX IF NOT EXISTS idx_bookings_auto_completed ON bookings(auto_completed);
CREATE INDEX IF NOT EXISTS idx_bookings_pending_auto_transition ON bookings(booking_status, session_start_time, session_end_time)
  WHERE booking_status IN ('scheduled', 'confirmed') OR (booking_status = 'active' AND auto_completed = false);

-- ============================================================================
-- 2. COMMENTS FOR CLARITY
-- ============================================================================

COMMENT ON COLUMN bookings.session_start_time IS 'Timestamp when the session starts. Used for auto-transition from booking_scheduled to active.';
COMMENT ON COLUMN bookings.session_end_time IS 'Timestamp when the session ends. Used for auto-transition from active to completed.';
COMMENT ON COLUMN bookings.auto_completed_at IS 'Timestamp when the booking was auto-completed (status transitioned to completed).';
COMMENT ON COLUMN bookings.auto_completed BOOLEAN IS 'Flag indicating if the booking was auto-completed (vs manually marked).';
