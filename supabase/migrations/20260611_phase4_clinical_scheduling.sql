-- Phase 4 & 5: Clinical Operations - Database Migrations
-- Created: 2026-06-11
-- Purpose: Add clinical scheduling, therapist specializations, session notes,
--          payment records, client status tracking, and room management

-- ============================================================================
-- 1. NEW TABLES FOR PHASE 4 & 5
-- ============================================================================

-- NOTE: therapists.id type is BIGSERIAL (from 20260608_create_clinic_tables.sql)
-- All therapist_id foreign keys must be BIGINT to match the source table

-- Therapist Availability Table
-- Stores weekly availability slots for therapists
CREATE TABLE IF NOT EXISTS therapist_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id BIGINT NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  clinic_id BIGINT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  day_of_week VARCHAR(10) NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status VARCHAR(50) DEFAULT 'working' CHECK (status IN ('working', 'vacation', 'off')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(therapist_id, day_of_week)
);
CREATE INDEX IF NOT EXISTS idx_therapist_availability_composite ON therapist_availability(therapist_id, clinic_id);

-- Therapist Specializations Table
-- Maps therapists to specific session types/specializations they can conduct
CREATE TABLE IF NOT EXISTS therapist_specializations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id BIGINT NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  session_type VARCHAR(50) NOT NULL CHECK (session_type IN ('single', 'group', 'couple')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(therapist_id, session_type)
);

-- Clinic Rooms Table
-- Stores physical/virtual rooms available at the clinic for sessions
CREATE TABLE IF NOT EXISTS clinic_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id BIGINT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  room_name VARCHAR(255) NOT NULL,
  room_type VARCHAR(50) DEFAULT 'standard',
  capacity INT DEFAULT 1 CHECK (capacity >= 1),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Session Notes Table
-- Records therapist's notes for completed sessions
CREATE TABLE IF NOT EXISTS session_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  therapist_id BIGINT NOT NULL REFERENCES therapists(id) ON DELETE RESTRICT,
  notes TEXT NOT NULL,
  session_outcome TEXT,
  progress_score INT CHECK (progress_score >= 1 AND progress_score <= 5),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Payment Records Table
-- Detailed payment transactions for client sessions
-- Single source of truth for all payment details (amounts, refunds, charges, costs)
CREATE TABLE IF NOT EXISTS payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  therapist_id BIGINT NOT NULL REFERENCES therapists(id) ON DELETE SET NULL,
  clinic_id BIGINT,
  -- Application must provide explicit payment amount; do not default to hardcoded value
  amount_paid DECIMAL(10, 2) NOT NULL,
  actual_cost DECIMAL(10, 2),
  refund_amount DECIMAL(10, 2) DEFAULT 0.00,
  additional_charge DECIMAL(10, 2) DEFAULT 0.00,
  charge_status VARCHAR(50) DEFAULT 'pending' CHECK (charge_status IN ('pending', 'collected')),
  payment_date TIMESTAMPTZ NOT NULL,
  marked_by_user_id UUID NOT NULL REFERENCES clinic_users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Client Status History Table
-- Audit trail of client status changes (intake → active → discharged)
CREATE TABLE IF NOT EXISTS client_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  changed_by_user_id UUID REFERENCES clinic_users(id) ON DELETE RESTRICT,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. EXTEND EXISTING TABLES
-- ============================================================================

-- Extend clients table with Phase 4 & 5 fields
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'intake' CHECK (status IN ('intake', 'assessment_pending', 'ready_for_booking', 'booking_scheduled', 'payment_pending', 'active', 'completed', 'inactive', 'booking_expired'));
ALTER TABLE clients ADD COLUMN IF NOT EXISTS last_session_date TIMESTAMPTZ;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS total_sessions_completed INT DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS total_amount_paid DECIMAL(10, 2) DEFAULT 0.00;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS client_since TIMESTAMPTZ DEFAULT now();

