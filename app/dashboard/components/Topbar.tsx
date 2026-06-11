'use client';

import React from 'react';
import Link from 'next/link';

interface TopbarProps {
  title?: string;
  subtitle?: string;
}

export default function Topbar({ title = 'Dashboard', subtitle }: TopbarProps) {
  const topbarStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid rgb(234, 228, 221)',
    padding: '0 20px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  };

  const leftStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: '600',
    color: 'rgb(45, 74, 70)',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#2c2c2c',
    opacity: 0.7,
  };

  const toggleButtonStyle: React.CSSProperties = {
    padding: '8px 14px',
    border: '2px solid #7b2d3e',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    color: 'rgb(45, 74, 70)',
    fontSize: '10px',
    fontWeight: '600',
    cursor: 'pointer',
    textTransform: 'uppercase',
    transition: 'all 0.2s ease',
  };

  const handleToggle = () => {
    window.location.href = '/app';
  };

  return (
    <div style={topbarStyle}>
      <div style={leftStyle}>
        <div style={titleStyle}>{title}</div>
        {subtitle && <div style={subtitleStyle}>{subtitle}</div>}
      </div>

      <button style={toggleButtonStyle} onClick={handleToggle}>
        Try Legacy Dashboard
      </button>
    </div>
  );
}
