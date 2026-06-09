'use client';

import { useState } from 'react';

export default function AppDashboard() {
  const [user] = useState<any>(null);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: '#2d4a46', margin: '0 0 5px 0' }}>Dashboard</h1>
          <p style={{ color: '#999', margin: 0 }}>Clinic Management System</p>
        </div>
        <span style={{ background: '#7b2d3e', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
          RECEPTION
        </span>
      </div>

      <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '20px', color: '#2d4a46', marginBottom: '20px' }}>Welcome to Sama Wellness Therapy</h2>
        <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '20px' }}>
          You are logged in to the clinic management system. Use the menu on the left to navigate to different modules.
        </p>

        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '6px', border: '1px solid #ddd' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#2d4a46' }}>Available Features:</h3>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
            <li>👥 Manage clients and their information</li>
            <li>📅 Schedule and track therapy sessions</li>
            <li>💳 Record and manage payments</li>
            <li>📝 Track assessments and progress</li>
            <li>And more coming soon...</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
