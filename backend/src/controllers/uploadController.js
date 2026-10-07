import ApiError from '../utils/ApiError.js';
import { uploadImageToCloudinary } from '../utils/cloudinary.js';
import { validateImageBuffer } from '../middleware/upload.js';

export async function uploadImage(req, res) {
  if (!req.file) throw ApiError.badRequest('Image file is required');
  await validateImageBuffer(req.file);

  const requestedFolder = String(req.body?.folder || 'ume-holidays').trim().replace(/^\/+|\/+$/g, '').slice(0, 100);
  const allowedFolders = new Set([
    'ume-holidays',
    'ume-holidays/banners',
    'ume-holidays/testimonials',
    'ume-holidays/destinations',
    'ume-holidays/tours',
    'ume-holidays/experiences',
    'ume-holidays/events',
    'ume-holidays/stories',
    'ume-holidays/offers',
    'ume-holidays/users',
  ]);
  const folder = allowedFolders.has(requestedFolder) ? requestedFolder : 'ume-holidays';
  const uploaded = await uploadImageToCloudinary(req.file, { folder });

  return res.status(201).json({
    success: true,
    data: {
      url: uploaded.url,
      publicId: uploaded.publicId,
      width: uploaded.width,
      height: uploaded.height,
      format: uploaded.format,
      size: uploaded.bytes,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
    },
  });
}
