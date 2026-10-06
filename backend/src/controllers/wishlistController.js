import { Destination, Event, Experience, Story, Tour, Wishlist } from '../models/index.js';
import ApiError from '../utils/ApiError.js';
import { sendSuccess } from '../utils/response.js';

const SOURCES = {
  tour: { Model: Tour, select: 'slug title image price duration' },
  destination: { Model: Destination, select: 'slug name heroImage region' },
  experience: { Model: Experience, select: 'slug title image location' },
  event: { Model: Event, select: 'slug title image location date' },
  story: { Model: Story, select: 'slug title image excerpt' },
};

/** Returns the user's wishlist with a summary of each saved item; unpublished/removed items are dropped. */
async function loadWishlist(userId) {
  const entries = await Wishlist.find({ user: userId }).sort({ createdAt: -1 });

  const slugsByType = {};
  for (const entry of entries) (slugsByType[entry.itemType] ||= []).push(entry.slug);

  const itemsByKey = new Map();
  await Promise.all(
    Object.entries(slugsByType).map(async ([type, slugs]) => {
      const { Model, select } = SOURCES[type];
      const docs = await Model.find({ slug: { $in: slugs }, isPublished: true }).select(select);
      for (const doc of docs) itemsByKey.set(`${type}:${doc.slug}`, doc);
    }),
  );

  return entries
    .filter((entry) => itemsByKey.has(`${entry.itemType}:${entry.slug}`))
    .map((entry) => ({
      id: entry.id,
      itemType: entry.itemType,
      slug: entry.slug,
      createdAt: entry.createdAt,
      item: itemsByKey.get(`${entry.itemType}:${entry.slug}`),
    }));
}

async function assertItemExists(itemType, slug) {
  const { Model } = SOURCES[itemType];
  if (!(await Model.exists({ slug, isPublished: true }))) {
    throw ApiError.notFound(`${itemType} "${slug}" not found`);
  }
}

const upsertEntry = (user, itemType, slug) =>
  Wishlist.updateOne({ user, itemType, slug }, { $setOnInsert: { user, itemType, slug } }, { upsert: true });

export async function getWishlist(req, res) {
  return sendSuccess(res, { data: await loadWishlist(req.user._id) });
}

export async function addToWishlist(req, res) {
  const { itemType, slug } = req.body;
  await assertItemExists(itemType, slug);
  await upsertEntry(req.user._id, itemType, slug);
  return sendSuccess(res, { status: 201, message: 'Saved to wishlist', data: await loadWishlist(req.user._id) });
}

/** Merges items saved anonymously (e.g. browser localStorage) into the account; unknown items are skipped. */
export async function syncWishlist(req, res) {
  const unique = new Map(req.body.items.map((item) => [`${item.itemType}:${item.slug.toLowerCase()}`, item]));

  await Promise.all(
    [...unique.values()].map(async ({ itemType, slug }) => {
      const normalized = slug.toLowerCase();
      if (await SOURCES[itemType].Model.exists({ slug: normalized, isPublished: true })) {
        await upsertEntry(req.user._id, itemType, normalized);
      }
    }),
  );

  return sendSuccess(res, { message: 'Wishlist synced', data: await loadWishlist(req.user._id) });
}

export async function removeFromWishlist(req, res) {
  const { itemType, slug } = req.params;
  if (!SOURCES[itemType]) throw ApiError.badRequest(`Unknown item type: ${itemType}`);

  const { deletedCount } = await Wishlist.deleteOne({ user: req.user._id, itemType, slug: slug.toLowerCase() });
  if (!deletedCount) throw ApiError.notFound('Item is not in your wishlist');

  return sendSuccess(res, { message: 'Removed from wishlist', data: await loadWishlist(req.user._id) });
}

export async function clearWishlist(req, res) {
  await Wishlist.deleteMany({ user: req.user._id });
  return sendSuccess(res, { message: 'Wishlist cleared', data: [] });
}
