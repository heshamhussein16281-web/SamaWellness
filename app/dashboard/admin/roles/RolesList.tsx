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
