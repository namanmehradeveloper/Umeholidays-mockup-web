import mongoose from 'mongoose';
import { contentPlugin, imageUrl, schemaOptions, stringList } from './plugins/content.js';

const destinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 120 },
    region: { type: String, required: [true, 'Region is required'], trim: true },
    tagline: { type: String, trim: true, maxlength: 200 },
    description: { type: String, required: [true, 'Description is required'], trim: true },
    heroImage: { ...imageUrl, required: [true, 'Hero image is required'] },
    bestTime: { type: String, trim: true },
    recommendedDays: { type: Number, min: 1, max: 60 },
    highlights: stringList,
    experiences: stringList,
    food: stringList,
    tips: stringList,
    /** Offered as a choice in the /plan-your-trip builder (also requires isPublished). */
    plannerEnabled: { type: Boolean, default: false, index: true },
    /** Planner base cost per adult per day, before hotel, transport and activities. */
    plannerBasePrice: { type: Number, min: 0, default: 0 },
    plannerSortOrder: { type: Number, default: 0 },
  },
  schemaOptions,
);

destinationSchema.plugin(contentPlugin, { slugFrom: 'name' });

export default mongoose.model('Destination', destinationSchema);
