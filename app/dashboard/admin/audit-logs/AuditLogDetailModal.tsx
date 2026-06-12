'use client';

import React from 'react';
import './audit-logs.css';

interface AuditLogDetailModalProps {
  isOpen: boolean;
  changes: Record<string, any> | null;
  onClose: () => void;
}

export default function AuditLogDetailModal({
  isOpen,
  changes,
  onClose,
}: AuditLogDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="audit-modal-overlay" onClick={onClose}>
      <div className="audit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="audit-modal-header">
          <h2 className="audit-modal-title">Change Details</h2>
          <button
            className="audit-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {changes ? (
          <pre className="audit-changes-json">
            {JSON.stringify(changes, null, 2)}
          </pre>
        ) : (
          <p>No changes recorded</p>
        )}
      </div>
    </div>
  );
}
