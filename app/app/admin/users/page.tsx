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

export default function UsersPage() {
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
        }
      }
      setFormData({ username: '', email: '', password: '', role_id: '' });
    } catch (error) {
      console.error('Error saving user:', error);
    }
  }

  async function handleBlockUser(userId: string) {
    if (!confirm('Are you sure you want to block this user?')) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-linen via-white to-linen pt-12 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-nav-text">Loading users...</div>
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

        /* DESIGN TOKENS */
        .admin-page {
          max-width: 5xl;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        /* PAGE HEADER */
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

        /* BUTTONS */
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

        .btn-danger {
          background: transparent;
          color: #c53030;
          padding: 0.5rem;
          min-width: auto;
        }

        .btn-danger:hover {
          background: rgba(197, 48, 48, 0.05);
        }

        /* FORM CARD */
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

        /* TABLE */
        .table-card {
          background: white;
          border: 1px solid var(--color-sand);
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          animation: slideUp 0.4s ease-out 0.1s both;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead {
          background: var(--color-sand);
          border-bottom: 2px solid rgba(45, 74, 70, 0.15);
        }

        th {
          padding: 1rem 1.5rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-nav-text);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-family: var(--font-ui);
        }

        td {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--color-sand);
          font-size: 0.875rem;
          color: var(--color-charcoal);
        }

        tbody tr {
          transition: all 0.2s ease;
        }

        tbody tr:hover {
          background: rgba(234, 228, 221, 0.5);
        }

        tbody tr:last-child td {
          border-bottom: none;
        }

        /* BADGES */
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 0.375rem 0.875rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.3px;
          font-family: var(--font-ui);
        }

        .badge-active {
          background: rgba(74, 103, 65, 0.12);
          color: var(--color-olive);
        }

        .badge-blocked {
          background: rgba(197, 48, 48, 0.12);
          color: #c53030;
        }

        /* ACTIONS */
        .table-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }

        .action-btn {
          padding: 0.5rem;
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          color: var(--color-nav-text);
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-btn:hover {
          background: var(--color-sand);
        }

        .action-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* ANIMATIONS */
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

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .page-header__title {
            font-size: 1.875rem;
          }

          .form-card {
            padding: 1.5rem;
          }

          th, td {
            padding: 0.75rem;
            font-size: 0.8rem;
          }

          .table-actions {
            flex-wrap: wrap;
          }
        }
      `}</style>

      <div className="admin-page">
        <div className="page-header">
          <h1 className="page-header__title">User Management</h1>
          <p className="page-header__subtitle">Create and manage clinic staff accounts</p>
        </div>

        <div style={{ marginBottom: '2rem', textAlign: 'right' }}>
          <button
            onClick={() => {
              setEditingUser(null);
              setFormData({ username: '', email: '', password: '', role_id: '' });
              setShowForm(!showForm);
            }}
            className="btn btn-primary"
          >
            <Plus size={18} />
            Add User
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="form-card">
            <h2 className="form-card__title">
              {editingUser ? 'Edit User' : 'Create New User'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="form-control"
                  disabled={!!editingUser}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="form-control"
                  placeholder="user@example.com"
                />
              </div>

              <div className="form-group">
                <label>
                  {editingUser ? 'New Password' : 'Password'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="form-control"
                  placeholder={editingUser ? 'Leave empty to keep current' : 'Enter secure password'}
                  required={!editingUser}
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select
                  value={formData.role_id}
                  onChange={(e) =>
                    setFormData({ ...formData, role_id: e.target.value })
                  }
                  className="form-control"
                  required
                >
                  <option value="">Select a role...</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingUser ? 'Update User' : 'Create User'}
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
            </form>
          </div>
        )}

        {/* Users Table */}
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>
                    <span style={{ color: 'var(--color-charcoal)', opacity: 0.6 }}>
                      No users yet. Create your first user to get started.
                    </span>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td style={{ fontWeight: 500 }}>{user.username}</td>
                    <td>{user.email || '—'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{user.roles.name}</td>
                    <td>
                      <span className={`badge ${user.is_active ? 'badge-active' : 'badge-blocked'}`}>
                        {user.is_active ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setFormData({
                              username: user.username,
                              email: user.email,
                              password: '',
                              role_id: user.roles.id,
                            });
                            setShowForm(true);
                          }}
                          className="action-btn"
                          title="Edit user"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleBlockUser(user.id)}
                          disabled={!user.is_active}
                          className="action-btn btn-danger"
                          title={user.is_active ? 'Block user' : 'User blocked'}
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
      </div>
    </main>
  );
}
