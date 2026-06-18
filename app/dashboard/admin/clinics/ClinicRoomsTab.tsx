'use client';

import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

interface ClinicRoomsTabProps {
  rooms?: string[] | null;
  onChange: (rooms: string[]) => void;
}

export default function ClinicRoomsTab({ rooms = [], onChange }: ClinicRoomsTabProps) {
  const [roomNames, setRoomNames] = useState<string[]>(rooms || []);

  // Sync with initial rooms data when editing
  useEffect(() => {
    if (rooms && rooms.length > 0) {
      setRoomNames(rooms);
    }
  }, [rooms]);

  const handleAddRoom = () => {
    const newRooms = [...roomNames, ''];
    setRoomNames(newRooms);
    onChange(newRooms);
  };

  const handleRemoveRoom = (index: number) => {
    const newRooms = roomNames.filter((_, i) => i !== index);
    setRoomNames(newRooms);
    onChange(newRooms);
  };

  const handleRoomNameChange = (index: number, value: string) => {
    const newRooms = [...roomNames];
    newRooms[index] = value;
    setRoomNames(newRooms);
    onChange(newRooms);
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h3 className="clinics-form-section__title">Clinic Rooms</h3>
        <p style={{ fontSize: '0.875rem', color: '#8b7f75', marginBottom: '16px' }}>
          Add the names of therapy rooms available at this clinic (e.g., "Consultation Room", "Private Session Room", etc.)
        </p>
      </div>

      {roomNames.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          {roomNames.map((roomName, index) => (
            <div key={index} className="clinics-room-input-wrapper">
              <span className="clinics-room-number">Room {index + 1}</span>
              <input
                type="text"
                value={roomName}
                onChange={(e) => handleRoomNameChange(index, e.target.value)}
                placeholder={`Enter name for room ${index + 1}`}
                className="clinics-room-input"
              />
              <button
                onClick={() => handleRemoveRoom(index)}
                type="button"
                className="clinics-room-delete-btn"
                title="Remove this room"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <button
        onClick={handleAddRoom}
        type="button"
        className="clinics-add-room-btn"
      >
        <Plus size={18} /> Add Room
      </button>
    </div>
  );
}
