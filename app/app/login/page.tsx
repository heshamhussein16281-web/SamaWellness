'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

      // Redirect to app dashboard on success
      router.push('/app');
    } catch (err) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Logo */}
        <div className="login-logo">
          <img src="/logo.png" alt="Sama Wellness Therapy" />
        </div>

        {/* Heading */}
        <h1 className="login-heading">Sama Wellness Therapy</h1>
        <p className="login-subheading">Clinic Management System</p>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Error Message */}
          {error && <div className="login-error">{error}</div>}

          {/* Username Field */}
          <div className="login-field">
            <label htmlFor="username" className="login-label">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="login-input"
              disabled={isLoading}
              autoComplete="username"
              required
            />
          </div>

          {/* Password Field */}
          <div className="login-field">
            <label htmlFor="password" className="login-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="login-input"
              disabled={isLoading}
              autoComplete="current-password"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Help Text */}
        <p className="login-help">
          For support, contact the clinic administration.
        </p>

        {/* Demo Credentials (for development only) */}
        <details className="login-demo">
          <summary>Demo Credentials (Development)</summary>
          <div className="login-demo-content">
            <p>
              <strong>Reception:</strong> reception / 1234
            </p>
            <p>
              <strong>Admin:</strong> admin / Sama202#
            </p>
          </div>
        </details>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--color-linen) 0%, #f0ebe4 100%);
          padding: var(--space-lg);
        }

        .login-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          padding: var(--space-xl);
          width: 100%;
          max-width: 380px;
          border: 1px solid var(--color-sand);
        }

        .login-logo {
          text-align: center;
          margin-bottom: var(--space-md);
        }

        .login-logo img {
          width: 50px;
          height: 50px;
          object-fit: contain;
        }

        .login-heading {
          font-family: var(--font-display);
          font-size: 28px;
          color: var(--color-nav-text);
          text-align: center;
          margin: 0 0 var(--space-xs) 0;
          font-weight: 600;
        }

        .login-subheading {
          font-family: var(--font-body);
          font-size: 14px;
          color: #888;
          text-align: center;
          margin: 0 0 var(--space-lg) 0;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .login-error {
          background: #fee;
          border: 1px solid #fcc;
          color: #c33;
          padding: var(--space-sm);
          border-radius: 6px;
          font-size: 14px;
          font-family: var(--font-body);
        }

        .login-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .login-label {
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 500;
          color: var(--color-nav-text);
        }

        .login-input {
          font-family: var(--font-body);
          font-size: 16px;
          padding: 10px 12px;
          border: 1px solid var(--color-sand);
          border-radius: 6px;
          color: var(--color-charcoal);
          transition: all 0.2s ease;
        }

        .login-input:focus {
          outline: none;
          border-color: var(--color-burgundy);
          box-shadow: 0 0 0 3px rgba(123, 45, 62, 0.1);
        }

        .login-input:disabled {
          background: #f5f5f5;
          color: #999;
          cursor: not-allowed;
        }

        .login-button {
          font-family: var(--font-ui);
          font-size: 16px;
          font-weight: 600;
          padding: 12px 20px;
          background: var(--color-burgundy);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .login-button:hover:not(:disabled) {
          background: #6a2538;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(123, 45, 62, 0.3);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-help {
          font-family: var(--font-body);
          font-size: 12px;
          color: #999;
          text-align: center;
          margin-top: var(--space-md);
        }

        .login-demo {
          margin-top: var(--space-lg);
          padding-top: var(--space-lg);
          border-top: 1px solid var(--color-sand);
        }

        .login-demo summary {
          font-family: var(--font-body);
          font-size: 13px;
          color: #666;
          cursor: pointer;
          user-select: none;
        }

        .login-demo-content {
          margin-top: var(--space-sm);
          padding: var(--space-sm);
          background: #f9f9f9;
          border-radius: 4px;
          font-family: monospace;
          font-size: 12px;
          color: #333;
        }

        .login-demo-content p {
          margin: 4px 0;
        }

        @media (max-width: 480px) {
          .login-container {
            padding: var(--space-lg);
          }

          .login-heading {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
}
