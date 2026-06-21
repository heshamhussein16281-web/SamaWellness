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

interface AvailableSlot {
  date: string;
  time: string;
  dayOfWeek: string;
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
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Available rooms
  const rooms = ['Room 1', 'Room 2'];

  // Get week start (Monday)
  useEffect(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    setWeekStart(new Date(monday));
  }, []);

  // Fetch therapist availability for current week
  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!therapistId) {
          throw new Error('Therapist not assigned');
        }

        // Fetch therapist availability for the week
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const params = new URLSearchParams({
          therapist_id: String(therapistId),
          start_date: formatDate(weekStart),
          end_date: formatDate(weekEnd),
        });

        const res = await fetch(`/api/admin/therapist-availability?${params}`, {
          credentials: 'include',
        });

        if (!res.ok) {
          // If API doesn't exist yet, use mock data
          setAvailableSlots(generateMockAvailability());
        } else {
          const data = await res.json();
          setAvailableSlots(data.slots || generateMockAvailability());
        }

        setSelectedSlot(null);
        setSelectedRoom('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load availability');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [weekStart, therapistId]);

  // Generate mock availability (remove when API is ready)
  const generateMockAvailability = (): AvailableSlot[] => {
    const slots: AvailableSlot[] = [];
    const days = getWeekDays();

    days.forEach((date, dayIndex) => {
      // Skip weekends
      if (dayIndex === 5 || dayIndex === 6) return;

      // Add morning slots
      if (dayIndex < 5) {
        slots.push(
          { date: formatDate(date), time: '09:00', dayOfWeek: formatDayName(date) },
          { date: formatDate(date), time: '10:00', dayOfWeek: formatDayName(date) },
          { date: formatDate(date), time: '11:00', dayOfWeek: formatDayName(date) }
        );

        // Add afternoon slots
        slots.push(
          { date: formatDate(date), time: '14:00', dayOfWeek: formatDayName(date) },
          { date: formatDate(date), time: '15:00', dayOfWeek: formatDayName(date) },
          { date: formatDate(date), time: '16:00', dayOfWeek: formatDayName(date) }
        );
      }
    });

    return slots;
  };

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

  const formatDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const groupSlotsByDay = () => {
    const grouped: { [key: string]: AvailableSlot[] } = {};
    availableSlots.forEach((slot) => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    return grouped;
  };

  const handleSubmit = async () => {
    if (!selectedSlot || !selectedRoom) {
      setError('Please select a time slot and room');
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
          session_date: `${selectedSlot.date}T${selectedSlot.time}:00`,
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
              Session scheduled for {clientName} on {selectedSlot?.date} at {selectedSlot?.time} in {selectedRoom}.
              {isRecurring && (
                <span> Payment due within 24 hours before the session.</span>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const slotsByDay = groupSlotsByDay();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content--large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Book Session - {clientName}</h2>
          <p className="modal-subtitle">
            {therapistName} • Available slots for this week
          </p>
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
                }}
              >
                ← Previous Week
              </button>
              <span className="modal-week-label">
                {formatDate(weekStart)} to {formatDate(new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000))}
              </span>
              <button
                type="button"
                className="modal-arrow-btn"
                onClick={() => {
                  const newStart = new Date(weekStart);
                  newStart.setDate(newStart.getDate() + 7);
                  setWeekStart(newStart);
                }}
              >
                Next Week →
              </button>
            </div>

            <div className="modal-booking-container">
              {/* Left Side: Therapist Availability Calendar */}
              <div className="modal-availability-panel">
                <h3 className="modal-section-title">Available Slots</h3>
                {availableSlots.length === 0 ? (
                  <p className="modal-empty-state">No available slots this week</p>
                ) : (
                  <div className="modal-slots-list">
                    {Object.entries(slotsByDay).map(([date, slots]) => (
                      <div key={date} className="modal-day-slots">
                        <div className="modal-day-header">
                          {new Date(date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="modal-slots-grid">
                          {slots.map((slot) => (
                            <button
                              key={`${slot.date}-${slot.time}`}
                              type="button"
                              className={`modal-slot-button ${
                                selectedSlot?.date === slot.date && selectedSlot?.time === slot.time
                                  ? 'selected'
                                  : ''
                              }`}
                              onClick={() => setSelectedSlot(slot)}
                            >
                              {slot.time}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Side: Room & Confirmation */}
              <div className="modal-booking-panel">
                <h3 className="modal-section-title">Select Room</h3>
                {selectedSlot ? (
                  <>
                    <div className="modal-selected-slot">
                      <div className="modal-slot-info">
                        <strong>Selected Time:</strong>
                        <p>
                          {new Date(selectedSlot.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                          })}{' '}
                          at {selectedSlot.time}
                        </p>
                      </div>
                    </div>

                    <div className="modal-room-selection">
                      {rooms.map((room) => (
                        <button
                          key={room}
                          type="button"
                          className={`modal-room-option ${selectedRoom === room ? 'selected' : ''}`}
                          onClick={() => setSelectedRoom(room)}
                        >
                          <div className="modal-room-name">{room}</div>
                          <div className="modal-room-status">Available</div>
                        </button>
                      ))}
                    </div>

                    <div className="modal-booking-summary">
                      <div className="modal-summary-row">
                        <span>Client:</span>
                        <strong>{clientName}</strong>
                      </div>
                      <div className="modal-summary-row">
                        <span>Therapist:</span>
                        <strong>{therapistName}</strong>
                      </div>
                      <div className="modal-summary-row">
                        <span>Date & Time:</span>
                        <strong>{selectedSlot?.time}</strong>
                      </div>
                      <div className="modal-summary-row">
                        <span>Room:</span>
                        <strong>{selectedRoom || '—'}</strong>
                      </div>
                    </div>

                    {isRecurring && (
                      <div className="modal-info-box">
                        <strong>Recurring Session:</strong>
                        <p>Payment due within 24 hours before the session.</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="modal-empty-state">
                    Select a time slot from {therapistName}'s availability on the left
                  </p>
                )}
              </div>
            </div>

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
                disabled={!selectedSlot || !selectedRoom || submitting}
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
