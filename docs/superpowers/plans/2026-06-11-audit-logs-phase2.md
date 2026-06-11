# Audit Logs & Monitoring — Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a basic audit trail system tracking admin actions (create/update/delete) with super-admin-only access and 1-year retention.

**Architecture:** Backend logging at API layer captures all admin modifications automatically. Frontend provides filterable audit log viewer at `/app/dashboard/admin/audit-logs`. Super-admin role gates access.

**Tech Stack:** Next.js 14, React, TypeScript, Supabase (PostgreSQL), 3-layer CSS

---

## File Structure

```
Database:
- Migration: Create audit_logs table, add is_super_admin to roles

API:
- /app/api/admin/audit-logs/route.ts — NEW: Fetch audit logs
- /app/api/admin/users/route.ts — MODIFY: Add logging
- /app/api/admin/users/[id]/route.ts — MODIFY: Add logging
- /app/api/admin/roles/route.ts — MODIFY: Add logging
- /app/api/admin/roles/[id]/route.ts — MODIFY: Add logging
- /app/api/admin/roles/[id]/permissions/route.ts — MODIFY: Add logging
- lib/audit.ts — NEW: Helper function for logging

Frontend:
- /app/dashboard/admin/audit-logs/page.tsx — NEW: Page wrapper
- /app/dashboard/admin/audit-logs/AuditLogsList.tsx — NEW: Main component
- /app/dashboard/admin/audit-logs/AuditLogsFilter.tsx — NEW: Filter controls
- /app/dashboard/admin/audit-logs/AuditLogDetailModal.tsx — NEW: Detail modal
- /app/dashboard/admin/audit-logs/audit-logs.css — NEW: 3-layer CSS
- /app/dashboard/components/Sidebar.tsx — MODIFY: Add Audit Logs link
- /app/dashboard/admin/layout.tsx — MODIFY: Add super-admin check
```

---

## Tasks

### Task 1: Database Migration

**Files:**
- Create: Database migration SQL

- [ ] **Step 1: Create audit_logs table in Supabase**

Log into Supabase → SQL Editor → Run this migration:

```sql
-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(20) NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('user', 'role', 'permission')),
  entity_id UUID NOT NULL,
  entity_name VARCHAR(255) NOT NULL,
  changes JSONB,
  timestamp TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_audit_logs_admin ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Add is_super_admin column to roles table
ALTER TABLE roles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT false;
```

Expected: Migration completes without error. Tables appear in Supabase dashboard.

- [ ] **Step 2: Create Super Admin role**

In Supabase SQL Editor, run:

```sql
-- Insert Super Admin role (if not exists)
INSERT INTO roles (name, description, is_super_admin)
VALUES ('Super Admin', 'Full system access with audit log visibility', true)
ON CONFLICT (name) DO NOTHING;
```

Expected: Super Admin role created. Verify in Supabase UI.

- [ ] **Step 3: Commit database changes**

```bash
# Document the migration
git add docs/database/migrations/
git commit -m "feat: Add audit_logs table and is_super_admin role"
```

---

### Task 2: Create Audit Logging Helper

**Files:**
- Create: `lib/audit.ts`

- [ ] **Step 1: Create audit helper function**

Create `lib/audit.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AuditLogInput {
  adminId: string;
  action: 'create' | 'update' | 'delete';
  entityType: 'user' | 'role' | 'permission';
  entityId: string;
  entityName: string;
  changes?: Record<string, { old: any; new: any }>;
}

export async function logAuditAction(input: AuditLogInput): Promise<void> {
  try {
    await supabase.from('audit_logs').insert({
      admin_id: input.adminId,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId,
      entity_name: input.entityName,
      changes: input.changes || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Log to console/Sentry but don't throw - audit is secondary
    console.error('Audit log error:', error);
  }
}

// Helper to calculate diff between old and new object
export function calculateChanges(
  oldData: Record<string, any>,
  newData: Record<string, any>
): Record<string, { old: any; new: any }> {
  const changes: Record<string, { old: any; new: any }> = {};

  for (const key in newData) {
    if (oldData[key] !== newData[key]) {
      changes[key] = { old: oldData[key], new: newData[key] };
    }
  }

  return Object.keys(changes).length > 0 ? changes : {};
}
```

