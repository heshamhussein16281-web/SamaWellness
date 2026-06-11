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
