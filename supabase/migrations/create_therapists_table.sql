-- DEPRECATED: This migration is SUPERSEDED by 20260608_create_clinic_tables.sql
-- The authoritative therapists table is defined in 20260608 with BIGSERIAL id
-- This file (create_therapists_table.sql) defines therapists with UUID id, which CONFLICTS
-- with the BIGSERIAL definition. Due to "CREATE TABLE IF NOT EXISTS", the FIRST migration
-- to run determines which schema is used. Currently 20260608 runs first (numeric prefix).
--
-- DO NOT USE THIS FILE. Use 20260608_create_clinic_tables.sql instead.
-- This file is retained only for reference/history. therapist_schedules should be
-- migrated to the therapist_availability pattern defined in 20260611_phase4_clinical_scheduling.sql

-- OBSOLETE: Create therapists table
CREATE TABLE IF NOT EXISTS therapists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  initials VARCHAR(5) NOT NULL,
  rate INTEGER NOT NULL, -- rate in EGP per session
  is_senior BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'inactive', 'on-leave'
  bio TEXT, -- therapist bio/specializations
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create therapist schedules table
CREATE TABLE IF NOT EXISTS therapist_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  day_of_week VARCHAR(10) NOT NULL, -- 'Monday', 'Tuesday', etc.
  start_hour INTEGER NOT NULL, -- 11-21 (11 AM - 9 PM)
  end_hour INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(therapist_id, day_of_week)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_therapists_status ON therapists(status);
CREATE INDEX IF NOT EXISTS idx_therapist_schedules_therapist ON therapist_schedules(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapist_schedules_day ON therapist_schedules(day_of_week);

-- Insert initial therapists data
INSERT INTO therapists (name, initials, rate, is_senior, status) VALUES
  ('Sama Eissa', 'SE', 3000, true, 'active'),
  ('Dr Sara', 'DS', 2000, false, 'active'),
  ('Sandy', 'SN', 2000, false, 'active'),
  ('Marina', 'MR', 2000, false, 'active'),
  ('Heidy', 'HY', 2000, false, 'active'),
  ('Aliaa', 'AL', 2000, false, 'active'),
  ('Mohamed', 'MO', 2000, false, 'active')
ON CONFLICT (name) DO NOTHING;

-- Insert initial schedules
-- Sama Eissa: Monday 11-22
INSERT INTO therapist_schedules (therapist_id, day_of_week, start_hour, end_hour)
SELECT id, 'Monday', 11, 22 FROM therapists WHERE name = 'Sama Eissa'
ON CONFLICT (therapist_id, day_of_week) DO NOTHING;

-- Dr Sara: Tuesday 11-19
INSERT INTO therapist_schedules (therapist_id, day_of_week, start_hour, end_hour)
SELECT id, 'Tuesday', 11, 19 FROM therapists WHERE name = 'Dr Sara'
ON CONFLICT (therapist_id, day_of_week) DO NOTHING;

-- Sandy: Tuesday 11-22
INSERT INTO therapist_schedules (therapist_id, day_of_week, start_hour, end_hour)
SELECT id, 'Tuesday', 11, 22 FROM therapists WHERE name = 'Sandy'
ON CONFLICT (therapist_id, day_of_week) DO NOTHING;

-- Marina: Tuesday 17-22, Wednesday 11-17
INSERT INTO therapist_schedules (therapist_id, day_of_week, start_hour, end_hour)
SELECT id, 'Tuesday', 17, 22 FROM therapists WHERE name = 'Marina'
ON CONFLICT (therapist_id, day_of_week) DO NOTHING;

INSERT INTO therapist_schedules (therapist_id, day_of_week, start_hour, end_hour)
SELECT id, 'Wednesday', 11, 17 FROM therapists WHERE name = 'Marina'
ON CONFLICT (therapist_id, day_of_week) DO NOTHING;

-- Heidy: Thursday 11-22
INSERT INTO therapist_schedules (therapist_id, day_of_week, start_hour, end_hour)
SELECT id, 'Thursday', 11, 22 FROM therapists WHERE name = 'Heidy'
ON CONFLICT (therapist_id, day_of_week) DO NOTHING;

-- Aliaa: Thursday 12-17
INSERT INTO therapist_schedules (therapist_id, day_of_week, start_hour, end_hour)
SELECT id, 'Thursday', 12, 17 FROM therapists WHERE name = 'Aliaa'
ON CONFLICT (therapist_id, day_of_week) DO NOTHING;

-- Mohamed: Sunday 17-22
INSERT INTO therapist_schedules (therapist_id, day_of_week, start_hour, end_hour)
SELECT id, 'Sunday', 17, 22 FROM therapists WHERE name = 'Mohamed'
ON CONFLICT (therapist_id, day_of_week) DO NOTHING;
