'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import './therapists.css';

interface Therapist {
  id: string;
  name: string;
  email: string;
  specializations: string[];
  hourly_rate?: number;
  created_at: string;
  status?: string;
}

type SortByOption = 'name' | 'email' | 'hourly_rate';
type SortOrder = 'asc' | 'desc';

export default function TherapistsList() {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTherapist, setEditingTherapist] = useState<Therapist | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    hourly_rate: '',
    specializations: '',
  });

  // Loading states for individual operations
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Message states
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortByOption>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const maxPaginationButtons = 7;

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
    fetchTherapists();
  }, []);

  async function fetchTherapists() {
    try {
      const res = await fetch('/api/clinic/therapists');
      if (!res.ok) {
        throw new Error(`Failed to fetch therapists: ${res.statusText}`);
      }
      const data = await res.json();
      setTherapists(Array.isArray(data) ? data : []);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load therapists';
      console.error('Error fetching therapists:', error);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const isEditing = !!editingTherapist;
    const loaderSetter = isEditing ? setLoadingEdit : setLoadingCreate;
    loaderSetter(true);

    try {
      // Parse specializations (comma-separated)
      const specArray = formData.specializations
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s);

      const therapistData = {
        name: formData.name,
        email: formData.email,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        specializations: specArray,
      };

      const url = isEditing
        ? `/api/clinic/therapists/${editingTherapist.id}`
        : '/api/clinic/therapists';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(therapistData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || `Failed to ${isEditing ? 'update' : 'create'} therapist`
        );
      }

      await fetchTherapists();
      setEditingTherapist(null);
      setShowForm(false);
      setFormData({ name: '', email: '', hourly_rate: '', specializations: '' });
      showSuccess(`Therapist ${isEditing ? 'updated' : 'created'} successfully`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to save therapist';
      console.error('Error saving therapist:', error);
      showError(errorMsg);
    } finally {
      loaderSetter(false);
    }
  }

  function handleEdit(therapist: Therapist) {
    setEditingTherapist(therapist);
    setFormData({
      name: therapist.name,
      email: therapist.email || '',
      hourly_rate: therapist.hourly_rate?.toString() || '',
      specializations: therapist.specializations?.join(', ') || '',
    });
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingTherapist(null);
    setFormData({ name: '', email: '', hourly_rate: '', specializations: '' });
  }

  async function handleDelete(therapist: Therapist) {
    if (!confirm(`Are you sure you want to delete ${therapist.name}?`)) {
      return;
    }

    setLoadingDelete(true);
    try {
      const res = await fetch(`/api/clinic/therapists/${therapist.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete therapist');
      }

      await fetchTherapists();
      showSuccess(`${therapist.name} deleted successfully`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete therapist';
      console.error('Error deleting therapist:', error);
      showError(errorMsg);
    } finally {
      setLoadingDelete(false);
    }
  }

  // Filter and sort
  const filtered = therapists
    .filter((t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';

      if (sortBy === 'name') {
        aVal = a.name;
        bVal = b.name;
      } else if (sortBy === 'email') {
        aVal = a.email || '';
        bVal = b.email || '';
      } else if (sortBy === 'hourly_rate') {
        aVal = a.hourly_rate || 0;
        bVal = b.hourly_rate || 0;
      }

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
      }
      return sortOrder === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedTherapists = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return <div className="therapists-loading">Loading therapists...</div>;
  }

  return (
    <div className="therapists-container">
      {/* Messages */}
      {errorMessage && <div className="therapists-message therapists-message--error">{errorMessage}</div>}
      {successMessage && <div className="therapists-message therapists-message--success">{successMessage}</div>}

      {/* Header */}
      <div className="therapists-header">
        <h1>Therapists</h1>
        <button
          className="therapists-btn therapists-btn--primary"
          onClick={() => {
            setShowForm(true);
            setEditingTherapist(null);
            setFormData({ name: '', email: '', hourly_rate: '', specializations: '' });
          }}
        >
          <Plus size={20} /> Add Therapist
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="therapists-form-container">
          <div className="therapists-form">
            <div className="therapists-form-header">
              <h2>{editingTherapist ? 'Edit Therapist' : 'Add New Therapist'}</h2>
              <button
                className="therapists-btn therapists-btn--close"
                onClick={handleCancel}
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="therapists-form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Therapist name"
                />
              </div>

              <div className="therapists-form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="therapist@example.com"
                />
              </div>

              <div className="therapists-form-group">
                <label>Hourly Rate (EGP)</label>
                <input
                  type="number"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                  placeholder="2000"
                  step="100"
                />
              </div>

              <div className="therapists-form-group">
                <label>Specializations (comma-separated)</label>
                <input
                  type="text"
                  value={formData.specializations}
                  onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                  placeholder="Anxiety, Depression, CBT"
                />
              </div>

              <div className="therapists-form-actions">
                <button
                  type="submit"
                  className="therapists-btn therapists-btn--primary"
                  disabled={loadingCreate || loadingEdit}
                >
                  {loadingCreate || loadingEdit ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  className="therapists-btn therapists-btn--secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="therapists-controls">
        <div className="therapists-search">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="therapists-sort">
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as SortByOption);
              setCurrentPage(1);
            }}
          >
            <option value="name">Sort by Name</option>
            <option value="email">Sort by Email</option>
            <option value="hourly_rate">Sort by Rate</option>
          </select>

          <button
            className="therapists-btn therapists-btn--secondary"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="therapists-table-wrapper">
        <table className="therapists-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Hourly Rate</th>
              <th>Specializations</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTherapists.length === 0 ? (
              <tr>
                <td colSpan={5} className="therapists-empty">
                  No therapists found
                </td>
              </tr>
            ) : (
              paginatedTherapists.map((therapist) => (
                <tr key={therapist.id}>
                  <td>{therapist.name}</td>
                  <td>{therapist.email || '-'}</td>
                  <td>{therapist.hourly_rate ? `₦${therapist.hourly_rate.toLocaleString()}` : '-'}</td>
                  <td className="therapists-specializations">
                    {therapist.specializations && therapist.specializations.length > 0
                      ? therapist.specializations.join(', ')
                      : '-'}
                  </td>
                  <td className="therapists-actions">
                    <button
                      className="therapists-btn therapists-btn--icon"
                      onClick={() => handleEdit(therapist)}
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      className="therapists-btn therapists-btn--icon therapists-btn--danger"
                      onClick={() => handleDelete(therapist)}
                      disabled={loadingDelete}
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="therapists-pagination">
          <button
            className="therapists-btn therapists-btn--secondary"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <div className="therapists-page-buttons">
            {Array.from({ length: Math.min(totalPages, maxPaginationButtons) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  className={`therapists-btn ${currentPage === page ? 'therapists-btn--active' : 'therapists-btn--secondary'}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            className="therapists-btn therapists-btn--secondary"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