Expected: No errors. File creates successfully.

- [ ] **Step 2: Commit**

```bash
git add lib/audit.ts
git commit -m "feat: Add audit logging helper functions"
```

---

### Task 3: Add Logging to POST /api/admin/users (Create User)

**Files:**
- Modify: `/app/api/admin/users/route.ts`

- [ ] **Step 1: Import audit helper**

At the top of `/app/api/admin/users/route.ts`, add:

```typescript
import { logAuditAction } from '@/lib/audit';
```

- [ ] **Step 2: Add logging after successful user creation**

Find the success response in the POST handler and add logging before returning:

```typescript
// After successful user creation (after insertUser):
const { data: { user } } = result;

// Log the action
await logAuditAction({
  adminId: userId,
  action: 'create',
  entityType: 'user',
  entityId: user.id,
  entityName: `${userData.username} (${userData.email || 'no email'})`,
});

return NextResponse.json(
  { success: true, user },
  { status: 201 }
);
```

Expected: Code compiles. User creation still works as before.

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/users/route.ts
git commit -m "feat: Add audit logging to create user endpoint"
```

---

### Task 4: Add Logging to PUT /api/admin/users/[id] (Update User)

**Files:**
- Modify: `/app/api/admin/users/[id]/route.ts`

- [ ] **Step 1: Import audit helpers**

At the top, add:

```typescript
import { logAuditAction, calculateChanges } from '@/lib/audit';
```

- [ ] **Step 2: Fetch user before update to calculate diff**

In the PUT handler, before updating, fetch the current user:

```typescript
// Get current user data for diff
const { data: currentUser } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single();

if (!currentUser) {
  return NextResponse.json({ error: 'User not found' }, { status: 404 });
}
```

- [ ] **Step 3: Add logging after successful update**

After the update succeeds:

```typescript
// Calculate what changed
const changedFields: Record<string, any> = {};
if (userData.email !== undefined) changedFields.email = userData.email;
if (userData.role_id !== undefined) changedFields.role_id = userData.role_id;
if (userData.status !== undefined) changedFields.status = userData.status;

const changes = calculateChanges(currentUser, changedFields);

// Log the action
await logAuditAction({
  adminId: userId,
  action: 'update',
  entityType: 'user',
  entityId: userId,
  entityName: currentUser.username || currentUser.email,
  changes: Object.keys(changes).length > 0 ? changes : undefined,
});

return NextResponse.json({ success: true });
```

Expected: Updates still work, logs are created with field changes.

- [ ] **Step 4: Commit**

```bash
git add app/api/admin/users/[id]/route.ts
git commit -m "feat: Add audit logging to update user endpoint"
```

---

### Task 5: Add Logging to DELETE /api/admin/users/[id] (Deactivate User)

**Files:**
- Modify: `/app/api/admin/users/[id]/route.ts` (DELETE handler)

- [ ] **Step 1: Add logging to DELETE handler**

In the DELETE handler, after soft-delete succeeds:

```typescript
import { logAuditAction } from '@/lib/audit';

// After successful deactivation:
await logAuditAction({
  adminId: userId,
  action: 'delete',
  entityType: 'user',
  entityId: userIdToDelete,
  entityName: `${userName} (deactivated)`,
});

return NextResponse.json({ success: true });
```

Expected: Deactivation still works, logs are created.

- [ ] **Step 2: Commit**

```bash
git add app/api/admin/users/[id]/route.ts
git commit -m "feat: Add audit logging to delete user endpoint"
```

---

### Task 6: Add Logging to POST /api/admin/roles (Create Role)

**Files:**
- Modify: `/app/api/admin/roles/route.ts`

- [ ] **Step 1: Import audit helper**

```typescript
import { logAuditAction } from '@/lib/audit';
```

- [ ] **Step 2: Add logging after role creation**

```typescript
// After successful role creation:
await logAuditAction({
  adminId: userId,
  action: 'create',
  entityType: 'role',
  entityId: newRole.id,
  entityName: newRole.name,
});

