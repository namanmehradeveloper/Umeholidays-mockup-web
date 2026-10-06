import AuditLog from '../models/AuditLog.js';

export async function auditAdmin(req, { action, module, recordId = null, meta = {} }) {
  if (!req.user?._id || req.user.role !== 'admin') return;
  try {
    await AuditLog.create({
      admin: req.user._id,
      action,
      module,
      recordId,
      meta,
    });
  } catch (error) {
    console.error('[audit] failed to record action', error);
  }
}
