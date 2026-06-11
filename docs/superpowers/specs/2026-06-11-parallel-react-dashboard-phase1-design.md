# Parallel React Dashboard — Phase 1 Design Spec

**Date:** 2026-06-11  
**Project:** Sama Wellness Therapy Clinic App  
**Phase:** 1 (MVP: Admin Roles + Admin Users)  
**Status:** Design Approved

---

## Executive Summary

This spec defines Phase 1 of a parallel React-based dashboard for the Sama Wellness clinic app. The new dashboard coexists with the legacy HTML/JS system (no disruption), allowing teams to test modern React features while operations continue on the stable legacy system.

**Phase 1 scope:** Admin/Roles management + Admin/Users management, reusing existing components integrated into a new dashboard shell with Sama Wellness branding.

**Timeline:** ~1-2 weeks build time  
**Risk:** Low (reuses proven components, parallel operation means zero disruption)

---

## Problem Statement

Currently, the clinic app uses a hybrid architecture:
- Modern React pages at `/app/admin/` (Roles, Users)
- Legacy HTML/JS iframe at `/app` (all clinic operations)

This creates:
- **Maintenance burden:** Two separate tech stacks hard to evolve
- **Integration issues:** Difficult to share state/auth between React and iframe
- **UX inconsistency:** Users experience two different interfaces
- **Technical debt:** Hard to onboard new features or modernize incrementally

**Solution:** Build a parallel modern React dashboard as an alternative entry point, keeping the legacy system untouched and operational.

---

## Goals

1. **Non-disruptive:** Legacy dashboard remains fully functional for clinic operations
2. **User choice:** Users can toggle between old and new dashboard anytime
3. **Code reuse:** Leverage existing `/app/admin` React components
4. **Brand consistency:** Apply Sama Wellness design tokens throughout
5. **Foundation:** Establish scalable dashboard shell for Phase 2+ features

---

## Architecture

### Overall System

```
Browser
├── /app/login (shared)
│   └── JWT authentication (shared session)
│
├── /app (legacy — unchanged)
│   └── /clinic.html (iframe, all features)
│
└── /app/dashboard (new React — Phase 1)
    ├── layout.tsx (dashboard shell)
    ├── admin/
    │   ├── users/ (reuse component)
    │   └── roles/ (reuse component)
    └── page.tsx (home)
```

**Key principle:** Single authentication layer. Both paths use the same JWT token. Users can switch dashboards without re-logging in.

### Directory Structure

```
/app/dashboard/                          (new directory)
├── layout.tsx                           (Dashboard shell: sidebar, topbar, nav)
├── page.tsx                             (Dashboard home / redirect)
├── admin/
│   ├── layout.tsx                       (Admin section layout)
│   ├── users/
│   │   └── page.tsx                     (Reuse /app/admin/users component)
│   └── roles/
│       └── page.tsx                     (Reuse /app/admin/roles component)

/app/api/                                (existing, no changes)
└── (reuse all existing endpoints)
```

---

## Dashboard Shell (layout.tsx)

### Sidebar (220px fixed)

**Structure:**
```
SWT Logo & Branding
─────────────────
ADMIN
  📧 Users
  🔐 Roles (active)
```

**Styling:**
- Background: White
- Logo: Burgundy square with "S"
- Active link: Burgundy left border (3px) + light burgundy background
- Inactive link: White, hover = light sand background
- Section label: Uppercase, Josefin Sans, muted color

### Topbar (fixed at top)

**Left side:**
- Page title (Gilda Display, large)
- Breadcrumb or subtitle (muted text)

**Right side:**
- **Toggle button:** "Try Legacy Dashboard" (hollow burgundy border)
  - Text changes to "Try New Dashboard" when in legacy
  - On click: Navigate to `/app` (legacy) or `/app/dashboard` (new)

**Styling:**
- Background: White
- Border-bottom: 1px Sand
- Height: 60px

### Main Content Area

- Left of sidebar: Linen background (`#F5F2EE`)
- Padding: 20px
- Max-width: Flexible (fills available space)

---

## Pages

### 1. Dashboard Home (`/app/dashboard/page.tsx`)

**Option A (Simple):** Redirect directly to `/app/dashboard/admin/roles`

**Option B (Welcome Page):** Show brief introduction + quick links to Admin sections
- "Welcome to Sama Wellness Admin Dashboard"
- Quick links to Users and Roles
- Brief description of each

**Recommended:** Option A (simplest, faster MVP)

### 2. Admin/Roles (`/app/dashboard/admin/roles/page.tsx`)

**Action:** Reuse existing component from `/app/admin/roles/page.tsx`
- No code changes needed to the component
- Import and render within new dashboard shell

