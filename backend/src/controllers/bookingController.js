import { isAdmin } from '../middleware/auth.js';
import Booking from '../models/Booking.js';
import Tour from '../models/Tour.js';
import ApiError from '../utils/ApiError.js';

import {
  asString,
  getPagination,
  getSort,
  idOrSlugFilter,
  paginationMeta,
  searchFilter,
} from '../utils/query.js';

import { sendSuccess } from '../utils/response.js';
import { auditAdmin } from '../utils/audit.js';
import { sendEmail } from '../utils/email.js';

const CANCELLABLE = ['pending', 'confirmed'];

/* =========================================================
   HELPERS
========================================================= */

function normalizeTravelDate(value) {
  if (!value) {
    throw ApiError.badRequest('Travel date is required');
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw ApiError.badRequest('Travel date is invalid');
  }

  date.setUTCHours(0, 0, 0, 0);

  return date;
}

function normalizeTravellers(value) {
  const count = Number(value);

  if (!Number.isInteger(count) || count < 1) {
    throw ApiError.badRequest(
      'Travellers must be a positive integer'
    );
  }

  if (count > 50) {
    throw ApiError.badRequest(
      'Maximum 50 travellers are allowed per booking'
    );
  }

  return count;
}

function normalizeContact(req) {
  const body = req.body || {};

  const contactBody =
    body.contact && typeof body.contact === 'object'
      ? body.contact
      : {};

  const name = String(
    contactBody.name || req.user?.name || ''
  )
    .trim()
    .slice(0, 150);

  const email = String(
    contactBody.email || req.user?.email || ''
  )
    .trim()
    .toLowerCase()
    .slice(0, 200);

  const phone = String(
    contactBody.phone || req.user?.phone || ''
  )
    .trim()
    .slice(0, 30);

  if (!name) {
    throw ApiError.badRequest('Name is required');
  }

  if (!email) {
    throw ApiError.badRequest('Email is required');
  }

  if (!phone) {
    throw ApiError.badRequest('Phone number is required');
  }

  return {
    name,
    email,
    phone,
  };
}

/* =========================================================
   BOOKING ACCESS
========================================================= */

async function findAccessibleBooking(req) {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    throw ApiError.notFound('Booking not found');
  }

  if (
    !isAdmin(req.user) &&
    booking.user.toString() !== req.user.id
  ) {
    throw ApiError.notFound('Booking not found');
  }

  return booking;
}

/* =========================================================
   RESERVE TOUR SEATS
========================================================= */

/**
 * Atomically reserves seats.
 *
 * Important:
 * - Only published tours can be booked.
 * - If availableSeats is missing, totalSeats is used.
 * - Reservation succeeds only when enough seats exist.
 */
async function reserveTourSeats(tourId, travellers) {
  if (!tourId) {
    throw ApiError.badRequest('Tour is required');
  }

  const count = normalizeTravellers(travellers);

  const tour = await Tour.findOneAndUpdate(
    {
      _id: tourId,
      isPublished: true,
      $expr: {
        $gte: [
          {
            $ifNull: [
              '$availableSeats',
              '$totalSeats',
            ],
          },
          count,
        ],
      },
    },
    [
      {
        $set: {
          availableSeats: {
            $subtract: [
              {
                $ifNull: [
                  '$availableSeats',
                  '$totalSeats',
                ],
              },
              count,
            ],
          },
        },
      },
    ],
    {
      new: true,
      updatePipeline: true,
    }
  );

  if (!tour) {
    throw ApiError.conflict(
      'Not enough seats are available for this tour'
    );
  }

  return tour;
}

/* =========================================================
   RELEASE TOUR SEATS
========================================================= */

async function releaseTourSeats(tourId, travellers) {
  if (!tourId) {
    return;
  }

  const count = Number(travellers);

  if (!Number.isInteger(count) || count < 1) {
    return;
  }

  await Tour.findOneAndUpdate(
    {
      _id: tourId,
    },
    [
      {
        $set: {
          availableSeats: {
            $min: [
              {
                $add: [
                  {
                    $ifNull: [
                      '$availableSeats',
                      '$totalSeats',
                    ],
                  },
                  count,
                ],
              },
              '$totalSeats',
            ],
          },
        },
      },
    ],
    {
      new: true,
      updatePipeline: true,
    }
  );
}

/* =========================================================
   CREATE BOOKING
========================================================= */

