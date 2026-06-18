# Sidebar Granular Permissions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement granular, per-link permission checking in the sidebar so users only see navigation links they have permission to access, while enforcing permission hierarchy (manage implies view) at the permission assignment level.

**Architecture:** 
- **Part 1** updates the Sidebar component to conditionally render links based on a permission mapping that checks if the user has the required permission(s)
- **Part 2** adds logic to the role/user permission assignment forms to automatically enable view permissions when manage permissions are selected, enforcing the permission hierarchy at the source

**Tech Stack:** Next.js 14 (App Router), React, TypeScript, Supabase (for permission data)

---

## File Structure

**Files to Modify:**
- `app/dashboard/components/Sidebar.tsx` — add permission mapping and conditional rendering logic
- `app/dashboard/admin/roles/RolesList.tsx` — add auto-enable logic for view permissions when manage permissions are selected

**Files Not Changed (but important context):**
- `/api/auth/verify` endpoint — already fetches permissions from database in real-time (no changes needed)
- Layout components (`clinical/layout.tsx`, `admin/layout.tsx`) — continue to validate access, no changes needed

---

## Task 1: Add Permission Mapping Helper to Sidebar

**Files:**
- Modify: `app/dashboard/components/Sidebar.tsx:1-50`

**Objective:** Define the permission requirements for each navigation link and create a helper function to check if a user has the required permissions.

- [ ] **Step 1: Open Sidebar.tsx and review current structure**

```bash
head -50 app/dashboard/components/Sidebar.tsx
```

Expected: See the component definition with useState hooks for user and loading state.

- [ ] **Step 2: Add permission mapping constant after imports, before the component**

Add this code after line 5 (after the `usePathname` import):

```typescript
// Permission mapping: each link requires at least one of these permissions
const linkPermissions = {
  clients: ['view_clients', 'manage_clients'],
  bookings: ['view_bookings', 'manage_bookings'],
  therapists: ['view_therapists', 'manage_therapists'],
  clinics: ['manage_clinics'],
  users: ['manage_users'],
  roles: ['manage_roles'],
  auditLogs: ['is_super_admin'],
};

// Helper function to check if user has permission for a link
const hasPermission = (permissions: string[] | undefined, requiredPerms: string[]): boolean => {
  if (!permissions) return false;
  return requiredPerms.some(p => permissions.includes(p));
};
```

- [ ] **Step 3: Verify the new code is inserted correctly**

```bash
grep -n "const linkPermissions" app/dashboard/components/Sidebar.tsx
```

Expected: Line number shows the constant is defined.

- [ ] **Step 4: Commit this change**

```bash
git add app/dashboard/components/Sidebar.tsx
git commit -m "feat: add permission mapping and helper function to Sidebar"
```

Expected: Commit succeeds with no errors.

---

## Task 2: Update Sidebar to Conditionally Render Clinical Links

**Files:**
- Modify: `app/dashboard/components/Sidebar.tsx:53-77` (Clinical Section)

**Objective:** Make Clinical section links visible only if the user has the required permissions.

- [ ] **Step 1: Replace the Clients link with conditional rendering**

Find the Clients link (around line 57) and replace:

```typescript
<Link href="/dashboard/clinical/clients" className={`sidebar-nav-link ${isActive('/dashboard/clinical/clients') ? 'active' : ''}`}>
  <div className={`sidebar-nav-item ${isActive('/dashboard/clinical/clients') ? 'active' : ''}`}>
    <span className="sidebar-icon">👤</span>
    <span className="sidebar-label">Clients</span>
  </div>
</Link>
```

With:

```typescript
{user && hasPermission(user.permissions, linkPermissions.clients) && (
  <Link href="/dashboard/clinical/clients" className={`sidebar-nav-link ${isActive('/dashboard/clinical/clients') ? 'active' : ''}`}>
    <div className={`sidebar-nav-item ${isActive('/dashboard/clinical/clients') ? 'active' : ''}`}>
      <span className="sidebar-icon">👤</span>
      <span className="sidebar-label">Clients</span>
    </div>
  </Link>
)}
```

- [ ] **Step 2: Replace the Bookings link with conditional rendering**

Find the Bookings link (around line 64) and wrap it similarly:

