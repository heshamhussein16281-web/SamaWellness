'use client';

import React from 'react';

interface TopbarProps {
  title?: string;
  subtitle?: string;
}

export default function Topbar({ title = 'Dashboard', subtitle }: TopbarProps) {
  const handleToggle = () => {
    window.location.href = '/app';
  };

  return (
    <div className="dashboard-topbar">
      <div className="topbar-left">
        <div className="topbar-title">{title}</div>
        {subtitle && <div className="topbar-subtitle">{subtitle}</div>}
      </div>

      <button className="topbar-toggle-button" onClick={handleToggle}>
        Try Legacy Dashboard
      </button>
    </div>
  );
}
