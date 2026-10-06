import SiteSettings from '../models/SiteSettings.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/response.js';
import { auditAdmin } from '../utils/audit.js';

const PUBLIC_FIELDS = [
  'companyName', 'tagline', 'email', 'phone', 'whatsapp', 'address',
  'instagram', 'facebook', 'youtube', 'linkedin', 'siteUrl',
];

async function getOrCreate() {
  return SiteSettings.findOneAndUpdate(
    { key: 'main' },
    { $setOnInsert: { key: 'main' } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
}

export async function getPublicSettings(_req, res) {
  const settings = await getOrCreate();
  const data = Object.fromEntries(PUBLIC_FIELDS.map((field) => [field, settings[field]]));
  return sendSuccess(res, { data });
}

export async function getAdminSettings(_req, res) {
  return sendSuccess(res, { data: await getOrCreate() });
}

export async function updateAdminSettings(req, res) {
  const data = {};
  for (const field of PUBLIC_FIELDS) {
    if (req.body[field] !== undefined) data[field] = req.body[field];
  }
  if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) throw ApiError.badRequest('Email is invalid');
  if (data.whatsapp && !/^\d{8,20}$/.test(String(data.whatsapp).replace(/\D/g, ''))) {
    throw ApiError.badRequest('WhatsApp number is invalid');
  }
  const settings = await getOrCreate();
  Object.assign(settings, data);
  await settings.save();
  await auditAdmin(req, { action: 'update', module: 'settings', recordId: settings._id, meta: { fields: Object.keys(data) } });
  return sendSuccess(res, { message: 'Company settings updated', data: settings });
}