**Features (from existing code):**
- View all roles in list
- Create new role (name + description)
- Select role to view/edit permissions
- Assign permissions (organized by category)
- Checkboxes for permission management
- Success/error feedback

**New styling applied:**
- Buttons: Burgundy primary, Sand secondary
- Active states: Olive (success)
- Backgrounds: Linen + White cards
- Borders: Sand dividers

### 3. Admin/Users (`/app/dashboard/admin/users/page.tsx`)

**Action:** Reuse existing component from `/app/admin/users/page.tsx`
- No code changes needed to the component
- Import and render within new dashboard shell

**Features (from existing code):**
- View all users in table
- Create new user (username, email, password, role)
- Edit user (email, password, role, status)
- Deactivate user (soft delete)
- Role dropdown (fetched from API)

**New styling applied:**
- Buttons: Burgundy primary, Olive success
- Status badges: Olive (active), Sand (inactive)
- Backgrounds: Linen + White cards
- Borders: Sand dividers

---

## Authentication & Session Management

### Login Flow

1. User visits `/app` or `/app/dashboard`
2. Auth check runs (from `/app/app/page.tsx`)
3. If not authenticated → Redirect to `/app/login`
4. User enters credentials
5. JWT token created + stored in HTTP-only cookie
6. **Token is valid for both `/app` and `/app/dashboard`**
7. User role stored in localStorage

### Dashboard Toggle

**Initial load:** 
- Default behavior: Redirect to `/app` (legacy dashboard) after login
- User preference stored: `users.preferred_dashboard` in Supabase (optional, Phase 2)

**Toggle button:**
- Topbar button: "Try Legacy Dashboard" or "Try New Dashboard"
- On click: Navigate to `/app` or `/app/dashboard` (same session, no re-auth)

**Example flow:**
```
1. Login → /app (legacy, default)
2. Click "Try New Dashboard" → /app/dashboard
3. Browse admin pages
4. Click "Try Legacy Dashboard" → /app (same session)
5. No re-login required
```

---

## Styling & Theme

### Design Tokens (from Sama Wellness brand)

| Token | Value | Usage |
|-------|-------|-------|
| Linen | `#F5F2EE` | Page background, content areas |
| Sand | `rgb(234, 228, 221)` | Borders, inactive states |
| Nav Text | `rgb(45, 74, 70)` | Headings, primary text (teal) |
| Charcoal | `#2c2c2c` | Body text |
| Burgundy | `#7b2d3e` | CTAs, active states, accents |
| Olive | `#4a6741` | Success feedback, checked states |

### Typography

- **Display:** Gilda Display (serif, 400 weight, 28px)
- **UI Labels:** Josefin Sans (sans-serif, 600 weight, uppercase)
- **Body:** Nunito Sans (sans-serif, 400 weight, 12px)

### Component Styling

**Buttons:**
- Primary (Create, Save): Burgundy bg, white text, 8px radius
- Secondary: Sand bg, Nav Text, 8px radius
- Hover: Darken slightly
- Active: Scale 0.98

**Form Elements:**
- Input borders: Sand (1px)
- Focus: Burgundy border + subtle shadow
- Labels: Josefin Sans, uppercase

**Cards:**
- Background: White
- Border: 1px Sand
- Border-radius: 8px
- Shadows: Optional, subtle

**Status Badges:**
- Active: Olive bg + text
- Inactive: Sand bg + text
- Checked: Olive circle (✓)
- Unchecked: Sand circle

---

## Feature Specifications

### Feature Group 1: Admin/Roles Management

**1.1 — View Roles List** (Partially implemented ✓, needs enhancement)

*Currently working:*
- ✓ Display all roles in list
- ✓ Show role name + permission count
- ✓ Click to select role for permission editing
- ✓ Empty state messaging
- ✓ Loading states

*Missing - To be added in Phase 1:*
- ✗ Search/filter by role name
- ✗ Sort by name/created date
- ✗ Edit role (change name/description)
- ✗ Delete/archive role

**Action for Phase 1:** Add search input, sort options, and edit/delete buttons to roles list.

**1.2 — Create New Role** (Fully implemented ✓)
- ✓ Slide-in panel with form
- ✓ Fields: Name (req), Description (opt)
- ✓ Validation: Name not empty, unique
- ✓ Cancel & Create buttons
- ✓ Success: Close panel, refresh list

**Action for Phase 1:** No code changes needed. Reuse as-is.

**1.3 — Assign Permissions to Role** (Fully implemented ✓)
- ✓ Right panel shows selected role
- ✓ Permissions grouped by category
- ✓ Checkboxes: Toggle permission on/off
- ✓ Visual: Checked = Olive circle, Unchecked = Sand circle
- ✓ Counter: "X permissions selected"
- ✓ Save button (only if changed)
- ✓ Success: Toast, refresh list

