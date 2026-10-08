import Enquiry from '../models/Enquiry.js';
import ApiError from '../utils/ApiError.js';
import { asString, getPagination, getSort, paginationMeta, searchFilter } from '../utils/query.js';
import { sendSuccess } from '../utils/response.js';
import { auditAdmin } from '../utils/audit.js';
import { emailConfigured, escapeHtml, sendEmail } from '../utils/email.js';
import env from '../config/env.js';
import { buildPlannerQuote, plannerSelectionShape } from '../services/plannerService.js';

async function findEnquiry(id) {
  const enquiry = await Enquiry.findById(id);
  if (!enquiry) throw ApiError.notFound('Enquiry not found');
  return enquiry;
}

const PLANNER_FIELDS = Object.keys(plannerSelectionShape);

async function buildEnquiryData(req) {
  const data = { user: req.user?._id };
  for (const [key, value] of Object.entries(req.body)) {
    if (!PLANNER_FIELDS.includes(key)) data[key] = value;
  }
  if (data.source !== 'plan-your-trip') return data;

  const { selection, snapshot, quote } = await buildPlannerQuote(req.body);
  delete data.preferences;
  return {
    ...data,
    destination: snapshot.destination.name,
    travellers: selection.adults + selection.children,
    planner: { ...selection, snapshot, pricing: quote, estimatedAmount: quote.estimatedTotal, currency: quote.currency },
  };
}

const formatAmount = (amount, currency) => `${currency || 'INR'} ${Number(amount || 0).toLocaleString('en-IN')}`;

function enquiryNotification(enquiry) {
  const planner = enquiry.planner;
  const rows = [
    ['Name', enquiry.name],
    ['Email', enquiry.email],
    ['Phone', enquiry.phone],
    ['Source', enquiry.source],
    ['Destination', enquiry.destination || 'Custom'],
    ['Travel dates', enquiry.travelDates],
    ['Travellers', enquiry.travellers],
    ['Related page', enquiry.relatedSlug],
    ...(planner
      ? [
          ['Duration', planner.snapshot?.duration?.label],
          ['Estimate', formatAmount(planner.estimatedAmount, planner.currency)],
        ]
      : []),
  ].filter(([, value]) => value !== undefined && value !== null && value !== '');

  const message = enquiry.message || '';
  const text = [
    `New ${enquiry.source} enquiry received.`,
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
    ...(message ? ['', 'Message:', message] : []),
    '',
    'Reply to this email to respond to the customer directly.',
  ].join('\n');

  const html = `
    <p>New <strong>${escapeHtml(enquiry.source)}</strong> enquiry received.</p>
    <table cellpadding="6" style="border-collapse:collapse">
      ${rows
        .map(
          ([label, value]) =>
            `<tr><td style="color:#746d67;vertical-align:top">${escapeHtml(label)}</td><td>${escapeHtml(value)}</td></tr>`,
        )
        .join('')}
    </table>
    ${message ? `<p><strong>Message</strong></p><p style="white-space:pre-line">${escapeHtml(message)}</p>` : ''}
    <p style="color:#746d67">Reply to this email to respond to the customer directly.</p>`;

  return { text, html };
}

export async function createEnquiry(req, res) {
  const enquiry = await Enquiry.create(await buildEnquiryData(req));
  const planner = enquiry.planner;
  const notification = enquiryNotification(enquiry);

  const [, adminResult] = await Promise.allSettled([
    sendEmail({
      to: enquiry.email,
      subject: 'We received your UME Holidays enquiry',
      text: `Thank you ${enquiry.name}. Your UME Holidays enquiry has been received and our team will review it shortly.`,
      replyTo: env.email.to,
    }),
    env.email.to
      ? sendEmail({
          to: env.email.to,
          subject: `New UME Holidays enquiry from ${enquiry.name}`,
          replyTo: enquiry.email,
          ...notification,
        })
      : Promise.resolve(false),
  ]);

  if (emailConfigured && env.email.to && adminResult.status === 'fulfilled' && adminResult.value === false) {
    console.error(`[enquiry] saved enquiry ${enquiry.id} but the admin notification email was not sent`);
  }

  return sendSuccess(res, {
    status: 201,
    message: 'Thank you, your enquiry has been received',
    data: {
      id: enquiry.id,
      status: enquiry.status,
      createdAt: enquiry.createdAt,
      ...(planner ? { estimatedAmount: planner.estimatedAmount, currency: planner.currency } : {}),
    },
  });
}

export async function listMyEnquiries(req, res) {
  const enquiries = await Enquiry.find({ user: req.user._id }).select('-adminNotes').sort({ createdAt: -1 });
  return sendSuccess(res, { data: enquiries });
}

export async function listEnquiries(req, res) {
  const pagination = getPagination(req.query);
  const filter = { ...searchFilter(asString(req.query.q), ['name', 'email', 'phone', 'destination', 'message']) };

  const status = asString(req.query.status);
  if (status) filter.status = status;
  const source = asString(req.query.source);
  if (source) filter.source = source;

  const from = asString(req.query.from);
  const to = asString(req.query.to);
  if (from || to) {
    filter.createdAt = {};
    if (from && !Number.isNaN(new Date(from).getTime())) filter.createdAt.$gte = new Date(from);
    if (to && !Number.isNaN(new Date(to).getTime())) {
      const end = new Date(to);
      end.setUTCHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
    if (!Object.keys(filter.createdAt).length) delete filter.createdAt;
  }

  const sort = getSort(req.query, ['createdAt', 'status', 'name'], { createdAt: -1 });
  const [enquiries, total] = await Promise.all([
    Enquiry.find(filter).sort(sort).skip(pagination.skip).limit(pagination.limit).populate('user', 'name email'),
    Enquiry.countDocuments(filter),
  ]);

  return sendSuccess(res, { data: enquiries, meta: paginationMeta(pagination, total) });
}

export async function getEnquiry(req, res) {
  const enquiry = await findEnquiry(req.params.id);
  await enquiry.populate('user', 'name email phone');
  return sendSuccess(res, { data: enquiry });
}

export async function updateEnquiry(req, res) {
  const enquiry = await findEnquiry(req.params.id);
  enquiry.set(req.body);
  await enquiry.save();
  await auditAdmin(req, { action: req.body.status ? 'status-change' : 'update', module: 'enquiries', recordId: enquiry._id, meta: { fields: Object.keys(req.body) } });
  return sendSuccess(res, { message: 'Enquiry updated', data: enquiry });
}

export async function deleteEnquiry(req, res) {
  const enquiry = await findEnquiry(req.params.id);
  await enquiry.deleteOne();
  await auditAdmin(req, { action: 'delete', module: 'enquiries', recordId: enquiry._id });
  return sendSuccess(res, { message: 'Enquiry deleted' });
}
