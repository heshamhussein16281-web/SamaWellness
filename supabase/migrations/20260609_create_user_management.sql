-- User Management System - Roles, Permissions, Users

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role-Permission junction table (many-to-many)
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role_id, permission_id)
);

-- Clinic Users table
CREATE TABLE IF NOT EXISTS clinic_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clinic_users_username ON clinic_users(username);
CREATE INDEX IF NOT EXISTS idx_clinic_users_role_id ON clinic_users(role_id);
CREATE INDEX IF NOT EXISTS idx_clinic_users_is_active ON clinic_users(is_active);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('admin', 'Full system access - manage users, roles, and all features'),
  ('reception', 'Manage bookings, clients, and payments'),
  ('clinician', 'View clients, assessments, and create notes')
ON CONFLICT (name) DO NOTHING;

-- Insert permissions
INSERT INTO permissions (key, name, description, category) VALUES
  -- Client Management
  ('view_clients', 'View all clients', 'View client list', 'clients'),
  ('create_client', 'Create new client', 'Add new client to system', 'clients'),
  ('edit_client', 'Edit client info', 'Update client details', 'clients'),
  ('delete_client', 'Delete client', 'Remove client from system', 'clients'),
  ('discharge_client', 'Discharge client', 'Mark client as discharged', 'clients'),

  -- Booking Management
  ('view_bookings', 'View bookings', 'View all bookings', 'bookings'),
  ('create_booking', 'Create booking', 'Schedule new session', 'bookings'),
  ('edit_booking', 'Edit booking', 'Update booking details', 'bookings'),
  ('cancel_booking', 'Cancel booking', 'Cancel scheduled session', 'bookings'),

  -- Assessments
  ('view_assessments', 'View assessments', 'View client assessments', 'assessments'),
  ('create_assessment', 'Create assessment', 'Add new assessment', 'assessments'),
  ('edit_assessment', 'Edit assessment', 'Update assessment', 'assessments'),

  -- Payments
  ('view_payments', 'View payments', 'View payment records', 'payments'),
  ('create_payment', 'Record payment', 'Add payment entry', 'payments'),
  ('edit_payment', 'Edit payment', 'Update payment details', 'payments'),

  -- Reports & Analytics
  ('view_reports', 'View reports', 'View analytics and reports', 'reports'),

  -- Expenses
  ('view_expenses', 'View expenses', 'View expense records', 'expenses'),
  ('create_expense', 'Create expense', 'Add expense entry', 'expenses'),

  -- Payouts
  ('view_payouts', 'View payouts', 'View therapist payouts', 'payouts'),
  ('create_payout', 'Create payout', 'Record therapist payout', 'payouts'),

  -- Change Log
  ('view_change_log', 'View change log', 'View system change history', 'audit'),

  -- Admin - User Management
  ('manage_users', 'Manage users', 'Create, edit, block/unblock users', 'admin'),
  ('manage_roles', 'Manage roles', 'Create roles and assign permissions', 'admin'),
  ('view_admin_panel', 'View admin panel', 'Access admin dashboard', 'admin'),

  -- Satisfaction
  ('view_satisfaction', 'View satisfaction scores', 'View client satisfaction', 'satisfaction')
ON CONFLICT (key) DO NOTHING;

-- Admin role - assign all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Reception role permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'reception' AND p.key IN (
  'view_clients', 'create_client', 'edit_client',
  'view_bookings', 'create_booking', 'edit_booking', 'cancel_booking',
  'view_payments', 'create_payment', 'edit_payment',
  'view_expenses', 'create_expense',
  'view_satisfaction'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Clinician role permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'clinician' AND p.key IN (
  'view_clients',
  'view_assessments', 'create_assessment', 'edit_assessment',
  'view_bookings',
  'view_satisfaction',
  'view_change_log'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE clinic_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
