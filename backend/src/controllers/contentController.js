import { isAdmin } from '../middleware/auth.js';
import Wishlist from '../models/Wishlist.js';
import ApiError from '../utils/ApiError.js';
import {
  asString,
  escapeRegex,
  getPagination,
  getSort,
  idOrSlugFilter,
  paginationMeta,
  pick,
  searchFilter,
} from '../utils/query.js';
import { sendSuccess } from '../utils/response.js';
import { auditAdmin } from '../utils/audit.js';

const ADMIN_ONLY_FIELDS = ['isPublished', 'featured'];

const combine = (conditions) => {
  const active = conditions.filter((c) => c && Object.keys(c).length);
  if (!active.length) return {};
  return active.length === 1 ? active[0] : { $and: active };
};

/**
 * Builds list/get/create/update/remove handlers for a publishable content model.
 *
 * @param {import('mongoose').Model} Model
 * @param {object} options
 * @param {string} options.label            Singular name used in messages.
 * @param {string[]} options.writableFields Fields accepted on create/update.
 * @param {string[]} options.searchFields   Fields matched by `?q=`.
 * @param {Record<string,string>} [options.filters]  Query param -> field (case-insensitive exact match).
 * @param {string[]} [options.ranges]       Numeric fields filterable with `?minX=&maxX=`.
 * @param {string[]} [options.sortFields]   Fields allowed in `?sort=`.
 * @param {object} [options.defaultSort]
 * @param {string} [options.ownerField]     Field holding the creator; owners may edit their own docs.
 * @param {string} [options.wishlistType]   Wishlist itemType to clean up on delete.
 */
export function createContentController(Model, options) {
  const {
    label,
    writableFields,
    searchFields,
    filters = {},
    ranges = [],
    sortFields = ['createdAt'],
    defaultSort = { createdAt: -1 },
    ownerField,
    wishlistType,
  } = options;

  const visibility = (user) => {
    if (isAdmin(user)) return {};
    if (ownerField && user) return { $or: [{ isPublished: true }, { [ownerField]: user._id }] };
    return { isPublished: true };
  };

  const sanitizeInput = (req, { isNew }) => {
    const data = pick(req.body, writableFields);
    if (!isAdmin(req.user)) {
      for (const field of ADMIN_ONLY_FIELDS) delete data[field];
      // Non-admin submissions (e.g. organiser events) need admin approval before going live.
      if (isNew) data.isPublished = false;
    }
    if (isNew && ownerField) data[ownerField] = req.user._id;
    return data;
  };

  const findEditable = async (req) => {
    const doc = await Model.findOne(idOrSlugFilter(req.params.idOrSlug));
    if (!doc) throw ApiError.notFound(`${label} not found`);
    if (!isAdmin(req.user)) {
      const ownerId = ownerField ? doc[ownerField]?.toString() : undefined;
      if (!ownerId || ownerId !== req.user.id) throw ApiError.forbidden();
    }
    return doc;
  };

  return {
    async list(req, res) {
      const pagination = getPagination(req.query);
      const conditions = [visibility(req.user), searchFilter(asString(req.query.q), searchFields)];

      for (const [param, field] of Object.entries(filters)) {
        const value = asString(req.query[param]);
        if (value) conditions.push({ [field]: new RegExp(`^${escapeRegex(value)}$`, 'i') });
      }

      for (const field of ranges) {
        const suffix = field.charAt(0).toUpperCase() + field.slice(1);
        const min = asString(req.query[`min${suffix}`]);
        const max = asString(req.query[`max${suffix}`]);
        const range = {};
        if (min && Number.isFinite(Number(min))) range.$gte = Number(min);
        if (max && Number.isFinite(Number(max))) range.$lte = Number(max);
        if (Object.keys(range).length) conditions.push({ [field]: range });
      }

      if (asString(req.query.featured) === 'true') conditions.push({ featured: true });

      const published = asString(req.query.published);
      if (isAdmin(req.user) && (published === 'true' || published === 'false')) {
        conditions.push({ isPublished: published === 'true' });
      }

      if (ownerField && asString(req.query.mine) === 'true') {
        if (!req.user) throw ApiError.unauthorized();
        conditions.push({ [ownerField]: req.user._id });
      }

      const filter = combine(conditions);
      const sort = getSort(req.query, sortFields, defaultSort);

      const [items, total] = await Promise.all([
        Model.find(filter).sort(sort).skip(pagination.skip).limit(pagination.limit),
        Model.countDocuments(filter),
      ]);

      return sendSuccess(res, { data: items, meta: paginationMeta(pagination, total) });
    },

    async getOne(req, res) {
      const doc = await Model.findOne(combine([idOrSlugFilter(req.params.idOrSlug), visibility(req.user)]));
      if (!doc) throw ApiError.notFound(`${label} not found`);
      return sendSuccess(res, { data: doc });
    },

    async create(req, res) {
      const doc = await Model.create(sanitizeInput(req, { isNew: true }));
      await auditAdmin(req, { action: 'create', module: label.toLowerCase(), recordId: doc._id });
      return sendSuccess(res, { status: 201, message: `${label} created`, data: doc });
    },

    async update(req, res) {
      const doc = await findEditable(req);
      const data = sanitizeInput(req, { isNew: false });
      if (!Object.keys(data).length) throw ApiError.badRequest('No valid fields provided');

      const previousSlug = doc.slug;
      doc.set(data);
      await doc.save();

      await auditAdmin(req, { action: Object.prototype.hasOwnProperty.call(data, 'isPublished') ? (data.isPublished ? 'publish' : 'unpublish') : 'update', module: label.toLowerCase(), recordId: doc._id, meta: { fields: Object.keys(data) } });

      if (wishlistType && previousSlug !== doc.slug) {
        await Wishlist.updateMany({ itemType: wishlistType, slug: previousSlug }, { slug: doc.slug });
      }

      return sendSuccess(res, { message: `${label} updated`, data: doc });
    },

    async remove(req, res) {
      const doc = await findEditable(req);
      await doc.deleteOne();
      await auditAdmin(req, { action: 'delete', module: label.toLowerCase(), recordId: doc._id });
      if (wishlistType) await Wishlist.deleteMany({ itemType: wishlistType, slug: doc.slug });
      return sendSuccess(res, { message: `${label} deleted` });
    },
  };
}
