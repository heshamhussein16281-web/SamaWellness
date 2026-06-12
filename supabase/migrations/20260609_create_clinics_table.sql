-- Create Clinics Table - Multi-Clinic Support
-- This migration must run BEFORE 20260611_phase4_clinical_scheduling.sql
-- which has foreign key references to clinics table

CREATE TABLE IF NOT EXISTS clinics (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  phone VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clinics_name ON clinics(name);
CREATE INDEX IF NOT EXISTS idx_clinics_email ON clinics(email);

-- Enable Row Level Security
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

-- Seed default clinic if none exist
INSERT INTO clinics (name, location, email)
VALUES ('Main Clinic', 'Cairo', 'info@sama-wellness.com')
ON CONFLICT DO NOTHING;
