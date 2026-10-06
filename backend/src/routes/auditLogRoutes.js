import { Router } from 'express';
import { authorize, protect } from '../middleware/auth.js';
import { listAuditLogs } from '../controllers/auditLogController.js';

const router = Router();
router.use(protect, authorize('admin'));
router.get('/', listAuditLogs);
export default router;
