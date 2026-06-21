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

interface TherapistAvailability {
  day_of_week: string;
  status: 'working' | 'vacation' | 'off';
}

interface BookingSlot {
  date: string;
  time: string;
  room: string;
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
  const [weekStart, setWeekStart] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');

  const [therapistAvailability, setTherapistAvailability] = useState<TherapistAvailability[]>([]);
  const [workingDays, setWorkingDays] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
  const rooms = ['Room 1', 'Room 2'];
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayAbbrev = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Get week start (Monday)
  useEffect(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    setWeekStart(new Date(monday));
  }, []);

  // Fetch therapist availability schedule
  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!therapistId) {
          throw new Error('Therapist not assigned');
        }

        // Fetch therapist availability - which days they work
        const res = await fetch(`/api/admin/therapists/${therapistId}/availability`, {
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          setTherapistAvailability(data.availability || []);

          // Extract working days (days where status = 'working')
          const working = data.availability
            ?.filter((a: TherapistAvailability) => a.status === 'working')
            .map((a: TherapistAvailability) => a.day_of_week) || [];
          setWorkingDays(working);
        } else {
          // Default to Mon-Fri if API fails
          setWorkingDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
        }
      } catch (err) {
        console.error(err);
        setWorkingDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
      } finally {
        setLoading(false);
      }
    };

    if (therapistId) {
      fetchAvailability();
    }
  }, [therapistId]);

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

  const getDayName = (date: Date) => {
    const dayIndex = date.getDay();
    const dayName = daysOfWeek[(dayIndex + 6) % 7]; // Convert JS day (0=Sun) to our order (0=Mon)
    return dayName;
  };

  const isTherapistWorkingDay = (dayName: string) => {
    return workingDays.includes(dayName);
  };

  // Get available days this week (only days therapist works)
  const getAvailableDaysThisWeek = () => {
    return getWeekDays().filter((date) => isTherapistWorkingDay(getDayName(date)));
  };

  const isDateSelected = (date: string) => selectedDate === date;

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !selectedRoom) {
      setError('Please select a date, time, and room');
      return;
    }

    setError(null);
    setSubmitting(true);

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
          duration_minutes: 60,
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
      setSubmitting(false);
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

  const availableDaysThisWeek = getAvailableDaysThisWeek();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content--large modal-content--xlarge" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Book Session - {clientName}</h2>
            <p className="modal-subtitle">
              {therapistName} • Available time slots
            </p>
          </div>
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

        {loading ? (
          <div className="modal-loading-container">
            <div className="modal-loading">Loading {therapistName}'s availability...</div>
          </div>
        ) : (
          <>
            {/* Week Navigation */}
            <div className="modal-week-navigation">
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
              <span className="modal-week-label">
                Week of {formatDate(weekStart)}
              </span>
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

            {/* Day Selector - Only show working days */}
            <div className="modal-day-selector">
              {availableDaysThisWeek.length === 0 ? (
                <p className="modal-empty-state">No available days this week</p>
              ) : (
                availableDaysThisWeek.map((date, idx) => {
                  const dayName = getDayName(date);
                  const dayIndex = date.getDay();
                  const dateStr = formatDate(date);
                  const isSelected = isDateSelected(dateStr);

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      className={`modal-day-tab ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedDate(dateStr)}
                    >
                      <div className="modal-day-tab-day">
                        {dayAbbrev[(dayIndex + 6) % 7]}
                      </div>
                      <div className="modal-day-tab-date">
                        {date.getDate()}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Weekly Calendar Grid - Time slots by room */}
            {selectedDate && (
              <>
                <h3 className="modal-section-title">Select Time & Room</h3>
                <div className="modal-calendar-grid">
                  {/* Header Row - Room Names */}
                  <div className="modal-calendar-header">
                    <div className="modal-time-column"></div>
                    {rooms.map((room) => (
                      <div key={room} className="modal-room-column-header">
                        {room}
                      </div>
                    ))}
                  </div>

                  {/* Time Slots Grid */}
                  {timeSlots.map((time) => (
                    <div key={time} className="modal-calendar-row">
                      <div className="modal-time-slot-label">{time}</div>
                      {rooms.map((room) => (
                        <button
                          key={`${time}-${room}`}
                          type="button"
                          className={`modal-calendar-slot ${
                            selectedTime === time && selectedRoom === room ? 'selected' : ''
                          }`}
                          onClick={() => {
                            setSelectedTime(time);
                            setSelectedRoom(room);
                          }}
                        >
                          ✓
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Selected Slot Summary */}
            {selectedDate && selectedTime && selectedRoom && (
              <div className="modal-booking-summary">
                <h3 className="modal-summary-title">Booking Details</h3>
                <div className="modal-summary-grid">
                  <div className="modal-summary-item">
                    <span className="modal-summary-label">Client:</span>
                    <span className="modal-summary-value">{clientName}</span>
                  </div>
                  <div className="modal-summary-item">
                    <span className="modal-summary-label">Therapist:</span>
                    <span className="modal-summary-value">{therapistName}</span>
                  </div>
                  <div className="modal-summary-item">
                    <span className="modal-summary-label">Date:</span>
                    <span className="modal-summary-value">
                      {new Date(selectedDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="modal-summary-item">
                    <span className="modal-summary-label">Time:</span>
                    <span className="modal-summary-value">{selectedTime}</span>
                  </div>
                  <div className="modal-summary-item">
                    <span className="modal-summary-label">Room:</span>
                    <span className="modal-summary-value">{selectedRoom}</span>
                  </div>
                  <div className="modal-summary-item">
                    <span className="modal-summary-label">Duration:</span>
                    <span className="modal-summary-value">60 minutes</span>
                  </div>
                </div>

                {isRecurring && (
                  <div className="modal-info-box">
                    <strong>Recurring Session:</strong>
                    <p>Payment due within 24 hours before the session.</p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="modal-actions">
              <button
                type="button"
                className="modal-btn modal-btn--secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-btn modal-btn--primary"
                onClick={handleSubmit}
                disabled={!selectedDate || !selectedTime || !selectedRoom || submitting}
              >
                {submitting ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
