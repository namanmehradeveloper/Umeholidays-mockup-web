// One-time migration of the /search page copy that used to be hardcoded in the
// frontend. Insert-only: existing records are never overwritten, so it is safe
// to re-run after admins have edited content.
import { connectDB, disconnectDB } from '../config/db.js';
import { AdminRecord } from '../models/index.js';

const sections = [
  {
    title: 'Search Hero',
    data: {
      key: 'hero',
      eyebrow: 'Explore UME Holidays',
      title: 'Where would you like\nto go next?',
      description: 'Search destinations, curated tours, experiences, travel stories and events across Rajasthan.',
      popularLabel: 'Popular',
      popularSource: 'custom',
      popularLimit: 5,
    },
  },
  {
    title: 'Search Box & Results',
    data: {
      key: 'results',
      placeholder: 'Search Jaipur, desert, heritage...',
      submitLabel: 'Search',
      loadingLabel: 'Searching for',
      resultsHeading: 'Search results',
      resultSingular: 'result',
      resultPlural: 'results',
      emptyTitle: 'No matching results.',
      emptyMessage: 'Try another destination, journey, experience, story or event.',
      errorMessage: 'Search could not be completed. Please try again.',
      destinationsLabel: 'Destinations',
      toursLabel: 'Tours',
      experiencesLabel: 'Experiences',
      storiesLabel: 'Stories',
      eventsLabel: 'Events',
    },
  },
  {
    title: 'Search Categories',
    data: {
      key: 'categories',
      eyebrow: 'Start exploring',
      title: 'What can you discover?',
      description: 'Search directly above or explore one of our main travel categories.',
      itemCtaLabel: 'Explore',
    },
  },
  {
    title: 'Search CTA',
    data: {
      key: 'cta',
      title: 'Not sure what to search?',
      description: 'Tell us what kind of journey you are looking for and we will help you plan it.',
      buttonLabel: 'Plan your trip',
      buttonUrl: '/plan-your-trip',
    },
  },
];

const categories = [
  { title: 'Destinations', description: 'Explore cities, heritage places and distinctive locations.', url: '/destinations', icon: 'map-pin' },
  { title: 'Tours', description: 'Find curated Rajasthan journeys and ready travel plans.', url: '/tours', icon: 'compass' },
  { title: 'Experiences', description: 'Discover culture, food, wildlife and local experiences.', url: '/experiences', icon: 'sparkles' },
  { title: 'Stories & Events', description: 'Read travel stories and discover upcoming events.', url: '/stories', icon: 'landmark' },
];

const popular = ['Jaipur', 'Udaipur', 'Jaisalmer', 'Jodhpur', 'Pushkar'];

async function seedSections() {
  let created = 0;
  for (const [index, section] of sections.entries()) {
    if (await AdminRecord.exists({ module: 'search-sections', 'data.key': section.data.key })) continue;
    await AdminRecord.create({ module: 'search-sections', title: section.title, status: 'active', sortOrder: index + 1, data: section.data });
    created += 1;
  }
  console.log(`[seed:search] search-sections: ${created} created`);
}

async function seedList(module, records) {
  if (await AdminRecord.exists({ module })) {
    console.log(`[seed:search] ${module}: already has records, skipped`);
    return;
  }
  await AdminRecord.insertMany(records.map((record, index) => ({ ...record, module, status: 'active', sortOrder: index + 1 })));
  console.log(`[seed:search] ${module}: ${records.length} created`);
}

async function main() {
  await connectDB({ retry: false });
  await seedSections();
  await seedList('search-categories', categories.map((data) => ({ title: data.title, data })));
  await seedList('search-popular', popular.map((term) => ({ title: term, data: { term } })));
  console.log('[seed:search] done');
}

main()
  .catch((error) => {
    console.error('[seed:search] failed:', error);
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());
