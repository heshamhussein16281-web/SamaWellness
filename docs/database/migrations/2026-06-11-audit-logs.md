# Migration: Create audit_logs table and is_super_admin role

**Date:** 2026-06-11

## Overview
This migration implements the foundation for audit logging and monitoring capabilities in the Sama Wellness clinic application. It creates the audit_logs table for tracking administrative actions and adds a super admin role flag to the roles table.

## Changes

### 1. Created audit_logs Table
- **Purpose:** Track all administrative actions (create, update, delete) for users, roles, and permissions
- **Columns:**
  - `id` (UUID, PK): Unique identifier
  - `admin_id` (UUID, FK to clinic_users): Administrator who performed the action
  - `action` (VARCHAR): Type of action (create, update, delete)
  - `entity_type` (VARCHAR): Type of entity affected (user, role, permission)
  - `entity_id` (UUID): ID of the affected entity
  - `entity_name` (VARCHAR): Name of the affected entity
  - `changes` (JSONB): Details of changes made (optional)
  - `timestamp` (TIMESTAMPTZ): When the action occurred
  - `created_at` (TIMESTAMPTZ): When the log entry was created

### 2. Created Indexes for Performance
- `idx_audit_logs_admin`: Enables efficient queries by administrator
- `idx_audit_logs_timestamp`: Enables efficient sorting by timestamp (descending)
- `idx_audit_logs_entity`: Enables efficient queries by entity type and ID

### 3. Added is_super_admin Column to roles Table
- **Column:** `is_super_admin` (BOOLEAN, default: false)
- **Purpose:** Flag roles that have full system access and audit log visibility

### 4. Created Super Admin Role
- **Name:** Super Admin
- **Description:** Full system access with audit log visibility
- **is_super_admin:** true

## SQL Executed

```sql
-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES clinic_users(id) ON DELETE SET NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('user', 'role', 'permission')),
  entity_id UUID NOT NULL,
  entity_name VARCHAR(255) NOT NULL,
  changes JSONB,
  timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Add is_super_admin column to roles table
ALTER TABLE roles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;

-- Insert Super Admin role
INSERT INTO roles (name, description, is_super_admin)
VALUES ('Super Admin', 'Full system access with audit log visibility', true)
ON CONFLICT (name) DO NOTHING;
```

## Verification

### Table Structure
- ✅ audit_logs table created with all required columns
- ✅ Column data types and constraints properly defined
- ✅ Foreign key constraint on clinic_users(id) with ON DELETE SET NULL

### Indexes
- ✅ idx_audit_logs_admin created
- ✅ idx_audit_logs_timestamp created (descending)
- ✅ idx_audit_logs_entity created

### Roles Table
- ✅ is_super_admin column added with default value false
- ✅ Super Admin role created with is_super_admin=true

## Next Steps
1. Implement audit logging middleware in the application
2. Create API endpoints to query audit logs
3. Build audit log UI in the admin dashboard
4. Implement role assignment workflow for Super Admin role
