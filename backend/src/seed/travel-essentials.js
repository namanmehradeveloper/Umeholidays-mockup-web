// One-time migration of the /travel-essentials page copy that used to be
// hardcoded in the frontend. Insert-only: existing records are never
// overwritten, so it is safe to re-run after admins have edited content.
import { connectDB, disconnectDB } from '../config/db.js';
import { AdminRecord } from '../models/index.js';

const sections = [
  {
    title: 'Travel Essentials Hero',
    data: {
      key: 'hero',
      eyebrow: 'Travel Essentials',
      title: 'Everything you need,',
      highlightedTitle: 'sorted',
      description: 'From local currency to comfortable rides, we take care of the essentials so you can focus on the journey.',
    },
  },
  {
    title: 'Services',
    data: {
      key: 'services',
      buttonLabel: 'Enquire Now',
      buttonUrl: '/contact',
    },
  },
];

const services = [
  {
    eyebrow: 'Money Matters',
    title: 'Currency Exchange',
    image: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=1200&q=80',
    description: 'Convert your currency to Indian Rupees at fair, transparent rates, delivered to your hotel or arranged on arrival.',
    features: [
      'Competitive, transparent exchange rates',
      'Major currencies accepted',
      'Doorstep delivery at your hotel',
      'Fully authorised and documented',
    ],
  },
  {
    eyebrow: 'Private Transfers',
    title: 'Chauffeur Driven Cars',
    image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80',
    description: 'Travel across Rajasthan in comfort with experienced, English-speaking chauffeurs who know every route.',
    features: [
      'Sedans, SUVs and luxury cars',
      'Airport, railway and hotel transfers',
      'Experienced local chauffeurs',
      'Clean, air-conditioned vehicles',
    ],
  },
  {
    eyebrow: 'Group Travel',
    title: 'Coaches & Tempo Travellers',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    description: 'Spacious vehicles for families, weddings and group tours, with comfortable seating for long desert drives.',
    features: [
      '9 to 45 seater options',
      'Push-back seats and ample luggage space',
      'Ideal for weddings and group tours',
      'Multi-city itineraries',
    ],
  },
];

async function seedSections() {
  let created = 0;
  for (const [index, section] of sections.entries()) {
    if (await AdminRecord.exists({ module: 'travel-essentials-sections', 'data.key': section.data.key })) continue;
    await AdminRecord.create({ module: 'travel-essentials-sections', title: section.title, status: 'active', sortOrder: index + 1, data: section.data });
    created += 1;
  }
  console.log(`[seed:travel-essentials] travel-essentials-sections: ${created} created`);
}

async function seedServices() {
  const module = 'travel-essentials-services';
  if (await AdminRecord.exists({ module })) {
    console.log(`[seed:travel-essentials] ${module}: already has records, skipped`);
    return;
  }
  await AdminRecord.insertMany(
    services.map((data, index) => ({ module, title: data.title, status: 'active', sortOrder: index + 1, data })),
  );
  console.log(`[seed:travel-essentials] ${module}: ${services.length} created`);
}

async function main() {
  await connectDB({ retry: false });
  await seedSections();
  await seedServices();
  console.log('[seed:travel-essentials] done');
}

main()
  .catch((error) => {
    console.error('[seed:travel-essentials] failed:', error);
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());
