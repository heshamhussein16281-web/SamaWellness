-- Add fields for two-tier payment verification system
-- Tier 1: Initial assessment payment (before assessment)
-- Tier 2: Therapist-specific payment (after therapist assignment)

ALTER TABLE clients ADD COLUMN IF NOT EXISTS assessment_payment_amount DECIMAL(10, 2) COMMENT 'Amount paid for initial assessment verification';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS assessment_payment_verified BOOLEAN DEFAULT false COMMENT 'Whether initial assessment payment has been verified';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS assessment_payment_date TIMESTAMPTZ COMMENT 'Date of initial assessment payment';

ALTER TABLE clients ADD COLUMN IF NOT EXISTS therapist_fee_payment_amount DECIMAL(10, 2) COMMENT 'Amount paid for therapist-specific fee (difference between therapist rate and assessment payment)';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS therapist_fee_payment_verified BOOLEAN DEFAULT false COMMENT 'Whether therapist-specific fee payment has been verified';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS therapist_fee_payment_date TIMESTAMPTZ COMMENT 'Date of therapist-specific fee payment';

ALTER TABLE clients ADD COLUMN IF NOT EXISTS total_payment_due DECIMAL(10, 2) COMMENT 'Total amount due for the therapist (therapist hourly_rate)';

-- Create indexes for payment lookups
CREATE INDEX IF NOT EXISTS idx_clients_assessment_payment_verified ON clients(assessment_payment_verified);
CREATE INDEX IF NOT EXISTS idx_clients_therapist_fee_payment_verified ON clients(therapist_fee_payment_verified);
CREATE INDEX IF NOT EXISTS idx_clients_total_payment_due ON clients(total_payment_due);

-- Add tracking fields to bookings for payment associations
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS assessment_payment_verified BOOLEAN DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS therapist_fee_payment_verified BOOLEAN DEFAULT false;
