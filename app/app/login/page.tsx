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
    <div className="login-wrapper">
      <div className="login-box">
        <div className="logo-section">
          <img src="/logo.png" alt="Sama Wellness" className="logo" />
        </div>

        <h1 className="title">Sama Wellness Therapy</h1>
        <p className="subtitle">Clinic Management</p>

        <form onSubmit={handleSubmit} className="form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="reception"
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              required
            />
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="help-text">
          <p>Demo: reception / 1234</p>
        </div>
      </div>

      <style jsx>{`
        .login-wrapper {
          width: 100%;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--color-linen) 0%, #f0ebe4 100%);
          padding: 20px;
        }

        .login-box {
          background: white;
          width: 100%;
          max-width: 360px;
          padding: 40px 30px;
          border-radius: 10px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid var(--color-sand);
        }

        .logo-section {
          text-align: center;
          margin-bottom: 20px;
        }

        .logo {
          width: 40px;
          height: 40px;
          object-fit: contain;
        }

        .title {
          font-family: var(--font-display);
          font-size: 22px;
          color: var(--color-nav-text);
          margin: 0 0 5px 0;
          text-align: center;
          font-weight: 600;
        }

        .subtitle {
          font-family: var(--font-body);
          font-size: 13px;
          color: #999;
          text-align: center;
          margin: 0 0 25px 0;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-group label {
          font-family: var(--font-body);
          font-size: 13px;
          font-weight: 500;
          color: var(--color-nav-text);
        }

        .form-group input {
          font-family: var(--font-body);
          font-size: 15px;
          padding: 10px 12px;
          border: 1px solid var(--color-sand);
          border-radius: 6px;
          color: #333;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--color-burgundy);
        }

        .form-group input:disabled {
          background: #f5f5f5;
          color: #999;
        }

        .form button {
          font-family: var(--font-ui);
          font-size: 15px;
          font-weight: 600;
          padding: 11px 20px;
          background: var(--color-burgundy);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: all 0.2s ease;
          margin-top: 10px;
        }

        .form button:hover:not(:disabled) {
          background: #6a2538;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(123, 45, 62, 0.3);
        }

        .form button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          background: #fee;
          border: 1px solid #fcc;
          color: #c33;
          padding: 10px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-family: var(--font-body);
        }

        .help-text {
          text-align: center;
          margin-top: 20px;
          padding-top: 15px;
          border-top: 1px solid var(--color-sand);
        }

        .help-text p {
          font-family: var(--font-body);
          font-size: 12px;
          color: #999;
          margin: 0;
        }

        @media (max-width: 480px) {
          .login-box {
            padding: 30px 20px;
          }

          .title {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  );
}
