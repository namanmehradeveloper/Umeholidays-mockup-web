import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { verifyToken } from '../utils/token.js';

const readBearerToken = (req) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  return scheme === 'Bearer' && token ? token : null;
};

async function resolveUser(token) {
  const payload = verifyToken(token);
  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) throw ApiError.unauthorized('Account not found or disabled');
  if (user.passwordChangedAfter(payload.iat)) {
    throw ApiError.unauthorized('Password was changed recently, please log in again');
  }
  return user;
}

export async function protect(req, _res, next) {
  const token = readBearerToken(req);
  if (!token) throw ApiError.unauthorized();
  req.user = await resolveUser(token);
  next();
}

/** Attaches `req.user` when a valid token is present; never rejects the request. */
export async function optionalAuth(req, _res, next) {
  const token = readBearerToken(req);
  if (token) {
    try {
      req.user = await resolveUser(token);
    } catch {
      req.user = undefined;
    }
  }
  next();
}

export const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user) throw ApiError.unauthorized();
    if (!roles.includes(req.user.role)) throw ApiError.forbidden();
    next();
  };

export const isAdmin = (user) => user?.role === 'admin';