**Action for Phase 1:** No code changes needed. Reuse as-is.

**1.4 — Edit Role** (NEW - Not yet implemented ✗)
- Button: "Edit" (pencil icon) next to each role in list
- Modal form: Name (editable), Description (editable)
- Save & Cancel buttons
- Validation: Name not empty, unique (excluding current role)
- Success: Update list, show toast

**Action for Phase 1:** Implement this new feature.

**1.5 — Delete Role** (NEW - Not yet implemented ✗)
- Button: "Delete" (trash icon) next to each role
- Confirmation dialog: "Delete this role? Users with this role will need reassignment."
- Hard or soft delete (recommend soft delete to preserve history)
- Success: Remove from list, show toast

**Action for Phase 1:** Implement this new feature.

### Feature Group 2: Admin/Users Management

**2.1 — View Users List** (Partially implemented ✓, needs enhancement)

*Currently working:*
- ✓ Table: Username, Email, Role, Status, Created date
- ✓ Actions: Edit & Deactivate buttons
- ✓ Status badges (Active/Inactive)
- ✓ Empty state messaging
- ✓ Loading states

*Missing - To be added in Phase 1:*
- ✗ Search by username/email
- ✗ Filter by role or status (Active/Inactive)
- ✗ Sort by column (username, created date, role)
- ✗ Pagination (currently shows all users; needs 25 users per page)

**Action for Phase 1:** Add search input, filter dropdowns, sortable column headers, and pagination.

**2.2 — Create User** (Fully implemented ✓)
- ✓ Modal/slide-in form
- ✓ Fields: Username (req, unique), Email (opt, unique), Password (req), Role (req, dropdown)
- ✓ Validation: Username unique, email format, password strength, role selected
- ✓ Cancel & Create buttons
- ✓ Success: Close panel, refresh list, show toast
- ✓ Error handling: Specific error messages

**Action for Phase 1:** No code changes needed. Reuse as-is.

**2.3 — Edit User** (Fully implemented ✓)
- ✓ Edit form: Username (read-only), Email, Password (opt), Role, Status toggle
- ✓ Leave password blank = keep current password
- ✓ Update button (only if data changed)
- ✓ Validation: Same as create form
- ✓ Success: Update list, show toast

**Action for Phase 1:** No code changes needed. Reuse as-is.

**2.4 — Deactivate User** (Fully implemented ✓, minor enhancement needed)
- ✓ Button: "Deactivate" in users table
- ✓ Confirmation dialog: "Are you sure you want to block this user?"
- ✓ Soft delete: Mark as inactive
- ✓ Success: Update list, show toast
- ✗ Missing: Check to prevent deactivating current user (disable button for self)

**Action for Phase 1:** Add logic to disable deactivate button for current logged-in user.

---

## API Integration

### Existing Endpoints (Reuse as-is)

**Admin/Roles:**
- `GET /api/admin/roles` — List all roles with permissions
- `POST /api/admin/roles` — Create new role
- `POST /api/admin/roles/[id]/permissions` — Assign permissions

**Admin/Users:**
- `GET /api/admin/users` — List all users
- `POST /api/admin/users` — Create user
- `PUT /api/admin/users/[id]` — Update user
- `DELETE /api/admin/users/[id]` — Deactivate user (soft delete)

### New Endpoints Required for Phase 1

**Admin/Roles — Enhancement Endpoints:**
- `PUT /api/admin/roles/[id]` — Update role (name, description) — **NEEDS TO BE BUILT**
- `DELETE /api/admin/roles/[id]` — Delete/archive role — **NEEDS TO BE BUILT**

**Admin/Users — No new endpoints needed** (all functionality covered by existing endpoints)

### Implementation Notes

- **Roles edit/delete:** Need to create two new API endpoints at `/api/admin/roles/[id]` (PUT and DELETE)
- **Users search/filter/sort:** Implemented client-side (no API changes needed, all users fetched then filtered in React)
- **Users pagination:** Implemented client-side (fetch all users, paginate in React component)

**Note:** If users table grows large, consider moving search/filter/sort/pagination to server-side in Phase 2 for better performance.

---

## Error Handling & Edge Cases

**Authentication Expired:**
- JWT expires during session
- Redirect to `/app/login`
- Same for both dashboards

**API Errors:**
- Show error toast with specific message
- Retry option for transient failures
- Graceful fallback UI

**Permission Denied:**
- User lacks `manage_roles` or `manage_users` permission
- Show locked page: "You don't have access to this section"

