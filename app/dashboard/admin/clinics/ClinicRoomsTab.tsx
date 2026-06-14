'use client';

interface ClinicRoomsTabProps {
  numberOfRooms: number | null | undefined;
  onChange: (value: number | null) => void;
}

export default function ClinicRoomsTab({ numberOfRooms, onChange }: ClinicRoomsTabProps) {
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
          onChange(value);
        }}
        placeholder="e.g., 5"
        style={{ width: '120px' }}
      />
    </div>
  );
}
