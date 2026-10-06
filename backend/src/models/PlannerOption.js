import mongoose from 'mongoose';
import { imageUrl, schemaOptions } from './plugins/content.js';

export const PLANNER_OPTION_TYPES = ['duration', 'travel-style', 'hotel', 'transport', 'activity'];
export const TRANSPORT_PRICING_TYPES = ['per_day', 'per_trip', 'per_person'];
export const PLANNER_OPTION_STATUSES = ['active', 'inactive'];

/** Fields that are meaningful for each option type; everything else is ignored on write and hidden on read. */
export const PLANNER_TYPE_FIELDS = {
  duration: ['days', 'nights', 'priceModifier'],
  'travel-style': ['icon', 'image', 'priceModifier'],
  hotel: ['icon', 'image', 'pricePerNight'],
  transport: ['icon', 'image', 'pricingType', 'price'],
  activity: ['image', 'pricePerPerson', 'destinationIds'],
};

const money = { type: Number, min: [0, 'Price cannot be negative'], default: 0 };

const plannerOptionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: PLANNER_OPTION_TYPES, required: true, index: true },
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    icon: { type: String, trim: true, maxlength: 60, default: '' },
    image: { ...imageUrl, maxlength: 1000, default: '' },
    status: { type: String, enum: PLANNER_OPTION_STATUSES, default: 'active', index: true },
    sortOrder: { type: Number, default: 0 },

    days: { type: Number, min: 1, max: 60 },
    nights: { type: Number, min: 0, max: 60 },
    /** Percentage applied to the trip subtotal (durations and travel styles). */
    priceModifier: { type: Number, min: -90, max: 500, default: 0 },
    pricePerNight: money,
    pricingType: { type: String, enum: TRANSPORT_PRICING_TYPES, default: 'per_day' },
    price: money,
    pricePerPerson: money,
    /** Empty means the activity is offered at every planner destination. */
    destinationIds: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }], default: [] },
  },
  schemaOptions,
);

plannerOptionSchema.virtual('label').get(function label() {
  return this.name;
});

plannerOptionSchema.pre('validate', function validateDuration() {
  if (this.type !== 'duration') return;
  if (!Number.isFinite(this.days)) {
    this.invalidate('days', 'Days are required for a duration');
    return;
  }
  if (!Number.isFinite(this.nights)) this.nights = Math.max(0, this.days - 1);
  if (this.nights > this.days) this.invalidate('nights', 'Nights cannot exceed days');
});

plannerOptionSchema.index({ type: 1, status: 1, sortOrder: 1 });

export default mongoose.model('PlannerOption', plannerOptionSchema);
