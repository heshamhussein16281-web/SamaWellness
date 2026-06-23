'use client';

import React from 'react';
import './skeleton-loader.css';

export function HeaderSkeleton() {
  return (
    <div className="skeleton-header">
      <div className="skeleton-line skeleton-title"></div>
      <div className="skeleton-badges">
        <div className="skeleton-badge"></div>
        <div className="skeleton-badge"></div>
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="skeleton-stats">
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton-stat">
          <div className="skeleton-line skeleton-label"></div>
          <div className="skeleton-line skeleton-value"></div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton() {
  return (
    <div className="skeleton-table">
      <div className="skeleton-table-header">
        <div className="skeleton-line skeleton-cell"></div>
        <div className="skeleton-line skeleton-cell"></div>
        <div className="skeleton-line skeleton-cell"></div>
        <div className="skeleton-line skeleton-cell"></div>
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="skeleton-table-row">
          <div className="skeleton-line skeleton-cell"></div>
          <div className="skeleton-line skeleton-cell"></div>
          <div className="skeleton-line skeleton-cell"></div>
          <div className="skeleton-line skeleton-cell"></div>
        </div>
      ))}
    </div>
  );
}

export function TabSkeleton() {
  return (
    <div className="skeleton-tab">
      <TableSkeleton />
    </div>
  );
}
