# Parallel React Dashboard — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a parallel React-based dashboard coexisting with the legacy system, featuring Admin/Roles management (with edit/delete), Admin/Users management (with search/filter/sort/pagination), and seamless toggle between old and new dashboards.

**Architecture:** New dashboard shell at `/app/dashboard/` with sidebar navigation. Reuse existing Admin/Roles and Admin/Users components. Build new API endpoints for role edit/delete. Implement client-side search/filter/sort/pagination for users. Dashboard shell and API endpoints are new; most features reuse proven code.

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Supabase (existing DB), Lucide icons

**Timeline:** 1-2 weeks

---

## File Structure

```
/app/dashboard/                                (NEW - Dashboard section)
├── layout.tsx                                 (NEW - Dashboard shell: sidebar, topbar)
├── page.tsx                                   (NEW - Dashboard home/redirect)
├── components/
│   ├── Sidebar.tsx                            (NEW - Sidebar navigation)
│   ├── Topbar.tsx                             (NEW - Top navigation bar with toggle)
│   └── DashboardLayout.tsx                    (NEW - Shared layout wrapper)
├── admin/
│   ├── layout.tsx                             (MODIFY - Admin section wrapper)
│   ├── users/
│   │   ├── page.tsx                           (NEW - Wrapper, reuse /app/admin/users)
│   │   └── UsersList.tsx                      (NEW - Enhanced users list with search/filter/sort/pagination)
│   └── roles/
│       ├── page.tsx                           (NEW - Wrapper, reuse /app/admin/roles)
│       └── RolesList.tsx                      (NEW - Enhanced roles list with edit/delete)

/app/api/admin/roles/
├── route.ts                                   (MODIFY - Add PUT endpoint)
├── [id]/
│   ├── route.ts                               (NEW - PUT/DELETE for role edit/delete)
│   └── permissions/
│       └── route.ts                           (EXISTING - No changes)

/lib/
├── dashboard-types.ts                         (NEW - Shared TypeScript interfaces)
└── (existing auth, supabase files)            (EXISTING - No changes)
```

---

## Tasks

### Task 1: Create Dashboard Shell Layout

**Files:**
- Create: `/app/dashboard/layout.tsx`
- Create: `/app/dashboard/components/DashboardLayout.tsx`
- Create: `/app/dashboard/components/Sidebar.tsx`
- Create: `/app/dashboard/components/Topbar.tsx`

**Goal:** Build the main dashboard shell with sidebar, topbar, and navigation structure.

---

- [ ] **Step 1: Create DashboardLayout wrapper component**

Create `/app/dashboard/components/DashboardLayout.tsx`:

```tsx
'use client';

import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface DashboardLayoutProps {
  children: ReactNode;
  currentPage?: string;
}

export default function DashboardLayout({ children, currentPage }: DashboardLayoutProps) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar currentPage={currentPage} />
      
      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <Topbar />
        
        {/* Content Area */}
        <main style={{ flex: 1, overflow: 'auto', padding: '20px', backgroundColor: '#F5F2EE' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create Sidebar component**

Create `/app/dashboard/components/Sidebar.tsx`:

```tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  currentPage?: string;
}

