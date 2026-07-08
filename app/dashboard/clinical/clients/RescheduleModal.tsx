'use client';

import React, { useState, useEffect } from 'react';
import './modal.css';

interface RescheduleModalProps {
  clientId: number;
  bookingId?: number;
  clientName: string;
  therapistId: number;
  therapistName?: string;
  currentSessionDate?: string;
  clinicId?: number;
  paymentAmount?: number | null;
  onSuccess: () => void;
  onClose: () => void;
}

interface TherapistSchedule {
  days: string[];
  schedule: Record<string, { start: number; end: number }>;
}

export default function RescheduleModal({
  clientId,
  bookingId,
  clientName,
  therapistId,
  therapistName,
  currentSessionDate,
  clinicId,
  paymentAmount = 2000,
  onSuccess,
  onClose,
}: RescheduleModalProps) {
  // Get today's date (normalized to midnight)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Tomorrow is the earliest date we can book
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Log the booking being opened
  console.log('[RescheduleModal] Opened with:', {
    bookingId,
    currentSessionDate,
    clientName,
    today: today.toISOString().split('T')[0],
    tomorrow: tomorrow.toISOString().split('T')[0],
  });

  const [action, setAction] = useState<'reschedule' | 'cancel' | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [refundSelection, setRefundSelection] = useState<'keep' | 'refund'>('keep');

  // Calendar state - start from Monday of next week (or this week if it's early in the week)
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const todayDate = new Date();
    const day = todayDate.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday

    // Calculate days back to Monday (if today is Monday, daysBack=0)
    const daysBack = day === 0 ? 6 : day - 1;

    // Get Monday of current week
    const monday = new Date(todayDate);
    monday.setDate(monday.getDate() - daysBack);
    monday.setHours(0, 0, 0, 0);

    // If Monday is today or in the past, move to next week's Monday
    if (monday <= today) {
      monday.setDate(monday.getDate() + 7);
    }

    return monday;
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<{ id: number; room_name: string } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [therapistSchedule, setTherapistSchedule] = useState<TherapistSchedule | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [clinicRooms, setClinicRooms] = useState<Array<{ id: number; room_name: string }>>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Fetch therapist schedule and clinic rooms on mount
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoadingSchedule(true);
        setScheduleError(null);
        const res = await fetch(`/api/admin/therapists/${therapistId}`, {
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          const therapist = data.therapist;
          if (therapist && therapist.days && therapist.days.length > 0) {
            setTherapistSchedule({
              days: therapist.days || [],
              schedule: therapist.schedule || {},
            });
          } else {
            setScheduleError('No schedule data found for this therapist');
          }
        } else {
          setScheduleError(`Failed to load therapist schedule`);
        }
      } catch (err) {
        console.error('Failed to fetch therapist schedule:', err);
        setScheduleError('Error loading therapist schedule');
      } finally {
        setLoadingSchedule(false);
      }
    };

    const fetchRooms = async () => {
      if (!clinicId) {
        setLoadingRooms(false);
        return;
      }

      try {
        setLoadingRooms(true);
        const res = await fetch(`/api/admin/clinics/${clinicId}`, {
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          if (data.clinic_rooms && Array.isArray(data.clinic_rooms)) {
            setClinicRooms(data.clinic_rooms);
            if (data.clinic_rooms.length > 0) {
              setSelectedRoom(data.clinic_rooms[0]);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch clinic rooms:', err);
      } finally {
        setLoadingRooms(false);
      }
    };

    if (therapistId) {
      fetchSchedule();
    }
    if (clinicId) {
      fetchRooms();
    }
  }, [therapistId, clinicId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calendar helper functions
  const getDayName = (date: Date) => {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
  };

  const getFullDayName = (date: Date) => {
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
  };

  const matchDayInSchedule = (dayAbbr: string): string => {
    const fullNames: Record<string, string> = {
      'Sun': 'Sunday',
      'Mon': 'Monday',
      'Tue': 'Tuesday',
      'Wed': 'Wednesday',
      'Thu': 'Thursday',
      'Fri': 'Friday',
      'Sat': 'Saturday'
    };
    return fullNames[dayAbbr] || dayAbbr;
  };

  const isTherapistWorking = (dayAbbr: string): boolean => {
    if (!therapistSchedule || therapistSchedule.days.length === 0) {
      return true;
    }
    const fullDayName = matchDayInSchedule(dayAbbr);
    return therapistSchedule.days.includes(fullDayName);
  };

  const getDayStart = (dayAbbr: string): number => {
    if (!therapistSchedule?.schedule) return 10;
    const fullDayName = matchDayInSchedule(dayAbbr);
    return therapistSchedule.schedule[fullDayName]?.start || 10;
  };

  const getDayEnd = (dayAbbr: string): number => {
    if (!therapistSchedule?.schedule) return 22;
    const fullDayName = matchDayInSchedule(dayAbbr);
    return therapistSchedule.schedule[fullDayName]?.end || 22;
  };

  const formatDate2 = (date: Date) => {
    // Use local date components to avoid timezone shift
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Check if date is today or in the past (not allowed for booking)
  const isPastOrToday = (date: Date): boolean => {
    const dateNormalized = new Date(date);
    dateNormalized.setHours(0, 0, 0, 0);
    return dateNormalized.getTime() <= today.getTime();
  };

  // Check if date is in the future (allowed for booking)
  const isFutureDate = (date: Date): boolean => {
    return !isPastOrToday(date);
  };

  const formatHour = (hour: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour} ${period}`;
  };

  // Time slots (10am to 10pm) - full day view
  const HOUR_START = 10;
  const HOUR_END = 22;
  const HOURS = Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i);
  const HOUR_LABELS = HOURS.map((h) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${displayH} ${period}`;
  });

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const weekDays = getWeekDays();

  const handleCancel = async () => {
    if (!bookingId) {
      setError('No booking found for this session. Unable to cancel.');
      return;
    }

    if (!cancelReason.trim()) {
      setError('Please provide a reason for cancellation');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          reason: cancelReason.trim(),
          refund_requested: refundSelection === 'refund',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to cancel session');
      }

      // Refund amount should be based on therapist's rate, not hardcoded
      // Use the actual payment amount from client record
      const refundAmount = paymentAmount || 2000;
      setSuccessMessage(
        refundSelection === 'refund'
          ? `Session cancelled. Refund of ${refundAmount} EGP will be processed to client.`
          : `Session cancelled. Payment of ${refundAmount} EGP kept. Client can rebook anytime.`
      );
      setSuccess(true);

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotClick = async (date: string, hour: number, roomName: string) => {
    // Prevent bookings that are not in the future (today or past)
    if (!isFutureDate(new Date(date))) {
      setError('Bookings must be scheduled for tomorrow or later');
      return;
    }

    setError(null);
    setSelectedDate(date);
    setSelectedTime(hour);
    // Find the room object by name
    const room = clinicRooms.find(r => r.room_name === roomName);
    if (room) {
      setSelectedRoom(room);
    }
  };

  const handleReschedule = async () => {
    if (!bookingId) {
      setError('No booking found for this session. Unable to reschedule.');
      return;
    }

    if (!selectedDate || selectedTime === null || !selectedRoom) {
      setError('Please select a date, time, and room');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // First, cancel the old booking (skip if already cancelled)
      console.log('[RescheduleModal] Cancelling old booking:', bookingId);
      const cancelRes = await fetch(`/api/admin/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          cancellation_reason: 'Rescheduled to new date',
        }),
      });

      // If booking is already cancelled or cancel fails, log but continue with creating new booking
      if (!cancelRes.ok) {
        const errorData = await cancelRes.json();
        console.error('[RescheduleModal] ❌ CANCEL FAILED:', cancelRes.status, errorData);
        console.error('[RescheduleModal] Response:', cancelRes);
        // Still continue - we'll create the new booking anyway
        // This handles cases where the old booking is already cancelled
      } else {
        const cancelData = await cancelRes.json();
        console.log('[RescheduleModal] ✓ Old booking cancelled successfully:', cancelData);
      }

      // Then, create new booking
      const newSessionDate = `${selectedDate}T${String(selectedTime).padStart(2, '0')}:00:00`;

      if (!clinicId) {
        throw new Error('Clinic ID is required to create a booking');
      }

      console.log('[RescheduleModal] handleReschedule called with:', {
        selectedDate,
        selectedTime,
        newSessionDate,
        clientId,
        therapistId,
        clinicId,
        roomId: selectedRoom?.id,
      });

      const bookRes = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          client_id: clientId,
          therapist_id: therapistId,
          session_date: newSessionDate,
          duration_minutes: 60,
          session_type: 'single',
          clinic_id: clinicId,
          room_id: selectedRoom?.id || null,
          notes: currentSessionDate ? `Rescheduled from ${formatDate(currentSessionDate)}` : 'Rescheduled to new date',
        }),
      });

      if (!bookRes.ok) {
        const data = await bookRes.json();
        console.error('[RescheduleModal] New booking failed:', bookRes.status, data);
        throw new Error(data.error || `Failed to create new session (${bookRes.status})`);
      }

      const newBookingData = await bookRes.json();
      console.log('[RescheduleModal] New booking created:', newBookingData);

      // Store the new booking ID so we can use it as the current booking
      if (newBookingData.data && newBookingData.data.id) {
        sessionStorage.setItem('lastCreatedBookingId', String(newBookingData.data.id));
        console.log('[RescheduleModal] Stored new booking ID:', newBookingData.data.id);
      }

      // Restore payment_verified_1 after rescheduling
      // The booking API resets it to false, but for rescheduling we want to preserve payment state
      const updateRes = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          payment_verified_1: true,
        }),
      });

      if (!updateRes.ok) {
        console.error('[RescheduleModal] Warning: Could not restore payment state after rescheduling');
        // Don't throw - the reschedule succeeded, just log a warning
      }

      setSuccessMessage(
        `Session rescheduled to ${new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} at ${HOUR_LABELS[HOURS.indexOf(selectedTime)]} in ${selectedRoom?.room_name}. Original payment applies.`
      );
      setSuccess(true);

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
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
            <h2 className="modal-success-title">
              {action === 'cancel' ? 'Session Cancelled' : 'Session Rescheduled'}
            </h2>
            <p className="modal-success-message">{successMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if no booking found or booking is cancelled
  if (!bookingId || !currentSessionDate) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">No Booking Found</h2>
            <button
              className="modal-close-btn"
              onClick={onClose}
              type="button"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
          <div className="modal-error" style={{ margin: '2rem' }}>
            No scheduled booking found for {clientName}. This client may need to book a session first before you can reschedule or cancel.
          </div>
          <div style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" className="modal-btn modal-btn--secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if booking is already cancelled (shouldn't happen, but protect against it)
  if (bookingId && !currentSessionDate) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Booking Already Cancelled</h2>
            <button
              className="modal-close-btn"
              onClick={onClose}
              type="button"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
          <div className="modal-error" style={{ margin: '2rem' }}>
            This booking has already been cancelled. Please refresh the page to see the latest client status, or book a new session for {clientName}.
          </div>
          <div style={{ padding: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="button" className="modal-btn modal-btn--secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-content ${action === 'reschedule' ? 'modal-content--large' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Manage Booking - {clientName}</h2>
            <p className="modal-subtitle">
              Current: {formatDate(currentSessionDate)} with {therapistName}
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

        {/* Action Selection */}
        {action === null ? (
          <div className="modal-body">
            <p style={{ marginBottom: '1.5rem', color: 'var(--modal-text-secondary)', fontWeight: '500', fontSize: '0.95rem' }}>
              What would you like to do?
            </p>

            <div className="action-buttons-grid">
              {/* Reschedule Option */}
              <button
                onClick={() => setAction('reschedule')}
                className="action-button action-button--reschedule"
                type="button"
              >
                <div className="action-button__icon" aria-hidden="true">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
                  </svg>
                </div>
                <div className="action-button__label">Reschedule</div>
                <div className="action-button__desc">
                  Move to a new<br/>date or time
                </div>
              </button>

              {/* Cancel Option */}
              <button
                onClick={() => setAction('cancel')}
                className="action-button action-button--cancel"
                type="button"
              >
                <div className="action-button__icon" aria-hidden="true">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
                <div className="action-button__label">Cancel</div>
                <div className="action-button__desc">
                  Remove this<br/>appointment
                </div>
              </button>
            </div>
          </div>
        ) : action === 'reschedule' ? (
          <>
            {/* Week Navigation */}
            <div className="legacy-week-nav">
              <button
                type="button"
                className="legacy-nav-btn"
                onClick={() => {
                  const newStart = new Date(weekStart);
                  newStart.setDate(newStart.getDate() - 7);
                  setWeekStart(newStart);
                  setSelectedDate(null);
                }}
              >
                ←
              </button>
              <span className="legacy-week-label">
                {formatDate2(weekDays[0])} – {formatDate2(weekDays[6])}
              </span>
              <button
                type="button"
                className="legacy-nav-btn"
                onClick={() => {
                  const newStart = new Date(weekStart);
                  newStart.setDate(newStart.getDate() + 7);
                  setWeekStart(newStart);
                  setSelectedDate(null);
                }}
              >
                →
              </button>
            </div>

            {/* Legend */}
            <div className="legacy-legend">
              <span>
                <span className="legacy-legend-box" style={{ background: '#D4EDDA', border: '1px solid #A8D5B5' }}></span>
                Free
              </span>
              <span>
                <span className="legacy-legend-box" style={{ background: '#f5f5f5', border: '1px solid #ddd' }}></span>
                Unavailable
              </span>
            </div>

            {/* Therapist Schedule Info */}
            {loadingSchedule && (
              <div className="therapist-schedule-info loading">
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>Loading therapist schedule...</p>
              </div>
            )}

            {scheduleError && (
              <div className="therapist-schedule-info error">
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#c75c5c' }}>⚠ {scheduleError}</p>
              </div>
            )}

            {therapistSchedule && therapistSchedule.days.length > 0 && (
              <div className="therapist-schedule-info">
                <h4>Working Schedule</h4>
                <div className="schedule-grid">
                  {therapistSchedule.days.map((day) => {
                    const dayStart = getDayStart(day);
                    const dayEnd = getDayEnd(day);
                    const formatHourLabel = (h: number) => {
                      const period = h >= 12 ? 'PM' : 'AM';
                      const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
                      return `${displayH}${period}`;
                    };
                    return (
                      <div key={day} className="schedule-day">
                        <span className="day-name">{day}</span>
                        <span className="day-hours">{formatHourLabel(dayStart)}–{formatHourLabel(dayEnd)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Calendar Grid */}
            <div className="legacy-calendar-wrapper">
              <div className="legacy-calendar-grid">
                {/* Header Row - Days */}
                <div className="legacy-grid-cell legacy-header-cell"></div>
                {weekDays.map((date) => {
                  const dayName = getDayName(date);
                  const isWorking = isTherapistWorking(dayName);
                  const dayStart = getDayStart(dayName);
                  const dayEnd = getDayEnd(dayName);
                  const isPastDate = isPastOrToday(date);
                  const formatHourLabel = (h: number) => {
                    const period = h >= 12 ? 'PM' : 'AM';
                    const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
                    return `${displayH}${period}`;
                  };

                  return (
                    <div key={formatDate2(date)} className={`legacy-header-cell ${isPastDate ? 'unavailable' : isWorking ? 'working' : 'off'}`}>
                      <div className="legacy-day-abbr">{isPastDate ? 'Closed' : dayName}</div>
                      <div className="legacy-day-num">{date.getDate()}</div>
                      <div className="legacy-day-hours">
                        {isPastDate ? 'Cannot Book' : isWorking ? `${formatHourLabel(dayStart)}–${formatHourLabel(dayEnd)}` : 'Off'}
                      </div>
                    </div>
                  );
                })}

                {/* Time Rows */}
                {HOURS.map((hour, hourIdx) => {
                  const isRelevantHour = weekDays.some((date) => {
                    const dayName = getDayName(date);
                    return isTherapistWorking(dayName) && hour >= getDayStart(dayName) && hour < getDayEnd(dayName);
                  });

                  if (!isRelevantHour) {
                    return null;
                  }

                  return (
                    <React.Fragment key={hour}>
                      {/* Time Label */}
                      <div className="legacy-time-label">{HOUR_LABELS[hourIdx]}</div>

                      {/* Room Slots for each day */}
                      {weekDays.map((date) => {
                        const dayName = getDayName(date);
                        const dateStr = formatDate2(date);
                        const isWorking = isTherapistWorking(dayName);
                        const isInWorkingHours =
                          isWorking && hour >= getDayStart(dayName) && hour < getDayEnd(dayName);
                        const isSelected = selectedDate === dateStr && selectedTime === hour;
                        const isPastDate = isPastOrToday(date);

                        if (!isInWorkingHours || isPastDate) {
                          return (
                            <div key={`${dateStr}-${hour}`} className="legacy-slot-cell unavailable">
                              {clinicRooms.map((room) => (
                                <div key={room.id} className="legacy-room-btn disabled">—</div>
                              ))}
                            </div>
                          );
                        }

                        return (
                          <div key={`${dateStr}-${hour}`} className="legacy-slot-cell">
                            {clinicRooms.map((room) => (
                              <button
                                key={room.id}
                                type="button"
                                className={`legacy-room-btn ${isSelected && selectedRoom?.id === room.id ? 'selected' : 'free'}`}
                                onClick={() => handleSlotClick(dateStr, hour, room.room_name)}
                                title={room.room_name}
                              >
                                {room.room_name.charAt(0).toUpperCase()}
                              </button>
                            ))}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* Summary Panel */}
            {selectedDate && selectedTime !== null && selectedRoom && (
              <div className="legacy-summary-panel">
                <h3>Reschedule Summary</h3>
                <div className="legacy-summary-grid">
                  <div>
                    <span>Client:</span>
                    <strong>{clientName}</strong>
                  </div>
                  <div>
                    <span>Therapist:</span>
                    <strong>{therapistName}</strong>
                  </div>
                  <div>
                    <span>New Date:</span>
                    <strong>{(() => {
                      const [year, month, day] = selectedDate.split('-');
                      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
                    })()}</strong>
                  </div>
                  <div>
                    <span>New Time:</span>
                    <strong>{HOUR_LABELS[HOURS.indexOf(selectedTime)]}</strong>
                  </div>
                  <div>
                    <span>Room:</span>
                    <strong>{selectedRoom?.room_name}</strong>
                  </div>
                  <div>
                    <span>Duration:</span>
                    <strong>60 minutes</strong>
                  </div>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="modal-btn modal-btn--secondary"
                onClick={() => {
                  setAction(null);
                  setError(null);
                }}
                disabled={loading}
              >
                Back
              </button>
              <button
                type="button"
                className="modal-btn modal-btn--primary"
                onClick={handleReschedule}
                disabled={!selectedDate || selectedTime === null || !selectedRoom || loading}
              >
                {loading ? 'Rescheduling...' : 'Confirm Reschedule'}
              </button>
            </div>
          </>
        ) : (
          <>
            <p style={{ marginBottom: '1rem', color: '#666', fontWeight: '500' }}>
              Cancellation reason (required):
            </p>

            <div className="modal-form-group">
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="modal-input"
                placeholder="Why is this session being cancelled?"
                style={{ minHeight: '80px', fontFamily: 'inherit' }}
                disabled={loading}
              />
            </div>

            <p style={{ marginBottom: '1rem', color: '#666', fontWeight: '500' }}>
              How to handle payment:
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1rem',
              }}
            >
              {/* Keep Payment */}
              <button
                onClick={() => setRefundSelection('keep')}
                style={{
                  padding: '1rem',
                  border: refundSelection === 'keep' ? '2px solid #4a6741' : '2px solid #ddd',
                  borderRadius: '8px',
                  background: refundSelection === 'keep' ? '#f0fdf4' : '#fff',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: '600', color: '#333', marginBottom: '0.5rem' }}>
                  Keep Payment
                </div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>
                  {paymentAmount || 2000} EGP retained
                </div>
                <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem' }}>
                  Client can rebook anytime
                </div>
              </button>

              {/* Refund Payment */}
              <button
                onClick={() => setRefundSelection('refund')}
                style={{
                  padding: '1rem',
                  border: refundSelection === 'refund' ? '2px solid #1e6ba8' : '2px solid #ddd',
                  borderRadius: '8px',
                  background: refundSelection === 'refund' ? '#f0f9ff' : '#fff',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: '600', color: '#333', marginBottom: '0.5rem' }}>
                  Issue Refund
                </div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>
                  Payment refunded to client
                </div>
                <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem' }}>
                  Client will need to repay for rebook
                </div>
              </button>
            </div>

            <div
              style={{
                padding: '1rem',
                background: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '6px',
                marginBottom: '1rem',
                fontSize: '0.875rem',
              }}
            >
              <strong>⚠️ Important:</strong> Once cancelled, client status will revert to{' '}
              <strong>ready_for_booking</strong>. They will need to rebook and handle payment accordingly.
            </div>

            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'flex-end',
              }}
            >
              <button
                type="button"
                className="modal-btn modal-btn--secondary"
                onClick={() => {
                  setAction(null);
                  setError(null);
                }}
                disabled={loading}
              >
                Back
              </button>
              <button
                type="button"
                className="modal-btn modal-btn--primary"
                onClick={handleCancel}
                disabled={loading || !cancelReason.trim()}
                style={{ background: '#c75c5c' }}
              >
                {loading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
