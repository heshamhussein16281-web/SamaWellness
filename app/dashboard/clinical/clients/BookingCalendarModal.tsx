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
  clinicId: number;
  onSuccess: () => void;
  onClose: () => void;
}

export default function BookingCalendarModal({
  clientId,
  clientName,
  therapistId,
  therapistName,
  isRecurring,
  clinicId,
  onSuccess,
  onClose,
}: BookingCalendarModalProps) {
  // Get today's date (normalized to midnight)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [weekStart, setWeekStart] = useState<Date>(() => {
    const todayDate = new Date();
    const day = todayDate.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday

    console.log('[Week Calc] Today:', {
      date: todayDate.toISOString().split('T')[0],
      dayOfWeek: day,
      dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]
    });

    // Calculate days back to Monday (if today is Monday, daysBack=0)
    const daysBack = day === 0 ? 6 : day - 1;
    console.log('[Week Calc] daysBack to Monday:', daysBack);

    // Get Monday of current week by subtracting days
    const monday = new Date(todayDate);
    const beforeSubtract = monday.getDate();
    monday.setDate(monday.getDate() - daysBack);
    console.log('[Week Calc] After subtract:', { before: beforeSubtract, after: monday.getDate(), result: monday.toISOString().split('T')[0] });

    monday.setHours(0, 0, 0, 0);

    // If Monday is today or in the past, move to next week's Monday
    if (monday <= today) {
      console.log('[Week Calc] Monday is in past, moving to next week');
      monday.setDate(monday.getDate() + 7);
      console.log('[Week Calc] After adding 7 days:', monday.toISOString().split('T')[0]);
    }

    console.log('[BookingCalendarModal] Initialized weekStart to:', monday.toISOString().split('T')[0]);
    return monday;
  });

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<{ id: number; room_name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [therapistSchedule, setTherapistSchedule] = useState<TherapistSchedule | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [clinicRooms, setClinicRooms] = useState<Array<{ id: number; room_name: string }>>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [clinicName, setClinicName] = useState<string | null>(null);

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

  // Fetch clinic rooms
  useEffect(() => {
    if (!clinicId) {
      setLoadingRooms(false);
      return;
    }

    const fetchRooms = async () => {
      try {
        setLoadingRooms(true);
        const res = await fetch(`/api/admin/clinics/${clinicId}`, {
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          // Store clinic name
          if (data.name) {
            setClinicName(data.name);
          }
          // Store clinic rooms
          if (data.clinic_rooms && Array.isArray(data.clinic_rooms)) {
            setClinicRooms(data.clinic_rooms);
            // Auto-select first room
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

    fetchRooms();
  }, [clinicId]);

  // Time slots (10am to 10pm) - full day view
  const HOUR_START = 10;
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

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isToday = (date: Date): boolean => {
    const dateNormalized = new Date(date);
    dateNormalized.setHours(0, 0, 0, 0);
    return dateNormalized.getTime() === today.getTime();
  };

  const isPastOrToday = (date: Date): boolean => {
    const dateNormalized = new Date(date);
    dateNormalized.setHours(0, 0, 0, 0);
    return dateNormalized.getTime() <= today.getTime();
  };

  const isFutureDate = (date: Date): boolean => {
    const dateNormalized = new Date(date);
    dateNormalized.setHours(0, 0, 0, 0);
    return dateNormalized.getTime() > today.getTime();
  };

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

  const handleSlotClick = async (date: string, hour: number, roomName: string) => {
    console.log('[BookingCalendarModal] Slot clicked - date string:', date);
    const dateParts = date.split('-');
    const clickedDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
    console.log('[BookingCalendarModal] Slot clicked - parsed as:', clickedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }));

    // Prevent same-day bookings
    if (isToday(new Date(date))) {
      setError('Bookings must be scheduled for the next day or later');
      return;
    }

    setError(null);
    setSelectedDate(date);
    console.log('[BookingCalendarModal] Set selectedDate to:', date);
    setSelectedTime(hour);
    // Find the room object by name
    const room = clinicRooms.find(r => r.room_name === roomName);
    if (room) {
      setSelectedRoom(room);
    }
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
          session_type: 'single',
          clinic_id: clinicId,
          room_id: selectedRoom?.id || null,
          notes: selectedRoom ? `Booked for ${selectedRoom.room_name}` : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        console.error('Booking creation error:', res.status, data);
        throw new Error(data.details || data.error || 'Failed to create booking');
      }

      console.log('[BookingCalendarModal] Booking created successfully, client status will be updated by API');

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
              Session scheduled for {clientName} on {selectedDate} at {HOUR_LABELS[HOURS.indexOf(selectedTime || 0)]} in {selectedRoom?.room_name || 'selected room'}.
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
            <p className="modal-subtitle">{clinicName} • {therapistName} • Select time slot</p>
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
              const isPastOrTodayDate = isPastOrToday(date);
              const isTodayDate = isToday(date);
              const formatHour = (h: number) => {
                const period = h >= 12 ? 'PM' : 'AM';
                const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
                return `${displayH}${period}`;
              };

              return (
                <div key={formatDate(date)} className={`legacy-header-cell ${isPastOrTodayDate ? 'unavailable' : isWorking ? 'working' : 'off'}`}>
                  <div className="legacy-day-abbr">{isTodayDate ? 'Today' : dayName}</div>
                  <div className="legacy-day-num">{date.getDate()}</div>
                  <div className="legacy-day-hours">
                    {isPastOrTodayDate ? 'Not Available' : isWorking ? `${formatHour(dayStart)}–${formatHour(dayEnd)}` : 'Off'}
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
                    const isPastOrTodayDate = isPastOrToday(date);

                    // Show as unavailable if not in working hours OR if it's today or in the past
                    if (!isInWorkingHours || isPastOrTodayDate) {
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
                <strong>{(() => {
                  console.log('[BookingCalendarModal] Summary - selectedDate string:', selectedDate);
                  const [year, month, day] = selectedDate.split('-');
                  console.log('[BookingCalendarModal] Summary - parsed components:', { year, month, day });
                  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                  console.log('[BookingCalendarModal] Summary - Date object:', date.toISOString());
                  const display = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
                  console.log('[BookingCalendarModal] Summary - display:', display);
                  return display;
                })()}</strong>
              </div>
              <div>
                <span>Time:</span>
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
