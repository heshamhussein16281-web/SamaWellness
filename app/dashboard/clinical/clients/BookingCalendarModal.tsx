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
  const [step, setStep] = useState<'date' | 'time-room' | 'confirm'>('date');
  const [weekStart, setWeekStart] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [duration] = useState(60);
  const [loading, setLoading] = useState(false);
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

  // Available rooms
  const rooms = ['Room 1', 'Room 2'];

  // Get week start (Monday)
  useEffect(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(today.setDate(diff));
    setWeekStart(new Date(monday));
  }, []);

  // Get days of current week
  const getWeekDays = () => {
    const days = [];
    const start = new Date(weekStart);
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  const formatDateDisplay = (date: Date) =>
    date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const canProceed = (): boolean => {
    switch (step) {
      case 'date':
        return selectedDate !== '';
      case 'time-room':
        return selectedTime !== '' && selectedRoom !== '';
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!canProceed()) {
      setError(`Please complete this step`);
      return;
    }

    const steps: Array<'date' | 'time-room' | 'confirm'> = ['date', 'time-room', 'confirm'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
      setError(null);
    }
  };

  const handleBack = () => {
    const steps: Array<'date' | 'time-room' | 'confirm'> = ['date', 'time-room', 'confirm'];
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
      // Create booking
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          client_id: clientId,
          therapist_id: therapistId,
          session_date: `${selectedDate}T${selectedTime}:00`,
          duration_minutes: duration,
          session_type: isRecurring ? 'recurring' : 'single',
          room: selectedRoom,
          notes: `Booked for ${selectedRoom}`,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create booking');
      }

      // Update client status to booking_scheduled
      const clientStatusRes = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          status: 'booking_scheduled',
        }),
      });

      if (!clientStatusRes.ok) {
        console.error('Failed to update client status');
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

  if (success) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-success">
            <div className="modal-success-icon">✓</div>
            <h2 className="modal-success-title">Session Booked</h2>
            <p className="modal-success-message">
              Session scheduled for {clientName} on {selectedDate} at {selectedTime} in {selectedRoom}.
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
          <div className={`modal-step ${step === 'date' ? 'active' : ['time-room', 'confirm'].includes(step) ? 'done' : ''}`}>
            <div className="modal-step-number">1</div>
            <div className="modal-step-label">Select Date</div>
          </div>
          <div className={`modal-step ${step === 'time-room' ? 'active' : step === 'confirm' ? 'done' : ''}`}>
            <div className="modal-step-number">2</div>
            <div className="modal-step-label">Time & Room</div>
          </div>
          <div className={`modal-step ${step === 'confirm' ? 'active' : ''}`}>
            <div className="modal-step-number">3</div>
            <div className="modal-step-label">Confirm</div>
          </div>
        </div>

        {/* Step Content */}
        <div className="modal-step-content">
          {step === 'date' && (
            <div className="modal-form-group">
              <label className="modal-label">
                Select Date <span className="modal-required">*</span>
              </label>
              <div className="modal-info-box">
                <p>Therapist: <strong>{therapistName}</strong></p>
                <p>Select a date from this week</p>
              </div>
              <div className="modal-week-grid">
                {getWeekDays().map((date, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`modal-day-button ${formatDate(date) === selectedDate ? 'selected' : ''}`}
                    onClick={() => setSelectedDate(formatDate(date))}
                  >
                    <div className="modal-day-label">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]}</div>
                    <div className="modal-day-date">{date.getDate()}</div>
                  </button>
                ))}
              </div>
              <div className="modal-navigation-arrows">
                <button
                  type="button"
                  className="modal-arrow-btn"
                  onClick={() => {
                    const newStart = new Date(weekStart);
                    newStart.setDate(newStart.getDate() - 7);
                    setWeekStart(newStart);
                    setSelectedDate('');
                  }}
                >
                  ← Previous Week
                </button>
                <button
                  type="button"
                  className="modal-arrow-btn"
                  onClick={() => {
                    const newStart = new Date(weekStart);
                    newStart.setDate(newStart.getDate() + 7);
                    setWeekStart(newStart);
                    setSelectedDate('');
                  }}
                >
                  Next Week →
                </button>
              </div>
            </div>
          )}

          {step === 'time-room' && (
            <>
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

              <div className="modal-form-group">
                <label className="modal-label">
                  Select Room <span className="modal-required">*</span>
                </label>
                <div className="modal-room-grid">
                  {rooms.map((room) => (
                    <button
                      key={room}
                      type="button"
                      className={`modal-room-button ${selectedRoom === room ? 'selected' : ''}`}
                      onClick={() => setSelectedRoom(room)}
                    >
                      <div className="modal-room-name">{room}</div>
                      <div className="modal-room-status">Available</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 'confirm' && (
            <div className="modal-confirm-details">
              <div className="modal-detail-row">
                <span className="modal-detail-label">Client:</span>
                <span className="modal-detail-value">{clientName}</span>
              </div>
              <div className="modal-detail-row">
                <span className="modal-detail-label">Therapist:</span>
                <span className="modal-detail-value">{therapistName}</span>
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
                  <strong>Recurring Session:</strong>
                  <p>Payment must be received by 24 hours before this session.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="modal-actions">
          {step !== 'date' && (
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
              disabled={!canProceed()}
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
