# Audit Logs & Monitoring — Phase 2 Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a basic audit trail system tracking admin actions (create/update/delete users and roles) with 1-year rolling retention, accessible only to super-admins.

**Architecture:** Backend-driven logging at the API layer captures all admin modifications automatically. Frontend provides a searchable, filterable audit log viewer at `/app/dashboard/admin/audit-logs`. Super-admin role gates access.

**Tech Stack:** Next.js 14, React, TypeScript, Supabase (PostgreSQL), 3-layer CSS architecture

---

## Database Design

### New Table: `audit_logs`

```sql
CREATE TABLE audit_logs (
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

CREATE INDEX idx_audit_logs_admin ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
```

### Role Table Update

Add `is_super_admin` boolean field to distinguish super-admins:
```sql
ALTER TABLE roles ADD COLUMN is_super_admin BOOLEAN DEFAULT false;
```

Super-admin role is typically created once: name="Super Admin", is_super_admin=true, has all permissions enabled.

### Data Retention

Daily cleanup: Delete entries older than 1 year.
```sql
-- Run daily via cron or trigger
DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '1 year';
```

---

## API Endpoints

### Existing Endpoints (Modified to Log)

All existing admin endpoints now log to `audit_logs` after successful action:

**Users:**
- `POST /api/admin/users` → Log action="create", entity_type="user"
- `PUT /api/admin/users/[id]` → Log action="update", entity_type="user", capture field changes
- `DELETE /api/admin/users/[id]` → Log action="delete", entity_type="user"

**Roles:**
- `POST /api/admin/roles` → Log action="create", entity_type="role"
- `PUT /api/admin/roles/[id]` → Log action="update", entity_type="role", capture field changes
- `DELETE /api/admin/roles/[id]` → Log action="delete", entity_type="role"

**Permissions:**
- `POST /api/admin/roles/[id]/permissions` → Log action="update", entity_type="permission"

**Logging implementation:**
```typescript
// After successful modification:
await supabase.from('audit_logs').insert({
  admin_id: userId,
  action: 'create' | 'update' | 'delete',
  entity_type: 'user' | 'role' | 'permission',
  entity_id: affectedEntityId,
  entity_name: entityDisplayName,
  changes: { field: { old: oldValue, new: newValue } },
  timestamp: new Date()
});
```

For update actions, calculate diff and store in `changes` JSON field. For create/delete, `changes` can be null or empty.

---

### New Endpoint: Fetch Audit Logs

**GET `/api/admin/audit-logs`**

**Authentication:** Requires JWT with `is_super_admin: true`

**Query parameters:**
- `admin_id` (UUID, optional): Filter by admin who performed action
- `action` (string, optional): Filter by 'create'|'update'|'delete'
- `entity_type` (string, optional): Filter by 'user'|'role'|'permission'
- `start_date` (ISO string, optional): Logs after this date
- `end_date` (ISO string, optional): Logs before this date
- `page` (number, default 1): Pagination page
- `limit` (number, default 50): Entries per page

**Response:**
```typescript
{
  success: true,
  data: [
    {
      id: UUID,
      admin_id: UUID,
      admin_name: string,
      action: 'create' | 'update' | 'delete',
      entity_type: 'user' | 'role' | 'permission',
      entity_id: UUID,
      entity_name: string,
      changes: object | null,
      timestamp: ISO string
    }
  ],
  total: number,
  page: number,
  limit: number
}
```

**Error handling:**
- 403 Forbidden if user not super-admin
- 400 Bad Request if invalid filters
- 500 Internal Server Error with message logged to sentry

---

## Frontend Components

### New Page: `/app/dashboard/admin/audit-logs`

**Route structure:**
```
/app/dashboard/admin/audit-logs/page.tsx
/app/dashboard/admin/audit-logs/AuditLogsList.tsx
/app/dashboard/admin/audit-logs/AuditLogsFilter.tsx
/app/dashboard/admin/audit-logs/AuditLogDetailModal.tsx
/app/dashboard/admin/audit-logs/audit-logs.css
```

### Access Control

In `/app/dashboard/admin/layout.tsx`, add super-admin check:
```typescript
// Existing auth check, add:
const hasAuditAccess = user.permissions.includes('is_super_admin') || user.role === 'Super Admin';
if (pathname.includes('audit-logs') && !hasAuditAccess) {
  router.push('/app/dashboard');
}
```

### Sidebar Navigation

Add to Sidebar.tsx under Admin section (only visible if user is super-admin):
```
Admin
  └─ Roles
  └─ Users
  └─ Audit Logs [NEW - hidden if not super-admin]
```

### Components

**1. AuditLogsList.tsx (Main component)**
- State: logs[], filters (admin, action, date), page, loading, error
- Fetch logs on mount and when filters change
- Display table with columns: Timestamp | Admin | Action | Entity Type | Entity Name | Details button
- Pagination controls (prev/next/page number buttons)
- "Details" button opens modal showing full `changes` JSON

**2. AuditLogsFilter.tsx**
- Admin dropdown (populated from users who have performed actions)
- Action filter (radio or dropdown: All, Create, Update, Delete)
- Date range picker (start_date, end_date)
- "Clear filters" button resets to defaults
- All filter changes call parent's `onFilterChange()` handler

