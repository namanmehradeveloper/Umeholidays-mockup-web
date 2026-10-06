import { Router } from 'express';
import {
  createEnquiry,
  deleteEnquiry,
  getEnquiry,
  listEnquiries,
  listMyEnquiries,
  updateEnquiry,
} from '../controllers/enquiryController.js';
import { authorize, optionalAuth, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { ENQUIRY_SOURCES, ENQUIRY_STATUSES } from '../models/Enquiry.js';
import { plannerSelectionShape } from '../services/plannerService.js';

const router = Router();
const adminOnly = [protect, authorize('admin')];
const enquiryLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

router.post(
  '/',
  enquiryLimit,
  optionalAuth,
  validate({
    name: { type: 'string', required: true, min: 2, max: 100 },
    email: { type: 'email', required: true },
    phone: { type: 'string', max: 30 },
    travelDates: { type: 'string', max: 100 },
    destination: { type: 'string', max: 200 },
    travellers: { type: 'integer', min: 1, max: 100 },
    message: { type: 'string', max: 5000 },
    source: { type: 'string', enum: ENQUIRY_SOURCES, default: 'contact' },
    relatedSlug: { type: 'string', max: 120 },
    preferences: { type: 'object' },
    // Planner selection (source "plan-your-trip"). Any browser-sent estimatedAmount or
    // plannerSnapshot is deliberately absent here, so validate() strips it.
    ...plannerSelectionShape,
  }),
  createEnquiry,
);

router.get('/me', protect, listMyEnquiries);

router.get('/', ...adminOnly, listEnquiries);
router.get('/:id', ...adminOnly, getEnquiry);
router.patch(
  '/:id',
  ...adminOnly,
  validate(
    { status: { type: 'string', enum: ENQUIRY_STATUSES }, adminNotes: { type: 'string', max: 5000 } },
    { partial: true },
  ),
  updateEnquiry,
);
router.delete('/:id', ...adminOnly, deleteEnquiry);

export default router;
