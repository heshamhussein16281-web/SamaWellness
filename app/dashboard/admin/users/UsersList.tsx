'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import './users.css';

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

type StatusFilter = 'all' | 'active' | 'inactive';
type SortByOption = 'username' | 'created_at' | 'role';
type SortOrder = 'asc' | 'desc';

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

  // Loading states for individual operations
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Message states (replacing alert)
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | string>('all');
  const [sortBy, setSortBy] = useState<SortByOption>('username');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const maxPaginationButtons = 7; // Performance optimization: limit visible page buttons

  // Auto-dismiss notifications
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

  // Show error message with auto-dismiss
  const showError = useCallback((message: string) => {
    setErrorMessage(message);
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    errorTimeoutRef.current = setTimeout(() => setErrorMessage(''), 3000);
  }, []);

  // Show success message with auto-dismiss
  const showSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
    if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    successTimeoutRef.current = setTimeout(() => setSuccessMessage(''), 3000);
  }, []);

  useEffect(() => {
    const initData = async () => {
      await Promise.all([fetchUsers(), fetchRoles()]);
    };
    initData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchUsers() {
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) {
        throw new Error(`Failed to fetch users: ${res.statusText}`);
      }
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load users';
      console.error('Error fetching users:', error);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRoles() {
    try {
      const res = await fetch('/api/admin/roles');
      if (!res.ok) {
        throw new Error(`Failed to fetch roles: ${res.statusText}`);
      }
      const data = await res.json();
      setRoles(data.roles || []);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load roles';
      console.error('Error fetching roles:', error);
      showError(errorMsg);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const isEditing = !!editingUser;
    const loaderSetter = isEditing ? setLoadingEdit : setLoadingCreate;
    loaderSetter(true);

    try {
      const url = isEditing ? `/api/admin/users/${editingUser.id}` : '/api/admin/users';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to ${isEditing ? 'update' : 'create'} user`);
      }

      await fetchUsers();
      setEditingUser(null);
      setShowForm(false);
      setFormData({ username: '', email: '', password: '', role_id: '' });
      showSuccess(`User ${isEditing ? 'updated' : 'created'} successfully`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to save user';
      console.error('Error saving user:', error);
      showError(errorMsg);
      // Reset form on error
      setFormData({ username: '', email: '', password: '', role_id: '' });
    } finally {
      loaderSetter(false);
    }
  }

  async function handleBlockUser(userId: string) {
    if (!confirm('Are you sure you want to deactivate this user?')) return;

    setLoadingDelete(true);

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to deactivate user');
      }

      await fetchUsers();
      showSuccess('User deactivated successfully');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to deactivate user';
      console.error('Error deactivating user:', error);
      showError(errorMsg);
    } finally {
      setLoadingDelete(false);
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
    let aVal: string | number = '';
    let bVal: string | number = '';

    if (sortBy === 'role') {
      aVal = a.roles?.name || '';
      bVal = b.roles?.name || '';
    } else {
      aVal = a[sortBy] || '';
      bVal = b[sortBy] || '';
    }

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Pagination with performance optimization
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  // Calculate which page buttons to show (e.g., 5-7 buttons instead of all)
  const getPaginationRange = (): number[] => {
    if (totalPages <= maxPaginationButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const halfWindow = Math.floor(maxPaginationButtons / 2);
    let start = Math.max(1, currentPage - halfWindow);
    let end = Math.min(totalPages, start + maxPaginationButtons - 1);

    if (end - start + 1 < maxPaginationButtons) {
      start = Math.max(1, end - maxPaginationButtons + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  if (loading) {
    return (
      <div className="users-container" style={{ padding: '20px', textAlign: 'center' }}>
        Loading users...
      </div>
    );
  }

  return (
    <div className="users-container">
      {/* Error Message */}
      {errorMessage && (
        <div className="toast-notification toast-notification--error" role="alert" aria-live="polite">
          {errorMessage}
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="toast-notification toast-notification--success" role="status" aria-live="polite">
          {successMessage}
        </div>
      )}

      {/* Header */}
      <div className="users-header">
        <h1 className="users-title">User Management</h1>
        <p className="users-subtitle">Create and manage clinic staff accounts and permissions</p>
      </div>

      {/* Action Bar */}
      <div className="users-action-bar">
        <button
          className="btn-primary"
          onClick={() => {
            setEditingUser(null);
            setFormData({ username: '', email: '', password: '', role_id: '' });
            setShowForm(!showForm);
          }}
          disabled={loadingCreate || loadingEdit || loadingDelete}
          aria-label="Create a new user"
        >
          <Plus size={18} aria-hidden="true" /> Create User
        </button>
      </div>

      {/* Filters */}
      <div className="users-filters">
        {/* Search */}
        <div className="filter-group">
          <label htmlFor="search-input" className="filter-group__label">Search</label>
          <input
            id="search-input"
            type="text"
            placeholder="Username or email"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="form-field__input"
            aria-label="Search users by username or email"
          />
        </div>

        {/* Status Filter */}
        <div className="filter-group">
          <label htmlFor="status-filter" className="filter-group__label">Status</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as StatusFilter);
              setCurrentPage(1);
            }}
            className="form-field__select"
            aria-label="Filter users by status"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Role Filter */}
        <div className="filter-group">
          <label htmlFor="role-filter" className="filter-group__label">Role</label>
          <select
            id="role-filter"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="form-field__select"
            aria-label="Filter users by role"
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
        <div className="filter-group">
          <label htmlFor="sort-by" className="filter-group__label">Sort By</label>
          <div className="filter-group__sort-wrapper">
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortByOption)}
              className="form-field__select"
              aria-label="Sort users by"
              style={{ flex: 1 }}
            >
              <option value="username">Username</option>
              <option value="created_at">Created Date</option>
              <option value="role">Role</option>
            </select>
            <button
              className="btn-sort"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              aria-label={`Toggle sort order: currently ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {showForm && (
        <div
          className="users-modal-overlay"
          onClick={() => setShowForm(false)}
          aria-hidden="true"
        />
      )}

      {/* Modal Panel */}
      <div className={`users-modal-panel ${showForm ? 'open' : ''}`}>
        <div className="users-modal-header">
          <h2 className="users-modal-title">
            {editingUser ? 'Edit User' : 'Create New User'}
          </h2>
          <button
            className="users-modal-close-btn"
            onClick={() => setShowForm(false)}
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        <div className="users-modal-content">
          <form id="user-form" onSubmit={handleSubmit} className="users-modal-form">
            <div className="form-field">
              <label htmlFor="username-input" className="form-field__label">
                Username
              </label>
              <input
                id="username-input"
                type="text"
                placeholder="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="form-field__input"
                disabled={!!editingUser || loadingCreate || loadingEdit}
                required
                aria-required="true"
              />
            </div>

            <div className="form-field">
              <label htmlFor="email-input" className="form-field__label">
                Email (Optional)
              </label>
              <input
                id="email-input"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-field__input"
                disabled={loadingCreate || loadingEdit}
              />
            </div>

            <div className="form-field">
              <label htmlFor="password-input" className="form-field__label">
                Password {editingUser && '(Leave blank to keep current)'}
              </label>
              <input
                id="password-input"
                type="password"
                placeholder="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="form-field__input"
                disabled={loadingCreate || loadingEdit}
                required={!editingUser}
                aria-required={!editingUser}
              />
            </div>

            <div className="form-field">
              <label htmlFor="role-input" className="form-field__label">
                Role
              </label>
              <select
                id="role-input"
                value={formData.role_id}
                onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                className="form-field__select"
                disabled={loadingCreate || loadingEdit}
                required
                aria-required="true"
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

          <div className="users-modal-footer">
            <button
              type="submit"
              form="user-form"
              className="btn-primary"
              disabled={loadingCreate || loadingEdit}
              aria-label={editingUser ? 'Update user' : 'Create user'}
            >
              {(loadingCreate || loadingEdit) && <span className="spinner" aria-hidden="true" />}
              {editingUser ? 'Update User' : 'Create User'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn-secondary"
              disabled={loadingCreate || loadingEdit}
              aria-label="Cancel and close form"
            >
              <X size={16} aria-hidden="true" /> Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table className="users-table">
          <thead className="users-table__header">
            <tr>
              <th className="users-table__header-cell">Username</th>
              <th className="users-table__header-cell">Email</th>
              <th className="users-table__header-cell">Role</th>
              <th className="users-table__header-cell">Status</th>
              <th className="users-table__header-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="users-table__empty-cell">
                  No users found
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => (
                <tr key={user.id} className="users-table__body-row">
                  <td className="users-table__cell">{user.username}</td>
                  <td className="users-table__cell">{user.email || '-'}</td>
                  <td className="users-table__cell">{user.roles?.name || '-'}</td>
                  <td className="users-table__cell">
                    <span
                      className={`status-badge ${user.is_active ? 'status-badge--active' : 'status-badge--inactive'}`}
                      role="status"
                      aria-label={`User status: ${user.is_active ? 'active' : 'inactive'}`}
                    >
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="users-table__cell">
                    <div className="user-actions">
                      <button
                        className="icon-btn icon-btn--edit"
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
                        disabled={loadingEdit || loadingDelete}
                        title="Edit user"
                        aria-label={`Edit user ${user.username}`}
                      >
                        <Edit2 size={16} aria-hidden="true" />
                      </button>
                      <button
                        className="icon-btn icon-btn--delete"
                        onClick={() => handleBlockUser(user.id)}
                        disabled={!user.is_active || loadingDelete || loadingEdit}
                        title="Deactivate user"
                        aria-label={`Deactivate user ${user.username}`}
                      >
                        <Trash2 size={16} aria-hidden="true" />
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
      <div className="users-pagination">
        <div className="users-pagination__info">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
        </div>

        <div className="users-pagination__buttons">
          <button
            className="btn-pagination"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            aria-label="Go to previous page"
          >
            ← Previous
          </button>

          {getPaginationRange().map((page) => (
            <button
              key={page}
              className={`btn-pagination ${currentPage === page ? 'active' : ''}`}
              onClick={() => setCurrentPage(page)}
              aria-label={`Go to page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          ))}

          <button
            className="btn-pagination"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
