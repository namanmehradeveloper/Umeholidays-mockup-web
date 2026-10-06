import mongoose from 'mongoose';
import { contentPlugin, imageUrl, schemaOptions, stringList } from './plugins/content.js';

const itineraryDaySchema = new mongoose.Schema(
  {
    day: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    text: { type: String, trim: true },
  },
  { _id: false },
);

const tourSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 160 },
    eyebrow: { type: String, trim: true },
    duration: { type: String, required: [true, 'Duration is required'], trim: true },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    totalSeats: { type: Number, required: true, min: 1, max: 1000, default: 20 },
    availableSeats: { type: Number, required: true, min: 0, max: 1000, default: 20 },
    destinations: { ...stringList, index: true },
    category: { type: String, trim: true, index: true },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    hotel: { type: String, trim: true },
    transport: { type: String, trim: true },
    difficulty: { type: String, trim: true },
    ideal: { type: String, trim: true },
    image: { ...imageUrl, required: [true, 'Image is required'] },
    description: { type: String, required: [true, 'Description is required'], trim: true },
    highlights: stringList,
    itinerary: { type: [itineraryDaySchema], default: [] },
  },
  schemaOptions,
);

tourSchema.pre('validate', function checkCapacity() {
  if (this.availableSeats > this.totalSeats) {
    this.invalidate('availableSeats', 'Available seats cannot exceed total seats');
  }
});

tourSchema.plugin(contentPlugin, { slugFrom: 'title' });

export default mongoose.model('Tour', tourSchema);