```typescript
{user && hasPermission(user.permissions, linkPermissions.bookings) && (
  <Link href="/dashboard/clinical/bookings" className={`sidebar-nav-link ${isActive('/dashboard/clinical/bookings') ? 'active' : ''}`}>
    <div className={`sidebar-nav-item ${isActive('/dashboard/clinical/bookings') ? 'active' : ''}`}>
      <span className="sidebar-icon">📅</span>
      <span className="sidebar-label">Bookings</span>
    </div>
  </Link>
)}
```

- [ ] **Step 3: Replace the Therapists link with conditional rendering**

Find the Therapists link (around line 71) and wrap it similarly:

```typescript
{user && hasPermission(user.permissions, linkPermissions.therapists) && (
  <Link href="/dashboard/clinical/therapists" className={`sidebar-nav-link ${isActive('/dashboard/clinical/therapists') ? 'active' : ''}`}>
    <div className={`sidebar-nav-item ${isActive('/dashboard/clinical/therapists') ? 'active' : ''}`}>
      <span className="sidebar-icon">💼</span>
      <span className="sidebar-label">Therapists</span>
    </div>
  </Link>
)}
```

- [ ] **Step 4: Verify the changes by checking line count**

```bash
wc -l app/dashboard/components/Sidebar.tsx
```

Expected: Line count should be slightly higher (added conditional wrappers).

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/components/Sidebar.tsx
git commit -m "feat: conditionally render Clinical section links based on user permissions"
```

---

## Task 3: Update Sidebar to Conditionally Render Admin Links

**Files:**
- Modify: `app/dashboard/components/Sidebar.tsx:83-106` (Admin Section)

**Objective:** Make Admin section links visible only if the user has the required permissions.

- [ ] **Step 1: Replace the Clinics link with conditional rendering**

Find the Clinics link (around line 86) and replace:

```typescript
<Link href="/dashboard/admin/clinics" className={`sidebar-nav-link ${isActive('/dashboard/admin/clinics') ? 'active' : ''}`}>
  <div className={`sidebar-nav-item ${isActive('/dashboard/admin/clinics') ? 'active' : ''}`}>
    <span className="sidebar-icon">🏥</span>
    <span className="sidebar-label">Clinics</span>
  </div>
