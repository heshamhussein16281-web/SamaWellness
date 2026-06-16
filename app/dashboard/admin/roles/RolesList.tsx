'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, Circle, X } from 'lucide-react';
import './roles.css';

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

// Permission hierarchy: manage permissions imply view access
const permissionHierarchy: Record<string, string> = {
  'manage_clients': 'view_clients',
  'manage_bookings': 'view_bookings',
  'manage_therapists': 'view_therapists',
};

// Auto-enable view permissions when manage permissions are selected
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

export default function RolesList() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState<string | null>(null);
  const [loadingPermissionsAssign, setLoadingPermissionsAssign] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [newRole, setNewRole] = useState({ name: '', description: '' });
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', description: '' });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteConfirmRole, setDeleteConfirmRole] = useState<{ id: string; name: string } | null>(null);

  // Fetch roles with error handling
  const fetchRoles = useCallback(async () => {
    try {
      setErrorMessage(null);
      const res = await fetch('/api/admin/roles');
      const data = await res.json();
      if (res.ok) {
        setRoles(data.roles);
      } else {
        setErrorMessage(data.error || 'Failed to load roles');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load roles';
      setErrorMessage(errorMsg);
    } finally {
      setLoadingRoles(false);
    }
  }, []);

  // Fetch permissions with error handling
  const fetchPermissions = useCallback(async () => {
    try {
      setLoadingPermissions(true);
      setErrorMessage(null);
      const res = await fetch('/api/admin/roles/dummy/permissions');
      const data = await res.json();
      if (res.ok) {
        setPermissions(data.permissions);
      } else {
        setErrorMessage(data.error || 'Failed to load permissions');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load permissions';
      setErrorMessage(errorMsg);
    } finally {
      setLoadingPermissions(false);
    }
  }, []);

  // Initialize data on mount
  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, [fetchRoles, fetchPermissions]);

  // Cleanup timeout messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Handle create role with validation and error states
  const handleCreateRole = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newRole.name.trim()) {
      setErrorMessage('Role name is required');
      return;
    }

    setLoadingCreate(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRole),
      });

      const data = await res.json();
      if (res.ok) {
        await fetchRoles();
        setNewRole({ name: '', description: '' });
        setShowCreateForm(false);
        setSuccessMessage('Role created successfully');
      } else {
        setErrorMessage(data.error || 'Failed to create role');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to create role';
      setErrorMessage(errorMsg);
    } finally {
      setLoadingCreate(false);
    }
  }, [newRole, fetchRoles]);

  // Handle edit role with validation and error states
  const handleEditRole = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRole) return;

    if (!editFormData.name.trim()) {
      setErrorMessage('Role name is required');
      return;
    }

    setLoadingEdit(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/roles/${editingRole.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      const data = await res.json();
      if (res.ok) {
        await fetchRoles();
        setEditingRole(null);
        setShowEditForm(false);
        setEditFormData({ name: '', description: '' });
        setSuccessMessage('Role updated successfully');
      } else {
        setErrorMessage(data.error || 'Failed to update role');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update role';
      setErrorMessage(errorMsg);
    } finally {
      setLoadingEdit(false);
    }
  }, [editingRole, editFormData, fetchRoles]);

  // Handle delete role with confirmation and error states
  const handleDeleteRole = useCallback(async (roleId: string) => {
    setLoadingDelete(roleId);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/roles/${roleId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok) {
        await fetchRoles();
        setSelectedRole(null);
        setDeleteConfirmRole(null);
        setSuccessMessage('Role deleted successfully');
      } else {
        setErrorMessage(data.error || 'Failed to delete role');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete role';
      setErrorMessage(errorMsg);
    } finally {
      setLoadingDelete(null);
    }
  }, [fetchRoles]);

  // Handle assign permissions with error states and prevent double-submit
  const handleAssignPermissions = useCallback(async () => {
    if (!selectedRole) return;

    setLoadingPermissionsAssign(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/roles/${selectedRole.id}/permissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permission_ids: selectedPermissions }),
      });

      const data = await res.json();
      if (res.ok) {
        await fetchRoles();
        setSelectedRole(null);
        setSelectedPermissions([]);
        setSuccessMessage('Permissions saved successfully');
      } else {
        setErrorMessage(data.error || 'Failed to save permissions');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to save permissions';
      setErrorMessage(errorMsg);
    } finally {
      setLoadingPermissionsAssign(false);
    }
  }, [selectedRole, selectedPermissions, fetchRoles]);

  const groupedPermissions = permissions.reduce(
    (acc, perm) => {
      if (!acc[perm.category]) acc[perm.category] = [];
      acc[perm.category].push(perm);
      return acc;
    },
    {} as Record<string, Permission[]>
  );

  if (loadingRoles) {
    return (
      <div className="roles-container">
        <div className="roles-header">
          <h1 className="roles-title">Role Management</h1>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '1rem' }}>Loading roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="roles-container">
      {/* Header */}
      <div className="roles-header">
        <h1 className="roles-title">Role Management</h1>
        <p className="roles-subtitle">
          Create roles and assign permissions to manage clinic access
        </p>
      </div>

      {/* Error/Success Notifications */}
      {errorMessage && (
        <div className="toast-error toast-error--visible text-error" role="alert">
          <X size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="toast-error text-success" style={{ color: 'var(--roles-color-success)', background: 'rgba(74, 103, 65, 0.08)' }} role="status">
          <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--roles-color-success)' }} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Action Bar */}
      <div className="roles-action-bar">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary"
          disabled={loadingCreate}
        >
          <Plus size={18} />
          Create Role
        </button>
      </div>

      {/* Create Form Modal Overlay */}
      {showCreateForm && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateForm(false)}
          aria-hidden="true"
        />
      )}

      {/* Create Form Modal */}
      <div className={`modal-panel ${showCreateForm ? 'open' : ''}`}>
        <div className="modal-header">
          <h2 className="modal-title">Create New Role</h2>
          <button
            onClick={() => setShowCreateForm(false)}
            className="modal-close-btn"
            aria-label="Close"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          {errorMessage && (
            <div className="permissions-notification permissions-notification--error" role="alert">
              <X size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form id="create-role-form" onSubmit={handleCreateRole} className="modal-form">
            <div className="form-field">
              <label htmlFor="create-name" className="form-field__label">
                Role Name
              </label>
              <input
                id="create-name"
                type="text"
                placeholder="e.g., supervisor, therapist"
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                className="form-field__input"
                required
                disabled={loadingCreate}
              />
            </div>

            <div className="form-field">
              <label htmlFor="create-description" className="form-field__label">
                Description
              </label>
              <textarea
                id="create-description"
                placeholder="Describe the purpose and responsibilities of this role..."
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                className="form-field__textarea"
                rows={3}
                disabled={loadingCreate}
              />
            </div>
          </form>

          <div className="modal-footer">
            <button
              type="submit"
              form="create-role-form"
              className="btn-primary"
              disabled={loadingCreate}
            >
              {loadingCreate ? <span className="spinner" style={{ marginRight: '0.5rem' }}></span> : null}
              Create Role
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="btn-secondary"
              disabled={loadingCreate}
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Edit Form Modal Overlay */}
      {showEditForm && editingRole && (
        <div
          className="modal-overlay"
          onClick={() => setShowEditForm(false)}
          aria-hidden="true"
        />
      )}

      {/* Edit Form Modal */}
      <div className={`modal-panel ${showEditForm ? 'open' : ''}`}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Role</h2>
          <button
            onClick={() => setShowEditForm(false)}
            className="modal-close-btn"
            aria-label="Close"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        <div className="modal-content">
          {errorMessage && (
            <div className="permissions-notification permissions-notification--error" role="alert">
              <X size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form id="edit-role-form" onSubmit={handleEditRole} className="modal-form">
            <div className="form-field">
              <label htmlFor="edit-name" className="form-field__label">
                Role Name
              </label>
              <input
                id="edit-name"
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="form-field__input"
                required
                disabled={loadingEdit}
              />
            </div>

            <div className="form-field">
              <label htmlFor="edit-description" className="form-field__label">
                Description
              </label>
              <textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                className="form-field__textarea"
                rows={3}
                disabled={loadingEdit}
              />
            </div>
          </form>

          <div className="modal-footer">
            <button
              type="submit"
              form="edit-role-form"
              className="btn-primary"
              disabled={loadingEdit}
            >
              {loadingEdit ? <span className="spinner" style={{ marginRight: '0.5rem' }}></span> : null}
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setShowEditForm(false)}
              className="btn-secondary"
              disabled={loadingEdit}
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal Overlay */}
      {deleteConfirmRole && (
        <div
          className="modal-overlay"
          onClick={() => setDeleteConfirmRole(null)}
          aria-hidden="true"
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmRole && (
        <div className="modal-panel open" style={{ maxWidth: '400px', left: '50%', right: 'auto', top: '50%', transform: 'translate(-50%, -50%)' }}>
          <div className="modal-header">
            <h2 className="modal-title">Confirm Delete</h2>
            <button
              onClick={() => setDeleteConfirmRole(null)}
              className="modal-close-btn"
              aria-label="Close"
              type="button"
            >
              <X size={24} />
            </button>
          </div>

          <div className="modal-content" style={{ padding: '2rem' }}>
            <p style={{ marginBottom: '1rem' }}>
              Delete role <strong>{deleteConfirmRole.name}</strong>? Users with this role will need reassignment.
            </p>
            <div className="modal-footer">
              <button
                onClick={() => handleDeleteRole(deleteConfirmRole.id)}
                className="btn-primary"
                style={{ backgroundColor: 'var(--roles-color-error)' }}
                disabled={loadingDelete === deleteConfirmRole.id}
              >
                {loadingDelete === deleteConfirmRole.id ? <span className="spinner" style={{ marginRight: '0.5rem' }}></span> : null}
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirmRole(null)}
                className="btn-secondary"
                disabled={loadingDelete === deleteConfirmRole.id}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Roles and Permissions Grid */}
      <div className="roles-grid">
        {/* Roles List Panel */}
        <div className="roles-list-panel">
          <div className="roles-list-header">Available Roles</div>
          <div className="roles-list-body">
            {roles.length === 0 ? (
              <div className="roles-list-empty">
                No roles yet. Create your first role.
              </div>
            ) : (
              roles.map((role) => (
                <div
                  key={role.id}
                  className={`role-item role-item__border-left ${selectedRole?.id === role.id ? 'selected' : ''}`}
                >
                  <button
                    onClick={() => {
                      setSelectedRole(role);
                      setSelectedPermissions(role.role_permissions.map((rp) => rp.permissions.id));
                    }}
                    className="role-item__content"
                    type="button"
                  >
                    <div className="role-item__name text-primary">
                      {role.name}
                    </div>
                    <div className="role-item__count">
                      {role.role_permissions.length} permission{role.role_permissions.length !== 1 ? 's' : ''}
                    </div>
                  </button>

                  <div className="role-item__actions">
                    <button
                      onClick={() => {
                        setEditingRole(role);
                        setEditFormData({ name: role.name, description: role.description });
                        setShowEditForm(true);
                      }}
                      className="icon-btn icon-btn--edit"
                      title="Edit role"
                      type="button"
                      disabled={loadingDelete === role.id}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmRole({ id: role.id, name: role.name })}
                      className="icon-btn icon-btn--delete"
                      title="Delete role"
                      type="button"
                      disabled={loadingDelete === role.id}
                    >
                      {loadingDelete === role.id ? (
                        <span className="spinner" style={{ width: '14px', height: '14px' }}></span>
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Permissions Selector Panel */}
        {selectedRole && (
          <div className="permissions-panel">
            <div className="permissions-header">
              <h2 className="permissions-title">{selectedRole.name}</h2>
              {selectedRole.description && (
                <p className="permissions-description">
                  {selectedRole.description}
                </p>
              )}
            </div>

            {errorMessage && (
              <div className="permissions-notification permissions-notification--error" role="alert">
                <X size={16} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="permissions-content">
              <h3 style={{ fontFamily: 'var(--roles-font-ui)', fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1.5rem' }}>
                Assign Permissions
              </h3>

              {Object.entries(groupedPermissions).map(([category, perms]) => (
                <div key={category} className="permission-category">
                  <div className="permission-category__title">{category}</div>
                  <div className="permission-category__items">
                    {perms.map((perm) => (
                      <label key={perm.id} className="permission-item">
                        <div className="permission-item__checkbox-wrapper">
                          <div className={`checkbox-circle ${selectedPermissions.includes(perm.id) ? 'checked' : 'unchecked'}`}>
                            {selectedPermissions.includes(perm.id) ? (
                              <CheckCircle2 size={20} />
                            ) : (
                              <Circle size={20} />
                            )}
                          </div>
                        </div>
                        <div className="permission-item__content">
                          <div className="permission-item__name">{perm.name}</div>
                          <div className="permission-item__description">
                            {perm.description}
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          className="permission-item__input"
                          checked={selectedPermissions.includes(perm.id)}
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
                          aria-label={`Assign ${perm.name} permission`}
                          disabled={loadingPermissionsAssign}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="permissions-footer">
              <button
                onClick={handleAssignPermissions}
                className="btn-success"
                disabled={loadingPermissionsAssign}
              >
                {loadingPermissionsAssign ? <span className="spinner" style={{ marginRight: '0.5rem' }}></span> : null}
                Save Permissions
              </button>
              <span className="permissions-count">
                {selectedPermissions.length} permission{selectedPermissions.length !== 1 ? 's' : ''} selected
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
