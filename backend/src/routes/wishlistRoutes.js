import { Router } from 'express';
import {
  addToWishlist,
  clearWishlist,
  getWishlist,
  removeFromWishlist,
  syncWishlist,
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { WISHLIST_TYPES } from '../models/Wishlist.js';

const item = {
  itemType: { type: 'string', required: true, enum: WISHLIST_TYPES },
  slug: { type: 'string', required: true, max: 120 },
};

const router = Router();

router.use(protect);

router.get('/', getWishlist);
router.post('/', validate(item), addToWishlist);
router.post(
  '/sync',
  validate({ items: { type: 'array', required: true, max: 100, items: { type: 'object', shape: item } } }),
  syncWishlist,
);
router.delete('/', clearWishlist);
router.delete('/:itemType/:slug', removeFromWishlist);

export default router;
