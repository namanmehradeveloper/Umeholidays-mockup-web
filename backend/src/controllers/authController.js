import { validateImageBuffer } from '../middleware/upload.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { deleteImageFromCloudinary, uploadImageToCloudinary } from '../utils/cloudinary.js';
import { sendPasswordResetEmail, createResetToken } from '../utils/email.js';
import { auditAdmin } from '../utils/audit.js';
import { sendSuccess } from '../utils/response.js';
import { signToken } from '../utils/token.js';
import crypto from 'node:crypto';

const authPayload = (user) => ({ user, token: signToken(user) });

export async function register(req, res) {
  const { name, email, password, phone } = req.body;
  if (await User.exists({ email })) throw ApiError.conflict('An account with this email already exists');

  let uploaded;
  if (req.file) {
    await validateImageBuffer(req.file);
    uploaded = await uploadImageToCloudinary(req.file, { folder: 'ume-holidays/users' });
  }

  try {
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'user',
      avatar: uploaded?.url || '',
      avatarPublicId: uploaded?.publicId || '',
    });
    return sendSuccess(res, { status: 201, message: 'Account created', data: authPayload(user) });
  } catch (error) {
    if (uploaded?.publicId) {
      await deleteImageFromCloudinary(uploaded.publicId).catch((cleanupError) => {
        console.error(`[auth] failed to remove orphaned avatar ${uploaded.publicId}:`, cleanupError.message);
      });
    }
    throw error;
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (!user.isActive) throw ApiError.forbidden('This account has been disabled');

  user.lastLoginAt = new Date();
  await user.save({ validateModifiedOnly: true });

  if (user.role === 'admin') {
    req.user = user;
    await auditAdmin(req, { action: 'login', module: 'auth' });
  }

  return sendSuccess(res, { message: 'Logged in', data: authPayload(user) });
}

export async function logout(req, res) {
  if (req.user?.role === 'admin') {
    await auditAdmin(req, { action: 'logout', module: 'auth' });
  }
  return sendSuccess(res, { message: 'Logged out' });
}

export async function forgotPassword(req, res) {
  const generic = 'If an account exists for that email, reset instructions have been sent.';
  const user = await User.findOne({ email: req.body.email }).select('+resetPasswordTokenHash +resetPasswordExpiresAt');

  if (!user || !user.isActive) {
    return sendSuccess(res, { message: generic });
  }

  const { token, hash } = createResetToken();
  user.resetPasswordTokenHash = hash;
  user.resetPasswordExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
  await user.save({ validateModifiedOnly: true });

  await sendPasswordResetEmail(user.email, token);
  return sendSuccess(res, { message: generic });
}

export async function resetPassword(req, res) {
  const hash = crypto.createHash('sha256').update(req.body.token).digest('hex');
  const user = await User.findOne({
    resetPasswordTokenHash: hash,
    resetPasswordExpiresAt: { $gt: new Date() },
  }).select('+password +resetPasswordTokenHash +resetPasswordExpiresAt');

  if (!user) throw ApiError.badRequest('Reset link is invalid or expired');

  user.password = req.body.password;
  user.resetPasswordTokenHash = undefined;
  user.resetPasswordExpiresAt = undefined;
  await user.save();

  return sendSuccess(res, { message: 'Password reset successfully. Please log in again.' });
}

export async function getMe(req, res) {
  return sendSuccess(res, { data: req.user });
}

export async function updateMe(req, res) {
  const { name, phone } = req.body;
  if (name !== undefined) req.user.name = name;
  if (phone !== undefined) req.user.phone = phone;
  await req.user.save();
  return sendSuccess(res, { message: 'Profile updated', data: req.user });
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    throw ApiError.unauthorized('Current password is incorrect');
  }
  if (currentPassword === newPassword) {
    throw ApiError.badRequest('New password must be different from the current password');
  }

  user.password = newPassword;
  await user.save();

  return sendSuccess(res, { message: 'Password updated', data: authPayload(user) });
}
