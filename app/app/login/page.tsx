'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setIsLoading(false);
        return;
      }

      router.push('/app');
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.logoBox}>
            <img src="/logo.png" alt="Logo" style={styles.logo} />
          </div>

          <h1 style={styles.title}>Sama Wellness Therapy</h1>
          <p style={styles.subtitle}>Clinic Management</p>

          <form onSubmit={handleSubmit} style={styles.form}>
            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.field}>
              <label style={styles.label}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="reception"
                disabled={isLoading}
                required
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                required
                style={styles.input}
              />
            </div>

            <button type="submit" disabled={isLoading} style={styles.button}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p style={styles.hint}>Demo: reception / 1234</p>
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    width: '100%',
    minHeight: '100vh',
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    background: 'linear-gradient(135deg, #F5F2EE 0%, #f0ebe4 100%)',
    padding: '20px',
    boxSizing: 'border-box' as const,
  },
  card: {
    background: 'white',
    width: '100%',
    maxWidth: '340px',
    padding: '40px 30px',
    borderRadius: '10px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
    border: '1px solid #EAEAE2',
  },
  logoBox: {
    textAlign: 'center' as const,
    marginBottom: '20px',
  },
  logo: {
    width: '35px',
    height: '35px',
    objectFit: 'contain' as const,
  },
  title: {
    fontFamily: 'Gilda Display, serif',
    fontSize: '20px',
    color: '#2d4a46',
    margin: '0 0 5px 0',
    textAlign: 'center' as const,
    fontWeight: 600,
  },
  subtitle: {
    fontFamily: 'Nunito Sans, sans-serif',
    fontSize: '13px',
    color: '#999',
    textAlign: 'center' as const,
    margin: '0 0 25px 0',
  },
  form: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: '15px',
  },
  field: {
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: '6px',
  },
  label: {
    fontFamily: 'Nunito Sans, sans-serif',
    fontSize: '13px',
    fontWeight: 500,
    color: '#2d4a46',
  },
  input: {
    fontFamily: 'Nunito Sans, sans-serif',
    fontSize: '15px',
    padding: '10px 12px',
    border: '1px solid #EAEAE2',
    borderRadius: '6px',
    color: '#333',
    boxSizing: 'border-box' as const,
  },
  button: {
    fontFamily: 'Josefin Sans, sans-serif',
    fontSize: '15px',
    fontWeight: 600,
    padding: '11px 20px',
    background: '#7b2d3e',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginTop: '10px',
  },
  error: {
    background: '#fee',
    border: '1px solid #fcc',
    color: '#c33',
    padding: '10px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontFamily: 'Nunito Sans, sans-serif',
  },
  hint: {
    textAlign: 'center' as const,
    marginTop: '20px',
    paddingTop: '15px',
    borderTop: '1px solid #EAEAE2',
    fontFamily: 'Nunito Sans, sans-serif',
    fontSize: '12px',
    color: '#999',
    margin: '20px 0 0 0',
  },
};