export default function Sidebar({ currentPage }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  const sidebarStyle: React.CSSProperties = {
    width: '220px',
    backgroundColor: '#FFFFFF',
    borderRight: '1px solid rgb(234, 228, 221)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
  };

  const logoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '30px',
  };

  const logoMarkStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    backgroundColor: '#7b2d3e',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
  };

  const dividerStyle: React.CSSProperties = {
    height: '1px',
    backgroundColor: 'rgb(234, 228, 221)',
    marginBottom: '20px',
  };

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: '600',
    color: 'rgb(45, 74, 70)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '15px',
    opacity: 0.7,
  };

  const navItemStyle = (active: boolean): React.CSSProperties => ({
    padding: '12px 10px',
    borderRadius: '4px',
    backgroundColor: active ? 'rgba(123, 45, 62, 0.08)' : 'transparent',
    borderLeft: active ? '3px solid #7b2d3e' : '3px solid transparent',
    paddingLeft: active ? '7px' : '10px',
    cursor: 'pointer',
    marginBottom: '4px',
    transition: 'all 0.2s ease',
  });

  const navLinkTextStyle = (active: boolean): React.CSSProperties => ({
    fontSize: '12px',
    color: active ? 'rgb(45, 74, 70)' : 'rgb(45, 74, 70)',
    fontWeight: active ? '600' : '400',
    textDecoration: 'none',
  });

  return (
    <aside style={sidebarStyle}>
      {/* Logo */}
      <div style={logoStyle}>
        <div style={logoMarkStyle}>S</div>
        <span style={{ fontSize: '13px', fontWeight: '600', color: 'rgb(45, 74, 70)' }}>
          SWT Clinic
        </span>
      </div>

      {/* Divider */}
      <div style={dividerStyle} />

      {/* Admin Section */}
      <div>
        <div style={sectionLabelStyle}>Admin</div>

        <Link href="/app/dashboard/admin/users">
          <div style={navItemStyle(isActive('/app/dashboard/admin/users'))}>
            <span style={navLinkTextStyle(isActive('/app/dashboard/admin/users'))}>
              👥 Users
            </span>
          </div>
        </Link>

        <Link href="/app/dashboard/admin/roles">
          <div style={navItemStyle(isActive('/app/dashboard/admin/roles'))}>
            <span style={navLinkTextStyle(isActive('/app/dashboard/admin/roles'))}>
              🔐 Roles
            </span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: Create Topbar component**

Create `/app/dashboard/components/Topbar.tsx`:

```tsx
'use client';

import React from 'react';
import Link from 'next/link';

interface TopbarProps {
  title?: string;
  subtitle?: string;
}

export default function Topbar({ title = 'Dashboard', subtitle }: TopbarProps) {
  const topbarStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid rgb(234, 228, 221)',
    padding: '0 20px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  };

  const leftStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: '600',
    color: 'rgb(45, 74, 70)',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#2c2c2c',
    opacity: 0.7,
  };

  const toggleButtonStyle: React.CSSProperties = {
    padding: '8px 14px',
    border: '2px solid #7b2d3e',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: 'rgb(45, 74, 70)',
    fontSize: '10px',
    fontWeight: '600',
    cursor: 'pointer',
    textTransform: 'uppercase',
    transition: 'all 0.2s ease',
  };

  const handleToggle = () => {
    window.location.href = '/app';
  };

  return (
    <div style={topbarStyle}>
      <div style={leftStyle}>
        <div style={titleStyle}>{title}</div>
        {subtitle && <div style={subtitleStyle}>{subtitle}</div>}
      </div>

      <button style={toggleButtonStyle} onClick={handleToggle}>
        Try Legacy Dashboard
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Create dashboard layout.tsx**

Create `/app/dashboard/layout.tsx`:

```tsx
'use client';

import { ReactNode } from 'react';
import DashboardLayout from './components/DashboardLayout';

export default function Layout({ children }: { children: ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
```

- [ ] **Step 5: Run lint to verify no syntax errors**

```bash
npm run lint
```

Expected: No errors in new files

- [ ] **Step 6: Commit Task 1**

```bash
git add app/dashboard/layout.tsx app/dashboard/components/
git commit -m "feat: Build dashboard shell with sidebar and topbar navigation"
```

---

### Task 2: Create Dashboard Home Page

**Files:**
- Create: `/app/dashboard/page.tsx`

**Goal:** Create landing page that redirects to Admin/Roles by default.

---

- [ ] **Step 1: Create dashboard home page**

Create `/app/dashboard/page.tsx`:

```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from './components/Topbar';

export default function DashboardHome() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to roles page by default
    router.push('/app/dashboard/admin/roles');
  }, [router]);

  return (
    <div>
      <Topbar title="Dashboard" subtitle="Welcome to Sama Wellness Admin" />
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Redirecting...</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit Task 2**

```bash
git add app/dashboard/page.tsx
git commit -m "feat: Add dashboard home page with redirect to roles"
```

---

### Task 3: Create Admin Section Layout Wrapper

**Files:**
- Create: `/app/dashboard/admin/layout.tsx`

**Goal:** Wrap admin pages with shared layout and authentication check.

---

- [ ] **Step 1: Create admin layout**

Create `/app/dashboard/admin/layout.tsx`:

```tsx
'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/verify', {
          credentials: 'include',
        });

        if (!res.ok) {
          router.push('/app/login');
          return;
        }

        const data = await res.json();
        // Check if user has admin permissions
        if (data.permissions && (data.permissions.includes('manage_roles') || data.permissions.includes('manage_users'))) {
          setIsAuthorized(true);
        } else {
          // User not authorized for admin section
          router.push('/app/dashboard');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        router.push('/app/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>You do not have access to this section.</p>
      </div>
    );
  }

  return <>{children}</>;
}
```

- [ ] **Step 2: Commit Task 3**

```bash
git add app/dashboard/admin/layout.tsx
git commit -m "feat: Add admin layout with auth check"
```

---

### Task 4: Create Admin/Roles Page Wrapper

**Files:**
- Create: `/app/dashboard/admin/roles/page.tsx`
- Create: `/app/dashboard/admin/roles/RolesList.tsx`

**Goal:** Reuse existing Admin/Roles component and enhance with edit/delete functionality.

---

- [ ] **Step 1: Copy existing roles component and create enhanced version**

First, let's create the enhanced RolesList component:

Create `/app/dashboard/admin/roles/RolesList.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, Circle, X } from 'lucide-react';

interface Permission {
  id: string;
  key: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  created_at: string;
  role_permissions: {
    permissions: Permission;
  }[];
}

export default function RolesList() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [newRole, setNewRole] = useState({ name: '', description: '' });
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  async function fetchRoles() {
    try {
      const res = await fetch('/api/admin/roles');
      const data = await res.json();
      if (res.ok) {
        setRoles(data.roles);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPermissions() {
    try {
      const res = await fetch('/api/admin/roles/dummy/permissions');
      const data = await res.json();
      if (res.ok) {
        setPermissions(data.permissions);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  }

  async function handleCreateRole(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRole),
      });

      if (res.ok) {
        fetchRoles();
        setNewRole({ name: '', description: '' });
        setShowCreateForm(false);
        alert('Role created successfully');
      } else {
        const error = await res.json();
        alert('Error: ' + error.error);
      }
    } catch (error) {
      console.error('Error creating role:', error);
      alert('Error creating role');
    }
  }

  async function handleEditRole(e: React.FormEvent) {
    e.preventDefault();
    if (!editingRole) return;

    try {
      const res = await fetch(`/api/admin/roles/${editingRole.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (res.ok) {
        fetchRoles();
        setEditingRole(null);
        setShowEditForm(false);
        setEditFormData({ name: '', description: '' });
        alert('Role updated successfully');
      } else {
        const error = await res.json();
        alert('Error: ' + error.error);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Error updating role');
    }
  }

  async function handleDeleteRole(roleId: string) {
    if (!confirm('Delete this role? Users with this role will need reassignment.')) return;

    try {
      const res = await fetch(`/api/admin/roles/${roleId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchRoles();
        setSelectedRole(null);
        alert('Role deleted successfully');
      } else {
        const error = await res.json();
        alert('Error: ' + error.error);
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      alert('Error deleting role');
    }
  }

  async function handleAssignPermissions() {
    if (!selectedRole) return;

    try {
      const res = await fetch(`/api/admin/roles/${selectedRole.id}/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permission_ids: selectedPermissions }),
      });

      if (res.ok) {
        fetchRoles();
        setSelectedRole(null);
        setSelectedPermissions([]);
        alert('Permissions saved successfully');
      } else {
        const error = await res.json();
        alert('Error: ' + error.error);
      }
    } catch (error) {
      console.error('Error assigning permissions:', error);
      alert('Error saving permissions');
    }
  }

  const groupedPermissions = permissions.reduce(
    (acc, perm) => {
      if (!acc[perm.category]) acc[perm.category] = [];
      acc[perm.category].push(perm);
      return acc;
    },
    {} as Record<string, Permission[]>
  );

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading roles...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '400', color: 'rgb(45, 74, 70)', marginBottom: '0.5rem', fontFamily: 'Gilda Display, serif' }}>
          Role Management
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#2c2c2c', opacity: 0.7 }}>
          Create roles and assign permissions to manage clinic access
        </p>
      </div>

      <div style={{ marginBottom: '2rem', textAlign: 'right' }}>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#7b2d3e',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          <Plus size={18} /> Create Role
        </button>
      </div>

      {/* Create Form Modal */}
      {showCreateForm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            zIndex: 999,
          }}
          onClick={() => setShowCreateForm(false)}
        />
      )}

      <div
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '500px',
          background: 'white',
          boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          transform: showCreateForm ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease-out',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '2rem', borderBottom: '1px solid rgb(234, 228, 221)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <h2 style={{ fontFamily: 'Gilda Display, serif', fontSize: '1.5rem', color: 'rgb(45, 74, 70)', margin: 0 }}>
            Create New Role
          </h2>
          <button
            onClick={() => setShowCreateForm(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgb(45, 74, 70)', padding: '0.5rem' }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <form id="create-role-form" onSubmit={handleCreateRole} style={{ flex: 1 }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'rgb(45, 74, 70)', textTransform: 'uppercase' }}>
                Role Name
              </label>
              <input
                type="text"
                placeholder="e.g., supervisor, therapist"
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid rgb(234, 228, 221)', borderRadius: '6px', fontSize: '0.875rem' }}
                required
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'rgb(45, 74, 70)', textTransform: 'uppercase' }}>
                Description
              </label>
              <textarea
                placeholder="Describe the purpose and responsibilities of this role..."
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid rgb(234, 228, 221)', borderRadius: '6px', fontSize: '0.875rem', minHeight: '100px' }}
                rows={3}
              />
            </div>
          </form>

          <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgb(234, 228, 221)' }}>
            <button
              type="submit"
              form="create-role-form"
              style={{ backgroundColor: '#7b2d3e', color: 'white', border: 'none', borderRadius: '6px', padding: '0.75rem 1.5rem', cursor: 'pointer', fontWeight: '500' }}
            >
              Create Role
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              style={{ backgroundColor: 'rgb(234, 228, 221)', color: 'rgb(45, 74, 70)', border: 'none', borderRadius: '6px', padding: '0.75rem 1.5rem', cursor: 'pointer' }}
            >
              <X size={16} style={{ marginRight: '0.5rem' }} /> Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      {showEditForm && editingRole && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            zIndex: 999,
          }}
          onClick={() => setShowEditForm(false)}
        />
      )}

      <div
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '500px',
          background: 'white',
          boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          transform: showEditForm ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease-out',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '2rem', borderBottom: '1px solid rgb(234, 228, 221)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <h2 style={{ fontFamily: 'Gilda Display, serif', fontSize: '1.5rem', color: 'rgb(45, 74, 70)', margin: 0 }}>
            Edit Role
          </h2>
          <button
            onClick={() => setShowEditForm(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgb(45, 74, 70)', padding: '0.5rem' }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <form id="edit-role-form" onSubmit={handleEditRole} style={{ flex: 1 }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'rgb(45, 74, 70)', textTransform: 'uppercase' }}>
                Role Name
              </label>
              <input
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid rgb(234, 228, 221)', borderRadius: '6px', fontSize: '0.875rem' }}
                required
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'rgb(45, 74, 70)', textTransform: 'uppercase' }}>
                Description
              </label>
              <textarea
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid rgb(234, 228, 221)', borderRadius: '6px', fontSize: '0.875rem', minHeight: '100px' }}
                rows={3}
              />
            </div>
          </form>

          <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgb(234, 228, 221)' }}>
            <button
              type="submit"
              form="edit-role-form"
              style={{ backgroundColor: '#7b2d3e', color: 'white', border: 'none', borderRadius: '6px', padding: '0.75rem 1.5rem', cursor: 'pointer', fontWeight: '500' }}
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setShowEditForm(false)}
              style={{ backgroundColor: 'rgb(234, 228, 221)', color: 'rgb(45, 74, 70)', border: 'none', borderRadius: '6px', padding: '0.75rem 1.5rem', cursor: 'pointer' }}
            >
              <X size={16} style={{ marginRight: '0.5rem' }} /> Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Roles and Permissions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Roles List */}
        <div style={{ backgroundColor: 'white', border: '1px solid rgb(234, 228, 221)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '2px solid rgb(234, 228, 221)', background: 'rgb(234, 228, 221)', fontFamily: 'Josefin Sans, sans-serif', fontSize: '0.875rem', fontWeight: '600', color: 'rgb(45, 74, 70)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Available Roles
          </div>
          <div>
            {roles.length === 0 ? (
              <div style={{ padding: '2rem 1.5rem', textAlign: 'center', color: '#2c2c2c', opacity: 0.6 }}>
                No roles yet. Create your first role.
              </div>
            ) : (
              roles.map((role) => (
                <div
                  key={role.id}
                  style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid rgb(234, 228, 221)',
                    backgroundColor: selectedRole?.id === role.id ? 'rgba(123, 45, 62, 0.08)' : 'transparent',
                    borderLeft: selectedRole?.id === role.id ? '3px solid #7b2d3e' : '3px solid transparent',
                    paddingLeft: selectedRole?.id === role.id ? 'calc(1.5rem - 3px)' : '1.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <button
                    onClick={() => {
                      setSelectedRole(role);
                      setSelectedPermissions(role.role_permissions.map((rp) => rp.permissions.id));
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      flex: 1,
                    }}
                  >
                    <div style={{ fontWeight: '600', color: 'rgb(45, 74, 70)', marginBottom: '0.25rem', textTransform: 'capitalize' }}>
                      {role.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#2c2c2c', opacity: 0.6 }}>
                      {role.role_permissions.length} permission{role.role_permissions.length !== 1 ? 's' : ''}
                    </div>
                  </button>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setEditingRole(role);
                        setEditFormData({ name: role.name, description: role.description });
                        setShowEditForm(true);
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7b2d3e', padding: '4px' }}
                      title="Edit role"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d32f2f', padding: '4px' }}
                      title="Delete role"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Permissions Selector */}
        {selectedRole && (
          <div style={{ backgroundColor: 'white', border: '1px solid rgb(234, 228, 221)', borderRadius: '10px', padding: '2rem' }}>
            <div style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '2px solid rgb(234, 228, 221)' }}>
              <h2 style={{ fontFamily: 'Gilda Display, serif', fontSize: '1.5rem', color: 'rgb(45, 74, 70)', marginBottom: '0.5rem' }}>
                {selectedRole.name}
              </h2>
              {selectedRole.description && (
                <p style={{ fontSize: '0.875rem', color: '#2c2c2c', opacity: 0.7 }}>
                  {selectedRole.description}
                </p>
              )}
            </div>

            <div>
              <h3 style={{ fontFamily: 'Josefin Sans, sans-serif', fontSize: '0.875rem', fontWeight: '600', color: 'rgb(45, 74, 70)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Assign Permissions
              </h3>

              {Object.entries(groupedPermissions).map(([category, perms]) => (
                <div key={category} style={{ marginBottom: '2rem' }}>
                  <div style={{ fontFamily: 'Josefin Sans, sans-serif', fontSize: '0.75rem', fontWeight: '600', color: 'rgb(45, 74, 70)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgb(234, 228, 221)' }}>
                    {category}
                  </div>
                  {perms.map((perm) => (
                    <label
                      key={perm.id}
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        padding: '1rem',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <div style={{ flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {selectedPermissions.includes(perm.id) ? (
                          <CheckCircle2 size={20} color="#4a6741" />
                        ) : (
                          <Circle size={20} color="rgb(234, 228, 221)" />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500', fontSize: '0.875rem', color: 'rgb(45, 74, 70)', marginBottom: '0.25rem' }}>
                          {perm.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#2c2c2c', opacity: 0.6, lineHeight: 1.4 }}>
                          {perm.description}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(perm.id)}
                        onChange={() => {
                          setSelectedPermissions(
                            selectedPermissions.includes(perm.id)
                              ? selectedPermissions.filter((id) => id !== perm.id)
                              : [...selectedPermissions, perm.id]
                          );
                        }}
                        style={{ display: 'none' }}
                      />
                    </label>
                  ))}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '2px solid rgb(234, 228, 221)' }}>
              <button
                onClick={handleAssignPermissions}
                style={{
                  backgroundColor: '#4a6741',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Save Permissions
              </button>
              <span style={{ fontSize: '0.875rem', color: '#2c2c2c', opacity: 0.6, display: 'flex', alignItems: 'center' }}>
                {selectedPermissions.length} permission{selectedPermissions.length !== 1 ? 's' : ''} selected
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create roles page wrapper**

Create `/app/dashboard/admin/roles/page.tsx`:

```tsx
'use client';

import RolesList from './RolesList';

export default function RolesPage() {
  return <RolesList />;
}
```

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

Expected: No errors

- [ ] **Step 4: Commit Task 4**

```bash
git add app/dashboard/admin/roles/
git commit -m "feat: Add enhanced roles management with edit and delete functions"
```

---

### Task 5: Build API Endpoints for Role Edit/Delete

**Files:**
- Modify: `/app/api/admin/roles/route.ts`
- Create: `/app/api/admin/roles/[id]/route.ts`

**Goal:** Create PUT and DELETE endpoints for role management.

---

- [ ] **Step 1: Create role [id] route with PUT and DELETE**

Create `/app/api/admin/roles/[id]/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getJWTFromCookie } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function checkAdminPermission(request: NextRequest) {
  const cookieHeader = request.headers.get('cookie');
  const token = getJWTFromCookie(cookieHeader || undefined);

  if (!token) {
    return { authorized: false, error: 'No authentication token found' };
  }

  const payload = await verifyJWT(token);
  if (!payload) {
    return { authorized: false, error: 'Invalid or expired token' };
  }

  if (!payload.permissions.includes('manage_roles')) {
    return { authorized: false, error: 'Insufficient permissions' };
  }

  return { authorized: true, user: payload };
}

// PUT: Update role name and description
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await checkAdminPermission(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const { id } = params;
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Role name is required' },
        { status: 400 }
      );
    }

    const { data: role, error } = await supabase
      .from('roles')
      .update({ name, description: description || null })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Role name already exists' },
          { status: 400 }
        );
      }
      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Role updated successfully',
        role,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating role:', error);
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    );
  }
}

// DELETE: Delete/archive role
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await checkAdminPermission(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: 403 });
  }

  try {
    const { id } = params;

    // First, delete all role_permissions associations
    const { error: deletePermissionsError } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', id);

    if (deletePermissionsError) throw deletePermissionsError;

    // Then delete the role
    const { data: role, error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        message: 'Role deleted successfully',
        role,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Test PUT endpoint**

```bash
# Test with curl (replace with actual role ID and token)
curl -X PUT http://localhost:3000/api/admin/roles/[role-id] \
  -H "Content-Type: application/json" \
  -H "Cookie: token=[jwt-token]" \
  -d '{"name":"Updated Role","description":"Updated description"}'
```

Expected: `{ "success": true, "message": "Role updated successfully", "role": {...} }`

- [ ] **Step 3: Test DELETE endpoint**

```bash
# Test with curl (replace with actual role ID and token)
curl -X DELETE http://localhost:3000/api/admin/roles/[role-id] \
  -H "Cookie: token=[jwt-token]"
```

Expected: `{ "success": true, "message": "Role deleted successfully", "role": {...} }`

- [ ] **Step 4: Commit Task 5**

```bash
git add app/api/admin/roles/[id]/route.ts
git commit -m "feat: Add PUT and DELETE endpoints for role management"
```

---

### Task 6: Create Admin/Users Page with Search/Filter/Sort/Pagination

**Files:**
- Create: `/app/dashboard/admin/users/page.tsx`
- Create: `/app/dashboard/admin/users/UsersList.tsx`

**Goal:** Create enhanced users list with search, filter, sort, and pagination.

---

- [ ] **Step 1: Create enhanced UsersList component**

Create `/app/dashboard/admin/users/UsersList.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
  roles: { id: string; name: string };
}

interface Role {
  id: string;
  name: string;
}

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role_id: '',
  });

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | string>('all');
  const [sortBy, setSortBy] = useState<'username' | 'created_at' | 'role'>('username');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRoles() {
    try {
      const res = await fetch('/api/admin/roles');
      const data = await res.json();
      if (res.ok) {
        setRoles(data.roles);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (editingUser) {
        const res = await fetch(`/api/admin/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          fetchUsers();
          setEditingUser(null);
          setShowForm(false);
          alert('User updated successfully');
        } else {
          const error = await res.json();
          alert('Error: ' + error.error);
        }
      } else {
        const res = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          fetchUsers();
          setShowForm(false);
          alert('User created successfully');
        } else {
          const error = await res.json();
          alert('Error: ' + error.error);
        }
      }
      setFormData({ username: '', email: '', password: '', role_id: '' });
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error saving user');
    }
  }

  async function handleBlockUser(userId: string) {
    if (!confirm('Are you sure you want to deactivate this user?')) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchUsers();
        alert('User deactivated successfully');
      } else {
        const error = await res.json();
        alert('Error: ' + error.error);
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('Error deactivating user');
    }
  }

  // Filter and sort logic
  let filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);

    const matchesRole =
      roleFilter === 'all' ||
      (user.roles && user.roles.id === roleFilter);

    return matchesSearch && matchesStatus && matchesRole;
  });

  // Sort
  filteredUsers.sort((a, b) => {
    let aVal: any = a[sortBy];
    let bVal: any = b[sortBy];

    if (sortBy === 'role') {
      aVal = a.roles?.name || '';
      bVal = b.roles?.name || '';
    }

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading users...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '400', color: 'rgb(45, 74, 70)', marginBottom: '0.5rem', fontFamily: 'Gilda Display, serif' }}>
          User Management
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#2c2c2c', opacity: 0.7 }}>
          Create and manage clinic staff accounts and permissions
        </p>
      </div>

      <div style={{ marginBottom: '2rem', textAlign: 'right' }}>
        <button
          onClick={() => {
            setEditingUser(null);
            setFormData({ username: '', email: '', password: '', role_id: '' });
            setShowForm(!showForm);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#7b2d3e',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          <Plus size={18} /> Create User
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {/* Search */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: 'rgb(45, 74, 70)', textTransform: 'uppercase' }}>
            Search
          </label>
          <input
            type="text"
            placeholder="Username or email"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: '1px solid rgb(234, 228, 221)',
              borderRadius: '6px',
              fontSize: '0.875rem',
            }}
          />
        </div>

        {/* Status Filter */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: 'rgb(45, 74, 70)', textTransform: 'uppercase' }}>
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: '1px solid rgb(234, 228, 221)',
              borderRadius: '6px',
              fontSize: '0.875rem',
            }}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Role Filter */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: 'rgb(45, 74, 70)', textTransform: 'uppercase' }}>
            Role
          </label>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: '1px solid rgb(234, 228, 221)',
              borderRadius: '6px',
              fontSize: '0.875rem',
            }}
          >
            <option value="all">All Roles</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: 'rgb(45, 74, 70)', textTransform: 'uppercase' }}>
            Sort By
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                border: '1px solid rgb(234, 228, 221)',
                borderRadius: '6px',
                fontSize: '0.875rem',
              }}
            >
              <option value="username">Username</option>
              <option value="created_at">Created Date</option>
              <option value="role">Role</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              style={{
                padding: '0.75rem 1rem',
                border: '1px solid rgb(234, 228, 221)',
                borderRadius: '6px',
                backgroundColor: 'white',
                cursor: 'pointer',
              }}
              title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Create Form Modal */}
      {showForm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            zIndex: 999,
          }}
          onClick={() => setShowForm(false)}
        />
      )}

      <div
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '500px',
          background: 'white',
          boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          transform: showForm ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease-out',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '2rem', borderBottom: '1px solid rgb(234, 228, 221)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <h2 style={{ fontFamily: 'Gilda Display, serif', fontSize: '1.5rem', color: 'rgb(45, 74, 70)', margin: 0 }}>
            {editingUser ? 'Edit User' : 'Create New User'}
          </h2>
          <button
            onClick={() => setShowForm(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgb(45, 74, 70)', padding: '0.5rem' }}
          >
            <X size={24} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <form id="user-form" onSubmit={handleSubmit} style={{ flex: 1 }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'rgb(45, 74, 70)', textTransform: 'uppercase' }}>
                Username
              </label>
              <input
                type="text"
                placeholder="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid rgb(234, 228, 221)', borderRadius: '6px', fontSize: '0.875rem' }}
                disabled={!!editingUser}
                required
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'rgb(45, 74, 70)', textTransform: 'uppercase' }}>
                Email (Optional)
              </label>
              <input
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid rgb(234, 228, 221)', borderRadius: '6px', fontSize: '0.875rem' }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'rgb(45, 74, 70)', textTransform: 'uppercase' }}>
                Password {editingUser && '(Leave blank to keep current)'}
              </label>
              <input
                type="password"
                placeholder="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid rgb(234, 228, 221)', borderRadius: '6px', fontSize: '0.875rem' }}
                required={!editingUser}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: 'rgb(45, 74, 70)', textTransform: 'uppercase' }}>
                Role
              </label>
              <select
                value={formData.role_id}
                onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid rgb(234, 228, 221)', borderRadius: '6px', fontSize: '0.875rem' }}
                required
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
          </form>

          <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid rgb(234, 228, 221)' }}>
            <button
              type="submit"
              form="user-form"
              style={{
                backgroundColor: '#7b2d3e',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              {editingUser ? 'Update User' : 'Create User'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              style={{
                backgroundColor: 'rgb(234, 228, 221)',
                color: 'rgb(45, 74, 70)',
                border: 'none',
                borderRadius: '6px',
                padding: '0.75rem 1.5rem',
                cursor: 'pointer',
              }}
            >
              <X size={16} style={{ marginRight: '0.5rem' }} /> Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div style={{ backgroundColor: 'white', border: '1px solid rgb(234, 228, 221)', borderRadius: '10px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgb(234, 228, 221)', borderBottom: '2px solid rgba(45, 74, 70, 0.15)' }}>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: 'rgb(45, 74, 70)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Username
              </th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: 'rgb(45, 74, 70)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Email
              </th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: 'rgb(45, 74, 70)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Role
              </th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: 'rgb(45, 74, 70)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Status
              </th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: 'rgb(45, 74, 70)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '2rem 1.5rem', textAlign: 'center', color: '#2c2c2c', opacity: 0.6 }}>
                  No users found
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid rgb(234, 228, 221)' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>{user.username}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>{user.email || '-'}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>{user.roles?.name || '-'}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '2px 8px',
                        borderRadius: '20px',
                        fontSize: '10px',
                        fontWeight: '600',
                        backgroundColor: user.is_active ? '#4a6741' : 'rgb(234, 228, 221)',
                        color: user.is_active ? 'white' : '#2c2c2c',
                      }}
                    >
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setFormData({
                            username: user.username,
                            email: user.email || '',
                            password: '',
                            role_id: user.roles?.id || '',
                          });
                          setShowForm(true);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#7b2d3e',
                          padding: '4px',
                        }}
                        title="Edit user"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleBlockUser(user.id)}
                        disabled={!user.is_active}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: user.is_active ? 'pointer' : 'not-allowed',
                          color: user.is_active ? '#d32f2f' : '#ccc',
                          padding: '4px',
                        }}
                        title="Deactivate user"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.875rem', color: '#2c2c2c' }}>
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid rgb(234, 228, 221)',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
          >
            ← Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid rgb(234, 228, 221)',
                borderRadius: '4px',
                backgroundColor: currentPage === page ? '#7b2d3e' : 'white',
                color: currentPage === page ? 'white' : 'rgb(45, 74, 70)',
                cursor: 'pointer',
              }}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid rgb(234, 228, 221)',
              borderRadius: '4px',
              backgroundColor: 'white',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage === totalPages ? 0.5 : 1,
            }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create users page wrapper**

Create `/app/dashboard/admin/users/page.tsx`:

```tsx
'use client';

import UsersList from './UsersList';

export default function UsersPage() {
  return <UsersList />;
}
```

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

Expected: No errors

- [ ] **Step 4: Commit Task 6**

```bash
git add app/dashboard/admin/users/
git commit -m "feat: Add enhanced users management with search, filter, sort, and pagination"
```

---

### Task 7: Update Legacy Dashboard Page with Toggle

**Files:**
- Modify: `/app/app/page.tsx`

**Goal:** Add toggle button to legacy dashboard to switch to new dashboard.

---

- [ ] **Step 1: Update legacy page to add toggle logic**

Modify `/app/app/page.tsx` - Update topbar section to include toggle button. Replace the JSX that renders the button with:

```tsx
{/* Add toggle button to try new dashboard */}
<div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1001 }}>
  <button
    onClick={() => {
      window.location.href = '/app/dashboard';
    }}
    style={{
      padding: '8px 14px',
      border: '2px solid #7b2d3e',
      borderRadius: '4px',
      backgroundColor: 'transparent',
      color: 'rgb(45, 74, 70)',
      fontSize: '10px',
      fontWeight: '600',
      cursor: 'pointer',
      textTransform: 'uppercase',
      transition: 'all 0.2s ease',
    }}
    onMouseEnter={(e) => {
      (e.target as HTMLButtonElement).style.backgroundColor = '#7b2d3e';
      (e.target as HTMLButtonElement).style.color = 'white';
    }}
    onMouseLeave={(e) => {
      (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
      (e.target as HTMLButtonElement).style.color = 'rgb(45, 74, 70)';
    }}
  >
    Try New Dashboard
  </button>
</div>
```

- [ ] **Step 2: Run build to check for issues**

```bash
npm run build
```

Expected: Successful build with no errors

- [ ] **Step 3: Commit Task 7**

```bash
git add app/app/page.tsx
git commit -m "feat: Add toggle button to legacy dashboard"
```

---

### Task 8: Test Full Dashboard Flow

**Goal:** Verify all features work together.

---

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

Expected: Server running at http://localhost:3000

- [ ] **Step 2: Test login and redirect**

1. Visit http://localhost:3000/app/login
2. Login with valid credentials
3. Should redirect to /app (legacy dashboard, default)
4. Click "Try New Dashboard" button
5. Should navigate to /app/dashboard and maintain session

Expected: Session persists, no re-login required

- [ ] **Step 3: Test Admin/Roles**

1. In new dashboard, click "Roles" in sidebar
2. Click "Create Role" button
3. Create a test role with name and description
4. Verify role appears in roles list
5. Click "Edit" button next to role
6. Update role details
7. Save changes
8. Click "Delete" button
9. Confirm deletion
10. Verify role is removed from list

Expected: All CRUD operations work

- [ ] **Step 4: Test Admin/Users with search/filter/sort/pagination**

1. In new dashboard, click "Users" in sidebar
2. Click "Create User" button
3. Create 3-5 test users with different roles and statuses
4. Test search: Enter username/email in search field
5. Test status filter: Select "Active" or "Inactive"
6. Test role filter: Select a specific role
7. Test sort: Click different sort options
8. Test pagination: Create enough users to need pagination
9. Test edit: Click edit on a user, change details, save
10. Test deactivate: Click trash icon on active user, confirm

Expected: All filtering, sorting, and pagination work correctly

- [ ] **Step 5: Test toggle between dashboards**

1. From new dashboard, click "Try Legacy Dashboard"
2. Should go to /app (legacy)
3. Click "Try New Dashboard" button
4. Should go back to /app/dashboard
5. Session should persist both ways

Expected: Seamless toggle without re-login

- [ ] **Step 6: Commit Task 8**

```bash
git add -A
git commit -m "test: Verify full dashboard flow and all features"
```

---

## Summary of Changes

**New Files Created (11):**
- `/app/dashboard/layout.tsx`
- `/app/dashboard/page.tsx`
- `/app/dashboard/components/DashboardLayout.tsx`
- `/app/dashboard/components/Sidebar.tsx`
- `/app/dashboard/components/Topbar.tsx`
- `/app/dashboard/admin/layout.tsx`
- `/app/dashboard/admin/roles/page.tsx`
- `/app/dashboard/admin/roles/RolesList.tsx`
- `/app/dashboard/admin/users/page.tsx`
- `/app/dashboard/admin/users/UsersList.tsx`
- `/app/api/admin/roles/[id]/route.ts`

**Files Modified (1):**
- `/app/app/page.tsx` (add toggle button)

**Total New Lines of Code:** ~2,500 lines

---

## Architecture Summary

```
Dashboard Shell
├── Sidebar (fixed left, 220px)
├── Topbar (fixed top, with toggle button)
└── Content Area
    ├── Admin/Roles
    │   ├── Create role
    │   ├── Edit role (NEW)
    │   ├── Delete role (NEW)
    │   └── Assign permissions
    └── Admin/Users
        ├── Search/filter/sort/pagination (NEW)
        ├── Create user
        ├── Edit user
        └── Deactivate user

API Endpoints
├── PUT /api/admin/roles/[id] (NEW - edit)
└── DELETE /api/admin/roles/[id] (NEW - delete)
```

---

**Plan complete and saved to `docs/superpowers/plans/2026-06-11-parallel-react-dashboard-phase1.md`.**

## Execution Options

**Two execution approaches:**

**1. Subagent-Driven (Recommended)** - Fresh subagent per task (Tasks 1-8), review after each, fast iteration with feedback loops

**2. Inline Execution** - Execute all tasks in this session using `superpowers:executing-plans`, batch with checkpoints

**Which approach would you prefer?**