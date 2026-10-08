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

const NOT_SPECIFIED = 'Not specified';
const REPLY_NOTE = 'Reply to this email to respond to the customer directly.';

const hasValue = (value) => value !== undefined && value !== null && String(value).trim() !== '';

const formatSource = (source) =>
  String(source || 'other')
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

/** Trip-planner answers live in `preferences`; plan-your-trip details are resolved server-side into `planner`. */
function enquiryDetails(enquiry) {
  const preferences = enquiry.preferences && typeof enquiry.preferences === 'object' ? enquiry.preferences : {};
  const planner = enquiry.planner;
  const pick = (...values) => values.find(hasValue);

  return {
    travelStyle: pick(preferences.style, preferences.travelStyle, planner?.snapshot?.travelStyle?.name),
    duration: pick(preferences.duration, planner?.snapshot?.duration?.label),
    budget: pick(
      preferences.budget,
      planner ? `${formatAmount(planner.estimatedAmount, planner.currency)} (estimated)` : undefined,
    ),
  };
}

function enquiryNotification(enquiry) {
  const { travelStyle, duration, budget } = enquiryDetails(enquiry);
  const email = enquiry.email || '';
  const phone = enquiry.phone || '';

  const rows = [
    { label: 'Name', value: enquiry.name },
    { label: 'Email', value: email, href: email ? `mailto:${email}` : undefined },
    { label: 'Phone', value: phone, href: phone ? `tel:+91${phone}` : undefined },
    { label: 'Source', value: formatSource(enquiry.source) },
    { label: 'Destination', value: enquiry.destination || 'Custom' },
    { label: 'Travel Style', value: travelStyle },
    { label: 'Duration', value: duration },
    { label: 'Budget', value: budget },
    ...[
      { label: 'Travel Dates', value: enquiry.travelDates },
      { label: 'Travellers', value: enquiry.travellers },
      { label: 'Related Page', value: enquiry.relatedSlug },
    ].filter((row) => hasValue(row.value)),
  ];

  const message = (enquiry.message || '').trim();
  const year = new Date().getFullYear();

  const text = [
    `New ${formatSource(enquiry.source)} enquiry - UME Holidays`,
    '',
    ...rows.map((row) => `${row.label}: ${hasValue(row.value) ? row.value : NOT_SPECIFIED}`),
    '',
    'Message:',
    message || 'No message provided.',
    '',
    REPLY_NOTE,
    '',
    '--',
    'UME Holidays',
    'Thoughtful journeys across Rajasthan',
    env.appUrl,
  ].join('\n');

  const cell = 'padding:12px 16px;border-bottom:1px solid #f0ebe6;font-size:14px;line-height:20px;vertical-align:top;';
  const link = 'color:#b76b43;text-decoration:none;';

  const tableRows = rows
    .map(({ label, value, href }, index) => {
      const background = index % 2 === 0 ? '#ffffff' : '#fbf9f7';
      let content = `<span style="color:#a39b94;">${NOT_SPECIFIED}</span>`;
      if (hasValue(value)) {
        content = href
          ? `<a href="${escapeHtml(href)}" style="${link}">${escapeHtml(value)}</a>`
          : escapeHtml(value);
      }

      return `<tr>
              <td width="34%" style="${cell}background:${background};color:#746d67;font-weight:600;white-space:nowrap;">${escapeHtml(label)}</td>
              <td style="${cell}background:${background};color:#1b1917;">${content}</td>
            </tr>`;
    })
    .join('');

  const messageHtml = message
    ? escapeHtml(message).replace(/\r?\n/g, '<br>')
    : '<span style="color:#a39b94;">No message provided.</span>';

  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>New UME Holidays enquiry</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f2ee;font-family:Arial,Helvetica,sans-serif;color:#1b1917;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f6f2ee;">
      <tr>
        <td align="center" style="padding:32px 12px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border:1px solid #ece7e2;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:#1b1917;padding:24px 28px;">
                <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:28px;color:#ffffff;">UME Holidays</p>
                <p style="margin:6px 0 0;font-size:11px;line-height:16px;letter-spacing:2px;text-transform:uppercase;color:#e8b08f;">New ${escapeHtml(formatSource(enquiry.source))} enquiry</p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px 8px;">
                <p style="margin:0;font-size:15px;line-height:22px;color:#3f3a36;">You have received a new enquiry from <strong>${escapeHtml(enquiry.name)}</strong>.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #ece7e2;border-collapse:separate;border-radius:8px;overflow:hidden;">
                  ${tableRows}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 28px 16px;">
                <p style="margin:0 0 8px;font-size:11px;line-height:16px;letter-spacing:2px;text-transform:uppercase;font-weight:700;color:#b76b43;">Message</p>
                <div style="background:#faf6f2;border-left:3px solid #b76b43;border-radius:6px;padding:14px 16px;font-size:14px;line-height:22px;color:#3f3a36;">${messageHtml}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 28px 28px;">
                <p style="margin:0;padding:12px 16px;background:#fff8f3;border:1px solid #f1dfd2;border-radius:6px;font-size:13px;line-height:20px;color:#9d5735;">${REPLY_NOTE}</p>
              </td>
            </tr>
            <tr>
              <td style="background:#faf8f5;border-top:1px solid #ece7e2;padding:20px 28px;text-align:center;">
                <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:16px;line-height:22px;color:#1b1917;">UME Holidays</p>
                <p style="margin:4px 0 0;font-size:12px;line-height:18px;color:#8a837c;">Thoughtful journeys across Rajasthan</p>
                <p style="margin:8px 0 0;font-size:12px;line-height:18px;"><a href="${escapeHtml(env.appUrl)}" style="${link}">${escapeHtml(env.appUrl.replace(/^https?:\/\//, ''))}</a></p>
                <p style="margin:8px 0 0;font-size:11px;line-height:16px;color:#a39b94;">&copy; ${year} UME Holidays. This notification was sent from your website enquiry form.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

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
