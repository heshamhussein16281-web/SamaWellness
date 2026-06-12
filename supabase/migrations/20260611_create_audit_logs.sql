-- Create audit_logs table for tracking admin actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES clinic_users(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('user', 'role', 'permission')),
  entity_id UUID NOT NULL,
  entity_name VARCHAR(255) NOT NULL,
  changes JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Add is_super_admin column to roles table
ALTER TABLE roles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

-- Create Super Admin role
INSERT INTO roles (name, description, is_super_admin)
VALUES ('Super Admin', 'Full system access with audit log visibility', false)
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
