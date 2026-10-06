import mongoose from 'mongoose';
import Destination from '../models/Destination.js';
import PlannerOption, { PLANNER_TYPE_FIELDS } from '../models/PlannerOption.js';
import PlannerSettings, { OPTIONAL_PLANNER_STEPS, PLANNER_STEP_KEYS } from '../models/PlannerSettings.js';
import { activityFilterFor, buildPlannerQuote, destinationFilter } from '../services/plannerService.js';
import ApiError from '../utils/ApiError.js';
import { auditAdmin } from '../utils/audit.js';
import { asString, isObjectId, pick } from '../utils/query.js';
import { sendSuccess } from '../utils/response.js';

/** URL segment -> PlannerOption.type */
export const PLANNER_OPTION_ROUTES = {
  durations: 'duration',
  'travel-styles': 'travel-style',
  hotels: 'hotel',
  transports: 'transport',
  activities: 'activity',
};

const BASE_FIELDS = ['name', 'description', 'status', 'sortOrder'];
const OPTION_SORT = { sortOrder: 1, createdAt: 1 };

function resolveType(segment) {
  const type = PLANNER_OPTION_ROUTES[segment];
  if (!type) throw ApiError.notFound('Planner option type not found');
  return type;
}

/** Public shape: only the fields a visitor needs to choose. Prices stay on the server. */
function toPublicOption(option) {
  const out = { id: String(option._id), name: option.name, description: option.description || '', sortOrder: option.sortOrder };
  if (option.type === 'duration') Object.assign(out, { label: option.name, days: option.days, nights: option.nights });
  if (option.icon && PLANNER_TYPE_FIELDS[option.type].includes('icon')) out.icon = option.icon;
  if (option.image && PLANNER_TYPE_FIELDS[option.type].includes('image')) out.image = option.image;
  return out;
}

function toPublicDestination(destination) {
  return {
    id: String(destination._id),
    name: destination.name,
    slug: destination.slug,
    region: destination.region,
    image: destination.heroImage,
    shortDescription: destination.tagline || '',
    sortOrder: destination.plannerSortOrder || 0,
  };
}

function publicSettings(settings) {
  const doc = settings.toObject();
  return {
    builder: doc.builder,
    summary: doc.summary,
    labels: doc.labels,
    success: doc.success,
    page: doc.page,
    steps: settings.resolvedSteps().filter((step) => step.status === 'active'),
    limits: doc.limits,
    pricing: { currency: doc.pricing.currency, disclaimer: doc.pricing.disclaimer },
  };
}

/* ------------------------------- public ------------------------------- */

export async function getPlannerSettings(_req, res) {
  const settings = await PlannerSettings.getSingleton();
  return sendSuccess(res, { data: publicSettings(settings) });
}

export async function listPlannerDestinations(_req, res) {
  const destinations = await Destination.find(destinationFilter)
    .select('name slug region heroImage tagline plannerSortOrder')
    .sort({ plannerSortOrder: 1, name: 1 })
    .lean();
  return sendSuccess(res, { data: destinations.map(toPublicDestination) });
}

export async function listPlannerOptions(req, res) {
  const type = resolveType(req.params.type);
  let filter = { type, status: 'active' };

  if (type === 'activity') {
    const destinationId = asString(req.query.destinationId);
    if (!destinationId) throw ApiError.badRequest('destinationId is required to list activities');
    if (!isObjectId(destinationId)) throw ApiError.badRequest('destinationId is not a valid id');
    if (!(await Destination.exists({ _id: destinationId, ...destinationFilter }))) {
      throw ApiError.notFound('Destination is not available for planning');
    }
    filter = activityFilterFor(new mongoose.Types.ObjectId(destinationId));
  }

  const options = await PlannerOption.find(filter).sort(OPTION_SORT).lean();
  return sendSuccess(res, { data: options.map(toPublicOption) });
}

export async function calculatePlannerQuote(req, res) {
  const { snapshot, quote } = await buildPlannerQuote(req.body);
  return sendSuccess(res, { data: { ...quote, snapshot } });
}

/* -------------------------------- admin ------------------------------- */

function sanitizeOptionInput(type, body) {
  const data = pick(body, [...BASE_FIELDS, ...PLANNER_TYPE_FIELDS[type]]);
  if (data.destinationIds !== undefined) {
    const ids = [...new Set(data.destinationIds.map(String))];
    if (ids.some((id) => !isObjectId(id))) throw ApiError.badRequest('destinationIds contains an invalid id');
    data.destinationIds = ids;
  }
  return data;
}

async function assertDestinationsExist(ids) {
  if (!ids?.length) return;
  const count = await Destination.countDocuments({ _id: { $in: ids } });
  if (count !== ids.length) throw ApiError.badRequest('destinationIds references a destination that does not exist');
}

async function findOption(type, id) {
  if (!isObjectId(id)) throw ApiError.notFound('Planner option not found');
  const option = await PlannerOption.findOne({ _id: id, type });
  if (!option) throw ApiError.notFound('Planner option not found');
  return option;
}

