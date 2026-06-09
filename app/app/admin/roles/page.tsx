'use client';

import { useEffect, useState } from 'react';
import { Plus, CheckCircle2, Circle, X } from 'lucide-react';

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

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [newRole, setNewRole] = useState({ name: '', description: '' });

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
        setShowForm(false);
      }
    } catch (error) {
      console.error('Error creating role:', error);
    }
  }

  async function handleAssignPermissions() {
    if (!selectedRole) return;

    try {
      const res = await fetch(`/api/admin/roles/${selectedRole.id}/permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permission_ids: selectedPermissions }),
      });

      if (res.ok) {
        fetchRoles();
        setSelectedRole(null);
        setSelectedPermissions([]);
      }
    } catch (error) {
      console.error('Error assigning permissions:', error);
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
    return (
      <main className="min-h-screen bg-gradient-to-br from-linen via-white to-linen pt-12 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-nav-text">Loading roles...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-linen via-white to-linen pt-12 pb-20">
      <style>{`
        :root {
          --color-linen: #F5F2EE;
          --color-sand: rgb(234, 228, 221);
          --color-nav-text: rgb(45, 74, 70);
          --color-burgundy: #7b2d3e;
          --color-olive: #4a6741;
          --color-charcoal: #2c2c2c;
          --font-display: 'Gilda Display', serif;
          --font-body: 'Nunito Sans', sans-serif;
          --font-ui: 'Josefin Sans', sans-serif;
        }

        * {
          font-family: var(--font-body);
        }

        .admin-page {
          max-width: 6xl;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .page-header {
          margin-bottom: 3rem;
          animation: fadeInDown 0.6s ease-out;
        }

        .page-header__title {
          font-family: var(--font-display);
          font-size: 2.5rem;
          font-weight: 400;
          color: var(--color-nav-text);
          margin-bottom: 0.5rem;
          letter-spacing: -0.5px;
        }

        .page-header__subtitle {
          font-size: 0.875rem;
          color: var(--color-charcoal);
          opacity: 0.7;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: var(--font-ui);
          letter-spacing: 0.5px;
        }

        .btn-primary {
          background: var(--color-burgundy);
          color: white;
        }

        .btn-primary:hover {
          background: #5a1f2d;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(123, 45, 62, 0.2);
        }

        .btn-secondary {
          background: var(--color-sand);
          color: var(--color-nav-text);
          border: 1px solid rgba(45, 74, 70, 0.2);
        }

        .btn-secondary:hover {
          background: #ddd6cd;
        }

        .btn-success {
          background: var(--color-olive);
          color: white;
        }

        .btn-success:hover {
          background: #3a5535;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(74, 103, 65, 0.2);
        }

        .form-card {
          background: white;
          border: 1px solid var(--color-sand);
          border-radius: 10px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          animation: slideUp 0.4s ease-out;
        }

        .form-card__title {
          font-family: var(--font-display);
          font-size: 1.5rem;
          color: var(--color-nav-text);
          margin-bottom: 1.5rem;
          border-bottom: 2px solid var(--color-sand);
          padding-bottom: 1rem;
        }

        .form-group {
          margin-bottom: 1.25rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-nav-text);
          font-family: var(--font-ui);
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }

        .form-control {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid var(--color-sand);
          border-radius: 6px;
          background: white;
          color: var(--color-charcoal);
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .form-control:focus {
          outline: none;
          border-color: var(--color-burgundy);
          box-shadow: 0 0 0 3px rgba(123, 45, 62, 0.1);
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--color-sand);
        }

        .roles-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 2rem;
          animation: slideUp 0.4s ease-out 0.1s both;
        }

        .roles-list {
          background: white;
          border: 1px solid var(--color-sand);
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          height: fit-content;
        }

        .roles-list__header {
          padding: 1.25rem 1.5rem;
          border-bottom: 2px solid var(--color-sand);
          background: var(--color-sand);
          font-family: var(--font-ui);
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--color-nav-text);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .role-item {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--color-sand);
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          display: block;
        }

        .role-item:hover {
          background: var(--color-sand);
        }

        .role-item.active {
          background: rgba(123, 45, 62, 0.08);
          border-left: 3px solid var(--color-burgundy);
          padding-left: calc(1.5rem - 3px);
        }

        .role-item__name {
          font-weight: 600;
          color: var(--color-nav-text);
          margin-bottom: 0.25rem;
          text-transform: capitalize;
        }

        .role-item__count {
          font-size: 0.75rem;
          color: var(--color-charcoal);
          opacity: 0.6;
        }

        .permissions-panel {
          background: white;
          border: 1px solid var(--color-sand);
          border-radius: 10px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .permissions-panel__header {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid var(--color-sand);
        }

        .permissions-panel__title {
          font-family: var(--font-display);
          font-size: 1.5rem;
          color: var(--color-nav-text);
          margin-bottom: 0.5rem;
        }

        .permissions-panel__desc {
          font-size: 0.875rem;
          color: var(--color-charcoal);
          opacity: 0.7;
        }

        .permission-category {
          margin-bottom: 2rem;
        }

        .permission-category__title {
          font-family: var(--font-ui);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-nav-text);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--color-sand);
        }

        .permission-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s ease;
          margin-bottom: 0.75rem;
        }

        .permission-item:hover {
          background: var(--color-sand);
        }

        .permission-checkbox {
          flex-shrink: 0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .permission-content {
          flex: 1;
        }

        .permission-name {
          font-weight: 500;
          font-size: 0.875rem;
          color: var(--color-nav-text);
          margin-bottom: 0.25rem;
        }

        .permission-desc {
          font-size: 0.8rem;
          color: var(--color-charcoal);
          opacity: 0.6;
          line-height: 1.4;
        }

        .permissions-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 2px solid var(--color-sand);
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @media (max-width: 1024px) {
          .roles-grid {
            grid-template-columns: 1fr;
          }

          .page-header__title {
            font-size: 1.875rem;
          }
        }
      `}</style>

      <div className="admin-page">
        <div className="page-header">
          <h1 className="page-header__title">Role Management</h1>
          <p className="page-header__subtitle">Create roles and assign permissions to manage clinic access</p>
        </div>

        <div style={{ marginBottom: '2rem', textAlign: 'right' }}>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            <Plus size={18} />
            Create Role
          </button>
        </div>

        {/* Modal Overlay */}
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
              animation: 'fadeIn 0.3s ease-out',
            }}
            onClick={() => setShowForm(false)}
          />
        )}

        {/* Slide-in Panel */}
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
          {/* Panel Header */}
          <div
            style={{
              padding: '2rem',
              borderBottom: '1px solid var(--color-sand)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.5rem',
                color: 'var(--color-nav-text)',
                margin: 0,
              }}
            >
              Create New Role
            </h2>
            <button
              onClick={() => setShowForm(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-nav-text)',
                padding: '0.5rem',
              }}
            >
              <X size={24} />
            </button>
          </div>

          {/* Form Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <form id="role-form" onSubmit={handleCreateRole} style={{ flex: 1 }}>
              <div className="form-group">
                <label>Role Name</label>
                <input
                  type="text"
                  placeholder="e.g., supervisor, therapist"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Describe the purpose and responsibilities of this role..."
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  className="form-control"
                  rows={3}
                />
              </div>

            </form>
            <div
              style={{
                display: 'flex',
                gap: '1rem',
                marginTop: 'auto',
                paddingTop: '1.5rem',
                borderTop: '1px solid var(--color-sand)',
              }}
            >
              <button type="submit" className="btn btn-primary" form="role-form">
                Create Role
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-secondary"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </div>
        </div>

        {/* Roles and Permissions Grid */}
        <div className="roles-grid">
          {/* Roles List */}
          <div className="roles-list">
            <div className="roles-list__header">Available Roles</div>
            <div>
              {roles.length === 0 ? (
                <div style={{ padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--color-charcoal)', opacity: 0.6 }}>
                  No roles yet. Create your first role.
                </div>
              ) : (
                roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => {
                      setSelectedRole(role);
                      setSelectedPermissions(
                        role.role_permissions.map((rp) => rp.permissions.id)
                      );
                    }}
                    className={`role-item ${selectedRole?.id === role.id ? 'active' : ''}`}
                  >
                    <div className="role-item__name">{role.name}</div>
                    <div className="role-item__count">
                      {role.role_permissions.length} permission{role.role_permissions.length !== 1 ? 's' : ''}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Permissions Selector */}
          {selectedRole && (
            <div className="permissions-panel">
              <div className="permissions-panel__header">
                <h2 className="permissions-panel__title">{selectedRole.name}</h2>
                {selectedRole.description && (
                  <p className="permissions-panel__desc">{selectedRole.description}</p>
                )}
              </div>

              <div>
                <h3 style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--color-nav-text)',
                  marginBottom: '1.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  Assign Permissions
                </h3>

                {Object.entries(groupedPermissions).map(([category, perms]) => (
                  <div key={category} className="permission-category">
                    <div className="permission-category__title">{category}</div>
                    {perms.map((perm) => (
                      <label key={perm.id} className="permission-item">
                        <div className="permission-checkbox">
                          {selectedPermissions.includes(perm.id) ? (
                            <CheckCircle2 size={20} color="var(--color-olive)" />
                          ) : (
                            <Circle size={20} color="var(--color-sand)" />
                          )}
                        </div>
                        <div className="permission-content">
                          <div className="permission-name">{perm.name}</div>
                          <div className="permission-desc">{perm.description}</div>
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

              <div className="permissions-actions">
                <button
                  onClick={handleAssignPermissions}
                  className="btn btn-success"
                >
                  Save Permissions
                </button>
                <span style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-charcoal)',
                  opacity: 0.6,
                  display: 'flex',
                  alignItems: 'center',
                }}>
                  {selectedPermissions.length} permission{selectedPermissions.length !== 1 ? 's' : ''} selected
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}