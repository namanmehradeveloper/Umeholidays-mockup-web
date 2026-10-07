import { Router } from 'express';
import {
  cancelBooking,
  createBooking,
  deleteBooking,
  getBooking,
  listBookings,
  listMyBookings,
  updateBooking,
} from '../controllers/bookingController.js';
import { authorize, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { BOOKING_STATUSES } from '../models/Booking.js';

const router = Router();
const adminOnly = authorize('admin');
const bookingLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, keyGenerator: (req) => req.user?.id || req.ip });

router.use(protect);

router.post(
  '/',
  bookingLimit,
  validate({
    tour: { type: 'string', required: true, max: 120 },
    travelDate: { type: 'date', required: true, future: true },
    travellers: { type: 'integer', required: true, min: 1, max: 50 },
    contact: {
      type: 'object',
      shape: {
        name: { type: 'string', min: 2, max: 100 },
        email: { type: 'email' },
        phone: { type: 'phone' },
      },
    },
    specialRequests: { type: 'string', max: 2000 },
  }),
  createBooking,
);

router.get('/me', listMyBookings);
router.get('/', adminOnly, listBookings);
router.get('/:id', getBooking);
router.patch(
  '/:id/cancel',
  validate({ reason: { type: 'string', max: 1000 } }, { partial: true }),
  cancelBooking,
);
router.patch(
  '/:id',
  adminOnly,
  validate(
    {
      status: { type: 'string', enum: BOOKING_STATUSES },
      cancellationReason: { type: 'string', max: 1000 },
    },
    { partial: true },
  ),
  updateBooking,
);
router.delete('/:id', adminOnly, deleteBooking);

export default router;
