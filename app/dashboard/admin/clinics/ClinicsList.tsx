'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import './clinics.css';
import ClinicRoomsTab from './ClinicRoomsTab';

interface Clinic {
  id: string;
  name: string;
  location: string;
  phone: string;
  email: string;
  number_of_rooms?: number | null;
  rooms?: string[];
  created_at: string;
}

type SortByOption = 'name' | 'location' | 'created_at';
type SortOrder = 'asc' | 'desc';

export default function ClinicsList() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'rooms'>('basic');
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    phone: '',
    email: '',
    number_of_rooms: null as number | null,
    rooms: [] as any[],
  });

  // Loading states for individual operations
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  // Permission state
  const [canManageClinics, setCanManageClinics] = useState(false);

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

  // Auto-dismiss notifications
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

  const showError = useCallback((message: string) => {
    setErrorMessage(message);
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    errorTimeoutRef.current = setTimeout(() => setErrorMessage(''), 3000);
  }, []);

  const showSuccess = useCallback((message: string) => {
    setSuccessMessage(message);
    if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    successTimeoutRef.current = setTimeout(() => setSuccessMessage(''), 3000);
  }, []);

  useEffect(() => {
    fetchClinics();
    fetchUserPermissions();
  }, []);

  async function fetchUserPermissions() {
    try {
      const res = await fetch('/api/auth/verify', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCanManageClinics(data.permissions?.includes('manage_clinics') || false);
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    }
  }

  async function fetchClinics() {
    try {
      const res = await fetch('/api/admin/clinics');
      if (!res.ok) {
        throw new Error(`Failed to fetch clinics: ${res.statusText}`);
      }
      const data = await res.json();
      setClinics(data.clinics || []);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load clinics';
      console.error('Error fetching clinics:', error);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Validate required fields
    if (!formData.name.trim()) {
      showError('Clinic name is required');
      return;
    }

    if (!formData.number_of_rooms || formData.number_of_rooms < 1) {
      showError('Number of rooms is required');
      return;
    }

    // Validate that all room names are filled
    const filledRooms = formData.rooms.filter((r: string) => r && r.trim());
    if (filledRooms.length !== formData.number_of_rooms) {
      showError(`Please fill in all ${formData.number_of_rooms} room names`);
      return;
    }

    const isEditing = !!editingClinic;
    const loaderSetter = isEditing ? setLoadingEdit : setLoadingCreate;
    loaderSetter(true);

    try {
      const clinicData = {
        name: formData.name,
        location: formData.location,
        phone: formData.phone,
        email: formData.email,
        number_of_rooms: formData.number_of_rooms,
        rooms: filledRooms,
      };

      const url = isEditing
        ? `/api/admin/clinics/${editingClinic.id}`
        : '/api/admin/clinics';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clinicData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(
          errorData.error || `Failed to ${isEditing ? 'update' : 'create'} clinic`
        );
      }

      await fetchClinics();
      setEditingClinic(null);
      setShowForm(false);
      setFormData({ name: '', location: '', phone: '', email: '', number_of_rooms: null, rooms: [] });
      setActiveTab('basic');
      showSuccess(`Clinic ${isEditing ? 'updated' : 'created'} successfully`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to save clinic';
      console.error('Error saving clinic:', error);
      showError(errorMsg);
    } finally {
      loaderSetter(false);
    }
  }

  function handleEdit(clinic: Clinic) {
    setEditingClinic(clinic);
    setFormData({
      name: clinic.name,
      location: clinic.location || '',
      phone: clinic.phone || '',
      email: clinic.email || '',
      number_of_rooms: (clinic as any).number_of_rooms || null,
      rooms: clinic.rooms || [],
    });
    setShowForm(true);
    setActiveTab('basic');
  }

  function handleCancel() {
    setShowForm(false);
    setEditingClinic(null);
    setFormData({ name: '', location: '', phone: '', email: '', number_of_rooms: null, rooms: [] });
    setActiveTab('basic');
  }

  async function handleDelete(clinic: Clinic) {
    if (!confirm(`Are you sure you want to delete ${clinic.name}?`)) {
      return;
    }

    setLoadingDelete(true);
    try {
      const res = await fetch(`/api/admin/clinics/${clinic.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete clinic');
      }

      await fetchClinics();
      showSuccess(`${clinic.name} deleted successfully`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to delete clinic';
      console.error('Error deleting clinic:', error);
      showError(errorMsg);
    } finally {
      setLoadingDelete(false);
    }
  }

  // Filter and sort
  const filtered = clinics
    .filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aVal: string = '';
      let bVal: string = '';

      if (sortBy === 'name') {
        aVal = a.name;
        bVal = b.name;
      } else if (sortBy === 'location') {
        aVal = a.location || '';
        bVal = b.location || '';
      } else if (sortBy === 'created_at') {
        aVal = a.created_at;
        bVal = b.created_at;
      }

      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedClinics = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return <div className="clinics-loading">Loading clinics...</div>;
  }

  return (
    <div className="clinics-container">
      {/* Messages */}
      {errorMessage && <div className="clinics-message clinics-message--error">{errorMessage}</div>}
      {successMessage && <div className="clinics-message clinics-message--success">{successMessage}</div>}

      {/* Header */}
      <div className="clinics-header">
        <h1>Clinic Management</h1>
        {canManageClinics && (
          <button
            className="clinics-btn clinics-btn--primary"
            onClick={() => {
              setShowForm(true);
              setEditingClinic(null);
              setFormData({ name: '', location: '', phone: '', email: '', number_of_rooms: null, rooms: [] });
              setActiveTab('basic');
            }}
          >
            <Plus size={20} /> Add Clinic
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="clinics-form-container">
          <div className="clinics-form">
            <div className="clinics-form-header">
              <h2>{editingClinic ? 'Edit Clinic' : 'Add New Clinic'}</h2>
              <button
                className="clinics-btn clinics-btn--close"
                onClick={handleCancel}
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="clinics-form-tabs">
              <button
                type="button"
                className={`clinics-form-tab ${activeTab === 'basic' ? 'clinics-form-tab--active' : ''}`}
                onClick={() => setActiveTab('basic')}
              >
                Basic Info
              </button>
              <button
                type="button"
                className={`clinics-form-tab ${activeTab === 'rooms' ? 'clinics-form-tab--active' : ''}`}
                onClick={() => setActiveTab('rooms')}
              >
                Rooms
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                <>
                  <div className="clinics-form-group">
                    <label>Clinic Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="e.g., Main Clinic, Branch Clinic"
                    />
                  </div>

                  <div className="clinics-form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Cairo, Alexandria, etc."
                    />
                  </div>

                  <div className="clinics-form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+20 XXX XXXX XXXX"
                    />
                  </div>

                  <div className="clinics-form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="clinic@example.com"
                    />
                  </div>
                </>
              )}

              {/* Rooms Tab */}
              {activeTab === 'rooms' && (
                <ClinicRoomsTab
                  numberOfRooms={formData.number_of_rooms}
                  rooms={formData.rooms}
                  onChange={(numberOfRooms, rooms) =>
                    setFormData({ ...formData, number_of_rooms: numberOfRooms, rooms: rooms || [] })
                  }
                />
              )}

              <div className="clinics-form-actions">
                <button
                  type="submit"
                  className="clinics-btn clinics-btn--primary"
                  disabled={loadingCreate || loadingEdit}
                >
                  {loadingCreate || loadingEdit ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  className="clinics-btn clinics-btn--secondary"
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
      <div className="clinics-controls">
        <div className="clinics-search">
          <input
            type="text"
            placeholder="Search by name or location..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="clinics-sort">
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as SortByOption);
              setCurrentPage(1);
            }}
          >
            <option value="name">Sort by Name</option>
            <option value="location">Sort by Location</option>
            <option value="created_at">Sort by Date</option>
          </select>

          <button
            className="clinics-btn clinics-btn--secondary"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="clinics-table-wrapper">
        <table className="clinics-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Rooms</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedClinics.length === 0 ? (
              <tr>
                <td colSpan={6} className="clinics-empty">
                  No clinics found
                </td>
              </tr>
            ) : (
              paginatedClinics.map((clinic) => (
                <tr key={clinic.id}>
                  <td><strong>{clinic.name}</strong></td>
                  <td>{clinic.location || '-'}</td>
                  <td>{clinic.phone || '-'}</td>
                  <td>{clinic.email || '-'}</td>
                  <td>
                    {clinic.rooms && clinic.rooms.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {clinic.rooms.map((room: string, idx: number) => (
                          <span
                            key={idx}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#e8f5e9',
                              borderRadius: '4px',
                              fontSize: '13px',
                              fontWeight: '500',
                              color: '#2e7d32',
                            }}
                          >
                            {room}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: '#999', fontSize: '13px' }}>-</span>
                    )}
                  </td>
                  <td className="clinics-actions">
                    {canManageClinics && (
                      <>
                        <button
                          className="clinics-btn clinics-btn--icon"
                          onClick={() => handleEdit(clinic)}
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          className="clinics-btn clinics-btn--icon clinics-btn--danger"
                          onClick={() => handleDelete(clinic)}
                          disabled={loadingDelete}
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="clinics-pagination">
          <button
            className="clinics-btn clinics-btn--secondary"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <div className="clinics-page-buttons">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  className={`clinics-btn ${currentPage === page ? 'clinics-btn--active' : 'clinics-btn--secondary'}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            className="clinics-btn clinics-btn--secondary"
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
