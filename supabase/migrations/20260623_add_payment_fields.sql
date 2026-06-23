-- Add simplified two-tier payment verification fields to clients table
-- Tier 1: Payment for first session booking (minimum 2000 EGP)
-- Tier 2: Additional payment if therapist rate is higher than tier 1

ALTER TABLE clients ADD COLUMN IF NOT EXISTS payment_verified_1 BOOLEAN DEFAULT false COMMENT 'Whether first session payment has been verified';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS payment_amount_1 DECIMAL(10, 2) COMMENT 'Amount paid for first session (tier 1)';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS payment_date_1 TIMESTAMPTZ COMMENT 'Date of first payment';

ALTER TABLE clients ADD COLUMN IF NOT EXISTS payment_verified_2 BOOLEAN DEFAULT false COMMENT 'Whether additional payment has been verified (if therapist rate > tier 1)';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS payment_amount_2 DECIMAL(10, 2) COMMENT 'Amount paid for additional payment (tier 2 difference)';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS payment_date_2 TIMESTAMPTZ COMMENT 'Date of second payment';

ALTER TABLE clients ADD COLUMN IF NOT EXISTS total_payment_due DECIMAL(10, 2) COMMENT 'Total amount due (therapist hourly rate)';

-- Create indexes for payment lookups
CREATE INDEX IF NOT EXISTS idx_clients_payment_verified_1 ON clients(payment_verified_1);
CREATE INDEX IF NOT EXISTS idx_clients_payment_verified_2 ON clients(payment_verified_2);
CREATE INDEX IF NOT EXISTS idx_clients_total_payment_due ON clients(total_payment_due);