return NextResponse.json({ success: true, role: newRole }, { status: 201 });
```

Expected: Role creation works, audit logs recorded.

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/roles/route.ts
git commit -m "feat: Add audit logging to create role endpoint"
```

---

### Task 7: Add Logging to PUT /api/admin/roles/[id] (Update Role)

**Files:**
- Modify: `/app/api/admin/roles/[id]/route.ts`

- [ ] **Step 1: Import audit helpers**

```typescript
import { logAuditAction, calculateChanges } from '@/lib/audit';
```

- [ ] **Step 2: Fetch current role and calculate changes**

```typescript
// Get current role data
const { data: currentRole } = await supabase
  .from('roles')
  .select('*')
  .eq('id', roleId)
  .single();

if (!currentRole) {
  return NextResponse.json({ error: 'Role not found' }, { status: 404 });
}

// ... perform update ...

// Calculate changes
const changedFields: Record<string, any> = {};
if (roleData.name !== undefined) changedFields.name = roleData.name;
if (roleData.description !== undefined) changedFields.description = roleData.description;

const changes = calculateChanges(currentRole, changedFields);

// Log the action
await logAuditAction({
  adminId: userId,
  action: 'update',
  entityType: 'role',
  entityId: roleId,
  entityName: currentRole.name,
  changes: Object.keys(changes).length > 0 ? changes : undefined,
});
```

Expected: Role updates work with audit logs.

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/roles/[id]/route.ts
git commit -m "feat: Add audit logging to update role endpoint"
```

---

### Task 8: Add Logging to DELETE /api/admin/roles/[id] (Delete Role)

**Files:**
- Modify: `/app/api/admin/roles/[id]/route.ts` (DELETE handler)

- [ ] **Step 1: Add logging to DELETE**

```typescript
import { logAuditAction } from '@/lib/audit';

// Before or after deletion, log:
await logAuditAction({
  adminId: userId,
  action: 'delete',
  entityType: 'role',
  entityId: roleId,
  entityName: roleName,
});

return NextResponse.json({ success: true });
```

Expected: Role deletion works with audit logs.

- [ ] **Step 2: Commit**

```bash
git add app/api/admin/roles/[id]/route.ts
git commit -m "feat: Add audit logging to delete role endpoint"
```

---

### Task 9: Add Logging to Permissions Endpoint

**Files:**
- Modify: `/app/api/admin/roles/[id]/permissions/route.ts`

- [ ] **Step 1: Add logging after permissions update**

```typescript
import { logAuditAction } from '@/lib/audit';

// After successful permission update:
await logAuditAction({
  adminId: userId,
  action: 'update',
  entityType: 'permission',
  entityId: roleId,
  entityName: `${roleName} permissions`,
  changes: { permissions: { old: 'see spec for format', new: 'updated permissions' } },
});

