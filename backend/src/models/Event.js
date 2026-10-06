import mongoose from 'mongoose';
import { contentPlugin, imageUrl, schemaOptions, stringList } from './plugins/content.js';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 160 },
    location: { type: String, required: [true, 'Location is required'], trim: true },
    category: { type: String, trim: true, index: true },
    /** Human-readable label shown on the site, e.g. "November — dates vary". */
    date: { type: String, trim: true },
    startDate: { type: Date, index: true },
    endDate: Date,
    image: imageUrl,
    description: { type: String, trim: true },
    highlights: stringList,
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  },
  schemaOptions,
);

eventSchema.plugin(contentPlugin, { slugFrom: 'title' });

eventSchema.pre('validate', function checkDates() {
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    this.invalidate('endDate', 'End date must be on or after the start date');
  }
});

export default mongoose.model('Event', eventSchema);
