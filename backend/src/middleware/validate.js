import ApiError from '../utils/ApiError.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function coerce(rule, raw) {
  switch (rule.type) {
    case 'string':
    case 'email': {
      if (typeof raw !== 'string') return { error: 'must be a string' };
      const value = rule.type === 'email' ? raw.trim().toLowerCase() : raw.trim();
      if (rule.type === 'email' && !EMAIL_RE.test(value)) return { error: 'must be a valid email address' };
      if (rule.min !== undefined && value.length < rule.min) return { error: `must be at least ${rule.min} characters` };
      if (rule.max !== undefined && value.length > rule.max) return { error: `must be at most ${rule.max} characters` };
      if (rule.pattern && !rule.pattern.test(value)) return { error: rule.patternMessage || 'has an invalid format' };
      return { value };
    }
    case 'number':
    case 'integer': {
      const value = typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : raw;
      if (typeof value !== 'number' || Number.isNaN(value)) return { error: 'must be a number' };
      if (rule.type === 'integer' && !Number.isInteger(value)) return { error: 'must be a whole number' };
      if (rule.min !== undefined && value < rule.min) return { error: `must be at least ${rule.min}` };
      if (rule.max !== undefined && value > rule.max) return { error: `must be at most ${rule.max}` };
      return { value };
    }
    case 'boolean':
      if (typeof raw === 'boolean') return { value: raw };
      if (raw === 'true' || raw === 'false') return { value: raw === 'true' };
      return { error: 'must be true or false' };
    case 'date': {
      const value = new Date(raw);
      if (typeof raw === 'boolean' || raw === null || Number.isNaN(value.getTime())) return { error: 'must be a valid date' };
      if (rule.future && value.getTime() <= Date.now()) return { error: 'must be in the future' };
      return { value };
    }
    case 'array': {
      if (!Array.isArray(raw)) return { error: 'must be an array' };
      if (rule.max !== undefined && raw.length > rule.max) return { error: `must contain at most ${rule.max} items` };
      if (!rule.items) return { value: raw };
      const value = [];
      for (const [i, item] of raw.entries()) {
        const result = coerce(rule.items, item);
        if (result.error) return { error: `item ${i} ${result.error}` };
        value.push(result.value);
      }
      return { value };
    }
    case 'object': {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { error: 'must be an object' };
      if (!rule.shape) return { value: raw };
      const { value, errors } = validateShape(rule.shape, raw, false);
      return errors.length ? { error: errors.map((e) => `${e.field} ${e.message}`).join(', ') } : { value };
    }
    default:
      return { value: raw };
  }
}

function validateShape(shape, input, partial) {
  const value = {};
  const errors = [];

  for (const [field, rule] of Object.entries(shape)) {
    const raw = input?.[field];
    const missing = raw === undefined || raw === null || (typeof raw === 'string' && raw.trim() === '');

    if (missing) {
      if (rule.allowEmpty && raw !== undefined && raw !== null) {
        value[field] = '';
        continue;
      }
      if (rule.required && !partial) errors.push({ field, message: 'is required' });
      else if (rule.default !== undefined && !partial) value[field] = rule.default;
      continue;
    }

    const result = coerce(rule, raw);
    if (result.error) {
      errors.push({ field, message: result.error });
      continue;
    }
    if (rule.enum && !rule.enum.includes(result.value)) {
      errors.push({ field, message: `must be one of: ${rule.enum.join(', ')}` });
      continue;
    }
    value[field] = result.value;
  }

  return { value, errors };
}

/**
 * Validates and sanitises `req.body` against a field schema. Unknown fields are
 * stripped. With `partial: true` (PATCH), required checks and defaults are skipped.
 */
export const validate =
  (shape, { partial = false } = {}) =>
  (req, _res, next) => {
    const { value, errors } = validateShape(shape, req.body ?? {}, partial);
    if (errors.length) throw ApiError.badRequest('Validation failed', errors);
    if (partial && !Object.keys(value).length) throw ApiError.badRequest('No valid fields provided');
    req.body = value;
    next();
  };