export async function createBooking(req, res) {
  const body = req.body || {};

  const {
    tour: tourRef,
    specialRequests,
  } = body;

  if (!tourRef) {
    throw ApiError.badRequest(
      'Tour is required'
    );
  }

  const travelDate = normalizeTravelDate(
    body.travelDate
  );

  const count = normalizeTravellers(
    body.travellers
  );

  const tour = await Tour.findOne({
    ...idOrSlugFilter(tourRef),
    isPublished: true,
  });

  if (!tour) {
    throw ApiError.notFound(
      'Tour not found'
    );
  }

  const contact = normalizeContact(req);

  const activeKey =
    `${req.user._id}:${tour._id}:${travelDate
      .toISOString()
      .slice(0, 10)}`;

  /* -------------------------------------------------------
     DUPLICATE ACTIVE BOOKING CHECK
  ------------------------------------------------------- */

  const duplicate = await Booking.exists({
    activeKey,
  });

  if (duplicate) {
    throw ApiError.conflict(
      'You already have an active booking for this tour and travel date'
    );
  }

  /* -------------------------------------------------------
     RESERVE SEATS FIRST
  ------------------------------------------------------- */

  await reserveTourSeats(
    tour._id,
    count
  );

  try {
    /* -----------------------------------------------------
       CREATE BOOKING
    ----------------------------------------------------- */

    const booking = await Booking.create({
      user: req.user._id,

      tour: tour._id,

      tourSnapshot: {
        slug: tour.slug,
        title: tour.title,
        duration: tour.duration,
        image: tour.image,
      },

      travelDate,

      travellers: count,

      contact,

      pricePerPerson:
        Number(tour.price) || 0,

      totalAmount:
        (Number(tour.price) || 0) * count,

      specialRequests:
        typeof specialRequests === 'string'
          ? specialRequests
              .trim()
              .slice(0, 5000)
          : '',

      activeKey,
    });

    /* -----------------------------------------------------
       EMAIL
    ----------------------------------------------------- */

    try {
      await sendEmail({
        to: contact.email,

        subject:
          `UME Holidays booking request received — ${tour.title}`,

        text:
          `Your booking request for ${tour.title} has been received. ` +
          `Travel date: ${travelDate.toDateString()}. ` +
          `Travellers: ${count}. ` +
          `Booking ID: ${booking.id}.`,
      });
    } catch (emailError) {
      /*
       * Booking already succeeded.
       * Email failure must NOT turn a successful booking
       * into a 500 response.
       */
      console.error(
        '[booking] confirmation email failed:',
        emailError
      );
    }

    return sendSuccess(res, {
      status: 201,
      message: 'Booking request received',
      data: booking,
    });
  } catch (error) {
    /*
     * Booking creation failed after seats were reserved.
     * Release them so inventory remains correct.
     */
    try {
      await releaseTourSeats(
        tour._id,
        count
      );
    } catch (releaseError) {
      console.error(
        '[booking] failed to release reserved seats:',
        releaseError
      );
    }

    throw error;
  }
}

/* =========================================================
   MY BOOKINGS
========================================================= */

export async function listMyBookings(req, res) {
  const bookings = await Booking.find({
    user: req.user._id,
  }).sort({
    createdAt: -1,
  });

  return sendSuccess(res, {
    data: bookings,
  });
}

/* =========================================================
   GET SINGLE BOOKING
========================================================= */

export async function getBooking(req, res) {
  const booking =
    await findAccessibleBooking(req);

  if (isAdmin(req.user)) {
    await booking.populate(
      'user',
      'name email phone'
    );
  }

  return sendSuccess(res, {
    data: booking,
  });
}

/* =========================================================
   CANCEL BOOKING
========================================================= */

