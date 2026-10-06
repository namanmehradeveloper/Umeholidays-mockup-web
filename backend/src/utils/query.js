import mongoose from 'mongoose';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 200;

const firstValue = (value) => (Array.isArray(value) ? value[0] : value);

export const asString = (value) => {
  const v = firstValue(value);
  return typeof v === 'string' ? v.trim() : undefined;
};

export function getPagination(query) {
  const page = Math.max(1, Number.parseInt(asString(query.page), 10) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number.parseInt(asString(query.limit), 10) || DEFAULT_LIMIT));
  return { page, limit, skip: (page - 1) * limit };
}

export const paginationMeta = ({ page, limit }, total) => ({
  page,
  limit,
  total,
  pages: Math.ceil(total / limit) || 1,
});

export const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function searchFilter(term, fields) {
  if (!term || !fields.length) return {};
  const regex = new RegExp(escapeRegex(term), 'i');
  return { $or: fields.map((field) => ({ [field]: regex })) };
}

/** Accepts `?sort=price,-createdAt`; only whitelisted fields are honoured. */
export function getSort(query, allowed, fallback) {
  const raw = asString(query.sort);
  if (!raw) return fallback;
  const sort = {};
  for (const token of raw.split(',')) {
    const field = token.replace(/^-/, '');
    if (allowed.includes(field)) sort[field] = token.startsWith('-') ? -1 : 1;
  }
  return Object.keys(sort).length ? sort : fallback;
}

export const isObjectId = (value) => mongoose.isValidObjectId(value) && /^[a-f\d]{24}$/i.test(value);

export const idOrSlugFilter = (value) => (isObjectId(value) ? { _id: value } : { slug: String(value).toLowerCase() });

export function pick(source, fields) {
  const out = {};
  for (const field of fields) {
    if (source?.[field] !== undefined) out[field] = source[field];
  }
  return out;
}

export const slugify = (value) =>
  String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
