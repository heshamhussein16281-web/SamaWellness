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
      // Logout any existing session first
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('Login failed:', data);
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      console.log('Login successful, redirecting...');
      // Store user info for clinic app
      localStorage.setItem('userRole', data.user.role);
      sessionStorage.setItem('username', username);
      localStorage.setItem('username', username);
      setLoading(false);
      router.push('/app');
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Error: ' + (err.message || 'Unknown error'));
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

        {error && (
          <div style={{ background: '#fee', color: '#c33', padding: '12px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px', border: '1px solid #fcc' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 500, color: '#2d4a46' }}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontSize: '14px' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 500, color: '#2d4a46' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', fontSize: '14px' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '12px', background: '#7b2d3e', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
