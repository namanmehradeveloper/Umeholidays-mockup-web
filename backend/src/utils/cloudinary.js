import crypto from 'node:crypto';
import ApiError from './ApiError.js';

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new ApiError(503, `Cloudinary is not configured: ${name} is missing`);
  return value;
}

function signParams(params, apiSecret) {
  const serialized = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return crypto.createHash('sha1').update(`${serialized}${apiSecret}`).digest('hex');
}

export async function uploadImageToCloudinary(file, { folder = 'ume-holidays' } = {}) {
  if (!file?.buffer?.length) throw ApiError.badRequest('Image file is required');

  const cloudName = required('CLOUDINARY_CLOUD_NAME');
  const apiKey = required('CLOUDINARY_API_KEY');
  const apiSecret = required('CLOUDINARY_API_SECRET');

  const timestamp = Math.floor(Date.now() / 1000);
  const params = { folder, timestamp };
  const signature = signParams(params, apiSecret);

  const form = new FormData();
  form.append('file', new Blob([file.buffer], { type: file.mimetype }), file.originalname || 'image');
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('folder', folder);
  form.append('signature', signature);

  let response;
  try {
    response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, {
      method: 'POST',
      body: form,
    });
  } catch (error) {
    throw new ApiError(502, `Could not connect to Cloudinary: ${error instanceof Error ? error.message : 'network error'}`);
  }

  let body = null;
  try { body = await response.json(); } catch { /* handled below */ }

  if (!response.ok || !body?.secure_url) {
    const message = body?.error?.message || `Cloudinary upload failed (${response.status})`;
    throw new ApiError(502, message);
  }

  return {
    url: body.secure_url,
    publicId: body.public_id,
    width: body.width,
    height: body.height,
    format: body.format,
    bytes: body.bytes,
  };
}

export async function deleteImageFromCloudinary(publicId) {
  if (!publicId) return;

  const cloudName = required('CLOUDINARY_CLOUD_NAME');
  const apiKey = required('CLOUDINARY_API_KEY');
  const apiSecret = required('CLOUDINARY_API_SECRET');

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signParams({ public_id: publicId, timestamp }, apiSecret);

  const form = new FormData();
  form.append('public_id', publicId);
  form.append('api_key', apiKey);
  form.append('timestamp', String(timestamp));
  form.append('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/destroy`, {
    method: 'POST',
    body: form,
  });
  if (!response.ok) throw new ApiError(502, `Cloudinary delete failed (${response.status})`);
}
