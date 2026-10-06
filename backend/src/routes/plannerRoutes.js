import { Router } from 'express';
import {
  adminCreateOption,
  adminDeleteOption,
  adminGetSettings,
  adminListOptions,
  adminReorderOptions,
  adminUpdateOption,
  adminUpdateSettings,
  calculatePlannerQuote,
  getPlannerSettings,
  listPlannerDestinations,
  listPlannerOptions,
} from '../controllers/plannerController.js';
import { authorize, protect } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { PLANNER_OPTION_STATUSES, TRANSPORT_PRICING_TYPES } from '../models/PlannerOption.js';
import { plannerSelectionShape } from '../services/plannerService.js';

const router = Router();
const adminOnly = [protect, authorize('admin')];
const quoteLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, keyGenerator: (req) => `planner-quote:${req.ip}` });

const optionShape = {
  name: { type: 'string', required: true, min: 1, max: 120 },
  description: { type: 'string', max: 1000, allowEmpty: true },
  icon: { type: 'string', max: 60, allowEmpty: true },
  image: { type: 'string', max: 1000, allowEmpty: true },
  status: { type: 'string', enum: PLANNER_OPTION_STATUSES },
  sortOrder: { type: 'number', min: -100000, max: 100000 },
  days: { type: 'integer', min: 1, max: 60 },
  nights: { type: 'integer', min: 0, max: 60 },
  priceModifier: { type: 'number', min: -90, max: 500 },
  pricePerNight: { type: 'number', min: 0, max: 10000000 },
  pricingType: { type: 'string', enum: TRANSPORT_PRICING_TYPES },
  price: { type: 'number', min: 0, max: 10000000 },
  pricePerPerson: { type: 'number', min: 0, max: 10000000 },
  destinationIds: { type: 'array', max: 200, items: { type: 'string', max: 24 } },
};

router.get('/settings', getPlannerSettings);
router.get('/destinations', listPlannerDestinations);
router.get('/options/:type', listPlannerOptions);
router.post('/calculate', quoteLimit, validate(plannerSelectionShape), calculatePlannerQuote);

router.get('/admin/settings', ...adminOnly, adminGetSettings);
router.patch('/admin/settings', ...adminOnly, adminUpdateSettings);
router.get('/admin/options/:type', ...adminOnly, adminListOptions);
router.post('/admin/options/:type', ...adminOnly, validate(optionShape), adminCreateOption);
router.post(
  '/admin/options/:type/reorder',
  ...adminOnly,
  validate({ ids: { type: 'array', required: true, max: 500, items: { type: 'string', max: 24 } } }),
  adminReorderOptions,
);
router.patch('/admin/options/:type/:id', ...adminOnly, validate(optionShape, { partial: true }), adminUpdateOption);
router.delete('/admin/options/:type/:id', ...adminOnly, adminDeleteOption);

export default router;
