-- Add RLS policies to bookings table to allow authenticated users to create bookings
-- This allows clinic staff to create bookings during the client workflow

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS bookings_read_policy ON bookings;
DROP POLICY IF EXISTS bookings_insert_policy ON bookings;
DROP POLICY IF EXISTS bookings_update_policy ON bookings;

-- Allow authenticated users to read bookings
CREATE POLICY bookings_read_policy ON bookings
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert bookings (clinic staff creating session bookings)
CREATE POLICY bookings_insert_policy ON bookings
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update bookings (e.g., marking sessions as completed)
CREATE POLICY bookings_update_policy ON bookings
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
