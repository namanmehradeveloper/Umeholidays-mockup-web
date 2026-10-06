import { Router } from 'express';
import { getAnalytics, getDashboard } from '../controllers/adminController.js';
import { authorize, protect } from '../middleware/auth.js';

const router = Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/analytics', getAnalytics);

export default router;
