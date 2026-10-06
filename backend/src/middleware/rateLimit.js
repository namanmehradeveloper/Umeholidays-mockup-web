import ApiError from '../utils/ApiError.js';

const buckets = new Map();

const cleanup = (now) => {
  if (buckets.size < 5000) return;
  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) buckets.delete(key);
  }
};

/**
 * Small dependency-free fixed-window limiter. Suitable for a single backend
 * instance; deployers running multiple instances should put a shared limiter
 * at the edge/load balancer.
 */
export const rateLimit = ({ windowMs = 15 * 60 * 1000, max = 20, keyGenerator = (req) => req.ip }) => {
  return (req, _res, next) => {
    const now = Date.now();
    cleanup(now);
    const key = String(keyGenerator(req) || 'unknown');
    let entry = buckets.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      buckets.set(key, entry);
    }
    entry.count += 1;
    if (entry.count > max) {
      throw new ApiError(429, 'Too many requests. Please try again later.');
    }
    next();
  };
};
