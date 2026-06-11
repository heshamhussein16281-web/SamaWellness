-- Add hourly_rate field to therapists table
-- This field is used to calculate actual costs for bookings

ALTER TABLE therapists ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2) DEFAULT 2000.00;

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_therapists_hourly_rate ON therapists(hourly_rate);

-- Set default hourly rates based on seniority (from legacy data)
-- Senior therapists (like Sama): 3000 per hour, others: 2000 per hour
UPDATE therapists SET hourly_rate = 3000 WHERE name LIKE 'Sama%' AND hourly_rate = 2000;
UPDATE therapists SET hourly_rate = 2000 WHERE hourly_rate IS NULL OR hourly_rate = 0;
