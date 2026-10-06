import { Router } from 'express';
import { getHealth } from '../controllers/healthController.js';
import requireDb from '../middleware/requireDb.js';
import adminRoutes from './adminRoutes.js';
import authRoutes from './authRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import { destinationRoutes, eventRoutes, experienceRoutes, storyRoutes, tourRoutes } from './contentRoutes.js';
import enquiryRoutes from './enquiryRoutes.js';
import userRoutes from './userRoutes.js';
import wishlistRoutes from './wishlistRoutes.js';
import adminRecordRoutes from './adminRecordRoutes.js';
import publicRecordRoutes from './publicRecordRoutes.js';
import auditLogRoutes from './auditLogRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import plannerRoutes from './plannerRoutes.js';

const router = Router();

router.get('/health', getHealth);

router.use(requireDb);

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/destinations', destinationRoutes);
router.use('/tours', tourRoutes);
router.use('/experiences', experienceRoutes);
router.use('/events', eventRoutes);
router.use('/stories', storyRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/bookings', bookingRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/admin', adminRoutes);
router.use('/admin/records', adminRecordRoutes);
router.use('/public-records', publicRecordRoutes);
router.use('/admin/audit-logs', auditLogRoutes);
router.use('/settings', settingsRoutes);
router.use('/uploads', uploadRoutes);
router.use('/planner', plannerRoutes);

export default router;
