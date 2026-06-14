-- Add missing columns to clients table that are used by intake and profile endpoints
-- Date: 2026-06-14

-- Add intake_date column to track when client intake was completed
ALTER TABLE clients ADD COLUMN IF NOT EXISTS intake_date TIMESTAMPTZ;

-- Add referral_source column to track how client was referred
ALTER TABLE clients ADD COLUMN IF NOT EXISTS referral_source VARCHAR(255);

-- Create indexes for these new columns
CREATE INDEX IF NOT EXISTS idx_clients_intake_date ON clients(intake_date);
CREATE INDEX IF NOT EXISTS idx_clients_referral_source ON clients(referral_source);
