-- Create payment_history table to track all client payments for accounting
CREATE TABLE IF NOT EXISTS payment_history (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  booking_id BIGINT REFERENCES bookings(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date TIMESTAMPTZ NOT NULL,
  payment_type VARCHAR(50) NOT NULL, -- 'assessment', 'session', 'remaining', 'refund'
  payment_method VARCHAR(50), -- 'cash', 'bank_transfer', 'credit_card', etc.
  verified BOOLEAN DEFAULT false,
  verified_by VARCHAR(255), -- admin user ID who verified
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for efficient queries
CREATE INDEX idx_payment_history_client ON payment_history(client_id);
CREATE INDEX idx_payment_history_booking ON payment_history(booking_id);
CREATE INDEX idx_payment_history_date ON payment_history(payment_date);
CREATE INDEX idx_payment_history_verified ON payment_history(verified);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_payment_history_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_history_update_timestamp
BEFORE UPDATE ON payment_history
FOR EACH ROW
EXECUTE FUNCTION update_payment_history_timestamp();
