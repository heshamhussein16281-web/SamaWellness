-- ⚠️ DEPRECATED FIELDS - Do not use in new code
-- See: docs/PAYMENT_FIELDS_DOCUMENTATION.md for payment field reference
--
-- These fields have been replaced by a two-tier payment system:
--   payment_verified (DEPRECATED) → Use payment_verified_1 instead
--   payment_date (DEPRECATED) → Use payment_date_1 or payment_date_2 instead
--
-- Migration Plan:
--   Phase 2: Copy data to payment_verified_1, remove from active code
--   Phase 3: Drop deprecated columns from database
--
-- Add payment verification fields to clients table for simple payment confirmation workflow
ALTER TABLE clients ADD COLUMN IF NOT EXISTS payment_verified BOOLEAN DEFAULT false COMMENT 'DEPRECATED: Use payment_verified_1 instead. See docs/PAYMENT_FIELDS_DOCUMENTATION.md';
ALTER TABLE clients ADD COLUMN IF NOT EXISTS payment_date DATE COMMENT 'DEPRECATED: Use payment_date_1 or payment_date_2 instead. See docs/PAYMENT_FIELDS_DOCUMENTATION.md';

-- Create index for quick payment verification lookups
CREATE INDEX IF NOT EXISTS idx_clients_payment_verified ON clients(payment_verified);
CREATE INDEX IF NOT EXISTS idx_clients_payment_date ON clients(payment_date);
