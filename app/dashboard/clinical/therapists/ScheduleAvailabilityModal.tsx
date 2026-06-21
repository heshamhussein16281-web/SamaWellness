'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import AddExceptionForm from './AddExceptionForm';

interface AvailabilityData {
  [day: string]: {
    working: boolean;
    start_time: string;
    end_time: string;
  };
}

interface ExceptionData {
  id: string;
  exception_type: 'vacation' | 'day_off';
  start_date: string;
  end_date: string | null;
}

interface ScheduleAvailabilityModalProps {
  therapistId: string;
  therapistName: string;
  clinicId: string;
  clinicName: string;
  onClose: () => void;
  onSave: () => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ScheduleAvailabilityModal({
  therapistId,
  therapistName,
  clinicId,
  clinicName,
  onClose,
  onSave,
}: ScheduleAvailabilityModalProps) {
  const [availability, setAvailability] = useState<AvailabilityData>({});
  const [exceptions, setExceptions] = useState<ExceptionData[]>([]);
  const [showExceptionForm, setShowExceptionForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch current availability and exceptions
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch availability
        const availRes = await fetch(
          `/api/admin/therapists/${therapistId}/availability?clinic_id=${clinicId}`,
          { credentials: 'include' }
        );
        if (!availRes.ok) throw new Error('Failed to fetch availability');
        const availData = await availRes.json();

        // Initialize availability object
        const availMap: AvailabilityData = {};
        DAYS.forEach(day => {
          availMap[day] = {
            working: false,
            start_time: '09:00',
            end_time: '17:00',
          };
        });

        // Set working days with times
        if (availData.data) {
          availData.data.forEach((record: any) => {
            availMap[record.day_of_week] = {
              working: record.status === 'working',
              start_time: record.start_time || '09:00',
              end_time: record.end_time || '17:00',
            };
          });
        }
        setAvailability(availMap);

        // Fetch exceptions
        const excRes = await fetch(
          `/api/admin/therapists/${therapistId}/exceptions?clinic_id=${clinicId}`,
          { credentials: 'include' }
        );
        if (!excRes.ok) throw new Error('Failed to fetch exceptions');
        const excData = await excRes.json();
        setExceptions(excData.data || []);

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load availability');
        setLoading(false);
      }
    };

    fetchData();
  }, [therapistId, clinicId]);

  const handleToggleDay = (day: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        working: !prev[day].working,
      },
    }));
  };

  const handleTimeChange = (day: string, field: 'start_time' | 'end_time', value: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleAddException = async (exception: any) => {
    try {
      const res = await fetch(`/api/admin/therapists/${therapistId}/exceptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinic_id: clinicId,
          ...exception,
        }),
      });

      if (!res.ok) throw new Error('Failed to add exception');
      const data = await res.json();
      setExceptions([...exceptions, data.data]);
      setShowExceptionForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add exception');
    }
  };

  const handleDeleteException = async (exceptionId: string) => {
    try {
      const res = await fetch(
        `/api/admin/therapists/${therapistId}/exceptions?exception_id=${exceptionId}`,
        { method: 'DELETE' }
      );

      if (!res.ok) throw new Error('Failed to delete exception');
      setExceptions(exceptions.filter(e => e.id !== exceptionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete exception');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      // Build availability array - only include working days
      const availArray = DAYS.filter(day => availability[day].working).map(day => ({
        day_of_week: day,
        clinic_id: clinicId,
        start_time: availability[day].start_time,
        end_time: availability[day].end_time,
      }));

      const res = await fetch(`/api/admin/therapists/${therapistId}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(availArray),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save availability');
      }

      setSaving(false);
      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save availability');
      setSaving(false);
    }
  };

  if (loading) {
    return (
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
      }}>
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <>
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
        zIndex: 999,
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>
              Set Availability for {therapistName} at {clinicName}
            </h3>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <X size={20} />
            </button>
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fee',
              color: '#c00',
              padding: '0.75rem',
              borderRadius: '4px',
              marginBottom: '1rem',
            }}>
              {error}
            </div>
          )}

          {/* Working Days */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ marginTop: 0 }}>Select Working Days:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {DAYS.map(day => (
                <div key={day} style={{ borderLeft: `3px solid ${availability[day]?.working ? '#007bff' : '#eee'}`, paddingLeft: '1rem' }}>
                  <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <input
                      type="checkbox"
                      checked={availability[day]?.working || false}
                      onChange={() => handleToggleDay(day)}
                    />
                    <strong>{day}</strong>
                  </label>
                  <div style={{ display: 'flex', gap: '1rem', paddingLeft: '1.5rem', opacity: availability[day]?.working ? 1 : 0.6 }}>
                    <div>
                      <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem', fontWeight: '600' }}>From:</label>
                      <input
                        type="time"
                        value={availability[day]?.start_time || '09:00'}
                        onChange={(e) => handleTimeChange(day, 'start_time', e.target.value)}
                        disabled={!availability[day]?.working}
                        style={{
                          padding: '0.4rem',
                          borderRadius: '4px',
                          border: '1px solid #ddd',
                          opacity: availability[day]?.working ? 1 : 0.5,
                          cursor: availability[day]?.working ? 'text' : 'not-allowed',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem', fontWeight: '600' }}>To:</label>
                      <input
                        type="time"
                        value={availability[day]?.end_time || '17:00'}
                        onChange={(e) => handleTimeChange(day, 'end_time', e.target.value)}
                        disabled={!availability[day]?.working}
                        style={{
                          padding: '0.4rem',
                          borderRadius: '4px',
                          border: '1px solid #ddd',
                          opacity: availability[day]?.working ? 1 : 0.5,
                          cursor: availability[day]?.working ? 'text' : 'not-allowed',
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr style={{ margin: '2rem 0' }} />

          {/* Exceptions */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ marginTop: 0 }}>Exceptions (Vacation, Days Off):</h4>

            {exceptions.length > 0 ? (
              <div style={{ marginBottom: '1rem' }}>
                {exceptions.map(exc => (
                  <div
                    key={exc.id}
                    style={{
                      backgroundColor: '#f9f9f9',
                      padding: '0.75rem',
                      borderRadius: '4px',
                      marginBottom: '0.75rem',
                      fontSize: '0.9rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>
                      {exc.exception_type === 'vacation' ? 'Vacation' : 'Day Off'}: {exc.start_date}
                      {exc.end_date && exc.end_date !== exc.start_date ? ` - ${exc.end_date}` : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteException(exc.id)}
                      style={{
                        fontSize: '0.8rem',
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#f0f0f0',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.9rem', color: '#666' }}>No exceptions yet</p>
            )}

            <button
              type="button"
              onClick={() => setShowExceptionForm(true)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f0f0f0',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              + Add Exception
            </button>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f0f0f0',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {showExceptionForm && (
        <AddExceptionForm
          onSubmit={handleAddException}
          onCancel={() => setShowExceptionForm(false)}
        />
      )}
    </>
  );
}
