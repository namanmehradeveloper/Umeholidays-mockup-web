import multer from 'multer';
import ApiError from '../utils/ApiError.js';

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    cb(ApiError.badRequest('Only JPG, PNG, WEBP and GIF images are allowed'));
    return;
  }
  cb(null, true);
};

export const imageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
    fields: 10,
    parts: 11,
  },
});

export async function validateImageBuffer(file) {
  if (!file?.buffer?.length) throw ApiError.badRequest('Image file is required');
  const bytes = file.buffer.subarray(0, 32);
  const isJpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng = bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isGif = bytes.length >= 6 && ['GIF87a', 'GIF89a'].includes(bytes.subarray(0, 6).toString('ascii'));
  const isWebp = bytes.length >= 12 && bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP';
  const valid = isJpeg || isPng || isGif || isWebp;
  if (!valid) throw ApiError.badRequest('The uploaded file is not a valid supported image');

  const mimeMatches =
    (file.mimetype === 'image/jpeg' && isJpeg) ||
    (file.mimetype === 'image/png' && isPng) ||
    (file.mimetype === 'image/gif' && isGif) ||
    (file.mimetype === 'image/webp' && isWebp);
  if (!mimeMatches) throw ApiError.badRequest('Image content does not match its MIME type');
}