**Data Conflicts:**
- Supabase is single source of truth
- No conflicts expected (both dashboards query same tables)
- Optimistic updates + validation on save

---

## Testing Strategy

### Manual Testing (MVP Phase)

1. **Login & Toggle:**
   - Login at `/app/login`
   - Verify redirect to `/app` (legacy default)
   - Click "Try New Dashboard" → `/app/dashboard`
   - Verify same session (no re-login)
   - Toggle back to legacy, verify session persists

2. **Admin/Roles:**
   - Create new role
   - Verify in roles list
   - Assign permissions
   - Verify permissions saved
   - Toggle to legacy, verify role appears in legacy system

3. **Admin/Users:**
   - Create new user
   - Verify in users list
   - Edit user (change email/role)
   - Verify changes saved
   - Deactivate user, verify status updated

4. **Parallel Operation:**
   - Keep legacy dashboard running in one tab
   - Use new dashboard in another tab
   - Create user in new dashboard
   - Verify user appears in legacy dashboard (real-time sync)

### Automated Testing (Phase 2)

- Unit tests for components (role, user create/edit)
- Integration tests for API calls
- E2E tests for workflows (login → create role → assign permissions)

---

## Rollout & Migration Path

### Phase 1 (Current)
- Launch new dashboard with Admin/Roles + Admin/Users
- Mark as "MVP / Testing" in UI (optional banner)
- Users opt-in to try new dashboard
- Gather feedback

### Phase 2 (Future)
- Add Clients management
- Add Bookings, Payments, Assessments
- Address Phase 1 feedback
- Increase user adoption

### Phase 3+ (Future)
- Add reporting, P&L, expenses
- Deprecate legacy iframe when Phase 2 is stable
- Full migration to React

---

## Success Criteria

✓ Dashboard shell built and styled with Sama Wellness brand  
✓ Admin/Roles component integrated and functional  
✓ Admin/Users component integrated and functional  
✓ Toggle between legacy and new dashboard works seamlessly  
✓ Session persists across both dashboards  
✓ All existing features (roles, users, permissions) work identically to legacy  
✓ New dashboard loads without impacting legacy operations  
✓ No data loss or conflicts (single source of truth = Supabase)

---

## Open Questions / Decisions Made

**Q: Should dashboard have a home page or redirect directly to roles?**  
**A:** Redirect to `/app/dashboard/admin/roles` (simplest MVP).

**Q: Store user dashboard preference (legacy vs new)?**  
**A:** Not for Phase 1. All users default to legacy, can toggle manually. Phase 2: Add `preferred_dashboard` to user profile.

**Q: Should legacy system be hidden or still accessible?**  
**A:** Both accessible. Toggle button allows switching. Legacy is default.

**Q: Can users use both dashboards simultaneously?**  
**A:** Yes. Same session, same data. Open in two tabs if desired.

---

## Files to Create/Modify

### New Files
- `/app/dashboard/layout.tsx` — Dashboard shell (sidebar, topbar)
- `/app/dashboard/page.tsx` — Home (redirect or welcome)
- `/app/dashboard/admin/layout.tsx` — Admin section wrapper
- `/app/dashboard/admin/users/page.tsx` — Import & wrap existing component
- `/app/dashboard/admin/roles/page.tsx` — Import & wrap existing component

### Modified Files
- `/app/app/page.tsx` — Add toggle button to topbar

### No Changes Needed
- `/app/api/*` — All endpoints reused as-is
- `/app/admin/*` — Existing components, no modifications

---

## Performance Considerations

- **Code reuse:** Components already exist, zero rework
- **API calls:** Existing endpoints, no new queries
- **Bundle size:** Dashboard shell small (~5KB), reused components already bundled
- **Load time:** Comparable to legacy (React faster than iframe load)

---

## Security Considerations

- **Auth:** Shared JWT token, same validation for both dashboards
- **Permissions:** Role-based access control (manage_roles, manage_users) enforced server-side
- **Data:** All sensitive operations require valid JWT + permission check
- **CSRF:** Using HTTP-only cookies for tokens

---

## Notes for Implementation

1. Reuse existing components: Don't rewrite Admin/Roles or Admin/Users
2. Focus on dashboard shell: Sidebar, topbar, navigation
3. Apply brand colors consistently: Use CSS variables from Sama Wellness palette
4. Test parallel operation: Keep legacy running while developing new dashboard
5. Commit early: Each major component (shell, users, roles) = separate commits
6. Zero breaking changes: Legacy system must remain untouched

---

## Document History

| Date | Author | Change |
|------|--------|--------|
| 2026-06-11 | Claude | Initial design spec (Phase 1 approved) |

---

**Approved by:** User (2026-06-11)  
**Ready for:** Implementation Planning
