import { getServiceClient } from './supabase-service';

export interface AuditLogInput {
  adminId: string;
  action: 'create' | 'update' | 'delete';
  entityType: 'user' | 'role' | 'permission';
  entityId: string;
  entityName: string;
  changes?: Record<string, { old: any; new: any }>;
}

/**
 * Log an audit action to the audit_logs table.
 * Uses service role client to ensure the log is recorded regardless of RLS policies.
 * Errors are logged but not thrown - audit logging is best-effort.
 */
export async function logAuditAction(input: AuditLogInput): Promise<void> {
  try {
    const supabase = getServiceClient();

    await supabase.from('audit_logs').insert({
      admin_id: input.adminId,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId,
      entity_name: input.entityName,
      changes: input.changes || null,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    // Log to console but don't throw - audit is secondary
    console.error('Audit log error:', error);
  }
}

/**
 * Calculate the differences between old and new data.
 * Returns an object with only the fields that changed.
 *
 * @param oldData The previous state of the object
 * @param newData The new state of the object
 * @returns Object with keys for each changed field, containing { old, new } values
 */
export function calculateChanges(
  oldData: Record<string, any>,
  newData: Record<string, any>
): Record<string, { old: any; new: any }> {
  const changes: Record<string, { old: any; new: any }> = {};

  for (const key in newData) {
    if (oldData[key] !== newData[key]) {
      changes[key] = { old: oldData[key], new: newData[key] };
    }
  }

  return Object.keys(changes).length > 0 ? changes : {};
}
