import { isAdmin } from '../middleware/auth.js';
import Offer, { OFFER_AVAILABILITY, OFFER_STATUSES, liveOfferFilter } from '../models/Offer.js';
import Tour from '../models/Tour.js';
import ApiError from '../utils/ApiError.js';
import { auditAdmin } from '../utils/audit.js';
import {
  asString,
  escapeRegex,
  getPagination,
  getSort,
  isObjectId,
  paginationMeta,
  searchFilter,
  slugify,
} from '../utils/query.js';
import { sendSuccess } from '../utils/response.js';

const DEFAULT_SORT = { featured: -1, sortOrder: 1, createdAt: -1 };
const SORT_FIELDS = ['sortOrder', 'title', 'originalPrice', 'startDate', 'endDate', 'createdAt', 'updatedAt', 'featured'];
const SEARCH_FIELDS = ['title', 'slug', 'subtitle', 'summary', 'destinations', 'duration'];
const PRIVATE_FIELDS = '-createdBy -updatedBy';
const TOUR_PREVIEW = 'title slug image duration price';

const combine = (conditions) => {
  const active = conditions.filter((c) => c && Object.keys(c).length);
  if (!active.length) return {};
  return active.length === 1 ? active[0] : { $and: active };
};

function availabilityFilter(value, now = new Date()) {
  switch (value) {
    case 'live':
      return liveOfferFilter(now);
    case 'scheduled':
      return { status: 'active', startDate: { $gt: now } };
    case 'expired':
      return { status: 'active', endDate: { $lt: now } };
    case 'inactive':
      return { status: 'inactive' };
    default:
      return {};
  }
}

const isMidnightUtc = (date) =>
  date.getUTCHours() === 0 && date.getUTCMinutes() === 0 && date.getUTCSeconds() === 0 && date.getUTCMilliseconds() === 0;

const cleanList = (items) => [...new Set(items.map((item) => String(item).trim()).filter(Boolean))];

async function uniqueSlug(source, excludeId) {
  const base = slugify(source).slice(0, 150) || 'offer';
  for (let attempt = 1; attempt < 1000; attempt += 1) {
    const candidate = attempt === 1 ? base : `${base}-${attempt}`;
    const filter = { slug: candidate };
    if (excludeId) filter._id = { $ne: excludeId };
    if (!(await Offer.exists(filter))) return candidate;
  }
  throw ApiError.conflict('Could not generate a unique slug, please enter one manually');
}

/** Normalises validated input into model values and checks cross-record constraints. */
async function prepareInput(body, { current } = {}) {
  const data = { ...body };

  for (const field of ['originalPrice', 'startDate', 'endDate', 'tour']) {
    if (data[field] === '') data[field] = null;
  }

  // A date-only end date ("2026-12-31") must include that whole day.
  if (data.endDate instanceof Date && isMidnightUtc(data.endDate)) {
    data.endDate = new Date(data.endDate.getTime() + 24 * 60 * 60 * 1000 - 1);
  }

  for (const field of ['highlights', 'destinations', 'gallery']) {
    if (Array.isArray(data[field])) data[field] = cleanList(data[field]);
  }

  if (data.tour && !(await Tour.exists({ _id: data.tour }))) {
    throw ApiError.badRequest('Linked tour does not exist');
  }

  if (data.slug === '' || (!current && data.slug === undefined)) {
    data.slug = await uniqueSlug(data.title || current?.title || '', current?._id);
  }

  return data;
}

async function findOfferById(id) {
  if (!isObjectId(id)) throw ApiError.notFound('Offer not found');
  const offer = await Offer.findById(id);
  if (!offer) throw ApiError.notFound('Offer not found');
  return offer;
}

async function nextSortOrder() {
  const last = await Offer.findOne().sort({ sortOrder: -1 }).select('sortOrder').lean();
  return (Number(last?.sortOrder) || 0) + 1;
}

/* -------------------------------- public ------------------------------- */

