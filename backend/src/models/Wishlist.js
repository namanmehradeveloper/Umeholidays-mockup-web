import mongoose from 'mongoose';
import { schemaOptions } from './plugins/content.js';

export const WISHLIST_TYPES = ['tour', 'destination', 'experience', 'event', 'story'];

const wishlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    itemType: { type: String, enum: WISHLIST_TYPES, required: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
  },
  schemaOptions,
);

wishlistSchema.index({ user: 1, itemType: 1, slug: 1 }, { unique: true });

export default mongoose.model('Wishlist', wishlistSchema);
