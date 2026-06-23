'use client';

import React from 'react';
import { useAuth } from '../context/AuthContext';

interface TopbarProps {
  title?: string;
  subtitle?: string;
}

export default function Topbar({ title = 'Dashboard', subtitle }: TopbarProps) {
  const { user, loading } = useAuth();

  const handleToggle = () => {
    window.location.href = '/app';
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
      </div>
    </div>
  );
}
