-- Add payment verification fields to clients table for simple payment confirmation workflow
ALTER TABLE clients ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN DEFAULT false;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS payment_date DATE;

-- Create index for quick payment verification lookups
CREATE INDEX IF NOT EXISTS idx_clients_payment_verified ON clients(payment_verified);
CREATE INDEX IF NOT EXISTS idx_clients_payment_date ON clients(payment_date);
