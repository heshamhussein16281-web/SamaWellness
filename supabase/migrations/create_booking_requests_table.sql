-- Create booking_requests table
CREATE TABLE IF NOT EXISTS booking_requests (
  id BIGSERIAL PRIMARY KEY,
  therapist_id INTEGER NOT NULL,
  therapist_name VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  mobile VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  created_at TIMESTAMP DEFAULT now()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_booking_requests_therapist_id ON booking_requests(therapist_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_created_at ON booking_requests(created_at);

-- Enable Row Level Security
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (form submissions from the website)
CREATE POLICY "Allow anonymous inserts"
  ON booking_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Only authenticated users (admins) can read submissions
CREATE POLICY "Allow authenticated reads"
  ON booking_requests
  FOR SELECT
  TO authenticated
  USING (true);
