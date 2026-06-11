'use client';

import React, { useState } from 'react';
import './audit-logs.css';

interface FilterState {
  adminId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}

interface AuditLogsFilterProps {
  admins: Array<{ id: string; username: string }>;
  onFilterChange: (filters: FilterState) => void;
}

export default function AuditLogsFilter({
  admins,
  onFilterChange,
}: AuditLogsFilterProps) {
  const [filters, setFilters] = useState<FilterState>({});

  const handleChange = (key: keyof FilterState, value: string) => {
    const updated = { ...filters, [key]: value || undefined };
    setFilters(updated);
  };

  const handleClear = () => {
    setFilters({});
    onFilterChange({});
  };

  const handleApply = () => {
    onFilterChange(filters);
  };

  return (
    <div className="audit-filters">
      <div className="audit-filter-group">
        <label htmlFor="admin-filter">Admin:</label>
        <select
          id="admin-filter"
          className="audit-filter-select"
          value={filters.adminId || ''}
          onChange={(e) => handleChange('adminId', e.target.value)}
        >
          <option value="">All Admins</option>
          {admins.map((admin) => (
            <option key={admin.id} value={admin.id}>
              {admin.username}
            </option>
          ))}
        </select>
      </div>

      <div className="audit-filter-group">
        <label htmlFor="action-filter">Action:</label>
        <select
          id="action-filter"
          className="audit-filter-select"
          value={filters.action || ''}
          onChange={(e) => handleChange('action', e.target.value)}
        >
          <option value="">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
        </select>
      </div>

      <div className="audit-filter-group">
        <label htmlFor="start-date">From:</label>
        <input
          id="start-date"
          type="date"
          className="audit-filter-input"
          value={filters.startDate || ''}
          onChange={(e) => handleChange('startDate', e.target.value)}
        />
      </div>

      <div className="audit-filter-group">
        <label htmlFor="end-date">To:</label>
        <input
          id="end-date"
          type="date"
          className="audit-filter-input"
          value={filters.endDate || ''}
          onChange={(e) => handleChange('endDate', e.target.value)}
        />
      </div>

      <button className="audit-button primary" onClick={handleApply}>
        Apply
      </button>
      <button className="audit-button" onClick={handleClear}>
        Clear
      </button>
    </div>
  );
}
