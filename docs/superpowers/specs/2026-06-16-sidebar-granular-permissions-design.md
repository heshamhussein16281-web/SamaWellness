# Sidebar Granular Permission-Based Link Visibility

**Date:** 2026-06-16  
**Status:** Design approved  
**Scope:** Implement per-link permission checking in dashboard sidebar to show only links the user has permission to access

---

## Problem

Currently, the sidebar displays all navigation links (Clinical and Admin sections) to authenticated users, regardless of their actual permissions. While the layout components protect unauthorized access by redirecting to login, this creates a poor user experience:

- Users see links they cannot access (e.g., a view-only therapist sees edit buttons they can't use)
- No clear signal which features they have access to
- Inconsistent pattern: Audit Logs is conditionally hidden, but other links aren't

## Solution

Implement granular, per-link permission checking in the Sidebar component. Each link is only rendered if the user has the required permission to view that feature.

**Key principle:** Show/hide links based on VIEW permissions; control page-level actions (edit, delete) based on MANAGE permissions.

Example: User with `view_therapists` sees the Therapists link and can view the page read-only. User with `manage_therapists` sees the same link but can also edit and delete.

---

## Architecture

### Permission Mapping

Each navigation link requires a set of permissions. **Important:** Manage permissions imply view access — you cannot have `manage_*` without `view_*`.

**Clinical Section:**
- **Clients** → `view_clients` (also shown if user has `manage_clients`)
- **Bookings** → `view_bookings` (also shown if user has `manage_bookings`)
- **Therapists** → `view_therapists` OR `manage_therapists` (manage implies view)

**Admin Section:**
- **Clinics** → `manage_clinics` (viewing clinics is an admin-only feature, no separate view permission)
- **Users** → `manage_users` (managing users requires this permission)
- **Roles** → `manage_roles` (managing roles requires this permission)
- **Audit Logs** → `is_super_admin` (already implemented)

**Permission Hierarchy:**
- `view_*` permission = can access the section, view-only mode
- `manage_*` permission = implies `view_*`, plus edit/delete/create actions
- Check for `view_*` OR `manage_*` to show the link (both grant access)

### Data Flow

1. Sidebar mounts → calls `/api/auth/verify`
2. API returns user permissions array (from database, real-time)
3. Sidebar creates a permission lookup map
4. For each link, checks: `user.permissions?.includes(requiredPermission)` or uses `permissions.some()` for OR logic
5. Conditionally renders `<Link>` only if permission check passes
6. If entire section has no visible links, optionally hide section header

### Component Changes

**File:** `app/dashboard/components/Sidebar.tsx`

```typescript
// Add permission mapping (manage permissions imply view access)
const linkPermissions = {
  clients: ['view_clients', 'manage_clients'], // show if either permission exists
  bookings: ['view_bookings', 'manage_bookings'],
  therapists: ['view_therapists', 'manage_therapists'],
  clinics: ['manage_clinics'],
  users: ['manage_users'],
  roles: ['manage_roles'],
  auditLogs: ['is_super_admin'],
};

// Helper to check if user has any of the required permissions
const hasPermission = (permissions: string[], requiredPerms: string[]) => 
  requiredPerms.some(p => permissions?.includes(p));

// Conditionally render each link based on permission check
{user && hasPermission(user.permissions, linkPermissions.clients) && (
  <Link href="/dashboard/clinical/clients">...</Link>
)}

// Optional: hide section if no links are visible
const visibleClinicalLinks = [
  hasPermission(user.permissions, linkPermissions.clients),
  hasPermission(user.permissions, linkPermissions.bookings),
  hasPermission(user.permissions, linkPermissions.therapists),
].some(Boolean);

{visibleClinicalLinks && (
  <div className="sidebar-section">...</div>
)}
```

---

## Behavior & Edge Cases

### Normal Cases
- **Super Admin** → sees all links (has all permissions including is_super_admin)
- **Admin** → sees Clinics, Users, Roles links (has manage_* permissions)
- **Reception** → sees Clients, Bookings links (has view_clients, view_bookings)
- **Clinician** → sees Clients, Bookings, Therapists links (has view_clients, view_bookings, manage_therapists)

**Note:** A user with `manage_therapists` will see the Therapists link even without explicit `view_therapists` permission, because manage implies view.

### Edge Cases
1. **User permissions change in database** → Next sidebar render fetches fresh permissions, links update immediately (no logout needed)
2. **User navigates directly to hidden URL** → Layout component validates permission, redirects to login (same as current behavior)
3. **New permission added to database** → Sidebar will automatically include it once user gets that permission (flexible for future expansion)

---

## Page-Level Access Control (No Change)

The layout components (`clinical/layout.tsx`, `admin/layout.tsx`) continue to validate access when users navigate to pages:
- Clinical section requires at least one clinical permission
- Admin section requires management permissions or super-admin
- Audit Logs specifically requires super-admin

This means even if someone navigates directly to a hidden URL, they're protected by the layout validation.

---

## Testing Strategy

1. **Unit test:** Permission mapping logic — verify `hasPermission()` works correctly
2. **Integration test:** Create users with different roles, verify sidebar shows correct links for each role
3. **Manual test:** 
   - Super Admin → all links visible
   - Admin → only admin links visible
   - Reception → only clinical links visible
   - Clinician → all clinical links visible
4. **Edge case:** Change user role in database, refresh sidebar, verify links update

---

## Implementation Order

1. Update Sidebar component with permission mapping and conditional rendering
2. Add helper function `hasPermission()` for reusability
3. Test with different user roles
4. Add optional section-hiding logic if needed for cleaner UI

---

## Success Criteria

- ✅ Users only see sidebar links for features they have permission to access
- ✅ Permission updates reflect immediately (real-time from `/api/auth/verify`)
- ✅ No data leaks — layout validation still protects unauthorized access
- ✅ Consistent pattern — all links follow same permission check logic (except legacy code)
- ✅ UX improvement — clearer signal of what features are available to the user

---

## Files Modified

- `app/dashboard/components/Sidebar.tsx` — add permission mapping and conditional rendering
