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

  // When numberOfRooms changes, adjust roomNames array to match
  useEffect(() => {
    if (numberOfRooms && numberOfRooms > 0) {
      const newRoomNames = [...roomNames];
      // Add empty slots if we don't have enough
      while (newRoomNames.length < numberOfRooms) {
        newRoomNames.push('');
      }
      // Remove extra slots if we have too many
      while (newRoomNames.length > numberOfRooms) {
        newRoomNames.pop();
      }
      setRoomNames(newRoomNames);
      onChange(numberOfRooms, newRoomNames);
    }
  }, [numberOfRooms]);

  // Sync with initial rooms data when editing
  useEffect(() => {
    if (rooms && rooms.length > 0) {
      setRoomNames(rooms);
    }
  }, [rooms]);

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

      {numberOfRooms && numberOfRooms > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
          {roomNames.map((roomName, index) => (
            <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ minWidth: '80px', fontWeight: '500', color: '#666' }}>
                Room {index + 1}
              </span>
              <input
                type="text"
                value={roomName}
                onChange={(e) => handleRoomNameChange(index, e.target.value)}
                placeholder={`Enter name for room ${index + 1}`}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px', color: '#666', fontSize: '14px' }}>
          Please enter the number of rooms first
        </div>
      )}
    </div>
  );
}
