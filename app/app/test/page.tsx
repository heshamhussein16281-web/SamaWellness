'use client';

import AppSidebar from '@/components/AppSidebar';

export default function TestPage() {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <AppSidebar />
      <main style={{ flex: 1, marginLeft: '280px', overflow: 'auto', padding: '40px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', marginBottom: '20px' }}>
          Logout Button Test
        </h1>
        <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.6', maxWidth: '600px' }}>
          Click the logout button in the sidebar to see the double confirmation dialog in action.
          You can:
        </p>
        <ul style={{ fontSize: '16px', color: '#666', lineHeight: '1.8', maxWidth: '600px' }}>
          <li>Click <strong>Logout</strong> to confirm and logout</li>
          <li>Click <strong>Cancel</strong> to dismiss the dialog</li>
          <li>Click the <strong>X</strong> button to close the dialog</li>
          <li>Click <strong>outside the dialog</strong> (on the overlay) to close it</li>
        </ul>
        <div style={{ marginTop: '40px', padding: '20px', background: '#f5f2ee', borderRadius: '8px', maxWidth: '600px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 10px 0', color: '#555' }}>
            Features Implemented:
          </h3>
          <ul style={{ fontSize: '14px', color: '#666', lineHeight: '1.8', margin: 0, paddingLeft: '20px' }}>
            <li>Prominent burgundy gradient logout button</li>
            <li>Double confirmation dialog with backdrop overlay</li>
            <li>Smooth animations and transitions</li>
            <li>Multiple ways to cancel the logout</li>
            <li>Professional UI matching clinic dashboard</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
