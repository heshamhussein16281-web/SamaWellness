'use client';

import { useEffect, useState } from 'react';
import AuditLogsFilter from './AuditLogsFilter';
import AuditLogDetailModal from './AuditLogDetailModal';
import '../audit-logs.css';

interface AuditLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action: 'create' | 'update' | 'delete';
  entity_type: 'user' | 'role' | 'permission';
  entity_id: string;
  entity_name: string;
  changes: Record<string, any> | null;
  timestamp: string;
}

interface FilterState {
  adminId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}

export default function AuditLogsList() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [admins, setAdmins] = useState<Array<{ id: string; username: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<FilterState>({});
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const limit = 50;

  useEffect(() => {
    fetchLogs();
  }, [page, filters]);

  async function fetchLogs() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.adminId) params.append('admin_id', filters.adminId);
      if (filters.action) params.append('action', filters.action);
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const res = await fetch(`/api/admin/audit-logs?${params}`, {
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to fetch audit logs');
      }

      const data = await res.json();
      setLogs(data.data);
      setTotal(data.total);

      // Extract unique admins from logs
      const uniqueAdmins = Array.from(
        new Map(
          data.data.map((log: AuditLog) => [
            log.admin_id,
            { id: log.admin_id, username: log.admin_name },
          ])
        ).values()
      );
      setAdmins(uniqueAdmins);
    } catch (err) {
      setError('Unable to load audit logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1);
  };

  const totalPages = Math.ceil(total / limit);

  const handleShowDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailModalOpen(true);
  };

  return (
    <div className="audit-container">
      <AuditLogsFilter admins={admins} onFilterChange={handleFilterChange} />

      <div className="audit-table-wrapper">
        {loading ? (
          <div className="audit-loading">
            <div className="audit-spinner"></div>
            <p>Loading audit logs...</p>
          </div>
        ) : error ? (
          <div className="audit-empty-state" style={{ color: '#8a1b1b' }}>
            {error}
          </div>
        ) : logs.length === 0 ? (
          <div className="audit-empty-state">No audit logs found</div>
        ) : (
          <table className="audit-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Admin</th>
                <th>Action</th>
                <th>Entity Type</th>
                <th>Entity Name</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                  <td>{log.admin_name}</td>
                  <td>
                    <span className={`audit-action-badge ${log.action}`}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>
                    {log.entity_type}
                  </td>
                  <td>{log.entity_name}</td>
                  <td>
                    <button
                      className="audit-details-button"
                      onClick={() => handleShowDetails(log)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && !error && logs.length > 0 && (
        <div className="audit-pagination">
          <button
            className="audit-pagination-button"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            ← Prev
          </button>

          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
            const start = Math.max(1, page - 3);
            const pageNum = start + i;
            if (pageNum > totalPages) return null;
            return (
              <button
                key={pageNum}
                className={`audit-pagination-button ${
                  pageNum === page ? 'active' : ''
                }`}
                onClick={() => setPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            className="audit-pagination-button"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            Next →
          </button>

          <span style={{ marginLeft: '10px', color: 'var(--audit-color-text-muted)' }}>
            Page {page} of {totalPages} ({total} total)
          </span>
        </div>
      )}

      {selectedLog && (
        <AuditLogDetailModal
          isOpen={detailModalOpen}
          changes={selectedLog.changes}
          onClose={() => setDetailModalOpen(false)}
        />
      )}
    </div>
  );
}
