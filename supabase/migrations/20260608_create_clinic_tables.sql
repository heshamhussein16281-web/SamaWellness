-- SWT Psychology Clinic Management System - Database Schema

-- Create therapists table first (referenced by other tables)
CREATE TABLE IF NOT EXISTS therapists (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  specializations TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  date_of_birth DATE,
  stage VARCHAR(50) DEFAULT 'intake',
  therapist_id BIGINT REFERENCES therapists(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  therapist_id BIGINT NOT NULL REFERENCES therapists(id) ON DELETE RESTRICT,
  session_date TIMESTAMP NOT NULL,
  duration_minutes INT DEFAULT 50,
  status VARCHAR(50) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_type VARCHAR(50),
  payment_method VARCHAR(50),
  status VARCHAR(50) DEFAULT 'completed',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  assessment_type VARCHAR(100),
  results TEXT,
  therapist_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Satisfaction log table
CREATE TABLE IF NOT EXISTS sat_log (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  booking_id BIGINT REFERENCES bookings(id) ON DELETE CASCADE,
  satisfaction_score INT CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Therapist reassignment log
CREATE TABLE IF NOT EXISTS reassign_log (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  old_therapist_id BIGINT REFERENCES therapists(id) ON DELETE SET NULL,
  new_therapist_id BIGINT REFERENCES therapists(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Change log table
CREATE TABLE IF NOT EXISTS change_log (
  id BIGSERIAL PRIMARY KEY,
  entity_type VARCHAR(100),
  entity_id BIGINT,
  action VARCHAR(50),
  changed_by VARCHAR(100),
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ended calls table
CREATE TABLE IF NOT EXISTS ended_calls (
  id BIGSERIAL PRIMARY KEY,
  booking_id BIGINT REFERENCES bookings(id) ON DELETE CASCADE,
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  therapist_id BIGINT REFERENCES therapists(id) ON DELETE SET NULL,
  session_date TIMESTAMP NOT NULL,
  duration_minutes INT,
  notes TEXT,
  archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Credit balance table
CREATE TABLE IF NOT EXISTS credit_balance (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT NOT NULL UNIQUE REFERENCES clients(id) ON DELETE CASCADE,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  currency VARCHAR(10) DEFAULT 'EGP',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payout confirmations table
CREATE TABLE IF NOT EXISTS payout_confirmations (
  id BIGSERIAL PRIMARY KEY,
  therapist_id BIGINT NOT NULL REFERENCES therapists(id) ON DELETE RESTRICT,
  amount DECIMAL(10, 2) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id BIGSERIAL PRIMARY KEY,
  category VARCHAR(100),
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  paid_date DATE,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Discharged clients table
CREATE TABLE IF NOT EXISTS discharged_clients (
  id BIGSERIAL PRIMARY KEY,
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  discharge_date DATE NOT NULL,
  reason VARCHAR(255),
  final_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_therapist_id ON clients(therapist_id);
CREATE INDEX IF NOT EXISTS idx_clients_stage ON clients(stage);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at);

CREATE INDEX IF NOT EXISTS idx_bookings_client_id ON bookings(client_id);
CREATE INDEX IF NOT EXISTS idx_bookings_therapist_id ON bookings(therapist_id);
CREATE INDEX IF NOT EXISTS idx_bookings_session_date ON bookings(session_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

CREATE INDEX IF NOT EXISTS idx_assessments_client_id ON assessments(client_id);

CREATE INDEX IF NOT EXISTS idx_sat_log_client_id ON sat_log(client_id);
CREATE INDEX IF NOT EXISTS idx_sat_log_booking_id ON sat_log(booking_id);

CREATE INDEX IF NOT EXISTS idx_reassign_log_client_id ON reassign_log(client_id);

CREATE INDEX IF NOT EXISTS idx_change_log_entity ON change_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_change_log_created_at ON change_log(created_at);

CREATE INDEX IF NOT EXISTS idx_ended_calls_client_id ON ended_calls(client_id);
CREATE INDEX IF NOT EXISTS idx_ended_calls_session_date ON ended_calls(session_date);

CREATE INDEX IF NOT EXISTS idx_payout_confirmations_therapist_id ON payout_confirmations(therapist_id);

CREATE INDEX IF NOT EXISTS idx_discharged_clients_client_id ON discharged_clients(client_id);

-- Insert therapist seed data
INSERT INTO therapists (name, specializations) VALUES
  ('Sama Eissa', ARRAY['Anxiety', 'Personality Disorders', 'Couple Therapy']),
  ('Sara El Shakankiri', ARRAY['Adolescent Psychiatry', 'Family Counseling']),
  ('Marina Rowes', ARRAY['PTSD', 'Trauma', 'Eating Disorders']),
  ('Alia El Meteni', ARRAY['Mood Disorders', 'Anxiety']),
  ('Mohamed Torkey', ARRAY['Trauma', 'Grief & Loss']),
  ('Haidy El Masry', ARRAY['Anxiety', 'Depression', 'Relationship Issues']),
  ('Sandy Magdy', ARRAY['Complex PTSD', 'Eating Disorders'])
ON CONFLICT DO NOTHING;

-- Enable Row Level Security on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sat_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE reassign_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ended_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE discharged_clients ENABLE ROW LEVEL SECURITY;
