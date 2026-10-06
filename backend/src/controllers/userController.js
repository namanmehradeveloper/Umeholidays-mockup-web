import User from '../models/User.js';
import Wishlist from '../models/Wishlist.js';
import ApiError from '../utils/ApiError.js';
import { asString, getPagination, getSort, paginationMeta, searchFilter } from '../utils/query.js';
import { sendSuccess } from '../utils/response.js';
import { auditAdmin } from '../utils/audit.js';

async function findUser(id) {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

export async function listUsers(req, res) {
  const pagination = getPagination(req.query);
  const filter = { ...searchFilter(asString(req.query.q), ['name', 'email', 'phone']) };

  const role = asString(req.query.role);
  if (role) filter.role = role;
  const active = asString(req.query.isActive);
  if (active === 'true' || active === 'false') filter.isActive = active === 'true';

  const sort = getSort(req.query, ['name', 'email', 'createdAt', 'lastLoginAt'], { createdAt: -1 });
  const [users, total] = await Promise.all([
    User.find(filter).sort(sort).skip(pagination.skip).limit(pagination.limit),
    User.countDocuments(filter),
  ]);

  return sendSuccess(res, { data: users, meta: paginationMeta(pagination, total) });
}

export async function getUser(req, res) {
  return sendSuccess(res, { data: await findUser(req.params.id) });
}

export async function createUser(req, res) {
  if (await User.exists({ email: req.body.email })) {
    throw ApiError.conflict('An account with this email already exists');
  }
  const { name, email, password, phone, role = 'user' } = req.body;
  const user = await User.create({ name, email, password, phone, role });
  await auditAdmin(req, { action: 'create', module: 'users', recordId: user._id });
  return sendSuccess(res, { status: 201, message: 'User created', data: user });
}

export async function updateUser(req, res) {
  const user = await findUser(req.params.id);
  const isSelf = user.id === req.user.id;

  if (isSelf && ((req.body.role && req.body.role !== 'admin') || req.body.isActive === false)) {
    throw ApiError.badRequest('You cannot remove your own admin access or deactivate yourself');
  }
  if (req.body.email && req.body.email !== user.email && (await User.exists({ email: req.body.email }))) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const allowed = {};
  for (const field of ['name', 'email', 'phone', 'role', 'isActive', 'avatar']) {
    if (req.body[field] !== undefined) allowed[field] = req.body[field];
  }
  user.set(allowed);
  await user.save();
  await auditAdmin(req, { action: 'update', module: 'users', recordId: user._id, meta: { fields: Object.keys(allowed) } });
  return sendSuccess(res, { message: 'User updated', data: user });
}

export async function deleteUser(req, res) {
  const user = await findUser(req.params.id);
  if (user.id === req.user.id) throw ApiError.badRequest('You cannot delete your own account');

  await Promise.all([user.deleteOne(), Wishlist.deleteMany({ user: user._id })]);
  await auditAdmin(req, { action: 'delete', module: 'users', recordId: user._id });
  return sendSuccess(res, { message: 'User deleted' });
}
