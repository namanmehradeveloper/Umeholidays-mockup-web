import { Router } from 'express';
import { listPublicRecords } from '../controllers/publicRecordController.js';
const router = Router();
router.get('/:module', listPublicRecords);
export default router;
