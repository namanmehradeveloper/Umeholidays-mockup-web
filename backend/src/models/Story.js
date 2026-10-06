import mongoose from 'mongoose';
import { contentPlugin, imageUrl, schemaOptions, stringList } from './plugins/content.js';

const storySchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 200 },
    category: { type: String, trim: true, index: true },
    author: { type: String, trim: true, default: 'UME Journal' },
    date: { type: Date, default: Date.now, index: true },
    reading: { type: String, trim: true },
    excerpt: { type: String, trim: true, maxlength: 500 },
    image: { ...imageUrl, required: [true, 'Image is required'] },
    /** Article body as an ordered list of paragraphs. */
    content: stringList,
  },
  schemaOptions,
);

storySchema.plugin(contentPlugin, { slugFrom: 'title' });

export default mongoose.model('Story', storySchema);
