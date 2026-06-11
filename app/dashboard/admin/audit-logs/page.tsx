import AuditLogsList from './AuditLogsList';

export default function AuditLogsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h1 style={{ padding: '16px', marginBottom: '0' }}>Audit Logs</h1>
      <AuditLogsList />
    </div>
  );
}
