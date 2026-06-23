'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface TopbarProps {
  title?: string;
  subtitle?: string;
}

export default function Topbar({ title = 'Dashboard', subtitle }: TopbarProps) {
  const { user, loading, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleToggle = () => {
    window.location.href = '/app';
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  const roleLabel = loading ? 'Loading...' : (user?.role || 'Guest');

  return (
    <div className="dashboard-topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{title}</h1>
        {subtitle && <span className="topbar-badge topbar-badge--secondary">{subtitle}</span>}
      </div>

      <div className="topbar-right">
        <span className="topbar-role-label">{roleLabel}</span>
        <button className="topbar-button topbar-button--secondary" onClick={handleToggle}>
          Try Legacy Dashboard
        </button>
        <button
          className="topbar-button topbar-button--danger"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </div>
  );
}
