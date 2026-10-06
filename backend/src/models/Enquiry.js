import mongoose from 'mongoose';
import { schemaOptions } from './plugins/content.js';

export const ENQUIRY_SOURCES = ['contact', 'trip-planner', 'plan-your-trip', 'tour', 'event', 'other'];
export const ENQUIRY_STATUSES = ['new', 'contacted', 'qualified', 'quoted', 'converted', 'closed'];

const objectId = { type: mongoose.Schema.Types.ObjectId };

/** Journey built in /plan-your-trip. Everything here is resolved and priced server-side. */
const plannerSchema = new mongoose.Schema(
  {
    destinationId: { ...objectId, ref: 'Destination' },
    durationId: { ...objectId, ref: 'PlannerOption' },
    travelStyleId: { ...objectId, ref: 'PlannerOption' },
    hotelId: { ...objectId, ref: 'PlannerOption' },
    transportId: { ...objectId, ref: 'PlannerOption' },
    activityIds: { type: [{ ...objectId, ref: 'PlannerOption' }], default: [] },
    adults: { type: Number, min: 1 },
    children: { type: Number, min: 0, default: 0 },
    /** Names and figures as they were at submission time, so later admin edits do not rewrite history. */
    snapshot: { type: mongoose.Schema.Types.Mixed },
    pricing: { type: mongoose.Schema.Types.Mixed },
    estimatedAmount: { type: Number, min: 0 },
    currency: { type: String, trim: true, maxlength: 3 },
  },
  { _id: false },
);

const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 100 },
    email: { type: String, required: [true, 'Email is required'], lowercase: true, trim: true },
    phone: { type: String, trim: true, maxlength: 30 },
    travelDates: { type: String, trim: true, maxlength: 100 },
    destination: { type: String, trim: true, maxlength: 200 },
    travellers: { type: Number, min: 1, max: 100 },
    message: { type: String, trim: true, maxlength: 5000 },
    source: { type: String, enum: ENQUIRY_SOURCES, default: 'contact', index: true },
    /** Slug of the tour/event/destination the enquiry was raised from, if any. */
    relatedSlug: { type: String, trim: true, lowercase: true },
    /** Free-form selections from the planner widgets (style, budget, duration...). */
    preferences: { type: mongoose.Schema.Types.Mixed },
    planner: { type: plannerSchema, default: undefined },
    status: { type: String, enum: ENQUIRY_STATUSES, default: 'new', index: true },
    adminNotes: { type: String, trim: true, maxlength: 5000 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  schemaOptions,
);

enquirySchema.index({ createdAt: -1 });

export default mongoose.model('Enquiry', enquirySchema);
