-- Add new fields for payment verification workflow for new clients

-- Add is_new_client flag to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_new_client BOOLEAN DEFAULT true;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS first_booking_completed_at TIMESTAMP;

-- Add hold tracking to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS hold_created_at TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS hold_expires_at TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS expiry_confirmed_at TIMESTAMP;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS expiry_confirmed_by VARCHAR(255);

-- Create pending_expiry table to track holds awaiting confirmation
CREATE TABLE IF NOT EXISTS pending_expiry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now(),
  status VARCHAR(50) DEFAULT 'awaiting_confirmation',
  notified_at TIMESTAMP,
  resolved_at TIMESTAMP
);

-- Index for efficient queries
CREATE INDEX IF NOT EXISTS idx_pending_expiry_status ON pending_expiry(status);
CREATE INDEX IF NOT EXISTS idx_pending_expiry_booking ON pending_expiry(booking_id);
CREATE INDEX IF NOT EXISTS idx_bookings_hold_expires ON bookings(hold_expires_at) WHERE status = 'H';
