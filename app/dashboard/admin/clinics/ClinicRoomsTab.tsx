'use client';

import { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

interface ClinicRoomsTabProps {
  numberOfRooms: number | null | undefined;
  rooms?: string[] | null;
  onChange: (numberOfRooms: number | null, rooms?: string[]) => void;
}

export default function ClinicRoomsTab({ numberOfRooms, rooms = [], onChange }: ClinicRoomsTabProps) {
  const [roomNames, setRoomNames] = useState<string[]>(rooms || []);

  useEffect(() => {
    setRoomNames(rooms || []);
  }, [rooms]);

  const handleAddRoom = () => {
    const newRooms = [...roomNames, ''];
    setRoomNames(newRooms);
    onChange(numberOfRooms || null, newRooms);
  };

  const handleRemoveRoom = (index: number) => {
    const newRooms = roomNames.filter((_, i) => i !== index);
    setRoomNames(newRooms);
    onChange(numberOfRooms || null, newRooms);
  };

  const handleRoomNameChange = (index: number, value: string) => {
    const newRooms = [...roomNames];
    newRooms[index] = value;
    setRoomNames(newRooms);
    onChange(numberOfRooms || null, newRooms);
  };

  return (
    <div className="clinics-form-group">
      <label>Total Number of Rooms</label>
      <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.75rem' }}>
        How many therapy rooms does this clinic have?
      </p>
      <input
        type="number"
        min="1"
        value={numberOfRooms || ''}
        onChange={(e) => {
          const value = e.target.value ? parseInt(e.target.value, 10) : null;
          onChange(value, roomNames);
        }}
        placeholder="e.g., 5"
        style={{ width: '120px', marginBottom: '20px' }}
      />

      <label style={{ marginTop: '20px', display: 'block', marginBottom: '10px' }}>Room Names</label>
      <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '15px' }}>
        Enter the name for each room (e.g., "Room A", "Consultation Room", etc.)
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
        {roomNames.map((roomName, index) => (
          <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              value={roomName}
              onChange={(e) => handleRoomNameChange(index, e.target.value)}
              placeholder={`Room ${index + 1}`}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            />
            <button
              onClick={() => handleRemoveRoom(index)}
              type="button"
              style={{
                padding: '8px',
                background: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Remove room"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={handleAddRoom}
        type="button"
        style={{
          padding: '8px 16px',
          background: '#4caf50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '14px',
          fontWeight: '500',
        }}
      >
        <Plus size={16} /> Add Room
      </button>
    </div>
  );
}
