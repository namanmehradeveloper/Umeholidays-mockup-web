import { Booking, Destination, Enquiry, Event, Experience, Story, Tour, User } from '../models/index.js';
import AdminRecord from '../models/AdminRecord.js';
import AuditLog from '../models/AuditLog.js';
import { sendSuccess } from '../utils/response.js';

const CONTENT_MODELS = { destinations: [Destination, 'heroImage'], tours: [Tour, 'image'], experiences: [Experience, 'image'], events: [Event, 'image'], stories: [Story, 'image'] };
const CMS_MODULES = ['banners', 'faqs', 'testimonials', 'moods', 'seasonal'];

const countBy = async (Model, field, filter = {}) => {
  const rows = await Model.aggregate([
    { $match: filter },
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
  ]);
  return Object.fromEntries(rows.map((row) => [row._id ?? 'unknown', row.count]));
};

const totalOf = (counts) => Object.values(counts).reduce((total, n) => total + Number(n || 0), 0);

const parseDate = (value, endOfDay = false) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  if (endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(String(value))) date.setUTCHours(23, 59, 59, 999);
  return date;
};

function dateFilter(from, to, field = 'createdAt') {
  const filter = {};
  const start = parseDate(from);
  const end = parseDate(to, true);
  if (start || end) filter[field] = {};
  if (start) filter[field].$gte = start;
  if (end) filter[field].$lte = end;
  if (!Object.keys(filter[field] || {}).length) delete filter[field];
  return filter;
}

function getRange(req) {
  const from = req.query.from ? String(req.query.from) : '';
  const to = req.query.to ? String(req.query.to) : '';
  return { from, to };
}

async function contentStats() {
  const entries = await Promise.all(
    Object.entries(CONTENT_MODELS).map(async ([key, [Model, imageField]]) => {
      const [total, published, missingImage, missingDescription, missingSeo] = await Promise.all([
        Model.countDocuments(),
        Model.countDocuments({ isPublished: true }),
        Model.countDocuments({ $or: [{ [imageField]: { $exists: false } }, { [imageField]: null }, { [imageField]: '' }] }),
        Model.countDocuments({ $or: [{ description: { $exists: false } }, { description: null }, { description: '' }] }),
        Model.countDocuments({ $or: [{ metaTitle: { $exists: false } }, { metaTitle: '' }, { metaDescription: { $exists: false } }, { metaDescription: '' }] }),
      ]);
      return [key, { total, published, drafts: total - published, missingImage, missingDescription, missingSeo }];
    }),
  );

  const cmsEntries = await Promise.all(
    CMS_MODULES.map(async (module) => {
      const [total, active] = await Promise.all([
        AdminRecord.countDocuments({ module }),
        AdminRecord.countDocuments({ module, status: 'active' }),
      ]);
      return [module, { total, active, inactive: total - active }];
    }),
  );

  return Object.fromEntries([...entries, ...cmsEntries]);
}

async function bookingMetrics(filter) {
  const [byStatus, byPayment, travellerAgg, amountAgg, daily] = await Promise.all([
    countBy(Booking, 'status', filter),
    countBy(Booking, 'paymentStatus', filter),
    Booking.aggregate([
      { $match: filter },
      { $group: { _id: null, travellers: { $sum: '$travellers' }, averageBookingValue: { $avg: '$totalAmount' } } },
    ]),
    Booking.aggregate([
      { $match: filter },
      { $group: {
        _id: null,
        gross: { $sum: '$totalAmount' },
        paid: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0] } },
        refunded: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'refunded'] }, '$totalAmount', 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, '$totalAmount', 0] } },
      } },
    ]),
    Booking.aggregate([
      { $match: filter },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Kolkata' } },
        bookings: { $sum: 1 },
        revenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0] } },
        travellers: { $sum: '$travellers' },
      } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return {
    total: totalOf(byStatus),
    byStatus,
    paymentStatus: byPayment,
    travellers: travellerAgg[0]?.travellers || 0,
    averageBookingValue: Math.round(totalOf(byStatus) ? Number(amountAgg[0]?.gross || 0) / totalOf(byStatus) : 0),
    revenue: {
      gross: amountAgg[0]?.gross || 0,
      successfulPayments: amountAgg[0]?.paid || 0,
      refunded: amountAgg[0]?.refunded || 0,
      cancelled: amountAgg[0]?.cancelled || 0,
      net: Math.max(0, (amountAgg[0]?.paid || 0) - (amountAgg[0]?.refunded || 0)),
    },
    trend: daily,
  };
}

async function topBookings(filter) {
  return Booking.aggregate([
    { $match: filter },
    { $group: {
      _id: '$tourSnapshot.title',
      bookings: { $sum: 1 },
      travellers: { $sum: '$travellers' },
      amount: { $sum: '$totalAmount' },
    } },
    { $sort: { bookings: -1, travellers: -1 } },
    { $limit: 8 },
  ]);
}

export async function getDashboard(_req, res) {
  const [usersByRole, activeUsers, content, enquiriesByStatus, bookings, recentEnquiries, recentBookings, recentUsers, recentActivity] =
    await Promise.all([
      countBy(User, 'role'),
      User.countDocuments({ isActive: true }),
      contentStats(),
      countBy(Enquiry, 'status'),
      bookingMetrics({}),
      Enquiry.find().sort({ createdAt: -1 }).limit(5).select('name email destination source status createdAt'),
      Booking.find().sort({ createdAt: -1 }).limit(5).select('tourSnapshot.title contact.name travelDate travellers totalAmount status paymentStatus createdAt'),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role isActive createdAt'),
      AuditLog.find().sort({ createdAt: -1 }).limit(8).populate('admin', 'name email'),
    ]);

  return sendSuccess(res, {
    data: {
      users: {
        total: totalOf(usersByRole),
        active: activeUsers,
        inactive: Math.max(0, totalOf(usersByRole) - activeUsers),
        byRole: usersByRole,
      },
      content,
      enquiries: { total: totalOf(enquiriesByStatus), byStatus: enquiriesByStatus },
      bookings,
      recent: { enquiries: recentEnquiries, bookings: recentBookings, users: recentUsers, activity: recentActivity },
    },
  });
}

export async function getAnalytics(req, res) {
  const { from, to } = getRange(req);
  const createdFilter = dateFilter(from, to);
  const [bookings, enquiryStatus, userRoles, userNew, topTours, content] = await Promise.all([
    bookingMetrics(createdFilter),
    countBy(Enquiry, 'status', createdFilter),
    countBy(User, 'role', createdFilter),
    User.countDocuments(createdFilter),
    topBookings(createdFilter),
    contentStats(),
  ]);

  const totalEnquiries = totalOf(enquiryStatus);
  const converted = Number(enquiryStatus.converted || 0);

  return sendSuccess(res, {
    data: {
      range: { from: from || null, to: to || null },
      bookings,
      enquiries: {
        total: totalEnquiries,
        byStatus: enquiryStatus,
        conversionRate: totalEnquiries ? Number(((converted / totalEnquiries) * 100).toFixed(2)) : 0,
      },
      users: { newUsers: userNew, byRole: userRoles },
      topTours,
      content,
    },
  });
}
