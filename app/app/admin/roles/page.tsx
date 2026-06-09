'use client';

import { useEffect, useState } from 'react';
import { Plus, CheckCircle2, Circle } from 'lucide-react';

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
        headers: { 'Content-Type': 'application/json' },
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

  if (loading) return <div className="p-6">Loading roles...</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Role Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Create Role
        </button>
      </div>

      {/* Create Role Form */}
      {showForm && (
        <div className="mb-6 bg-white p-6 rounded-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Create New Role</h2>
          <form onSubmit={handleCreateRole} className="space-y-4">
            <input
              type="text"
              placeholder="Role Name (e.g., supervisor)"
              value={newRole.name}
              onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              required
            />
            <textarea
              placeholder="Description"
              value={newRole.description}
              onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Create Role
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="col-span-1 bg-white rounded-lg border border-gray-200 h-fit">
          <div className="p-4 border-b font-semibold">Roles</div>
          <div className="divide-y">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => {
                  setSelectedRole(role);
                  setSelectedPermissions(
                    role.role_permissions.map((rp) => rp.permissions.id)
                  );
                }}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${
                  selectedRole?.id === role.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="font-medium">{role.name}</div>
                <div className="text-sm text-gray-600">
                  {role.role_permissions.length} permissions
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Permissions Selector */}
        {selectedRole && (
          <div className="col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">{selectedRole.name}</h2>
              <p className="text-gray-600">{selectedRole.description}</p>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-4">Assign Permissions</h3>
              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(
                  ([category, perms]) => (
                    <div key={category}>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase">
                        {category}
                      </h4>
                      <div className="space-y-2 ml-4">
                        {perms.map((perm) => (
                          <label
                            key={perm.id}
                            className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPermissions(
                                  selectedPermissions.includes(perm.id)
                                    ? selectedPermissions.filter((id) => id !== perm.id)
                                    : [...selectedPermissions, perm.id]
                                );
                              }}
                              className="mt-1"
                            >
                              {selectedPermissions.includes(perm.id) ? (
                                <CheckCircle2 size={20} className="text-green-600" />
                              ) : (
                                <Circle size={20} className="text-gray-300" />
                              )}
                            </button>
                            <div>
                              <div className="font-medium text-sm">{perm.name}</div>
                              <div className="text-xs text-gray-600">
                                {perm.description}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <button
              onClick={handleAssignPermissions}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Save Permissions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
