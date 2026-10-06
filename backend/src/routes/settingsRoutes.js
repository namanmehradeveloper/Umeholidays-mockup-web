import { Router } from 'express';
import { authorize, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { getAdminSettings, getPublicSettings, updateAdminSettings } from '../controllers/settingsController.js';

const router = Router();
const fields = {
  companyName: { type: 'string', min: 2, max: 120 },
  tagline: { type: 'string', max: 300 },
  email: { type: 'email', max: 160 },
  phone: { type: 'string', max: 30 },
  whatsapp: { type: 'string', max: 30 },
  address: { type: 'string', max: 300 },
  instagram: { type: 'string', max: 500 },
  facebook: { type: 'string', max: 500 },
  youtube: { type: 'string', max: 500 },
  linkedin: { type: 'string', max: 500 },
  siteUrl: { type: 'string', max: 500 },
};

router.get('/public', getPublicSettings);
router.get('/admin', protect, authorize('admin'), getAdminSettings);
router.patch('/admin', protect, authorize('admin'), validate(fields, { partial: true }), updateAdminSettings);

export default router;