return NextResponse.json({ success: true });
```

Expected: Permission updates work with audit logs.

- [ ] **Step 2: Commit**

```bash
git add app/api/admin/roles/[id]/permissions/route.ts
git commit -m "feat: Add audit logging to permissions endpoint"
```

---

### Task 10: Create Audit Logs Fetch Endpoint

**Files:**
- Create: `/app/api/admin/audit-logs/route.ts`

- [ ] **Step 1: Create endpoint file**

Create `/app/api/admin/audit-logs/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jwtDecode } from 'jwt-decode';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface JWTPayload {
  sub: string;
  email: string;
  permissions?: string[];
  is_super_admin?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    // Get JWT from cookies
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Decode and verify super-admin
    const decoded = jwtDecode<JWTPayload>(token);
    if (!decoded.is_super_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get query parameters
    const url = new URL(request.url);
    const adminId = url.searchParams.get('admin_id');
    const action = url.searchParams.get('action');
    const entityType = url.searchParams.get('entity_type');
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);

    // Build query
    let query = supabase
      .from('audit_logs')
      .select(
        `
        id,
        admin_id,
        users(username),
        action,
        entity_type,
        entity_id,
        entity_name,
        changes,
        timestamp
      `,
        { count: 'exact' }
      )
      .order('timestamp', { ascending: false });

    // Apply filters
    if (adminId) {
      query = query.eq('admin_id', adminId);
    }
    if (action) {
      query = query.eq('action', action);
    }
    if (entityType) {
      query = query.eq('entity_type', entityType);
    }
    if (startDate) {
      query = query.gte('timestamp', startDate);
    }
    if (endDate) {
      query = query.lte('timestamp', endDate);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format response
    const formattedData = data.map((log: any) => ({
      id: log.id,
      admin_id: log.admin_id,
      admin_name: log.users?.username || 'Unknown',
      action: log.action,
      entity_type: log.entity_type,
      entity_id: log.entity_id,
      entity_name: log.entity_name,
      changes: log.changes,
      timestamp: log.timestamp,
    }));

    return NextResponse.json({
      success: true,
      data: formattedData,
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('Audit logs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

Expected: Endpoint created, no errors.

- [ ] **Step 2: Commit**

```bash
git add app/api/admin/audit-logs/route.ts
git commit -m "feat: Add audit logs fetch endpoint with filtering"
```

---

### Task 11: Create Audit Logs CSS

**Files:**
- Create: `/app/dashboard/admin/audit-logs/audit-logs.css`

- [ ] **Step 1: Create CSS file with 3-layer architecture**

Create `/app/dashboard/admin/audit-logs/audit-logs.css`:

```css
/* LAYER 1: DESIGN TOKENS */
:root {
  --audit-space-xs: 4px;
  --audit-space-sm: 8px;
  --audit-space-md: 12px;
  --audit-space-lg: 16px;
  --audit-space-xl: 20px;

  --audit-color-bg: var(--color-linen, #F5F2EE);
  --audit-color-surface: #FFFFFF;
  --audit-color-border: var(--color-sand, rgb(234, 228, 221));
  --audit-color-text: var(--color-charcoal, #2c2c2c);
  --audit-color-text-muted: #999;
  --audit-color-badge-create: #4a6741;
  --audit-color-badge-update: #2d5a3d;
  --audit-color-badge-delete: #8a1b1b;
  --audit-color-accent: var(--color-burgundy, #7b2d3e);

  --audit-font-size-sm: 12px;
  --audit-font-size-base: 13px;
  --audit-font-size-lg: 14px;

  --audit-radius: 6px;
  --audit-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

/* LAYER 2: LAYOUT CONTAINERS */
.audit-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--audit-color-bg);
}

.audit-header {
  padding: var(--audit-space-lg);
  border-bottom: 1px solid var(--audit-color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.audit-filters {
  padding: var(--audit-space-lg);
  background: var(--audit-color-surface);
  border-bottom: 1px solid var(--audit-color-border);
  display: flex;
  gap: var(--audit-space-lg);
  align-items: flex-end;
  flex-wrap: wrap;
}

.audit-filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--audit-space-sm);
}

.audit-table-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: var(--audit-space-lg);
}

.audit-table {
  width: 100%;
  border-collapse: collapse;
}

.audit-pagination {
  padding: var(--audit-space-lg);
  background: var(--audit-color-surface);
  border-top: 1px solid var(--audit-color-border);
  display: flex;
  justify-content: center;
  gap: var(--audit-space-md);
  align-items: center;
}

/* LAYER 3: COMPONENTS */
.audit-table thead {
  background: var(--audit-color-surface);
  position: sticky;
  top: 0;
  z-index: 10;
}

.audit-table th {
  padding: var(--audit-space-md);
  text-align: left;
  font-size: var(--audit-font-size-sm);
  font-weight: 600;
  color: var(--audit-color-text-muted);
  border-bottom: 1px solid var(--audit-color-border);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.audit-table td {
  padding: var(--audit-space-md);
  border-bottom: 1px solid var(--audit-color-border);
  font-size: var(--audit-font-size-base);
  color: var(--audit-color-text);
}

.audit-table tbody tr:hover {
  background: var(--audit-color-bg);
}

.audit-action-badge {
  display: inline-block;
  padding: var(--audit-space-xs) var(--audit-space-sm);
  border-radius: var(--audit-radius);
  font-size: var(--audit-font-size-sm);
  font-weight: 600;
  text-transform: capitalize;
}

.audit-action-badge.create {
  background: rgba(74, 103, 65, 0.15);
  color: var(--audit-color-badge-create);
}

.audit-action-badge.update {
  background: rgba(45, 90, 61, 0.15);
  color: var(--audit-color-badge-update);
}

.audit-action-badge.delete {
  background: rgba(138, 27, 27, 0.15);
  color: var(--audit-color-badge-delete);
}

.audit-details-button {
  background: var(--audit-color-accent);
  color: white;
  border: none;
  padding: 4px 12px;
  border-radius: var(--audit-radius);
  cursor: pointer;
  font-size: var(--audit-font-size-sm);
  font-weight: 500;
  transition: background 0.2s;
}

.audit-details-button:hover {
  background: #662038;
}

.audit-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.audit-modal {
  background: var(--audit-color-surface);
  border-radius: 8px;
  padding: var(--audit-space-xl);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.audit-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--audit-space-lg);
  border-bottom: 1px solid var(--audit-color-border);
  padding-bottom: var(--audit-space-md);
}

.audit-modal-title {
  font-size: var(--audit-font-size-lg);
  font-weight: 600;
  color: var(--audit-color-text);
}

.audit-modal-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--audit-color-text-muted);
}

.audit-modal-close:hover {
  color: var(--audit-color-text);
}

.audit-changes-json {
  background: var(--audit-color-bg);
  padding: var(--audit-space-md);
  border-radius: var(--audit-radius);
  font-family: 'Courier New', monospace;
  font-size: 12px;
  overflow-x: auto;
  color: var(--audit-color-text);
}

.audit-filter-input,
.audit-filter-select {
  padding: var(--audit-space-sm) var(--audit-space-md);
  border: 1px solid var(--audit-color-border);
  border-radius: var(--audit-radius);
  font-size: var(--audit-font-size-base);
  font-family: inherit;
}

.audit-filter-input:focus,
.audit-filter-select:focus {
  outline: none;
  border-color: var(--audit-color-accent);
  box-shadow: 0 0 0 3px rgba(123, 45, 62, 0.1);
}

.audit-button {
  padding: var(--audit-space-sm) var(--audit-space-md);
  border: 1px solid var(--audit-color-border);
  background: var(--audit-color-surface);
  border-radius: var(--audit-radius);
  cursor: pointer;
  font-size: var(--audit-font-size-base);
  transition: background 0.2s, border-color 0.2s;
}

.audit-button:hover {
  background: var(--audit-color-bg);
  border-color: var(--audit-color-accent);
}

.audit-button.primary {
  background: var(--audit-color-accent);
  color: white;
  border-color: var(--audit-color-accent);
}

.audit-button.primary:hover {
  background: #662038;
}

.audit-pagination-button {
  padding: 6px 12px;
  border: 1px solid var(--audit-color-border);
  background: var(--audit-color-surface);
  border-radius: var(--audit-radius);
  cursor: pointer;
  font-size: var(--audit-font-size-sm);
}

.audit-pagination-button:hover {
  background: var(--audit-color-bg);
}

.audit-pagination-button.active {
  background: var(--audit-color-accent);
  color: white;
  border-color: var(--audit-color-accent);
}

.audit-pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.audit-empty-state {
  text-align: center;
  padding: var(--audit-space-xl) var(--audit-space-lg);
  color: var(--audit-color-text-muted);
  font-size: var(--audit-font-size-base);
}

.audit-loading {
  text-align: center;
  padding: var(--audit-space-xl);
  color: var(--audit-color-text-muted);
}

.audit-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid var(--audit-color-border);
  border-top-color: var(--audit-color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

Expected: CSS file created, no syntax errors.

- [ ] **Step 2: Commit**

```bash
git add app/dashboard/admin/audit-logs/audit-logs.css
git commit -m "feat: Add audit logs styling with 3-layer CSS"
```

---

### Task 12: Create AuditLogsFilter Component

**Files:**
- Create: `/app/dashboard/admin/audit-logs/AuditLogsFilter.tsx`

- [ ] **Step 1: Create filter component**

Create `/app/dashboard/admin/audit-logs/AuditLogsFilter.tsx`:

```typescript
'use client';

import React, { useState } from 'react';
import '../audit-logs.css';

interface FilterState {
  adminId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}

interface AuditLogsFilterProps {
  admins: Array<{ id: string; username: string }>;
  onFilterChange: (filters: FilterState) => void;
}

export default function AuditLogsFilter({
  admins,
  onFilterChange,
}: AuditLogsFilterProps) {
  const [filters, setFilters] = useState<FilterState>({});

  const handleChange = (key: keyof FilterState, value: string) => {
    const updated = { ...filters, [key]: value || undefined };
    setFilters(updated);
  };

  const handleClear = () => {
    setFilters({});
    onFilterChange({});
  };

  const handleApply = () => {
    onFilterChange(filters);
  };

  return (
    <div className="audit-filters">
      <div className="audit-filter-group">
        <label htmlFor="admin-filter">Admin:</label>
        <select
          id="admin-filter"
          className="audit-filter-select"
          value={filters.adminId || ''}
          onChange={(e) => handleChange('adminId', e.target.value)}
        >
          <option value="">All Admins</option>
          {admins.map((admin) => (
            <option key={admin.id} value={admin.id}>
              {admin.username}
            </option>
          ))}
        </select>
      </div>

      <div className="audit-filter-group">
        <label htmlFor="action-filter">Action:</label>
        <select
          id="action-filter"
          className="audit-filter-select"
          value={filters.action || ''}
          onChange={(e) => handleChange('action', e.target.value)}
        >
          <option value="">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
        </select>
      </div>

      <div className="audit-filter-group">
        <label htmlFor="start-date">From:</label>
        <input
          id="start-date"
          type="date"
          className="audit-filter-input"
          value={filters.startDate || ''}
          onChange={(e) => handleChange('startDate', e.target.value)}
        />
      </div>

      <div className="audit-filter-group">
        <label htmlFor="end-date">To:</label>
        <input
          id="end-date"
          type="date"
          className="audit-filter-input"
          value={filters.endDate || ''}
          onChange={(e) => handleChange('endDate', e.target.value)}
        />
      </div>

      <button className="audit-button primary" onClick={handleApply}>
        Apply
      </button>
      <button className="audit-button" onClick={handleClear}>
        Clear
      </button>
    </div>
  );
}
```

Expected: Component created, no errors.

- [ ] **Step 2: Commit**

```bash
git add app/dashboard/admin/audit-logs/AuditLogsFilter.tsx
git commit -m "feat: Add audit logs filter component"
```

---

### Task 13: Create AuditLogDetailModal Component

**Files:**
- Create: `/app/dashboard/admin/audit-logs/AuditLogDetailModal.tsx`

- [ ] **Step 1: Create modal component**

Create `/app/dashboard/admin/audit-logs/AuditLogDetailModal.tsx`:

```typescript
'use client';

import React from 'react';
import '../audit-logs.css';

interface AuditLogDetailModalProps {
  isOpen: boolean;
  changes: Record<string, any> | null;
  onClose: () => void;
}

export default function AuditLogDetailModal({
  isOpen,
  changes,
  onClose,
}: AuditLogDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="audit-modal-overlay" onClick={onClose}>
      <div className="audit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="audit-modal-header">
          <h2 className="audit-modal-title">Change Details</h2>
          <button
            className="audit-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {changes ? (
          <pre className="audit-changes-json">
            {JSON.stringify(changes, null, 2)}
          </pre>
        ) : (
          <p>No changes recorded</p>
        )}
      </div>
    </div>
  );
}
```

Expected: Component created, no errors.

- [ ] **Step 2: Commit**

```bash
git add app/dashboard/admin/audit-logs/AuditLogDetailModal.tsx
git commit -m "feat: Add audit log detail modal component"
```

---

### Task 14: Create AuditLogsList Component

**Files:**
- Create: `/app/dashboard/admin/audit-logs/AuditLogsList.tsx`

- [ ] **Step 1: Create main component**

Create `/app/dashboard/admin/audit-logs/AuditLogsList.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';
import AuditLogsFilter from './AuditLogsFilter';
import AuditLogDetailModal from './AuditLogDetailModal';
import '../audit-logs.css';

interface AuditLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action: 'create' | 'update' | 'delete';
  entity_type: 'user' | 'role' | 'permission';
  entity_id: string;
  entity_name: string;
  changes: Record<string, any> | null;
  timestamp: string;
}

interface FilterState {
  adminId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}

export default function AuditLogsList() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [admins, setAdmins] = useState<Array<{ id: string; username: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<FilterState>({});
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const limit = 50;

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  async function fetchLogs() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.adminId) params.append('admin_id', filters.adminId);
      if (filters.action) params.append('action', filters.action);
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const res = await fetch(`/api/admin/audit-logs?${params}`, {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to fetch audit logs');
      }

      const data = await res.json();
      setLogs(data.data);
      setTotal(data.total);

      // Extract unique admins from logs
      const uniqueAdmins = Array.from(
        new Map(
          data.data.map((log: AuditLog) => [
            log.admin_id,
            { id: log.admin_id, username: log.admin_name },
          ])
        ).values()
      );
      setAdmins(uniqueAdmins);
    } catch (err) {
      setError('Unable to load audit logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  const handleShowDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailModalOpen(true);
  };

  return (
    <div className="audit-container">
      <AuditLogsFilter admins={admins} onFilterChange={handleFilterChange} />

      <div className="audit-table-wrapper">
        {loading ? (
          <div className="audit-loading">
            <div className="audit-spinner"></div>
            <p>Loading audit logs...</p>
          </div>
        ) : error ? (
          <div className="audit-empty-state" style={{ color: '#8a1b1b' }}>
            {error}
          </div>
        ) : logs.length === 0 ? (
          <div className="audit-empty-state">No audit logs found</div>
        ) : (
          <table className="audit-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Admin</th>
                <th>Action</th>
                <th>Entity Type</th>
                <th>Entity Name</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                  <td>{log.admin_name}</td>
                  <td>
                    <span className={`audit-action-badge ${log.action}`}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>
                    {log.entity_type}
                  </td>
                  <td>{log.entity_name}</td>
                  <td>
                    <button
                      className="audit-details-button"
                      onClick={() => handleShowDetails(log)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && !error && logs.length > 0 && (
        <div className="audit-pagination">
          <button
            className="audit-pagination-button"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            ← Prev
          </button>

          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
            const start = Math.max(1, page - 3);
            const pageNum = start + i;
            if (pageNum > totalPages) return null;
            return (
              <button
                key={pageNum}
                className={`audit-pagination-button ${
                  pageNum === page ? 'active' : ''
                }`}
                onClick={() => setPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            className="audit-pagination-button"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            Next →
          </button>

          <span style={{ marginLeft: '10px', color: 'var(--audit-color-text-muted)' }}>
            Page {page} of {totalPages} ({total} total)
          </span>
        </div>
      )}

      {selectedLog && (
        <AuditLogDetailModal
          isOpen={detailModalOpen}
          changes={selectedLog.changes}
          onClose={() => setDetailModalOpen(false)}
        />
      )}
    </div>
  );
}
```

Expected: Component created with full functionality.

- [ ] **Step 2: Commit**

```bash
git add app/dashboard/admin/audit-logs/AuditLogsList.tsx
git commit -m "feat: Add audit logs list component with filtering and pagination"
```

---

### Task 15: Create Audit Logs Page

**Files:**
- Create: `/app/dashboard/admin/audit-logs/page.tsx`

- [ ] **Step 1: Create page wrapper**

Create `/app/dashboard/admin/audit-logs/page.tsx`:

```typescript
import AuditLogsList from './AuditLogsList';

export default function AuditLogsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h1 style={{ padding: '16px', marginBottom: '0' }}>Audit Logs</h1>
      <AuditLogsList />
    </div>
  );
}
```

Expected: Page created, compiles without errors.

- [ ] **Step 2: Commit**

```bash
git add app/dashboard/admin/audit-logs/page.tsx
git commit -m "feat: Add audit logs page"
```

---

### Task 16: Update Sidebar to Show Audit Logs Link

**Files:**
- Modify: `/app/dashboard/components/Sidebar.tsx`

- [ ] **Step 1: Add Audit Logs link**

In Sidebar.tsx, find the Admin section and add:

```typescript
// Inside the Admin section, after Users link:
{userRole === 'Super Admin' && (
  <Link href="/app/dashboard/admin/audit-logs" className="nav-link">
    📋 Audit Logs
  </Link>
)}
```

Or if using a different structure, ensure the link only shows for super-admins:

```typescript
{isSuperAdmin && (
  <NavItem href="/app/dashboard/admin/audit-logs" icon="📋">
    Audit Logs
  </NavItem>
)}
```

Expected: Sidebar link appears only for super-admins.

- [ ] **Step 2: Commit**

```bash
git add app/dashboard/components/Sidebar.tsx
git commit -m "feat: Add audit logs link to sidebar (super-admin only)"
```

---

### Task 17: Update AdminLayout for Super-Admin Check

**Files:**
- Modify: `/app/dashboard/admin/layout.tsx`

- [ ] **Step 1: Add super-admin check for audit logs**

In `/app/dashboard/admin/layout.tsx`, update the auth check:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/verify', { credentials: 'include' });
        if (!res.ok) {
          router.push('/app/login');
          return;
        }

        const user = await res.json();

        // Check if accessing audit-logs and user is not super-admin
        if (
          pathname.includes('audit-logs') &&
          user.role !== 'Super Admin' &&
          !user.permissions?.includes('is_super_admin')
        ) {
          router.push('/app/dashboard');
          return;
        }

        // Check for manage_roles or manage_users
        if (
          !user.permissions?.includes('manage_roles') &&
          !user.permissions?.includes('manage_users')
        ) {
          router.push('/app/login');
          return;
        }

        setAuthorized(true);
      } catch (err) {
        console.error('Auth check failed:', err);
        router.push('/app/login');
      }
    };

    checkAuth();
  }, [router, pathname]);

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
```

Expected: Layout checks super-admin status for audit-logs route.

- [ ] **Step 2: Commit**

```bash
git add app/dashboard/admin/layout.tsx
git commit -m "feat: Add super-admin check for audit logs access"
```

---

### Task 18: Manual Integration Testing

**Files:**
- No files modified; manual testing only

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

Expected: Server starts at http://localhost:3000

- [ ] **Step 2: Test create action logging**

1. Log in as admin with manage_users
2. Go to Users page
3. Create a new user (e.g., "testuser@example.com")
4. Submit form
5. Go to Audit Logs (if super-admin) or have super-admin navigate there
6. Verify entry shows: action="create", entity_type="user", admin_name, timestamp

Expected: Entry appears in audit logs table

- [ ] **Step 3: Test update action logging**

1. Go to Users page
2. Edit a user's email
3. Go to Audit Logs
4. Verify entry shows: action="update", changes shows old/new email

Expected: Changes JSON shows field diff

- [ ] **Step 4: Test filters**

1. Filter by action="create" → verify only creates shown
2. Filter by date range → verify correct entries
3. Click "Details" button → modal opens with changes JSON

Expected: All filters work correctly

- [ ] **Step 5: Test access control**

1. Log in as non-super-admin
2. Try accessing `/app/dashboard/admin/audit-logs` directly
3. Should redirect to dashboard

Expected: Access denied, redirect works

- [ ] **Step 6: Test pagination**

1. View first page of audit logs
2. Click "Next" → should show next 50 entries
3. Click page number → should jump to that page

Expected: Pagination works

- [ ] **Step 7: Build and verify no errors**

```bash
npm run build
```

Expected: Build succeeds with no errors

- [ ] **Step 8: Final commit**

```bash
git add .
git commit -m "feat: Complete audit logs Phase 2 implementation"
```

Expected: All changes committed successfully

---

## Success Criteria

- ✅ Audit logs table created in Supabase
- ✅ is_super_admin field added to roles
- ✅ All admin endpoints (users, roles, permissions) log actions
- ✅ `/api/admin/audit-logs` endpoint works with filtering and pagination
- ✅ Super-admin only can access `/app/dashboard/admin/audit-logs`
- ✅ Sidebar link visible only to super-admins
- ✅ Filters (admin, action, date) work correctly
- ✅ Details modal shows changes JSON formatted
- ✅ Pagination works (prev/next/page numbers)
- ✅ No console errors or security issues
- ✅ All 8 manual tests pass
- ✅ `npm run build` succeeds