**3. AuditLogDetailModal.tsx**
- Opens when user clicks "Details" button
- Shows formatted JSON of `changes` field
- Pretty-print JSON with syntax highlighting if possible
- Close button

**4. audit-logs.css**
- Follows 3-layer CSS architecture:
  - Layer 1: Design tokens (reuse existing --color-*, --space-*, etc.)
  - Layer 2: Layout containers (.audit-table-container, .audit-filters, etc.)
  - Layer 3: Components (.audit-row, .action-badge, .detail-modal, etc.)
- Responsive table (scrollable on small screens)
- Match existing dashboard styling (colors, typography, spacing)

---

## Data Flow

### Admin Performs Action (e.g., Create User)

1. Admin fills form and submits
2. Frontend POSTs to `/api/admin/users` with user data
3. API validates, creates user in DB
4. API logs to `audit_logs`: action="create", entity_type="user", admin_id from JWT
5. API returns 201 success response
6. Frontend shows success toast

### Admin Views Audit Logs

1. Admin navigates to `/app/dashboard/admin/audit-logs`
2. Access check: JWT checked for `is_super_admin`, redirect if denied
3. Frontend fetches `GET /api/admin/audit-logs` (no filters on initial load)
4. API queries `audit_logs` table, joins with users table for admin names
5. API returns paginated results (default 50 per page)
6. Frontend renders table with timestamp, admin name, action, entity type, entity name
7. Admin can filter by admin, action, entity type, date range
8. Admin clicks "Details" button to see what changed (e.g., old vs. new email address)

---

## Error Handling

| Scenario | Frontend | Backend |
|----------|----------|---------|
| Audit log insert fails during action | Log to console/sentry, don't block user action | Return success (audit is secondary) |
| Audit logs fetch fails | Show "Unable to load audit logs" error | Return 500 with error message |
| Non-super-admin access `/audit-logs` | Redirect to `/app/dashboard/` | Return 403 if API called directly |
| Invalid filter parameters | Reset to defaults | Return 400 Bad Request |
| User deleted after action logged | admin_name shows as null gracefully | Query left-joins to handle nulls |

---

## Testing

**Manual browser tests:**
1. Create user → Navigate to Audit Logs → Verify entry with action="create"
2. Edit user email → Verify entry with changes showing old/new email
3. Delete role → Verify entry shows who deleted it and when
4. Filter by date range → Verify only logs in range shown
5. Filter by admin → Verify only that admin's actions shown
6. Filter by action → Verify create/update/delete filters work
7. Pagination → Verify next/prev/page number buttons work
8. Details modal → Click Details button, verify changes JSON displayed
9. Non-super-admin tries to access `/audit-logs` → Verify redirected to dashboard
10. Verify logs older than 1 year are deleted (via DB query or manual test deletion)

---

## Files to Create/Modify

**Create:**
- `/app/dashboard/admin/audit-logs/page.tsx`
- `/app/dashboard/admin/audit-logs/AuditLogsList.tsx`
- `/app/dashboard/admin/audit-logs/AuditLogsFilter.tsx`
- `/app/dashboard/admin/audit-logs/AuditLogDetailModal.tsx`
- `/app/dashboard/admin/audit-logs/audit-logs.css`
- `/app/api/admin/audit-logs/route.ts`

**Modify:**
- `/app/dashboard/admin/layout.tsx` — Add super-admin check
- `/app/dashboard/components/Sidebar.tsx` — Add Audit Logs link
- `/app/api/admin/users/route.ts` — Add logging
- `/app/api/admin/users/[id]/route.ts` — Add logging
- `/app/api/admin/roles/route.ts` — Add logging
- `/app/api/admin/roles/[id]/route.ts` — Add logging
- `/app/api/admin/roles/[id]/permissions/route.ts` — Add logging
- Database migration — Create `audit_logs` table, add `is_super_admin` to roles

---

## Implementation Notes

1. **Audit logging is best-effort** — If logging fails after an action succeeds, don't rollback the action. Log the failure to Sentry for monitoring.

2. **Changes JSON format** — For updates, store like:
   ```json
   {
     "email": { "old": "old@example.com", "new": "new@example.com" },
     "role": { "old": "Reception", "new": "Admin" }
   }
   ```

3. **Super-admin role** — Define clearly. Could be:
   - A specific role with `is_super_admin: true` flag
   - Or check if user has all permissions + certain permission like "view_audit_logs"

4. **Entity name for deleted items** — When logging delete, capture entity name before deletion so it shows in audit logs even if user/role deleted.

5. **Pagination performance** — With 1-year retention and daily clinic operations, audit_logs table could grow large. Index on `timestamp` and `admin_id` is critical.

---

## Success Criteria

- ✅ Audit logs table created and migrated
- ✅ All admin endpoints log to audit_logs
- ✅ `/api/admin/audit-logs` endpoint works with filters and pagination
- ✅ Super-admin only can view audit logs page
- ✅ Sidebar link appears only for super-admins
- ✅ Filters (admin, action, date) work correctly
- ✅ Details modal shows changes JSON formatted
- ✅ 1-year retention cleanup runs daily
- ✅ No console errors or security issues
- ✅ All 10 manual tests pass