-- Extend bookings table with Phase 4 & 5 fields
-- Payment details are maintained in payment_records table (single source of truth)
-- Only keep current payment state fields (payment_status, payment_date, marked_paid tracking)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'charged', 'cancelled'));
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_deadline TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS marked_paid_by_user_id UUID REFERENCES clinic_users(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS marked_paid_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES clinic_rooms(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS session_type VARCHAR(50) DEFAULT 'single' CHECK (session_type IN ('single', 'group', 'couple'));
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_status VARCHAR(50) DEFAULT 'scheduled' CHECK (booking_status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'expired'));
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_by_user_id UUID REFERENCES clinic_users(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;

-- ============================================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Therapist Availability Indexes (composite index already created in table definition)
-- (No additional indexes needed beyond the composite index on therapist_id, clinic_id)

-- Therapist Specializations Indexes
CREATE INDEX IF NOT EXISTS idx_therapist_specializations_therapist_id ON therapist_specializations(therapist_id);
CREATE INDEX IF NOT EXISTS idx_therapist_specializations_session_type ON therapist_specializations(session_type);
CREATE INDEX IF NOT EXISTS idx_therapist_specializations_active ON therapist_specializations(is_active);

-- Clinic Rooms Indexes
CREATE INDEX IF NOT EXISTS idx_clinic_rooms_clinic_id ON clinic_rooms(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_rooms_room_type ON clinic_rooms(room_type);
CREATE INDEX IF NOT EXISTS idx_clinic_rooms_clinic_capacity ON clinic_rooms(clinic_id, capacity);

-- Session Notes Indexes
CREATE INDEX IF NOT EXISTS idx_session_notes_booking_id ON session_notes(booking_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_therapist_id ON session_notes(therapist_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_session_outcome ON session_notes(session_outcome);
CREATE INDEX IF NOT EXISTS idx_session_notes_created_at ON session_notes(created_at);

-- Payment Records Indexes
CREATE INDEX IF NOT EXISTS idx_payment_records_booking_id ON payment_records(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_client_id ON payment_records(client_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_therapist_id ON payment_records(therapist_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_charge_status ON payment_records(charge_status);
CREATE INDEX IF NOT EXISTS idx_payment_records_payment_date ON payment_records(payment_date);
CREATE INDEX IF NOT EXISTS idx_payment_records_clinic_id ON payment_records(clinic_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_client_charge ON payment_records(client_id, charge_status);

-- Client Status History Indexes
CREATE INDEX IF NOT EXISTS idx_client_status_history_client_id ON client_status_history(client_id);
CREATE INDEX IF NOT EXISTS idx_client_status_history_new_status ON client_status_history(new_status);
CREATE INDEX IF NOT EXISTS idx_client_status_history_created_at ON client_status_history(created_at);
CREATE INDEX IF NOT EXISTS idx_client_status_history_changed_by ON client_status_history(changed_by_user_id);

-- Extended clients table indexes
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_is_recurring ON clients(is_recurring);
CREATE INDEX IF NOT EXISTS idx_clients_client_since ON clients(client_since);
CREATE INDEX IF NOT EXISTS idx_clients_last_session_date ON clients(last_session_date);

-- Extended bookings table indexes
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_session_type ON bookings(session_type);
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_date ON bookings(payment_date);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_deadline ON bookings(payment_deadline);

-- ============================================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE therapist_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapist_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_status_history ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. SEED DATA (OPTIONAL)
-- ============================================================================

-- Insert default session types for all therapists
INSERT INTO therapist_specializations (therapist_id, session_type, is_active)
SELECT id, 'single', true FROM therapists
ON CONFLICT (therapist_id, session_type) DO NOTHING;

-- Insert default clinic room (virtual) for the main clinic
INSERT INTO clinic_rooms (clinic_id, room_name, room_type, capacity)
SELECT clinics.id, 'Default Virtual Room', 'virtual', 1 FROM clinics
WHERE clinics.name = 'Main Clinic' AND NOT EXISTS (SELECT 1 FROM clinic_rooms WHERE room_name = 'Default Virtual Room')
ON CONFLICT DO NOTHING;
