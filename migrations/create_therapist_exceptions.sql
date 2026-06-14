-- Create therapist_exceptions table for vacation/day-off tracking
CREATE TABLE therapist_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  exception_type TEXT NOT NULL CHECK (exception_type IN ('vacation', 'day_off')),
  start_date DATE NOT NULL,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_therapist_exceptions_therapist_clinic
  ON therapist_exceptions(therapist_id, clinic_id);

-- Add RLS policy (if using Supabase RLS)
ALTER TABLE therapist_exceptions ENABLE ROW LEVEL SECURITY;
