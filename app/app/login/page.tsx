'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      router.push('/app');
    } catch (err: any) {
      setError('Error: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F2EE', padding: '20px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '8px', width: '100%', maxWidth: '360px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img src="/logo.png" alt="Logo" style={{ width: '175px', height: '175px' }} />
        </div>

        <h1 style={{ fontSize: '24px', textAlign: 'center', margin: '0 0 10px 0', color: '#2d4a46' }}>Sama Wellness</h1>
        <p style={{ textAlign: 'center', color: '#999', margin: '0 0 30px 0', fontSize: '14px' }}>Clinic Management</p>

        {error && <div style={{ background: '#fee', color: '#c33', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 500, color: '#2d4a46' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="reception"
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 500, color: '#2d4a46' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '12px', background: '#7b2d3e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #ddd', fontSize: '12px', color: '#999' }}>
          Demo: reception / 1234
        </p>
      </div>
    </div>
  );
}
