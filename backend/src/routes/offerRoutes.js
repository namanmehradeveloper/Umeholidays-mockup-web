import { Router } from 'express';
import {
  createOffer,
  deleteOffer,
  getOffer,
  getOfferBySlug,
  listOffers,
  listPublicOffers,
  updateOffer,
  updateOfferStatus,
} from '../controllers/offerController.js';
import { authorize, optionalAuth, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { OFFER_DISCOUNT_TYPES, OFFER_STATUSES } from '../models/Offer.js';

const router = Router();
const adminOnly = [protect, authorize('admin')];

const IMAGE_URL = /^(https?:\/\/|\/)\S+$/;
const imageRule = { type: 'string', max: 1000, pattern: IMAGE_URL, patternMessage: 'must be an absolute URL or a site-relative path' };

const offerShape = {
  title: { type: 'string', required: true, min: 2, max: 160 },
  slug: {
    type: 'string',
    max: 160,
    allowEmpty: true,
    pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    patternMessage: 'may only contain lowercase letters, numbers and hyphens',
  },
  subtitle: { type: 'string', max: 160, allowEmpty: true },
  summary: { type: 'string', max: 5000, allowEmpty: true },
  description: { type: 'string', max: 50000, allowEmpty: true },
  terms: { type: 'string', max: 20000, allowEmpty: true },
  highlights: { type: 'array', max: 30, items: { type: 'string', max: 200 } },
  duration: { type: 'string', max: 80, allowEmpty: true },
  destinations: { type: 'array', max: 30, items: { type: 'string', max: 80 } },
  tour: { type: 'string', allowEmpty: true, pattern: /^[a-f\d]{24}$/i, patternMessage: 'must be a valid tour id' },
  image: { ...imageRule, allowEmpty: true },
  gallery: { type: 'array', max: 12, items: imageRule },
  originalPrice: { type: 'number', min: 0, max: 100000000, allowEmpty: true },
  discountType: { type: 'string', enum: OFFER_DISCOUNT_TYPES, default: 'none' },
  discountValue: { type: 'number', min: 0, max: 100000000, default: 0 },
  startDate: { type: 'date', allowEmpty: true },
  endDate: { type: 'date', allowEmpty: true },
  status: { type: 'string', enum: OFFER_STATUSES, default: 'active' },
  featured: { type: 'boolean', default: false },
  sortOrder: { type: 'integer', min: -100000, max: 100000 },
  metaTitle: { type: 'string', max: 70, allowEmpty: true },
  metaDescription: { type: 'string', max: 170, allowEmpty: true },
};

const statusShape = {
  status: { type: 'string', enum: OFFER_STATUSES },
  featured: { type: 'boolean' },
};

router.get('/public', listPublicOffers);
router.get('/slug/:slug', optionalAuth, getOfferBySlug);

router.get('/', ...adminOnly, listOffers);
router.post('/', ...adminOnly, validate(offerShape), createOffer);
router.get('/:id', ...adminOnly, getOffer);
router.put('/:id', ...adminOnly, validate(offerShape), updateOffer);
router.patch('/:id/status', ...adminOnly, validate(statusShape, { partial: true }), updateOfferStatus);
router.delete('/:id', ...adminOnly, deleteOffer);

export default router;