export async function cancelBooking(req, res) {
  const current =
    await findAccessibleBooking(req);

  if (!CANCELLABLE.includes(current.status)) {
    throw ApiError.badRequest(
      `A ${current.status} booking cannot be cancelled`
    );
  }

  if (
    !isAdmin(req.user) &&
    current.travelDate <= new Date()
  ) {
    throw ApiError.badRequest(
      'Bookings can only be cancelled before the travel date'
    );
  }

  const booking = await Booking.findOneAndUpdate(
    isAdmin(req.user)
      ? {
          _id: current._id,
          status: {
            $in: CANCELLABLE,
          },
        }
      : {
          _id: current._id,
          user: req.user._id,
          status: {
            $in: CANCELLABLE,
          },
        },
    {
      $set: {
        status: 'cancelled',

        cancelledAt: new Date(),

        cancelledBy:
          req.user._id,

        ...(typeof req.body?.reason === 'string'
          ? {
              cancellationReason: req.body.reason
                .trim()
                .slice(0, 1000),
            }
          : {}),
      },
      $unset: {
        activeKey: 1,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!booking) {
    throw ApiError.conflict(
      'Booking was already changed; please refresh and try again'
    );
  }

  await releaseTourSeats(
    booking.tour,
    booking.travellers
  );

  if (isAdmin(req.user)) {
    await auditAdmin(req, {
      action: 'cancel',
      module: 'bookings',
      recordId: booking._id,
    });
  }

  try {
    await sendEmail({
      to: booking.contact.email,

      subject:
        `UME Holidays booking cancelled — ${
          booking.tourSnapshot?.title ||
          'Tour'
        }`,

      text:
        `Your booking ${booking.id} has been cancelled.` +
        `${
          booking.cancellationReason
            ? ` Reason: ${booking.cancellationReason}`
            : ''
        }`,
    });
  } catch (emailError) {
    console.error(
      '[booking] cancellation email failed:',
      emailError
    );
  }

  return sendSuccess(res, {
    message: 'Booking cancelled',
    data: booking,
  });
}

/* =========================================================
   ADMIN - LIST BOOKINGS
========================================================= */

export async function listBookings(req, res) {
  const pagination =
    getPagination(req.query);

  const filter = {
    ...searchFilter(
      asString(req.query.q),
      [
        'contact.name',
        'contact.email',
        'contact.phone',
        'tourSnapshot.title',
      ]
    ),
  };

  /* -------------------------------------------------------
     STATUS
  ------------------------------------------------------- */

  const status =
    asString(req.query.status);

  if (status) {
    filter.status = status;
  }

  /* -------------------------------------------------------
     PAYMENT STATUS
  ------------------------------------------------------- */

  const paymentStatus =
    asString(req.query.paymentStatus);

  if (paymentStatus) {
    filter.paymentStatus =
      paymentStatus;
  }

  /* -------------------------------------------------------
     DATE RANGE
  ------------------------------------------------------- */

  const from =
    asString(req.query.from);

  const to =
    asString(req.query.to);

  if (from || to) {
    filter.travelDate = {};

    if (
      from &&
      !Number.isNaN(
        new Date(from).getTime()
      )
    ) {
      filter.travelDate.$gte =
        new Date(from);
    }

    if (
      to &&
      !Number.isNaN(
        new Date(to).getTime()
      )
    ) {
      const end =
        new Date(to);

      end.setUTCHours(
        23,
        59,
        59,
        999
      );

      filter.travelDate.$lte =
        end;
    }

    if (
      !Object.keys(
        filter.travelDate
      ).length
    ) {
      delete filter.travelDate;
    }
  }

  /* -------------------------------------------------------
     SORT
  ------------------------------------------------------- */

  const sort = getSort(
    req.query,
    [
      'createdAt',
      'travelDate',
      'totalAmount',
      'status',
    ],
    {
      createdAt: -1,
    }
  );

  /* -------------------------------------------------------
     QUERY
  ------------------------------------------------------- */

  const [
    bookings,
    total,
  ] = await Promise.all([
    Booking.find(filter)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate(
        'user',
        'name email'
      ),

    Booking.countDocuments(
      filter
    ),
  ]);

  return sendSuccess(res, {
    data: bookings,

    meta: paginationMeta(
      pagination,
      total
    ),
  });
}

/* =========================================================
   UPDATE BOOKING
========================================================= */

export async function updateBooking(
  req,
  res
) {
  const booking =
    await findAccessibleBooking(req);

  const allowed = [
    'status',
    'cancellationReason',
  ];

  const fields =
    Object.fromEntries(
      Object.entries(
        req.body || {}
      ).filter(
        ([key]) =>
          allowed.includes(key)
      )
    );

  if (!Object.keys(fields).length) {
    throw ApiError.badRequest(
      'No editable booking fields provided'
    );
  }

  const previousStatus =
    booking.status;

  const nextStatus =
    fields.status ||
    previousStatus;

  const wasActive =
    CANCELLABLE.includes(
      previousStatus
    );

  const willBeActive =
    CANCELLABLE.includes(
      nextStatus
    );

  const leavesActiveState =
    wasActive &&
    !willBeActive;

  const becomesCancelled =
    wasActive &&
    nextStatus === 'cancelled';

  const becomesActive =
    !wasActive &&
    willBeActive;

  const activeKey =
    `${booking.user}:${booking.tour}:${booking.travelDate
      .toISOString()
      .slice(0, 10)}`;

  /* -------------------------------------------------------
     RE-ACTIVATE BOOKING
  ------------------------------------------------------- */

  if (becomesActive) {
    /*
     * Prevent a duplicate active booking when an admin moves any inactive
     * booking (cancelled/completed) back to pending or confirmed.
     */

    const duplicate =
      await Booking.exists({
        activeKey,
        _id: {
          $ne: booking._id,
        },
      });

    if (duplicate) {
      throw ApiError.conflict(
        'Another active booking already exists for this tour and travel date'
      );
    }

    await reserveTourSeats(
      booking.tour,
      booking.travellers
    );

    booking.activeKey =
      activeKey;

    if (previousStatus === 'cancelled') {
      booking.cancelledAt = undefined;
      booking.cancelledBy = undefined;
      booking.cancellationReason = undefined;
    }
  }

  /* -------------------------------------------------------
     CANCEL
  ------------------------------------------------------- */

  if (leavesActiveState) {
    // `activeKey` exists only while a booking is pending/confirmed. Completed
    // bookings keep their consumed-seat history, but must not retain the
    // duplicate-active lock.
    booking.activeKey = undefined;
  }

  if (becomesCancelled) {
    booking.cancelledAt =
      new Date();

    booking.cancelledBy =
      req.user._id;

    booking.cancellationReason =
      fields.cancellationReason ||
      booking.cancellationReason;
  }

  booking.set(fields);

  try {
    await booking.save();
  } catch (error) {
    /*
     * If reactivation reserved seats but
     * booking save failed, restore seats.
     */
    if (becomesActive) {
      try {
        await releaseTourSeats(
          booking.tour,
          booking.travellers
        );
      } catch (releaseError) {
        console.error(
          '[booking] failed to rollback seats:',
          releaseError
        );
      }
    }

    throw error;
  }

  /* -------------------------------------------------------
     RELEASE SEATS AFTER CANCELLATION
  ------------------------------------------------------- */

  if (becomesCancelled) {
    await releaseTourSeats(
      booking.tour,
      booking.travellers
    );
  }

  /* -------------------------------------------------------
     AUDIT
  ------------------------------------------------------- */

  await auditAdmin(req, {
    action: fields.status
      ? 'status-change'
      : 'update',

    module: 'bookings',

    recordId:
      booking._id,

    meta: {
      fields:
        Object.keys(fields),
    },
  });

  /* -------------------------------------------------------
     CONFIRMATION EMAIL
  ------------------------------------------------------- */

  if (
    previousStatus !== 'confirmed' &&
    booking.status === 'confirmed'
  ) {
    try {
      await sendEmail({
        to: booking.contact.email,

        subject:
          `UME Holidays booking confirmed — ${
            booking.tourSnapshot?.title ||
            'Tour'
          }`,

        text:
          `Your UME Holidays booking ${booking.id} is confirmed. ` +
          `Travel date: ${new Date(
            booking.travelDate
          ).toDateString()}. ` +
          `Travellers: ${booking.travellers}.`,
      });
    } catch (emailError) {
      console.error(
        '[booking] confirmation email failed:',
        emailError
      );
    }
  }

  /* -------------------------------------------------------
     CANCELLATION EMAIL
  ------------------------------------------------------- */

  if (
    previousStatus !== 'cancelled' &&
    booking.status === 'cancelled'
  ) {
    try {
      await sendEmail({
        to: booking.contact.email,

        subject:
          `UME Holidays booking cancelled — ${
            booking.tourSnapshot?.title ||
            'Tour'
          }`,

        text:
          `Your booking ${booking.id} has been cancelled.` +
          `${
            booking.cancellationReason
              ? ` Reason: ${booking.cancellationReason}`
              : ''
          }`,
      });
    } catch (emailError) {
      console.error(
        '[booking] cancellation email failed:',
        emailError
      );
    }
  }

  return sendSuccess(res, {
    message: 'Booking updated',
    data: booking,
  });
}

/* =========================================================
   DELETE BOOKING
========================================================= */

export async function deleteBooking(
  _req,
  _res
) {
  throw ApiError.badRequest(
    'Historical bookings cannot be deleted; cancel them instead'
  );
}