import mongoose from 'mongoose';
import { schemaOptions } from './plugins/content.js';

export const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];
export const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded'];

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tour: { type: mongoose.Schema.Types.ObjectId, ref: 'Tour', required: true, index: true },
    /** Snapshot so the booking stays readable if the tour is later edited or removed. */
    tourSnapshot: {
      slug: String,
      title: String,
      duration: String,
      image: String,
    },
    travelDate: { type: Date, required: [true, 'Travel date is required'] },
    travellers: { type: Number, required: true, min: 1, max: 50 },
    contact: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String, required: true, trim: true },
    },
    pricePerPerson: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: BOOKING_STATUSES, default: 'pending', index: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: 'unpaid', index: true },
    specialRequests: { type: String, trim: true, maxlength: 2000 },
    cancelledAt: Date,
    cancellationReason: { type: String, trim: true, maxlength: 1000 },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    activeKey: { type: String, sparse: true, select: false },
  },
  schemaOptions,
);

bookingSchema.index({ createdAt: -1 });
bookingSchema.index({ user: 1, tour: 1, travelDate: 1, status: 1 });
bookingSchema.index({ tour: 1, travelDate: 1, status: 1 });
bookingSchema.index({ activeKey: 1 }, { unique: true, sparse: true });

export default mongoose.model('Booking', bookingSchema);
