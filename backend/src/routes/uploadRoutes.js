import { Router } from 'express';
import { uploadImage } from '../controllers/uploadController.js';
import { authorize, protect } from '../middleware/auth.js';
import { imageUpload } from '../middleware/upload.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();

const uploadLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, keyGenerator: (req) => req.user?.id || req.ip });

router.post('/image', protect, authorize('admin', 'organizer'), uploadLimit, imageUpload.single('image'), uploadImage);

export default router;
