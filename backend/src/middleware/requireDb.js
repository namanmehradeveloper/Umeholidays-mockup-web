import { isDbConnected } from '../config/db.js';
import ApiError from '../utils/ApiError.js';

export default function requireDb(_req, _res, next) {
  if (!isDbConnected()) throw new ApiError(503, 'Database unavailable, please try again shortly');
  next();
}
