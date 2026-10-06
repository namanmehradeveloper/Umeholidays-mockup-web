import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: 'main', immutable: true },
    companyName: { type: String, default: 'UME Holidays', trim: true, maxlength: 120 },
    tagline: { type: String, default: 'Journeys shaped by stories, landscapes and local experiences.', trim: true, maxlength: 300 },
    email: { type: String, default: 'hello@umeholidays.com', trim: true, lowercase: true, maxlength: 160 },
    phone: { type: String, default: '+91 99999 99999', trim: true, maxlength: 30 },
    whatsapp: { type: String, default: '919999999999', trim: true, maxlength: 30 },
    address: { type: String, default: 'Jaipur, Rajasthan, India', trim: true, maxlength: 300 },
    instagram: { type: String, default: '', trim: true, maxlength: 500 },
    facebook: { type: String, default: '', trim: true, maxlength: 500 },
    youtube: { type: String, default: '', trim: true, maxlength: 500 },
    linkedin: { type: String, default: '', trim: true, maxlength: 500 },
    siteUrl: { type: String, default: 'http://localhost:3000', trim: true, maxlength: 500 },
  },
  { timestamps: true, versionKey: false },
);

export default mongoose.model('SiteSettings', siteSettingsSchema);
