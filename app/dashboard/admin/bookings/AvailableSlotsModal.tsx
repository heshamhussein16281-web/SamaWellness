'use client';

import React, { useEffect, useState, useCallback } from 'react';
import './available-slots.css';

interface AvailableSlot {
  start_time: string;
  end_time: string;
  room_id: string;
  room_name: string;
  available: boolean;
  cost: number;
  reason?: string;
}

interface SelectedSlot {
  start_time: string;
  end_time: string;
  room_id: string;
  room_name: string;
  cost: number;
}

interface AvailableSlotsModalProps {
  isOpen: boolean;
  therapistId?: string;
  clinicId?: string;
  onClose: () => void;
  onSelectSlot: (slot: SelectedSlot) => void;
  initialDate?: string;
  initialSessionType?: 'single' | 'group' | 'couple';
  initialDuration?: number;
}

export default function AvailableSlotsModal({
  isOpen,
  therapistId = '',
  clinicId = '',
  onClose,
  onSelectSlot,
  initialDate = '',
  initialSessionType = 'single',
  initialDuration = 60,
}: AvailableSlotsModalProps) {
  const [therapist, setTherapist] = useState(therapistId);
  const [clinic, setClinic] = useState(clinicId);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [sessionType, setSessionType] = useState<'single' | 'group' | 'couple'>(
    initialSessionType
  );
  const [duration, setDuration] = useState(initialDuration);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = useCallback(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }, []);

  // Get min date (today) and max date (7 days from today)
  const getDateRange = useCallback(() => {
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];
    const maxDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    return { minDate, maxDate };
  }, []);

  // Fetch available slots
  const fetchAvailableSlots = useCallback(async () => {
    if (!therapist || !clinic || !selectedDate || !sessionType) {
      setError('Please fill in all filter fields');
      return;
    }

    setLoading(true);
    setError('');
    setSlots([]);
    setSelectedSlot(null);

    try {
      const params = new URLSearchParams({
        therapist_id: therapist,
        clinic_id: clinic,
        date: selectedDate,
        session_type: sessionType,
        duration_minutes: duration.toString(),
      });

      const response = await fetch(
        `/api/admin/bookings/available-slots?${params.toString()}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch available slots');
      }

      const data = await response.json();
      setSlots(data.data || []);

      if (!data.data || data.data.length === 0) {
        setError('No available slots found for the selected criteria');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      console.error('Error fetching slots:', err);
    } finally {
      setLoading(false);
    }
  }, [therapist, clinic, selectedDate, sessionType, duration]);

  // Initialize date on mount
  useEffect(() => {
    if (!initialDate) {
      setSelectedDate(getTodayDate());
    }
  }, [initialDate, getTodayDate]);

  // Auto-fetch when filters change
  useEffect(() => {
    if (isOpen && therapist && clinic && selectedDate) {
      fetchAvailableSlots();
    }
  }, [isOpen, therapist, clinic, selectedDate, sessionType, duration, fetchAvailableSlots]);

  // Handle slot click
  const handleSlotClick = (slot: AvailableSlot) => {
    if (!slot.available) return;
    setSelectedSlot({
      start_time: slot.start_time,
      end_time: slot.end_time,
      room_id: slot.room_id,
      room_name: slot.room_name,
      cost: slot.cost,
    });
  };

  // Handle slot selection confirmation
  const handleSelectSlot = () => {
    if (selectedSlot) {
      onSelectSlot(selectedSlot);
      handleClose();
    }
  };

  // Handle modal close
  const handleClose = () => {
    setSelectedSlot(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  const { minDate, maxDate } = getDateRange();

  // Group slots by room for display
  const slotsByRoom = slots.reduce(
    (acc, slot) => {
      if (!acc[slot.room_id]) {
        acc[slot.room_id] = [];
      }
      acc[slot.room_id].push(slot);
      return acc;
    },
    {} as Record<string, AvailableSlot[]>
  );

  return (
    <div className="slots-modal-overlay" onClick={handleClose}>
      <div className="slots-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="slots-modal-header">
          <h2 className="slots-modal-title">Select Appointment Date & Time</h2>
          <button
            className="slots-modal-close"
            onClick={handleClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Modal Content */}
        <div className="slots-modal-content">
          {/* Filters Section */}
          <div className="slots-filters-section">
            <div className="slots-filter-group">
              <label className="slots-filter-label">Therapist ID</label>
              <input
                type="text"
                className="slots-filter-input"
                value={therapist}
                onChange={(e) => setTherapist(e.target.value)}
                placeholder="Enter therapist ID"
              />
            </div>

            <div className="slots-filter-group">
              <label className="slots-filter-label">Clinic ID</label>
              <input
                type="text"
                className="slots-filter-input"
                value={clinic}
                onChange={(e) => setClinic(e.target.value)}
                placeholder="Enter clinic ID"
              />
            </div>

            <div className="slots-filter-group">
              <label className="slots-filter-label">Date</label>
              <input
                type="date"
                className="slots-filter-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={minDate}
                max={maxDate}
              />
            </div>

            <div className="slots-filter-group">
              <label className="slots-filter-label">Session Type</label>
              <div className="slots-session-type-options">
                {(['single', 'group', 'couple'] as const).map((type) => (
                  <label key={type} className="slots-radio-option">
                    <input
                      type="radio"
                      name="sessionType"
                      value={type}
                      checked={sessionType === type}
                      onChange={(e) => setSessionType(e.target.value as typeof sessionType)}
                    />
                    <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="slots-filter-group">
              <label className="slots-filter-label">Duration (minutes)</label>
              <select
                className="slots-filter-select"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
              >
                {[15, 30, 60, 90, 120].map((min) => (
                  <option key={min} value={min}>
                    {min} minutes
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error Message */}
          {error && !loading && (
            <div className="slots-error-message">
              <span className="slots-error-icon">!</span>
              {error}
            </div>
          )}

          {/* Available Times Summary */}
          {!loading && slots.length > 0 && (
            <div className="slots-summary-message">
              <span className="slots-summary-icon">✓</span>
              <span>
                Free slots available:{' '}
                {slots
                  .filter((s) => s.available)
                  .slice(0, 5)
                  .map((s) => s.start_time)
                  .join(', ')}
                {slots.filter((s) => s.available).length > 5 && ' ...'}
              </span>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="slots-loading-state">
              <div className="slots-spinner"></div>
              <p>Loading available slots...</p>
            </div>
          )}

          {/* Slots Grid */}
          {!loading && slots.length > 0 && (
            <div className="slots-container">
              <h3 className="slots-grid-title">Available Slots</h3>
              {Object.entries(slotsByRoom).map(([roomId, roomSlots]) => (
                <div key={roomId} className="slots-room-group">
                  <div className="slots-room-name">
                    {roomSlots[0].room_name || `Room ${roomId}`}
                  </div>
                  <div className="slots-grid">
                    {roomSlots.map((slot, index) => (
                      <button
                        key={`${roomId}-${index}`}
                        className={`slots-slot-button ${
                          !slot.available ? 'disabled' : ''
                        } ${
                          selectedSlot?.start_time === slot.start_time &&
                          selectedSlot?.room_id === slot.room_id
                            ? 'selected'
                            : ''
                        }`}
                        onClick={() => handleSlotClick(slot)}
                        disabled={!slot.available}
                        title={slot.reason || 'Available'}
                      >
                        <div className="slots-time">{slot.start_time}</div>
                        <div className="slots-cost">EGP {slot.cost}</div>
                        {!slot.available && (
                          <div className="slots-reason">{slot.reason}</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Slots Message */}
          {!loading && slots.length === 0 && !error && (
            <div className="slots-empty-state">
              <p>No slots available for the selected criteria</p>
            </div>
          )}

          {/* Cost Breakdown Section */}
          {selectedSlot && (
            <div className="slots-cost-breakdown">
              <h3 className="slots-cost-title">Cost Breakdown</h3>
              <div className="slots-cost-row">
                <span className="slots-cost-label">Session Cost:</span>
                <span className="slots-cost-value">{selectedSlot.cost} EGP</span>
              </div>
              <div className="slots-cost-row highlighted">
                <span className="slots-cost-label">Selected Slot:</span>
                <span className="slots-cost-value">
                  {selectedSlot.start_time} - {selectedSlot.end_time} at{' '}
                  {selectedSlot.room_name}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="slots-modal-footer">
          <button className="slots-button cancel" onClick={handleClose}>
            Cancel
          </button>
          <button
            className="slots-button primary"
            onClick={handleSelectSlot}
            disabled={!selectedSlot || loading}
          >
            {loading ? 'Loading...' : 'Select Slot'}
          </button>
        </div>
      </div>
    </div>
  );
}
