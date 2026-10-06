import mongoose from 'mongoose';
import { contentPlugin, imageUrl, schemaOptions } from './plugins/content.js';

const experienceSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 160 },
    location: { type: String, required: [true, 'Location is required'], trim: true, index: true },
    duration: { type: String, trim: true },
    description: { type: String, required: [true, 'Description is required'], trim: true },
    image: { ...imageUrl, required: [true, 'Image is required'] },
    category: { type: String, trim: true, index: true },
  },
  schemaOptions,
);

experienceSchema.plugin(contentPlugin, { slugFrom: 'title' });

export default mongoose.model('Experience', experienceSchema);
