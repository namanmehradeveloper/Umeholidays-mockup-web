import mongoose from 'mongoose';
import { imageUrl, schemaOptions, stringList } from './plugins/content.js';
import { slugify } from '../utils/query.js';

export const OFFER_STATUSES = ['active', 'inactive'];
export const OFFER_DISCOUNT_TYPES = ['none', 'percentage', 'fixed'];
export const OFFER_AVAILABILITY = ['live', 'scheduled', 'expired', 'inactive'];

const offerSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 160 },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 160,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug may only contain lowercase letters, numbers and hyphens'],
    },
    subtitle: { type: String, trim: true, maxlength: 160, default: '' },
    summary: { type: String, trim: true, maxlength: 5000, default: '' },
    description: { type: String, trim: true, maxlength: 50000, default: '' },
    terms: { type: String, trim: true, maxlength: 20000, default: '' },
    highlights: stringList,
    duration: { type: String, trim: true, maxlength: 80, default: '' },
    destinations: { ...stringList, index: true },
    tour: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', default: null },

    image: { ...imageUrl, maxlength: 1000, default: '' },
    gallery: { type: [{ ...imageUrl, maxlength: 1000 }], default: [] },

    originalPrice: { type: Number, min: [0, 'Price cannot be negative'], default: null },
    discountType: { type: String, enum: OFFER_DISCOUNT_TYPES, default: 'none' },
    discountValue: { type: Number, min: [0, 'Discount cannot be negative'], default: 0 },

    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },

    status: { type: String, enum: OFFER_STATUSES, default: 'active', index: true },
    featured: { type: Boolean, default: false, index: true },
    sortOrder: { type: Number, default: 0 },

    metaTitle: { type: String, trim: true, maxlength: 70, default: '' },
    metaDescription: { type: String, trim: true, maxlength: 170, default: '' },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  schemaOptions,
);

offerSchema.index({ status: 1, featured: -1, sortOrder: 1 });

offerSchema.virtual('discountAmount').get(function discountAmount() {
  const price = Number(this.originalPrice);
  if (!Number.isFinite(price) || price <= 0) return 0;
  const value = Number(this.discountValue) || 0;
  if (this.discountType === 'percentage') return Math.round((price * Math.min(value, 100)) / 100);
  if (this.discountType === 'fixed') return Math.min(value, price);
  return 0;
});

offerSchema.virtual('finalPrice').get(function finalPrice() {
  const price = Number(this.originalPrice);
  if (this.originalPrice === null || this.originalPrice === undefined || !Number.isFinite(price)) return null;
  return Math.max(0, price - this.discountAmount);
});

offerSchema.virtual('availability').get(function availability() {
  if (this.status !== 'active') return 'inactive';
  const now = Date.now();
  if (this.startDate && this.startDate.getTime() > now) return 'scheduled';
  if (this.endDate && this.endDate.getTime() < now) return 'expired';
  return 'live';
});

offerSchema.pre('validate', function checkOffer() {
  if (!this.slug && this.title) this.slug = slugify(this.title);

  const hasPrice = this.originalPrice !== null && this.originalPrice !== undefined;
  if (this.discountType !== 'none') {
    if (!hasPrice) this.invalidate('originalPrice', 'Original price is required when a discount is set');
    if (!(Number(this.discountValue) > 0)) this.invalidate('discountValue', 'Discount value must be greater than 0');
    if (this.discountType === 'percentage' && this.discountValue > 100) {
      this.invalidate('discountValue', 'Percentage discount cannot exceed 100');
    }
    if (this.discountType === 'fixed' && hasPrice && this.discountValue > this.originalPrice) {
      this.invalidate('discountValue', 'Fixed discount cannot exceed the original price');
    }
  } else {
    this.discountValue = 0;
  }

  if (this.startDate && this.endDate && this.endDate.getTime() < this.startDate.getTime()) {
    this.invalidate('endDate', 'End date cannot be before the start date');
  }
});

/** Mongo filter for offers a visitor may see right now (active and inside the optional date window). */
export function liveOfferFilter(now = new Date()) {
  return {
    status: 'active',
    $and: [
      { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
      { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
    ],
  };
}

export default mongoose.model('Offer', offerSchema);
