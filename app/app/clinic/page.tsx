import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SWT Psychology — Clinic Management',
};

export default function ClinicPage() {
  return (
    <div style={{ height: '100vh', width: '100%', margin: 0, padding: 0, overflow: 'hidden' }}>
      <iframe
        src="/clinic.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          margin: 0,
          padding: 0,
        }}
        title="Clinic Management System"
      />
    </div>
  );
}
