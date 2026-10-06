import mongoose from 'mongoose';
import AdminRecord, { CMS_MODULES } from '../models/AdminRecord.js';
import { Destination, Experience, Tour } from '../models/index.js';
import { sendSuccess } from '../utils/response.js';
import ApiError from '../utils/ApiError.js';

const PUBLIC_MODULES = new Set(CMS_MODULES);

/** Planner steps may draw their choices from live content instead of duplicated strings. */
const OPTION_SOURCES = {
  // Same eligibility as /plan-your-trip, so "Enabled for planning" governs both planners.
  destinations: { Model: Destination, label: 'name', filter: { plannerEnabled: true } },
  tours: { Model: Tour, label: 'title' },
  experiences: { Model: Experience, label: 'title' },
};

const validIds = (values) =>
  (Array.isArray(values) ? values : [])
    .map(String)
    .filter((id) => mongoose.isValidObjectId(id));

/** Adds `data.destination` for records whose `data.destinationId` points to a published destination. */
async function resolveDestinations(records) {
  const ids = [...new Set(records.flatMap((record) => validIds([record.data?.destinationId])))];
  if (!ids.length) return records;

  const destinations = await Destination.find({ _id: { $in: ids }, isPublished: true })
    .select('slug name')
    .lean();
  const byId = new Map(destinations.map((doc) => [String(doc._id), doc]));

  return records.map((record) => {
    const destination = byId.get(String(record.data?.destinationId));
    return destination
      ? { ...record, data: { ...record.data, destination: { id: String(destination._id), slug: destination.slug, name: destination.name } } }
      : record;
  });
}

async function resolvePlannerSteps(records) {
  return Promise.all(
    records.map(async (record) => {
      const data = record.data || {};
      const source = OPTION_SOURCES[data.source];

      if (!source) {
        const choices = (Array.isArray(data.options) ? data.options : [])
          .map((option) => String(option ?? '').trim())
          .filter(Boolean)
          .map((label) => ({ value: label, label }));
        return { ...record, data: { ...data, choices } };
      }

      const optionIds = validIds(data.optionIds);
      const filter = { isPublished: true, ...source.filter };
      if (optionIds.length) filter._id = { $in: optionIds };

      const docs = await source.Model.find(filter).select(`${source.label} slug`).sort({ createdAt: 1 }).lean();
      const ordered = optionIds.length
        ? optionIds.map((id) => docs.find((doc) => String(doc._id) === id)).filter(Boolean)
        : docs;

      const choices = ordered
        .map((doc) => ({ id: String(doc._id), value: String(doc[source.label] || '').trim(), label: String(doc[source.label] || '').trim() }))
        .filter((choice) => choice.label);

      return { ...record, data: { ...data, choices } };
    }),
  );
}

export async function listPublicRecords(req, res) {
  const module = String(req.params.module || '')
    .trim()
    .toLowerCase();

  if (!PUBLIC_MODULES.has(module)) {
    throw ApiError.notFound('Public module not found');
  }

  const limit = Math.min(
    Math.max(Number(req.query.limit) || 100, 1),
    200,
  );

  let data = await AdminRecord.find({
    module,
    status: 'active',
  })
    .select(
      'module title status sortOrder data createdAt updatedAt',
    )
    .sort({ sortOrder: 1, createdAt: -1 })
    .limit(limit)
    .lean();

  if (module === 'map-locations') data = await resolveDestinations(data);
  if (module === 'trip-planner-steps') data = await resolvePlannerSteps(data);

  return sendSuccess(res, { data });
}
