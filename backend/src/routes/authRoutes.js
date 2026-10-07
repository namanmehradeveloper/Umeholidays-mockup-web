import { Router } from 'express';
import { changePassword, forgotPassword, getMe, login, logout, register, resetPassword, updateMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { imageUpload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';

const password = { type: 'string', required: true, min: 8, max: 128 };

const router = Router();

const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });


// Accepts JSON or multipart/form-data with an optional `avatar` image file.
router.post(
  '/register',
  authLimit,
  imageUpload.single('avatar'),
  validate({
    name: { type: 'string', required: true, min: 2, max: 80 },
    email: { type: 'email', required: true },
    password,
    phone: { type: 'phone', required: true },
  }),
  register,
);

router.post(
  '/login',
  authLimit,
  validate({ email: { type: 'email', required: true }, password: { type: 'string', required: true, max: 128 } }),
  login,
);


router.post(
  '/forgot-password',
  authLimit,
  validate({ email: { type: 'email', required: true } }),
  forgotPassword,
);

router.post(
  '/reset-password',
  authLimit,
  validate({
    token: { type: 'string', required: true, min: 32, max: 128 },
    password,
  }),
  resetPassword,
);

router.post('/logout', protect, logout);

router.get('/me', protect, getMe);

router.patch(
  '/me',
  protect,
  validate({ name: { type: 'string', min: 2, max: 80 }, phone: { type: 'phone' } }, { partial: true }),
  updateMe,
);

router.patch(
  '/password',
  protect,
  validate({ currentPassword: { type: 'string', required: true, max: 128 }, newPassword: password }),
  changePassword,
);

export default router;
