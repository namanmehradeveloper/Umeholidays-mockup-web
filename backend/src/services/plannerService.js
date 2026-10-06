import Destination from '../models/Destination.js';
import PlannerOption from '../models/PlannerOption.js';
import PlannerSettings from '../models/PlannerSettings.js';
import ApiError from '../utils/ApiError.js';
import { isObjectId } from '../utils/query.js';

/** Request fields that reference single planner options, with the option type each must resolve to. */
const OPTION_FIELDS = [
  ['durationId', 'duration', 'Duration'],
  ['travelStyleId', 'travel-style', 'Travel style'],
  ['hotelId', 'hotel', 'Hotel'],
  ['transportId', 'transport', 'Transport'],
];

/** Shared `validate()` shape for a planner selection (used by /planner/calculate and /enquiries). */
export const plannerSelectionShape = {
  destinationId: { type: 'string', max: 24 },
  durationId: { type: 'string', max: 24 },
  travelStyleId: { type: 'string', max: 24 },
  hotelId: { type: 'string', max: 24 },
  transportId: { type: 'string', max: 24 },
  activityIds: { type: 'array', max: 30, items: { type: 'string', max: 24 } },
  adults: { type: 'integer', min: 1, max: 50 },
  children: { type: 'integer', min: 0, max: 50 },
};

export const destinationFilter = { isPublished: true, plannerEnabled: true };

export function activityFilterFor(destinationId) {
  return { type: 'activity', status: 'active', $or: [{ destinationIds: { $size: 0 } }, { destinationIds: destinationId }] };
}

const money = (value) => Math.max(0, Math.round(Number(value) || 0));
const roundUp = (value, step) => Math.ceil(value / step) * step;

function transportCost(transport, { days, travellers }) {
  switch (transport.pricingType) {
    case 'per_trip':
      return transport.price;
    case 'per_person':
      return transport.price * travellers;
    default:
      return transport.price * days;
  }
}

/**
 * Resolves a planner selection against the database and prices it. Every ID,
 * name and price comes from the database; nothing the browser sends about
 * names or amounts is trusted. Throws a 400 listing every invalid field.
 */
export async function buildPlannerQuote(input = {}) {
  const settings = await PlannerSettings.getSingleton();
  const { pricing, limits } = settings;
  const activitiesEnabled = settings.resolvedSteps().find((step) => step.key === 'activities')?.status === 'active';
  const errors = [];
  const fail = (field, message) => errors.push({ field, message });

  for (const field of ['destinationId', ...OPTION_FIELDS.map(([name]) => name)]) {
    if (!input[field]) fail(field, 'is required');
    else if (!isObjectId(input[field])) fail(field, 'is not a valid id');
  }

  const adults = Number(input.adults);
  const children = input.children === undefined ? 0 : Number(input.children);
  if (!Number.isInteger(adults) || adults < 1 || adults > limits.maxAdults) {
    fail('adults', `must be between 1 and ${limits.maxAdults}`);
  }
  if (!Number.isInteger(children) || children < 0 || children > limits.maxChildren) {
    fail('children', `must be between 0 and ${limits.maxChildren}`);
  }

  const requestedActivities = activitiesEnabled ? [...new Set((input.activityIds || []).map(String))] : [];
  if (requestedActivities.some((id) => !isObjectId(id))) fail('activityIds', 'contains an invalid id');

  if (errors.length) throw ApiError.badRequest('Invalid planner selection', errors);

  const optionIds = [...OPTION_FIELDS.map(([field]) => input[field]), ...requestedActivities];
  const [destination, options] = await Promise.all([
    Destination.findOne({ _id: input.destinationId, ...destinationFilter }).select('name slug plannerBasePrice').lean(),
    PlannerOption.find({ _id: { $in: optionIds }, status: 'active' }).lean(),
  ]);
  const byId = new Map(options.map((option) => [String(option._id), option]));

  if (!destination) fail('destinationId', 'is not available for planning');

  const resolved = {};
  for (const [field, type, label] of OPTION_FIELDS) {
    const option = byId.get(String(input[field]));
    if (!option || option.type !== type) fail(field, `${label} is not available`);
    else resolved[type] = option;
  }

  const activities = [];
  for (const id of requestedActivities) {
    const activity = byId.get(id);
    const offeredHere =
      activity?.type === 'activity' &&
      (!activity.destinationIds?.length || (destination && activity.destinationIds.some((d) => String(d) === String(destination._id))));
    if (!offeredHere) fail('activityIds', 'includes an activity that is not available for this destination');
    else activities.push(activity);
  }

  if (errors.length) throw ApiError.badRequest('Invalid planner selection', errors);

  const { duration, 'travel-style': travelStyle, hotel, transport } = resolved;
  const days = duration.days;
  const nights = duration.nights;
  const travellers = adults + children;
  const payingTravellers = adults + children * pricing.childRate;
  const rooms = Math.ceil(travellers / pricing.guestsPerRoom);

  const destinationCost = (destination.plannerBasePrice || 0) * days * payingTravellers;
  const hotelCost = hotel.pricePerNight * nights * rooms;
  const transportTotal = transportCost(transport, { days, travellers });
  const activitiesCost = activities.reduce((sum, activity) => sum + activity.pricePerPerson, 0) * payingTravellers;

  const subtotal = destinationCost + hotelCost + transportTotal + activitiesCost;
  const modifierPercent = (duration.priceModifier || 0) + (travelStyle.priceModifier || 0);
  const adjustments = (subtotal * modifierPercent) / 100;
  const taxes = ((subtotal + adjustments) * pricing.taxPercent) / 100;
  const estimatedTotal = money(roundUp(subtotal + adjustments + taxes, pricing.roundTo));

  const quote = {
    currency: pricing.currency,
    destination: money(destinationCost),
    hotel: money(hotelCost),
    transport: money(transportTotal),
    activities: money(activitiesCost),
    subtotal: money(subtotal),
    modifierPercent,
    adjustments: Math.round(adjustments),
    taxPercent: pricing.taxPercent,
    taxes: money(taxes),
    estimatedTotal,
    days,
    nights,
    rooms,
    travellers: { adults, children, total: travellers },
    disclaimer: pricing.disclaimer,
  };

  const ref = (doc, extra = {}) => ({ id: String(doc._id), name: doc.name, ...extra });
  const snapshot = {
    destination: ref(destination, { slug: destination.slug }),
    duration: { id: String(duration._id), label: duration.name, days, nights },
    travelStyle: ref(travelStyle),
    hotel: ref(hotel),
    transport: ref(transport, { pricingType: transport.pricingType }),
    activities: activities.map((activity) => ref(activity)),
    travellers: { adults, children },
  };

  const selection = {
    destinationId: destination._id,
    durationId: duration._id,
    travelStyleId: travelStyle._id,
    hotelId: hotel._id,
    transportId: transport._id,
    activityIds: activities.map((activity) => activity._id),
    adults,
    children,
  };

  return { selection, snapshot, quote };
}
