'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import TherapistAvailabilityCalendar from './TherapistAvailabilityCalendar';
import ScheduleAvailabilityModal from './ScheduleAvailabilityModal';
import './therapists-refined.css';

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

interface TherapistStats {
  appointments: number;
  bookedPercentage: number;
  rating: string;
}

export default function TherapistsListRefined() {
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

  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortByOption>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Availability and clinic states
  const [selectedTherapistForAvailability, setSelectedTherapistForAvailability] = useState<Therapist | null>(null);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [clinics, setClinics] = useState<any[]>([]);
  const [therapistAvailability, setTherapistAvailability] = useState<Map<string, any>>(new Map());
  const [therapistStats, setTherapistStats] = useState<Map<string, TherapistStats>>(new Map());

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
    fetchTherapists();
    fetchClinics();
  }, []);

  useEffect(() => {
    therapists.forEach(therapist => {
      if (clinics.length > 0) {
        const primaryClinic = clinics[0];
        fetch(`/api/admin/therapists/${therapist.id}/availability?clinic_id=${primaryClinic.id}`, {
          credentials: 'include',
        })
          .then(res => res.json())
          .then(data => {
            setTherapistAvailability(prev => new Map(prev).set(therapist.id, data.data || []));
          })
          .catch(err => console.error('Error fetching availability:', err));
      }

      // Mock stats - replace with real API call if available
      setTherapistStats(prev => new Map(prev).set(therapist.id, {
        appointments: Math.floor(Math.random() * 20) + 5,
        bookedPercentage: Math.floor(Math.random() * 40) + 60,
        rating: (Math.random() * 0.4 + 4.5).toFixed(1),
      }));
    });
  }, [therapists, clinics]);

  async function fetchTherapists() {
    try {
      const res = await fetch('/api/admin/therapists', {
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error(`Failed to fetch therapists: ${res.statusText}`);
      }
      const data = await res.json();
      setTherapists(data.therapists || []);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load therapists';
      console.error('Error fetching therapists:', error);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  async function fetchClinics() {
    try {
      const res = await fetch('/api/admin/clinics', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch clinics');
      const data = await res.json();
      setClinics(data.clinics || []);
    } catch (error) {
      console.error('Error fetching clinics:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const isEditing = !!editingTherapist;
    const loaderSetter = isEditing ? setLoadingEdit : setLoadingCreate;
    loaderSetter(true);

    try {
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
        ? `/api/admin/therapists/${editingTherapist.id}`
        : '/api/admin/therapists';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
      const res = await fetch(`/api/admin/therapists/${therapist.id}`, {
        method: 'DELETE',
        credentials: 'include',
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

  function handleScheduleClick(therapist: Therapist) {
    if (clinics.length > 0) {
      setSelectedTherapistForAvailability(therapist);
      setSelectedClinicId(clinics[0].id);
    }
  }

  function handleAvailabilitySaved() {
    if (selectedTherapistForAvailability && selectedClinicId) {
      fetch(`/api/admin/therapists/${selectedTherapistForAvailability.id}/availability?clinic_id=${selectedClinicId}`, {
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => {
          setTherapistAvailability(prev => new Map(prev).set(selectedTherapistForAvailability.id, data.data || []));
        });
    }
  }

  const filtered = therapists
    .filter((t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.specializations?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'hourly_rate') {
        const aRate = a.hourly_rate || 0;
        const bRate = b.hourly_rate || 0;
        return sortOrder === 'asc' ? aRate - bRate : bRate - aRate;
      }

      let aVal = '';
      let bVal = '';

      if (sortBy === 'name') {
        aVal = a.name;
        bVal = b.name;
      } else if (sortBy === 'email') {
        aVal = a.email || '';
        bVal = b.email || '';
      }

      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedTherapists = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return <div className="therapists-loading">Loading therapists...</div>;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const clinicName = clinics.length > 0 ? clinics[0].name : 'Main Clinic';

  return (
    <div className="therapists-page">
      {errorMessage && <div className="therapists-message therapists-message--error">{errorMessage}</div>}
      {successMessage && <div className="therapists-message therapists-message--success">{successMessage}</div>}

      <div className="page-header">
        <h1 className="page-header__title">Therapists</h1>
        <p className="page-header__subtitle">Manage therapist profiles, availability, and scheduling</p>
      </div>

      <div className="controls-bar">
        <div className="search-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search by name or specialty..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <button
          className="btn btn--primary"
          onClick={() => {
            setShowForm(true);
            setEditingTherapist(null);
            setFormData({ name: '', email: '', hourly_rate: '', specializations: '' });
          }}
        >
          <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Therapist
        </button>
      </div>

      {paginatedTherapists.length === 0 ? (
        <div className="therapists-empty">
          <p>No therapists found</p>
        </div>
      ) : (
        <div className="therapist-grid">
          {paginatedTherapists.map((therapist) => {
            const availability = therapistAvailability.get(therapist.id) || [];
            const stats = therapistStats.get(therapist.id);

            return (
              <div key={therapist.id} className="therapist-card">
                <div className="therapist-card__header">
                  <div className="therapist-info">
                    <h3 className="therapist-name">{therapist.name}</h3>
                    <p className="therapist-specialty">
                      {therapist.specializations?.join(', ') || 'General Therapy'}
                    </p>
                    {therapist.hourly_rate && (
                      <p className="therapist-rate">{therapist.hourly_rate.toLocaleString()} EGP/hr</p>
                    )}
                  </div>
                  <div className="therapist-avatar">
                    {getInitials(therapist.name)}
                  </div>
                </div>

                <div className="therapist-card__body">
                  <div className="availability-section">
                    <div className="availability-label">Availability at {clinicName}</div>
                    <TherapistAvailabilityCalendar
                      days={availability.map((av: any) => ({
                        day: av.day_of_week,
                        status: av.status,
                      }))}
                    />
                  </div>

                  {stats && (
                    <div className="stats-row">
                      <div className="stat">
                        <p className="stat__value">{stats.appointments}</p>
                        <p className="stat__label">Appointments</p>
                      </div>
                      <div className="stat">
                        <p className="stat__value">{stats.bookedPercentage}%</p>
                        <p className="stat__label">Booked</p>
                      </div>
                      <div className="stat">
                        <p className="stat__value">{stats.rating}</p>
                        <p className="stat__label">Rating</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="therapist-card__footer">
                  <button
                    className="btn btn--secondary btn--small btn--edit"
                    onClick={() => handleEdit(therapist)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn--secondary btn--small btn--schedule"
                    onClick={() => handleScheduleClick(therapist)}
                  >
                    📅 Schedule
                  </button>
                  <button
                    className="btn btn--icon btn--delete"
                    onClick={() => handleDelete(therapist)}
                    disabled={loadingDelete}
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ marginTop: '3rem', textAlign: 'center', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn--secondary"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                className={`btn ${currentPage === page ? 'btn--primary' : 'btn--secondary'}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            );
          })}

          <button
            className="btn btn--secondary"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>
                {editingTherapist ? 'Edit Therapist' : 'Add New Therapist'}
              </h2>
              <button
                onClick={handleCancel}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#999',
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Therapist name"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="therapist@example.com"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Hourly Rate (EGP)</label>
                <input
                  type="number"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                  placeholder="2000"
                  step="100"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Specializations (comma-separated)</label>
                <input
                  type="text"
                  value={formData.specializations}
                  onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                  placeholder="Trauma, CBT, Family Therapy"
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                  type="submit"
                  className="btn btn--primary"
                  disabled={loadingCreate || loadingEdit}
                >
                  {loadingCreate || loadingEdit ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedTherapistForAvailability && selectedClinicId && (
        <ScheduleAvailabilityModal
          therapistId={selectedTherapistForAvailability.id}
          therapistName={selectedTherapistForAvailability.name}
          clinicId={selectedClinicId}
          clinicName={clinicName}
          onClose={() => setSelectedTherapistForAvailability(null)}
          onSave={handleAvailabilitySaved}
        />
      )}
    </div>
  );
}
