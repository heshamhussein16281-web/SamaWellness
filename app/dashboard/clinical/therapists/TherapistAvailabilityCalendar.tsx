'use client';

interface AvailabilityDay {
  day: string; // Mon, Tue, etc.
  status: 'working' | 'off' | 'vacation';
}

interface TherapistAvailabilityCalendarProps {
  days: AvailabilityDay[];
  clinicName?: string;
}

const DAY_ABBREVIATIONS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function TherapistAvailabilityCalendar({ days, clinicName }: TherapistAvailabilityCalendarProps) {
  const dayOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Create a map of day -> status
  const statusMap = new Map(days.map(d => [d.day, d.status]));

  // Get status for each day of week
  const statuses = dayOfWeek.map(day => statusMap.get(day) || 'off');

  return (
    <div style={{ marginTop: '0.75rem' }}>
      {clinicName && (
        <p style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Availability at {clinicName}:
        </p>
      )}
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {DAY_ABBREVIATIONS.map((abbr, idx) => {
          const status = statuses[idx];
          const isWorking = status === 'working';
          const bgColor = isWorking ? '#4CAF50' : '#f0f0f0';
          const textColor = isWorking ? 'white' : '#999';
          const borderStyle = isWorking ? 'none' : '1px solid #ddd';

          return (
            <div
              key={abbr}
              style={{
                display: 'inline-block',
                width: '2rem',
                height: '2rem',
                backgroundColor: bgColor,
                borderRadius: '4px',
                textAlign: 'center',
                lineHeight: '2rem',
                fontSize: '0.7rem',
                color: textColor,
                fontWeight: 'bold',
                border: borderStyle,
              }}
              title={`${dayOfWeek[idx]}: ${status}`}
            >
              {abbr}
            </div>
          );
        })}
      </div>
    </div>
  );
}
