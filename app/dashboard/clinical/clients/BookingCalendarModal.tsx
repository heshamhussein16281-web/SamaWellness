'use client';

import React, { useState, useEffect } from 'react';
import './modal.css';

interface TherapistSchedule {
  days: string[];
  schedule: Record<string, { start: number; end: number }>;
}

interface BookingCalendarModalProps {
  clientId: number;
  clientName: string;
  therapistId?: number;
  therapistName?: string;
  isRecurring: boolean;
  onSuccess: () => void;
  onClose: () => void;
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
  const [weekStart, setWeekStart] = useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [therapistSchedule, setTherapistSchedule] = useState<TherapistSchedule | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // Fetch therapist schedule
  useEffect(() => {
    if (!therapistId) {
      setLoadingSchedule(false);
      return;
    }

    const fetchSchedule = async () => {
      try {
        setScheduleError(null);
        console.log('Fetching schedule for therapist:', therapistId);
        const res = await fetch(`/api/admin/therapists/${therapistId}`, {
          credentials: 'include',
        });

        console.log('Schedule API response status:', res.status);

        if (res.ok) {
          const data = await res.json();
          console.log('Schedule data received:', data);
          const therapist = data.therapist;
          if (therapist && therapist.days && therapist.days.length > 0) {
            console.log('Setting therapist schedule:', therapist.days, therapist.schedule);
            setTherapistSchedule({
              days: therapist.days || [],
              schedule: therapist.schedule || {},
            });
          } else {
            console.warn('No schedule data in therapist object');
            setScheduleError('No schedule data found for this therapist');
          }
        } else {
          const errorData = await res.json().catch(() => ({}));
          console.error('Failed to fetch schedule:', res.status, errorData);
          setScheduleError(`Failed to load schedule (Status: ${res.status})`);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('Failed to fetch therapist schedule:', err);
        setScheduleError(`Error: ${message}`);
      } finally {
        setLoadingSchedule(false);
      }
    };

    fetchSchedule();
  }, [therapistId]);

  // Time slots (9am to 10pm) - full day view
  const HOUR_START = 9;
  const HOUR_END = 22; // 10 PM - shows full day range
  const HOURS = Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => HOUR_START + i);
  const HOUR_LABELS = HOURS.map((h) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${displayH} ${period}`;
  });

  // Helper functions for therapist schedule
  const getDayStart = (dayAbbr: string): number => {
    // If no schedule data, use default hours (9 AM)
    if (!therapistSchedule?.schedule) return HOUR_START;
    // Convert abbreviated day name (Mon) to full name (Monday) to match schedule format
    const fullDayName = matchDayInSchedule(dayAbbr);
    if (!therapistSchedule.schedule[fullDayName]) return HOUR_START;
    return therapistSchedule.schedule[fullDayName].start;
  };

  const getDayEnd = (dayAbbr: string): number => {
    // If no schedule data, use default hours (10 PM)
    if (!therapistSchedule?.schedule) return HOUR_END;
    // Convert abbreviated day name (Mon) to full name (Monday) to match schedule format
    const fullDayName = matchDayInSchedule(dayAbbr);
    if (!therapistSchedule.schedule[fullDayName]) return HOUR_END;
    return therapistSchedule.schedule[fullDayName].end;
  };

  const isTherapistWorking = (dayAbbr: string): boolean => {
    // If no schedule data, assume all days are working (fallback)
    if (!therapistSchedule || therapistSchedule.days.length === 0) {
      return true;
    }
    // Convert abbreviated day name (Mon) to full name (Monday) to match schedule format
    const fullDayName = matchDayInSchedule(dayAbbr);
    return therapistSchedule.days.includes(fullDayName);
  };

  // Get week days
  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const getDayName = (date: Date) => {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
  };

  const getFullDayName = (date: Date) => {
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
  };

  // Convert day name to match format in schedule (full name like "Monday" vs "Mon")
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

  const weekDays = getWeekDays();

  const handleSlotClick = async (date: string, hour: number, room: string) => {
    setError(null);
    setSelectedDate(date);
    setSelectedTime(hour);
    setSelectedRoom(room);
  };

  const handleSubmit = async () => {
    if (!selectedDate || selectedTime === null || !selectedRoom) {
      setError('Please select a date, time, and room');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          client_id: clientId,
          therapist_id: therapistId,
          session_date: `${selectedDate}T${String(selectedTime).padStart(2, '0')}:00:00`,
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
              Session scheduled for {clientName} on {selectedDate} at {HOUR_LABELS[HOURS.indexOf(selectedTime || 0)]} in {selectedRoom}.
              {isRecurring && <span> Payment due within 24 hours before the session.</span>}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content--xlarge" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Book Session - {clientName}</h2>
            <p className="modal-subtitle">{therapistName} • Select time slot</p>
          </div>
          <button className="modal-close-btn" onClick={onClose} type="button" aria-label="Close modal">
            ✕
          </button>
        </div>

        {error && <div className="modal-error">{error}</div>}

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
            {formatDate(weekDays[0])} – {formatDate(weekDays[6])}
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
            <span className="legacy-legend-box" style={{ background: '#FFF3CD', border: '1px solid #FFECB5' }}></span>
            Booked (Pending)
          </span>
          <span>
            <span className="legacy-legend-box" style={{ background: '#FCEBEB', border: '1px solid #F7C1C1' }}></span>
            Booked (Paid)
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

        {!loadingSchedule && !scheduleError && (!therapistSchedule || therapistSchedule.days.length === 0) && (
          <div className="therapist-schedule-info warning">
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#856404' }}>
              ℹ No specific schedule set. Showing default hours (9 AM – 5 PM).
              <br />
              <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Contact admin to set up therapist working schedule</span>
            </p>
          </div>
        )}

        {therapistSchedule && therapistSchedule.days.length > 0 && (
          <div className="therapist-schedule-info">
            <h4>Working Schedule</h4>
            <div className="schedule-grid">
              {therapistSchedule.days.map((day) => {
                const dayStart = getDayStart(day);
                const dayEnd = getDayEnd(day);
                const formatHour = (h: number) => {
                  const period = h >= 12 ? 'PM' : 'AM';
                  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
                  return `${displayH}${period}`;
                };
                return (
                  <div key={day} className="schedule-day">
                    <span className="day-name">{day}</span>
                    <span className="day-hours">{formatHour(dayStart)}–{formatHour(dayEnd)}</span>
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
              const formatHour = (h: number) => {
                const period = h >= 12 ? 'PM' : 'AM';
                const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
                return `${displayH}${period}`;
              };

              return (
                <div key={formatDate(date)} className={`legacy-header-cell ${isWorking ? 'working' : 'off'}`}>
                  <div className="legacy-day-abbr">{dayName}</div>
                  <div className="legacy-day-num">{date.getDate()}</div>
                  <div className="legacy-day-hours">
                    {isWorking ? `${formatHour(dayStart)}–${formatHour(dayEnd)}` : 'Off'}
                  </div>
                </div>
              );
            })}

            {/* Time Rows */}
            {HOURS.map((hour, hourIdx) => {
              // Check if this hour is in any of the therapist's working days
              const isRelevantHour = weekDays.some((date) => {
                const dayName = getDayName(date);
                return isTherapistWorking(dayName) && hour >= getDayStart(dayName) && hour < getDayEnd(dayName);
              });

              if (!isRelevantHour) {
                return null; // Skip hours outside working range
              }

              return (
                <React.Fragment key={hour}>
                  {/* Time Label */}
                  <div className="legacy-time-label">{HOUR_LABELS[hourIdx]}</div>

                  {/* Room Slots for each day */}
                  {weekDays.map((date) => {
                    const dayName = getDayName(date);
                    const dateStr = formatDate(date);
                    const isWorking = isTherapistWorking(dayName);
                    const isInWorkingHours =
                      isWorking && hour >= getDayStart(dayName) && hour < getDayEnd(dayName);
                    const isSelected = selectedDate === dateStr && selectedTime === hour;

                    if (!isInWorkingHours) {
                      return (
                        <div key={`${dateStr}-${hour}`} className="legacy-slot-cell unavailable">
                          <div className="legacy-room-btn disabled">—</div>
                          <div className="legacy-room-btn disabled">—</div>
                        </div>
                      );
                    }

                    return (
                      <div key={`${dateStr}-${hour}`} className="legacy-slot-cell">
                        <button
                          type="button"
                          className={`legacy-room-btn ${isSelected && selectedRoom === 'Room 1' ? 'selected' : 'free'}`}
                          onClick={() => handleSlotClick(dateStr, hour, 'Room 1')}
                        >
                          R1
                        </button>
                        <button
                          type="button"
                          className={`legacy-room-btn ${isSelected && selectedRoom === 'Room 2' ? 'selected' : 'free'}`}
                          onClick={() => handleSlotClick(dateStr, hour, 'Room 2')}
                        >
                          R2
                        </button>
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
            <h3>Booking Summary</h3>
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
                <span>Date:</span>
                <strong>{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</strong>
              </div>
              <div>
                <span>Time:</span>
                <strong>{HOUR_LABELS[HOURS.indexOf(selectedTime)]}</strong>
              </div>
              <div>
                <span>Room:</span>
                <strong>{selectedRoom}</strong>
              </div>
              <div>
                <span>Duration:</span>
                <strong>60 minutes</strong>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="modal-actions">
          <button type="button" className="modal-btn modal-btn--secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            type="button"
            className="modal-btn modal-btn--primary"
            onClick={handleSubmit}
            disabled={!selectedDate || selectedTime === null || !selectedRoom || submitting}
          >
            {submitting ? 'Booking...' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  );
}
