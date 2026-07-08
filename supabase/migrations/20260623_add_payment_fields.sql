-- ✅ ACTIVE PAYMENT FIELDS (Do use in new code)
-- See: docs/PAYMENT_FIELDS_DOCUMENTATION.md for comprehensive reference
--
-- TWO-TIER PAYMENT SYSTEM:
-- Tier 1: First session payment (minimum 2000 EGP)
-- Tier 2: Additional payment if therapist rate exceeds tier 1
--
-- PAYMENT FLOW:
-- 1. Client books → payment_verified_1 set to true (2000 EGP minimum)
-- 2. Therapist assigned → If rate > 2000, payment_verified_2 required (amount = rate - 2000)
-- 3. Status transitions based on verification state
-- 4. payment_history table maintains audit trail of all verified payments

-- Add simplified two-tier payment verification fields to clients table
-- Tier 1: Payment for first session booking (minimum 2000 EGP)
-- Tier 2: Additional payment if therapist rate is higher than tier 1

ALTER TABLE clients ADD COLUMN IF NOT EXISTS payment_verified_1 BOOLEAN DEFAULT false COMMENT 'Whether first session payment has been verified (Assessment payment - 2000 EGP minimum)';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS payment_amount_1 DECIMAL(10, 2) COMMENT 'Amount paid for first session (tier 1 - Assessment payment)';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS payment_date_1 TIMESTAMPTZ COMMENT 'ISO 8601 timestamp of first payment verification';

ALTER TABLE clients ADD COLUMN IF NOT EXISTS payment_verified_2 BOOLEAN DEFAULT false COMMENT 'Whether additional payment has been verified (if therapist rate > tier 1). Amount = therapist_rate - 2000';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS payment_amount_2 DECIMAL(10, 2) COMMENT 'Additional payment amount (tier 2 difference = therapist_rate - 2000)';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS payment_date_2 TIMESTAMPTZ COMMENT 'ISO 8601 timestamp of second payment verification';

ALTER TABLE clients ADD COLUMN IF NOT EXISTS total_payment_due DECIMAL(10, 2) COMMENT 'Total amount due to therapist (therapist hourly rate at booking time)';

-- Create indexes for payment lookups
CREATE INDEX IF NOT EXISTS idx_clients_payment_verified_1 ON clients(payment_verified_1);
CREATE INDEX IF NOT EXISTS idx_clients_payment_verified_2 ON clients(payment_verified_2);
CREATE INDEX IF NOT EXISTS idx_clients_total_payment_due ON clients(total_payment_due);