</Link>
```

With:

```typescript
{user && hasPermission(user.permissions, linkPermissions.clinics) && (
  <Link href="/dashboard/admin/clinics" className={`sidebar-nav-link ${isActive('/dashboard/admin/clinics') ? 'active' : ''}`}>
    <div className={`sidebar-nav-item ${isActive('/dashboard/admin/clinics') ? 'active' : ''}`}>
      <span className="sidebar-icon">🏥</span>
      <span className="sidebar-label">Clinics</span>
    </div>
  </Link>
)}
```

- [ ] **Step 2: Replace the Users link with conditional rendering**

Find the Users link (around line 93) and wrap it:

```typescript
{user && hasPermission(user.permissions, linkPermissions.users) && (
  <Link href="/dashboard/admin/users" className={`sidebar-nav-link ${isActive('/dashboard/admin/users') ? 'active' : ''}`}>
    <div className={`sidebar-nav-item ${isActive('/dashboard/admin/users') ? 'active' : ''}`}>
      <span className="sidebar-icon">👥</span>
      <span className="sidebar-label">Users</span>
    </div>
  </Link>
)}
```

- [ ] **Step 3: Replace the Roles link with conditional rendering**

Find the Roles link (around line 100) and wrap it:

```typescript
{user && hasPermission(user.permissions, linkPermissions.roles) && (
  <Link href="/dashboard/admin/roles" className={`sidebar-nav-link ${isActive('/dashboard/admin/roles') ? 'active' : ''}`}>
    <div className={`sidebar-nav-item ${isActive('/dashboard/admin/roles') ? 'active' : ''}`}>
      <span className="sidebar-icon">🔐</span>
      <span className="sidebar-label">Roles</span>
    </div>
  </Link>
)}
```

- [ ] **Step 4: Note - Audit Logs link already has conditional rendering**

The Audit Logs link (around line 107) already has `{!loading && isSuperAdmin && (` — verify it's still there and unchanged.

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/components/Sidebar.tsx
git commit -m "feat: conditionally render Admin section links based on user permissions"
```

---

## Task 4: Add Empty Section Hiding Logic (Optional but Recommended)

**Files:**
- Modify: `app/dashboard/components/Sidebar.tsx:52-116` (both section divs)

**Objective:** Hide section headers and dividers if no links are visible in that section (cleaner UI).

- [ ] **Step 1: Add helper variables before the return statement**

Find the line `return (` (around line 42) and add this code right before it (after the `isSuperAdmin` declaration):

```typescript
  // Calculate visible links for each section
  const visibleClinicalLinks = [
    hasPermission(user?.permissions, linkPermissions.clients),
    hasPermission(user?.permissions, linkPermissions.bookings),
    hasPermission(user?.permissions, linkPermissions.therapists),
  ].some(Boolean);

  const visibleAdminLinks = [
    hasPermission(user?.permissions, linkPermissions.clinics),
    hasPermission(user?.permissions, linkPermissions.users),
    hasPermission(user?.permissions, linkPermissions.roles),
    isSuperAdmin, // Audit Logs visibility
  ].some(Boolean);
```

- [ ] **Step 2: Conditionally render the Clinical Section header and divider**

Find the Clinical Section div (around line 54) and change:

```typescript
{/* Clinical Section */}
<div className={`sidebar-section ${isClinicalSection ? 'sidebar-section-active' : ''}`}>
```

To:

```typescript
{/* Clinical Section */}
{visibleClinicalLinks && (
  <>
    <div className="sidebar-divider" />
    <div className={`sidebar-section ${isClinicalSection ? 'sidebar-section-active' : ''}`}>
```

And at the end of the Clinical Section (after the closing `</div>`), add:

```typescript
    </div>
  </>
)}
```

Also remove the divider that was originally at line 51 (the one before Clinical Section).

- [ ] **Step 3: Conditionally render the Admin Section header and divider**

Find the Admin Section div (around line 83) and apply the same pattern:

```typescript
{/* Admin Section */}
{visibleAdminLinks && (
  <>
    <div className="sidebar-divider" />
    <div className={`sidebar-section ${isAdminSection ? 'sidebar-section-active' : ''}`}>
```

And at the end of the Admin Section, add the closing tags:

```typescript
    </div>
  </>
)}
```

Also remove the divider that was originally at line 80 (the one before Admin Section).

- [ ] **Step 4: Verify the structure is correct**

```bash
npm run build 2>&1 | grep -i "error\|warning" || echo "Build succeeded"
```

Expected: No TypeScript errors about JSX structure.

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/components/Sidebar.tsx
git commit -m "feat: hide empty sidebar sections if no links are visible"
```

---

## Task 5: Add Permission Hierarchy Enforcement to RolesList

**Files:**
- Modify: `app/dashboard/admin/roles/RolesList.tsx:200-245`

**Objective:** When assigning permissions to a role, automatically enable view permissions if manage permissions are selected.

- [ ] **Step 1: Add permission hierarchy helper after imports**

Add this code after the Permission and Role interfaces (around line 23):

```typescript
// Permission hierarchy: manage permissions imply view access
const permissionHierarchy: Record<string, string> = {
  'manage_clients': 'view_clients',
  'manage_bookings': 'manage_bookings',
  'manage_therapists': 'view_therapists',
};
```

- [ ] **Step 2: Create helper function to auto-enable view permissions**

Add this function before the RolesList component definition (around line 25):

```typescript
const getImpliedPermissions = (selectedPermissionIds: string[], allPermissions: Permission[]): string[] => {
  const result = new Set(selectedPermissionIds);
  
  selectedPermissionIds.forEach(permId => {
    const perm = allPermissions.find(p => p.id === permId);
    if (!perm) return;
    
    // If manage_* permission is selected, also include view_* permission
    if (perm.key.startsWith('manage_')) {
      const viewKey = perm.key.replace('manage_', 'view_');
      const viewPerm = allPermissions.find(p => p.key === viewKey);
      if (viewPerm) {
        result.add(viewPerm.id);
      }
    }
  });
  
  return Array.from(result);
};
```

- [ ] **Step 3: Update the permission checkbox handler**

Find the `onChange` handler in the permission checkboxes (around line 633-639). The current code is:

```typescript
onChange={() => {
  setSelectedPermissions(
    selectedPermissions.includes(perm.id)
      ? selectedPermissions.filter((id) => id !== perm.id)
      : [...selectedPermissions, perm.id]
  );
}}
```

Replace it with:

```typescript
onChange={() => {
  let updatedPermissions: string[];
  if (selectedPermissions.includes(perm.id)) {
    // Removing a permission
    updatedPermissions = selectedPermissions.filter((id) => id !== perm.id);
  } else {
    // Adding a permission
    updatedPermissions = [...selectedPermissions, perm.id];
  }
  
  // Apply permission hierarchy (manage implies view)
  const withImpliedPerms = getImpliedPermissions(updatedPermissions, permissions);
  setSelectedPermissions(withImpliedPerms);
}}
```

- [ ] **Step 4: Verify the changes are syntactically correct**

```bash
npm run build 2>&1 | head -20
```

Expected: Build completes without TypeScript errors in RolesList.tsx.

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/admin/roles/RolesList.tsx
git commit -m "feat: auto-enable view permissions when manage permissions are selected in roles"
```

---

## Task 6: Test the Implementation End-to-End

**Files:**
- Test: Dev server and manual testing

**Objective:** Verify that sidebar links show/hide correctly based on user permissions, and that permission assignment enforces the hierarchy.

- [ ] **Step 1: Start the dev server**

```bash
npm run dev &
sleep 3
```

Expected: Server starts on port 3000.

- [ ] **Step 2: Navigate to the dashboard login page**

```bash
curl -s http://localhost:3000/app/login | grep -q "login" && echo "Login page accessible" || echo "Failed"
```

Expected: Login page loads.

- [ ] **Step 3: Log in as a test admin user and check sidebar**

(Manual browser testing required)
- Open http://localhost:3000/dashboard
- Verify that links appear based on your user's permissions
- Test with different permission combinations

- [ ] **Step 4: Test permission hierarchy in Roles management**

(Manual browser testing required)
- Go to http://localhost:3000/dashboard/admin/roles
- Create or edit a role
- Check `manage_therapists` permission
- Verify that `view_therapists` is automatically checked

- [ ] **Step 5: Verify permission changes are reflected immediately in sidebar**

(Manual browser testing required)
- Change a user's permissions in the database or via the Users page
- Refresh the sidebar (or navigate away and back)
- Verify sidebar links update based on new permissions

- [ ] **Step 6: Test with users of different roles**

Create test users with different roles (admin, reception, clinician) and verify:
- Admin sees all links
- Reception sees only Clinical section links
- Clinician sees Clinical links but not Admin links (unless they have manage permissions)

- [ ] **Step 7: Commit test results (optional)**

```bash
git log --oneline -5
```

Expected: See the feature commits from previous tasks.

---

## Task 7: Final Verification and Cleanup

**Files:**
- Verify: Sidebar.tsx, RolesList.tsx

**Objective:** Ensure code is clean, well-formatted, and follows project conventions.

- [ ] **Step 1: Run linting on modified files**

```bash
npm run lint -- app/dashboard/components/Sidebar.tsx app/dashboard/admin/roles/RolesList.tsx
```

Expected: No linting errors (warnings are okay).

- [ ] **Step 2: Verify no console errors or warnings**

Check the dev server logs and browser console during manual testing for any React warnings related to the Sidebar component.

Expected: No warnings about missing dependencies or state updates.

- [ ] **Step 3: Quick code review of permission mapping**

Verify in Sidebar.tsx that the `linkPermissions` object matches your actual permission keys in the database:
- `view_clients`, `manage_clients`
- `view_bookings`, `manage_bookings`
- `view_therapists`, `manage_therapists`
- `manage_clinics`
- `manage_users`
- `manage_roles`
- `is_super_admin`

If any keys don't match your database, update them now.

- [ ] **Step 4: Create a summary commit**

```bash
git log --oneline -10
```

Expected: See all feature commits. If needed, create a final summary commit:

```bash
git commit --allow-empty -m "docs: sidebar granular permissions implementation complete"
```

---

## Success Criteria

✅ **Part 1 (Sidebar Display):**
- Users only see sidebar links for features they have permission to access
- Permission updates reflect immediately (real-time from `/api/auth/verify`)
- Empty sections hide if no links are visible
- No data leaks — layout validation still protects unauthorized access

✅ **Part 2 (Permission Assignment):**
- When assigning `manage_*` permission, the corresponding `view_*` permission is automatically enabled
- Invalid permission combinations cannot be created
- Users cannot have manage without view

✅ **Overall:**
- Sidebar UX is cleaner and clearer about what features are available
- Permission hierarchy is enforced consistently across the app
- All tests pass and no console errors

---

## Implementation Order Priority

1. **Task 1-3** (Sidebar display) — Core feature, safe to implement first
2. **Task 4** (Empty section hiding) — UI enhancement, optional but recommended
3. **Task 5** (Permission hierarchy enforcement) — Critical for data integrity
4. **Task 6** (End-to-end testing) — Validates both parts work together
5. **Task 7** (Final verification) — Polish and cleanup
