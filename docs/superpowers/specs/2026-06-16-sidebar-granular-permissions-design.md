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

Each navigation link requires a set of permissions (user needs at least one):

**Clinical Section:**
- **Clients** → `view_clients`
- **Bookings** → `view_bookings`
- **Therapists** → `view_therapists` OR `manage_therapists`

**Admin Section:**
- **Clinics** → `manage_clinics` (or fallback to existing admin check)
- **Users** → `manage_users`
- **Roles** → `manage_roles`
- **Audit Logs** → `is_super_admin` (already implemented)

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
// Add permission mapping
const linkPermissions = {
  clients: ['view_clients'],
  bookings: ['view_bookings'],
  therapists: ['view_therapists', 'manage_therapists'],
  clinics: ['manage_clinics', 'manage_roles', 'manage_users'], // fallback to existing admin perms
  users: ['manage_users'],
  roles: ['manage_roles'],
  auditLogs: ['is_super_admin'],
};

// Helper to check if user has permission for a link
const hasPermission = (permissions: string[], requiredPerms: string[]) => 
  requiredPerms.some(p => permissions?.includes(p));

// Conditionally render each link based on permission check
{user && hasPermission(user.permissions, linkPermissions.clients) && (
  <Link href="/dashboard/clinical/clients">...</Link>
)}

// Optional: hide section if no links are visible
const visibleClinicalLinks = [
  hasPermission(...clinicalLink),
  hasPermission(...therapistsLink),
  hasPermission(...bookingsLink),
].filter(Boolean).length > 0;

{visibleClinicalLinks && (
  <div className="sidebar-section">...</div>
)}
```

---

## Behavior & Edge Cases

### Normal Cases
- **Super Admin** → sees all links (has all permissions)
- **Admin** → sees Clinics, Users, Roles links
- **Reception** → sees Clients, Bookings links
- **Clinician** → sees Clients, Bookings, Therapists links

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
