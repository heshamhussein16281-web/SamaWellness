'use client';

import React, { useEffect, useState } from 'react';

interface TopbarProps {
  title?: string;
  subtitle?: string;
}

interface UserData {
  role: string;
  username?: string;
}

export default function Topbar({ title = 'Dashboard', subtitle }: TopbarProps) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/verify', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleToggle = () => {
    window.location.href = '/app';
  };

  const roleLabel = loading ? 'Loading...' : user?.role || 'Guest';

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
