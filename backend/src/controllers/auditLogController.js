import AuditLog from '../models/AuditLog.js';
import { asString, getPagination, paginationMeta } from '../utils/query.js';
import { sendSuccess } from '../utils/response.js';

export async function listAuditLogs(req, res) {
  const pagination = getPagination(req.query);
  const filter = {};
  const module = asString(req.query.module);
  const action = asString(req.query.action);
  if (module) filter.module = module;
  if (action) filter.action = action;

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate('admin', 'name email'),
    AuditLog.countDocuments(filter),
  ]);

  return sendSuccess(res, { data: logs, meta: paginationMeta(pagination, total) });
}
