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
  room: string;
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
  const [weekStart, setWeekStart] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState(0); // 0-6 for Mon-Sun
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [rooms] = useState(['Room 1', 'Room 2']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Time slots
  const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  // Get week start (Monday)
  useEffect(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    setWeekStart(new Date(monday));
    setSelectedDay(0);
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

      // Add slots for each room
      timeSlots.forEach((time) => {
        rooms.forEach((room) => {
          slots.push({
            date: formatDate(date),
            time,
            room,
            available: true, // All slots available for now
          });
        });
      });
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

  const getSelectedDayDate = () => {
    const days = getWeekDays();
    return days[selectedDay];
  };

  const getSlotsForDayAndRoom = (date: string, room: string) => {
    return availableSlots.find(
      (slot) => slot.date === date && slot.room === room && slot.time === timeSlots[0]
    );
  };

  const isSlotSelected = (date: string, time: string, room: string) => {
    return (
      selectedSlot?.date === date &&
      selectedSlot?.time === time &&
      selectedSlot?.room === room
    );
  };

  const handleSlotClick = (date: string, time: string, room: string) => {
    const slot = availableSlots.find(
      (s) => s.date === date && s.time === time && s.room === room
    );
    if (slot?.available) {
      setSelectedSlot(slot);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSlot) {
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
          room: selectedSlot.room,
          notes: `Booked for ${selectedSlot.room}`,
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
              Session scheduled for {clientName} on {selectedSlot?.date} at {selectedSlot?.time} in{' '}
              {selectedSlot?.room}.
              {isRecurring && (
                <span> Payment due within 24 hours before the session.</span>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const selectedDayDate = getSelectedDayDate();
  const selectedDayFormatted = formatDayName(selectedDayDate);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content--large modal-content--xlarge" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Book Session - {clientName}</h2>
            <p className="modal-subtitle">
              {therapistName} • Select available slot
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
                }}
              >
                Next Week →
              </button>
            </div>

            {/* Day Selector */}
            <div className="modal-day-selector">
              {getWeekDays().map((date, idx) => {
                const dayName = formatDayName(date);
                const isWeekend = idx === 5 || idx === 6;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`modal-day-tab ${selectedDay === idx ? 'active' : ''} ${
                      isWeekend ? 'disabled' : ''
                    }`}
                    onClick={() => !isWeekend && setSelectedDay(idx)}
                    disabled={isWeekend}
                  >
                    {dayName}
                  </button>
                );
              })}
            </div>

            {/* Calendar Grid */}
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
                  {rooms.map((room) => {
                    const selectedDayStr = formatDate(selectedDayDate);
                    const slot = availableSlots.find(
                      (s) => s.date === selectedDayStr && s.time === time && s.room === room
                    );
                    const isSelected = isSlotSelected(selectedDayStr, time, room);

                    return (
                      <button
                        key={`${time}-${room}`}
                        type="button"
                        className={`modal-calendar-slot ${isSelected ? 'selected' : ''} ${
                          slot?.available ? 'available' : 'booked'
                        }`}
                        onClick={() =>
                          slot?.available && handleSlotClick(selectedDayStr, time, room)
                        }
                        disabled={!slot?.available}
                        title={slot?.available ? `${time} - ${room}` : `${time} - ${room} (Booked)`}
                      >
                        {slot?.available ? '✓' : '✕'}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Selected Slot Summary */}
            {selectedSlot && (
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
                    <span className="modal-summary-value">{selectedDayFormatted}</span>
                  </div>
                  <div className="modal-summary-item">
                    <span className="modal-summary-label">Time:</span>
                    <span className="modal-summary-value">{selectedSlot.time}</span>
                  </div>
                  <div className="modal-summary-item">
                    <span className="modal-summary-label">Room:</span>
                    <span className="modal-summary-value">{selectedSlot.room}</span>
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
                disabled={!selectedSlot || submitting}
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