export async function listPublicOffers(req, res) {
  const pagination = getPagination(req.query);
  const conditions = [liveOfferFilter()];

  if (asString(req.query.featured) === 'true') conditions.push({ featured: true });

  const destination = asString(req.query.destination);
  if (destination) conditions.push({ destinations: new RegExp(`^${escapeRegex(destination)}$`, 'i') });

  const filter = combine(conditions);
  const [items, total] = await Promise.all([
    Offer.find(filter).select(PRIVATE_FIELDS).sort(DEFAULT_SORT).skip(pagination.skip).limit(pagination.limit),
    Offer.countDocuments(filter),
  ]);

  return sendSuccess(res, { data: items, meta: paginationMeta(pagination, total) });
}

export async function getOfferBySlug(req, res) {
  const slug = String(req.params.slug || '').toLowerCase();
  const filter = isAdmin(req.user) ? { slug } : combine([{ slug }, liveOfferFilter()]);

  const offer = await Offer.findOne(filter)
    .select(PRIVATE_FIELDS)
    .populate({ path: 'tour', select: TOUR_PREVIEW, match: isAdmin(req.user) ? {} : { isPublished: true } });
  if (!offer) throw ApiError.notFound('Offer not found');

  return sendSuccess(res, { data: offer });
}

/* -------------------------------- admin -------------------------------- */

export async function listOffers(req, res) {
  const pagination = getPagination(req.query);
  const conditions = [searchFilter(asString(req.query.q), SEARCH_FIELDS)];

  const status = asString(req.query.status);
  if (status && OFFER_STATUSES.includes(status)) conditions.push({ status });

  const featured = asString(req.query.featured);
  if (featured === 'true' || featured === 'false') conditions.push({ featured: featured === 'true' });

  const availability = asString(req.query.availability);
  if (availability && OFFER_AVAILABILITY.includes(availability)) conditions.push(availabilityFilter(availability));

  const filter = combine(conditions);
  const sort = getSort(req.query, SORT_FIELDS, DEFAULT_SORT);

  const [items, total] = await Promise.all([
    Offer.find(filter).sort(sort).skip(pagination.skip).limit(pagination.limit).populate('tour', 'title slug'),
    Offer.countDocuments(filter),
  ]);

  return sendSuccess(res, { data: items, meta: paginationMeta(pagination, total) });
}

export async function getOffer(req, res) {
  const offer = await findOfferById(req.params.id);
  await offer.populate('tour', TOUR_PREVIEW);
  return sendSuccess(res, { data: offer });
}

export async function createOffer(req, res) {
  const data = await prepareInput(req.body);
  if (data.sortOrder === undefined) data.sortOrder = await nextSortOrder();

  const offer = await Offer.create({ ...data, createdBy: req.user._id, updatedBy: req.user._id });
  await auditAdmin(req, { action: 'create', module: 'offer', recordId: offer._id });

  return sendSuccess(res, { status: 201, message: 'Offer created', data: offer });
}

export async function updateOffer(req, res) {
  const offer = await findOfferById(req.params.id);
  const data = await prepareInput(req.body, { current: offer });

  offer.set({ ...data, updatedBy: req.user._id });
  await offer.save();
  await auditAdmin(req, { action: 'update', module: 'offer', recordId: offer._id, meta: { fields: Object.keys(data) } });

  return sendSuccess(res, { message: 'Offer updated', data: offer });
}

export async function updateOfferStatus(req, res) {
  const offer = await findOfferById(req.params.id);

  offer.set({ ...req.body, updatedBy: req.user._id });
  await offer.save();
  await offer.populate('tour', 'title slug');

  const action = req.body.status ? (req.body.status === 'active' ? 'publish' : 'unpublish') : 'update';
  await auditAdmin(req, { action, module: 'offer', recordId: offer._id, meta: { fields: Object.keys(req.body) } });

  return sendSuccess(res, { message: 'Offer status updated', data: offer });
}

export async function deleteOffer(req, res) {
  const offer = await findOfferById(req.params.id);
  await offer.deleteOne();
  await auditAdmin(req, { action: 'delete', module: 'offer', recordId: offer._id, meta: { title: offer.title } });
  return sendSuccess(res, { message: 'Offer deleted' });
}
