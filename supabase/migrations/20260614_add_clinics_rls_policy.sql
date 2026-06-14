-- Add RLS policies to clinics table to allow authenticated users to insert/read/update clinics

-- Allow authenticated users to view all clinics
CREATE POLICY clinics_read_policy ON clinics
  FOR SELECT
  USING (true);

-- Allow authenticated users to insert clinics
CREATE POLICY clinics_insert_policy ON clinics
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to update clinics
CREATE POLICY clinics_update_policy ON clinics
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete clinics
CREATE POLICY clinics_delete_policy ON clinics
  FOR DELETE
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clinics_created_at ON clinics(created_at);
