-- ========================================================================
-- PASTE THIS ENTIRE SCRIPT INTO SUPABASE SQL EDITOR
-- Go to: https://app.supabase.com → Your Project → SQL Editor
-- Create New Query → Copy-paste below → Execute
-- ========================================================================

-- STEP 1: Add Intake Clinical Fields
-- These are required for the Client Intake Form to work
ALTER TABLE clients ADD COLUMN IF NOT EXISTS gender VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS language VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS concern TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS preferences TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_gender ON clients(gender);
CREATE INDEX IF NOT EXISTS idx_clients_language ON clients(language);

-- ========================================================================

-- STEP 2: Add Phase 4 Clinical Scheduling Columns
-- These are required for client status tracking
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'intake' CHECK (status IN ('intake', 'assessment_pending', 'ready_for_booking', 'booking_scheduled', 'payment_pending', 'active', 'completed', 'inactive', 'booking_expired'));
ALTER TABLE clients ADD COLUMN IF NOT EXISTS last_session_date TIMESTAMPTZ;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS total_sessions_completed INT DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS total_amount_paid DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS client_since TIMESTAMPTZ DEFAULT now();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_is_recurring ON clients(is_recurring);
CREATE INDEX IF NOT EXISTS idx_clients_client_since ON clients(client_since);
CREATE INDEX IF NOT EXISTS idx_clients_last_session_date ON clients(last_session_date);

-- ========================================================================

-- STEP 3: Enable Row Level Security Policies
-- These policies allow authenticated users to access the clients table
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS clients_read_policy ON clients
  FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS clients_insert_policy ON clients
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS clients_update_policy ON clients
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS clients_delete_policy ON clients
  FOR DELETE
  USING (true);

-- ========================================================================
-- ALL DONE! Your database should now support the intake form.
-- Go back to your app and test: http://localhost:3002
-- ========================================================================
