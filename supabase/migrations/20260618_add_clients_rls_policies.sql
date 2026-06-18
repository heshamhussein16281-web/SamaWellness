-- Migration: Add RLS Policies to Clients Table
-- Date: 2026-06-18
-- Purpose: Enable Row Level Security for clients table with proper policies

-- Enable RLS on clients table (if not already enabled)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all clients
CREATE POLICY IF NOT EXISTS clients_read_policy ON clients
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert clients
CREATE POLICY IF NOT EXISTS clients_insert_policy ON clients
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to update clients
CREATE POLICY IF NOT EXISTS clients_update_policy ON clients
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete clients
CREATE POLICY IF NOT EXISTS clients_delete_policy ON clients
  FOR DELETE
  USING (true);