export async function adminListOptions(req, res) {
  const type = resolveType(req.params.type);
  const options = await PlannerOption.find({ type }).sort(OPTION_SORT).populate('destinationIds', 'name slug');
  return sendSuccess(res, { data: options });
}

export async function adminCreateOption(req, res) {
  const type = resolveType(req.params.type);
  const data = sanitizeOptionInput(type, req.body);
  await assertDestinationsExist(data.destinationIds);
  if (data.sortOrder === undefined) {
    const last = await PlannerOption.findOne({ type }).sort({ sortOrder: -1 }).select('sortOrder').lean();
    data.sortOrder = (Number(last?.sortOrder) || 0) + 1;
  }
  const option = await PlannerOption.create({ ...data, type });
  await auditAdmin(req, { action: 'create', module: `planner-${type}`, recordId: option._id });
  return sendSuccess(res, { status: 201, message: 'Planner option created', data: option });
}

export async function adminUpdateOption(req, res) {
  const type = resolveType(req.params.type);
  const option = await findOption(type, req.params.id);
  const data = sanitizeOptionInput(type, req.body);
  if (!Object.keys(data).length) throw ApiError.badRequest('No valid fields provided');
  await assertDestinationsExist(data.destinationIds);
  option.set(data);
  await option.save();
  await auditAdmin(req, { action: data.status ? 'status-change' : 'update', module: `planner-${type}`, recordId: option._id, meta: { fields: Object.keys(data) } });
  return sendSuccess(res, { message: 'Planner option updated', data: option });
}

export async function adminDeleteOption(req, res) {
  const type = resolveType(req.params.type);
  const option = await findOption(type, req.params.id);
  await option.deleteOne();
  await auditAdmin(req, { action: 'delete', module: `planner-${type}`, recordId: option._id });
  return sendSuccess(res, { message: 'Planner option deleted' });
}

export async function adminReorderOptions(req, res) {
  const type = resolveType(req.params.type);
  const ids = req.body.ids.map(String);
  if (ids.some((id) => !isObjectId(id))) throw ApiError.badRequest('ids must be planner option ids');
  await PlannerOption.bulkWrite(
    ids.map((id, index) => ({ updateOne: { filter: { _id: id, type }, update: { $set: { sortOrder: index + 1 } } } })),
  );
  await auditAdmin(req, { action: 'update', module: `planner-${type}`, meta: { reordered: ids.length } });
  return sendSuccess(res, { message: 'Order updated' });
}

export async function adminGetSettings(_req, res) {
  const settings = await PlannerSettings.getSingleton();
  return sendSuccess(res, { data: { ...settings.toObject(), steps: settings.resolvedSteps() } });
}

const SETTINGS_SECTIONS = ['builder', 'summary', 'labels', 'success', 'page', 'pricing', 'limits'];

function normalizeSettingValue(path, value) {
  if (path === 'page.trustPoints' && Array.isArray(value)) return value.map((item) => String(item ?? '').trim()).filter(Boolean);
  if (path === 'page.howItWorks' && Array.isArray(value)) {
    return value
      .map((row) => ({ title: String(row?.title ?? '').trim(), text: String(row?.text ?? '').trim() }))
      .filter((row) => row.title || row.text);
  }
  return value;
}

export async function adminUpdateSettings(req, res) {
  const settings = await PlannerSettings.getSingleton();
  const body = req.body || {};
  const changed = [];

  for (const section of SETTINGS_SECTIONS) {
    const value = body[section];
    if (value === undefined) continue;
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw ApiError.badRequest(`${section} must be an object`);
    for (const [key, fieldValue] of Object.entries(value)) {
      const path = `${section}.${key}`;
      if (settings.schema.path(path)) settings.set(path, normalizeSettingValue(path, fieldValue));
    }
    changed.push(section);
  }

  if (body.steps !== undefined) {
    if (!Array.isArray(body.steps)) throw ApiError.badRequest('steps must be an array');
    const incoming = new Map(body.steps.filter((step) => PLANNER_STEP_KEYS.includes(step?.key)).map((step) => [step.key, step]));
    settings.steps = settings.resolvedSteps().map((current) => {
      const next = { ...current, ...pick(incoming.get(current.key) || {}, ['eyebrow', 'title', 'description', 'summaryLabel', 'emptyMessage', 'status']) };
      if (!OPTIONAL_PLANNER_STEPS.includes(current.key)) next.status = 'active';
      return next;
    });
    changed.push('steps');
  }

  if (!changed.length) throw ApiError.badRequest('No valid fields provided');
  await settings.save();
  await auditAdmin(req, { action: 'update', module: 'planner-settings', recordId: settings._id, meta: { fields: changed } });
  return sendSuccess(res, { message: 'Planner settings updated', data: { ...settings.toObject(), steps: settings.resolvedSteps() } });
}
