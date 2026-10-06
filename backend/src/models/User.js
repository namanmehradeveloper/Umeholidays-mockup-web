import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

export const ROLES = ['user', 'organizer', 'admin'];
const SALT_ROUNDS = 12;

const hideSensitive = {
  virtuals: true,
  versionKey: false,
  transform(_doc, ret) {
    delete ret.password;
    delete ret.passwordChangedAt;
    delete ret.avatarPublicId;
    return ret;
  },
};

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true, maxlength: 80 },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email is invalid'],
    },
    password: { type: String, required: [true, 'Password is required'], minlength: 8, select: false },
    role: { type: String, enum: ROLES, default: 'user', index: true },
    phone: { type: String, trim: true, maxlength: 20 },
    avatar: { type: String, trim: true, maxlength: 1000, default: '' },
    avatarPublicId: { type: String, trim: true, maxlength: 300, default: '' },
    isActive: { type: Boolean, default: true },
    passwordChangedAt: Date,
    lastLoginAt: Date,
    resetPasswordTokenHash: { type: String, select: false },
    resetPasswordExpiresAt: { type: Date, select: false },
  },
  { timestamps: true, toJSON: hideSensitive, toObject: hideSensitive },
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  // Keep the freshly issued token valid while invalidating tokens issued before the change.
  if (!this.isNew) this.passwordChangedAt = new Date(Date.now() - 1000);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.passwordChangedAfter = function passwordChangedAfter(tokenIssuedAt) {
  if (!this.passwordChangedAt) return false;
  return Math.floor(this.passwordChangedAt.getTime() / 1000) > tokenIssuedAt;
};

export default mongoose.model('User', userSchema);
