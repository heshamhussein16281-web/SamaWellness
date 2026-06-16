'use client';

import React, { useState, useEffect } from 'react';
import './modal.css';

interface BookingCalendarModalProps {
  clientId: number;
  clientName: string;
  therapistId?: number;
  therapistName?: string;
  isRecurring: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

interface Therapist {
  id: number;
  name: string;
}

interface Clinic {
  id: string;
  name: string;
  rooms: string[];
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export default function BookingCalendarModal({
  clientId,
  clientName,
  therapistId,
  therapistName,
  isRecurring,
  onSuccess,
  onClose,
}: BookingCalendarModalProps) {
  const [step, setStep] = useState<'therapist' | 'date' | 'time' | 'room' | 'confirm'>('therapist');
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [selectedTherapistId, setSelectedTherapistId] = useState<number | null>(therapistId || null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Available time slots
  const timeSlots: TimeSlot[] = [
    { time: '09:00', available: true },
    { time: '10:00', available: true },
    { time: '11:00', available: true },
    { time: '14:00', available: true },
    { time: '15:00', available: true },
    { time: '16:00', available: true },
    { time: '17:00', available: true },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch therapists
        const therapistsRes = await fetch('/api/admin/therapists', {
          credentials: 'include',
        });
        if (therapistsRes.ok) {
          const data = await therapistsRes.json();
          setTherapists(data.therapists || data.data || []);
        }

        // Fetch clinics
        const clinicsRes = await fetch('/api/admin/clinics', {
          credentials: 'include',
        });
        if (clinicsRes.ok) {
          const data = await clinicsRes.json();
          setClinics(data.clinics || data.data || []);
          if (data.clinics?.[0]) {
            setSelectedClinicId(data.clinics[0].id);
          }
        }
      } catch (err) {
        setError('Failed to fetch booking data');
        console.error(err);
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, []);

  const getAvailableRooms = (): string[] => {
    const clinic = clinics.find((c) => c.id === selectedClinicId);
    return clinic?.rooms || [];
  };

  const getTodayAndFuture = (): string[] => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const canProceedToNext = (): boolean => {
    switch (step) {
      case 'therapist':
        return selectedTherapistId !== null;
      case 'date':
        return selectedDate !== '';
      case 'time':
        return selectedTime !== '';
      case 'room':
        return selectedRoom !== '';
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canProceedToNext()) {
      setError('Please complete this step');
      return;
    }

    const steps: Array<'therapist' | 'date' | 'time' | 'room' | 'confirm'> = [
      'therapist',
      'date',
      'time',
      'room',
      'confirm',
    ];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
      setError(null);
    }
  };

  const handleBack = () => {
    const steps: Array<'therapist' | 'date' | 'time' | 'room' | 'confirm'> = [
      'therapist',
      'date',
      'time',
      'room',
      'confirm',
    ];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          client_id: clientId,
          therapist_id: selectedTherapistId,
          session_date: `${selectedDate}T${selectedTime}:00`,
          duration_minutes: duration,
          session_type: 'single',
          clinic_id: selectedClinicId,
          room_id: null,
          notes: `Booked for ${selectedRoom}`,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create booking');
      }

      // Update client status based on recurring status
      const clientStatusRes = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: isRecurring ? 'booking_scheduled' : 'payment_pending',
        }),
      });

      if (!clientStatusRes.ok) {
        console.error('Failed to update client status');
        // Don't fail the whole request just because status update failed
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-loading-container">
            <div className="modal-loading">Loading booking calendar...</div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-success">
            <div className="modal-success-icon">✓</div>
            <h2 className="modal-success-title">Booking Confirmed</h2>
            <p className="modal-success-message">
              Session scheduled for {clientName} on {selectedDate} at {selectedTime}.
              {isRecurring && (
                <span> Payment due within 24 hours before the session.</span>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content--large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Book Session - {clientName}</h2>
          <button
            className="modal-close-btn"
            onClick={onClose}
            type="button"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        {/* Progress Indicator */}
        <div className="modal-steps">
          <div className={`modal-step ${step === 'therapist' ? 'active' : ['date', 'time', 'room', 'confirm'].includes(step) ? 'done' : ''}`}>
            <div className="modal-step-number">1</div>
            <div className="modal-step-label">Therapist</div>
          </div>
          <div className={`modal-step ${step === 'date' ? 'active' : ['time', 'room', 'confirm'].includes(step) ? 'done' : ''}`}>
            <div className="modal-step-number">2</div>
            <div className="modal-step-label">Date</div>
          </div>
          <div className={`modal-step ${step === 'time' ? 'active' : ['room', 'confirm'].includes(step) ? 'done' : ''}`}>
            <div className="modal-step-number">3</div>
            <div className="modal-step-label">Time</div>
          </div>
          <div className={`modal-step ${step === 'room' ? 'active' : step === 'confirm' ? 'done' : ''}`}>
            <div className="modal-step-number">4</div>
            <div className="modal-step-label">Room</div>
          </div>
          <div className={`modal-step ${step === 'confirm' ? 'active' : ''}`}>
            <div className="modal-step-number">5</div>
            <div className="modal-step-label">Confirm</div>
          </div>
        </div>

        {/* Step Content */}
        <div className="modal-step-content">
          {step === 'therapist' && (
            <div className="modal-form-group">
              <label htmlFor="therapist" className="modal-label">
                {isRecurring ? 'Therapist' : 'Select Therapist'} <span className="modal-required">*</span>
              </label>
              {isRecurring && therapistName && (
                <div className="modal-info-box">
                  <strong>Your Current Therapist:</strong> {therapistName}
                  <br />
                  <small>Change below if you'd like a different therapist</small>
                </div>
              )}
              <select
                id="therapist"
                value={selectedTherapistId || ''}
                onChange={(e) => setSelectedTherapistId(parseInt(e.target.value, 10))}
                className="modal-input"
                required
              >
                <option value="">
                  {isRecurring ? 'Continue with ' + therapistName : 'Choose a therapist'}
                </option>
                {therapists.map((therapist) => (
                  <option key={therapist.id} value={therapist.id}>
                    {therapist.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {step === 'date' && (
            <div className="modal-form-group">
              <label htmlFor="date" className="modal-label">
                Select Date <span className="modal-required">*</span>
              </label>
              <select
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="modal-input"
              >
                <option value="">Choose a date</option>
                {getTodayAndFuture().map((date) => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </option>
                ))}
              </select>
            </div>
          )}

          {step === 'time' && (
            <div className="modal-form-group">
              <label className="modal-label">
                Select Time <span className="modal-required">*</span>
              </label>
              <div className="modal-time-grid">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    className={`modal-time-slot ${selectedTime === slot.time ? 'selected' : ''} ${!slot.available ? 'disabled' : ''}`}
                    onClick={() => slot.available && setSelectedTime(slot.time)}
                    disabled={!slot.available}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'room' && (
            <>
              <div className="modal-form-group">
                <label htmlFor="clinic" className="modal-label">
                  Select Clinic <span className="modal-required">*</span>
                </label>
                <select
                  id="clinic"
                  value={selectedClinicId}
                  onChange={(e) => setSelectedClinicId(e.target.value)}
                  className="modal-input"
                >
                  {clinics.map((clinic) => (
                    <option key={clinic.id} value={clinic.id}>
                      {clinic.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-form-group">
                <label htmlFor="room" className="modal-label">
                  Select Room <span className="modal-required">*</span>
                </label>
                {getAvailableRooms().length > 0 ? (
                  <select
                    id="room"
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="modal-input"
                  >
                    <option value="">Choose a room</option>
                    {getAvailableRooms().map((room) => (
                      <option key={room} value={room}>
                        {room}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="modal-warning">No rooms available for this clinic</p>
                )}
              </div>
            </>
          )}

          {step === 'confirm' && (
            <div className="modal-confirm-details">
              <div className="modal-detail-row">
                <span className="modal-detail-label">Therapist:</span>
                <span className="modal-detail-value">
                  {therapists.find((t) => t.id === selectedTherapistId)?.name}
                </span>
              </div>
              <div className="modal-detail-row">
                <span className="modal-detail-label">Date:</span>
                <span className="modal-detail-value">
                  {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="modal-detail-row">
                <span className="modal-detail-label">Time:</span>
                <span className="modal-detail-value">{selectedTime}</span>
              </div>
              <div className="modal-detail-row">
                <span className="modal-detail-label">Room:</span>
                <span className="modal-detail-value">{selectedRoom}</span>
              </div>
              <div className="modal-detail-row">
                <span className="modal-detail-label">Duration:</span>
                <span className="modal-detail-value">{duration} minutes</span>
              </div>

              {isRecurring && (
                <div className="modal-info-box" style={{ marginTop: '1rem' }}>
                  <strong>Payment Reminder:</strong>
                  <p>Payment must be received by 24 hours before this session.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="modal-actions">
          {step !== 'therapist' && (
            <button
              type="button"
              className="modal-btn modal-btn--secondary"
              onClick={handleBack}
            >
              ← Back
            </button>
          )}
          {step !== 'confirm' ? (
            <button
              type="button"
              className="modal-btn modal-btn--primary"
              onClick={handleNext}
              disabled={!canProceedToNext()}
            >
              Next →
            </button>
          ) : (
            <>
              <button
                type="button"
                className="modal-btn modal-btn--secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-btn modal-btn--primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
