-- Add recurring_client status to clients table constraint
-- This status is used for recurring clients who have completed a session
-- and are ready to book their next session

ALTER TABLE clients
DROP CONSTRAINT IF EXISTS clients_status_check;

ALTER TABLE clients
ADD CONSTRAINT clients_status_check CHECK (
  status IN (
    'intake',
    'assessment_pending',
    'ready_for_booking',
    'booking_scheduled',
    'payment_pending',
    'active',
    'completed',
    'inactive',
    'booking_expired',
    'recurring_client'
  )
);
