import { slugify } from '../../utils/query.js';

export const schemaOptions = {
  timestamps: true,
  toJSON: { virtuals: true, versionKey: false },
  toObject: { virtuals: true, versionKey: false },
};

/** Common fields for publishable content (destinations, tours, experiences, events, stories). */
export function contentPlugin(schema, { slugFrom = 'title' } = {}) {
  schema.add({
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug may only contain lowercase letters, numbers and hyphens'],
    },
    isPublished: { type: Boolean, default: true, index: true },
    featured: { type: Boolean, default: false },
    metaTitle: { type: String, trim: true, maxlength: 70, default: '' },
    metaDescription: { type: String, trim: true, maxlength: 170, default: '' },
    canonicalUrl: { type: String, trim: true, maxlength: 500, default: '' },
    ogImage: { type: String, trim: true, maxlength: 1000, default: '' },
    noIndex: { type: Boolean, default: false },
  });

  schema.pre('validate', function setSlug() {
    if (!this.slug && this[slugFrom]) this.slug = slugify(this[slugFrom]);
  });
}

export const stringList = { type: [{ type: String, trim: true }], default: [] };

export const imageUrl = {
  type: String,
  trim: true,
  match: [/^(https?:\/\/|\/)\S+$/, 'Image must be an absolute URL or a site-relative path'],
};
