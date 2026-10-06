// One-time migration of the home page copy that used to be hardcoded in the
// frontend. Insert-only: existing sections/items are never overwritten, so it
// is safe to re-run after admins have edited content.
import { connectDB, disconnectDB } from '../config/db.js';
import { AdminRecord, Destination } from '../models/index.js';
import { CMS_MODULES } from '../models/AdminRecord.js';

const sections = [
  {
    title: 'Hero',
    data: {
      key: 'hero',
      title: 'Featured Rajasthan destinations',
      topLabel: 'Rajasthan · India',
      brandLabel: 'UME Holidays',
      primaryCtaLabel: 'Explore journeys',
      primaryCtaUrl: '/tours',
      secondaryCtaLabel: 'Plan your trip',
      slideCountLabel: 'places',
    },
  },
  {
    title: 'Trip Planner',
    data: {
      key: 'trip-planner',
      eyebrow: 'Plan My Trip',
      contactStepTitle: 'Tell us about you',
      namePlaceholder: 'Full name',
      emailPlaceholder: 'Email',
      phonePlaceholder: 'Phone / WhatsApp',
      backLabel: 'Back',
      submitLabel: 'Send my trip request',
      submittingLabel: 'Sending…',
      validationMessage: 'Please enter your name, email and phone.',
      successEyebrow: 'Request received',
      successTitle: 'We’ll shape the journey with you.',
      successMessage: 'Your request has been sent to the UME Holidays team. We’ll contact you using the details provided.',
      resetLabel: 'Plan another journey',
    },
  },
  {
    title: 'Destinations',
    data: {
      key: 'destinations',
      eyebrow: 'Where To Go · Padharo Mhare Desh',
      title: 'Rajasthan, with Room to Wander',
      description: 'From royal palace cities to the golden sands of the Thar desert, build a regal route around the places that pull you in.',
    },
  },
  {
    title: 'Story / About',
    data: {
      key: 'story',
      eyebrow: 'The Royal Rajasthan Story',
      title: 'Not Just Places. The Details Between Them.',
      description: 'A good journey leaves space for the unexpected: a royal palace kitchen, a heritage block-printing workshop, or a fort glowing at golden hour. Umeholidays is built around those moments.',
      image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1400&q=85',
      imageAlt: 'Rajasthan palace architecture',
      imageBadge: 'Rajasthan · India',
      buttonLabel: 'Meet Umeholidays',
      buttonUrl: '/about',
    },
  },
  {
    title: 'Travel Moods',
    data: {
      key: 'moods',
      eyebrow: 'Travel By Feeling',
      title: 'How Do You Want to Experience Rajasthan?',
      itemLabel: 'Travel mood',
    },
  },
  {
    title: 'Signature Journeys',
    data: {
      key: 'tours',
      eyebrow: 'Signature Journeys',
      title: 'Routes Worth Taking Your Time For.',
      ctaLabel: 'View All Journeys',
      ctaUrl: '/tours',
      priceLabel: 'From',
    },
  },
  {
    title: 'Experiences',
    data: {
      key: 'experiences',
      eyebrow: 'Go Deeper · Authentic Rajasthan',
      title: 'Curated Royal Experiences & Lasting Memories.',
    },
  },
  {
    title: 'Route Map',
    data: {
      key: 'map',
      eyebrow: 'Shape Your Route',
      title: 'One Royal State. Endless Possibilities.',
      description: 'Use our map as a starting point, then add the heritage cities that fit your ideal pace.',
      ctaLabel: 'Build a Route',
      ctaUrl: '/plan-your-trip',
      mapLabel: 'Rajasthan Journey Map',
    },
  },
  {
    title: 'Why UME',
    data: {
      key: 'why',
      eyebrow: 'Why Choose Umeholidays',
      title: 'Thoughtful & Royal by Design.',
      description: 'We combine modern planning structure with genuine human expertise.',
    },
  },
  {
    title: 'Seasonal Guide',
    data: {
      key: 'seasonal',
      eyebrow: 'Seasonal Guide',
      title: 'Where Should You Travel Now?',
      description: 'Discover Rajasthan at the pace and season that suits your journey.',
    },
  },
  {
    title: 'Testimonials',
    data: {
      key: 'testimonials',
      eyebrow: 'Traveller Notes',
      title: 'The Feeling After a Royal Journey.',
    },
  },
  {
    title: 'Journal',
    data: {
      key: 'journal',
      eyebrow: 'Umeholidays Journal',
      title: 'Read Before You Go.',
      ctaLabel: 'All Stories',
      ctaUrl: '/stories',
    },
  },
  {
    title: 'FAQs',
    data: {
      key: 'faqs',
      eyebrow: 'Questions & Answers',
      title: 'Before You Set Off.',
    },
  },
  {
    title: 'Final CTA',
    data: {
      key: 'final-cta',
      eyebrow: 'Your Next Royal Chapter',
      title: 'Let’s make a Rajasthan journey around what matters to you.',
      description: 'Tell us how you want to travel, and we’ll help shape a journey around your pace, interests and time.',
      primaryButtonLabel: 'Plan My Trip',
      primaryButtonUrl: '/plan-your-trip',
    },
  },
];

const reasons = [
  ['100% Local Expertise', 'Jaipur-headquartered local specialists shaping authentic routes.'],
  ['Handpicked Experiences', 'Fewer fillers. More royal heritage moments worth remembering.'],
  ['Flexible Custom Plans', 'Change the pace, stay longer in desert camps, or customize on the go.'],
  ['Clear Planning & Direct Support', 'Practical details, honest estimates, led by founder Mr. Umesh Sharma.'],
];

const locations = [
  ['Jaipur', 'jaipur', 50, 26],
  ['Jodhpur', 'jodhpur', 31, 47],
  ['Jaisalmer', 'jaisalmer', 15, 59],
  ['Udaipur', 'udaipur', 44, 73],
  ['Pushkar', 'pushkar', 43, 39],
  ['Bikaner', 'bikaner', 32, 25],
  ['Mount Abu', 'mount-abu', 50, 86],
];

const plannerSteps = [
  { question: 'Where are you going?', fieldKey: 'destination', source: 'destinations', options: [], optionIds: [] },
  { question: 'Travel style', fieldKey: 'style', source: 'custom', options: ['Luxury', 'Adventure', 'Family', 'Honeymoon', 'Heritage', 'Wellness', 'Photography', 'Food & Culture'] },
  { question: 'How long?', fieldKey: 'duration', source: 'custom', options: ['3–4 days', '5–7 days', '8–10 days', '11–14 days', '15+ days'] },
  { question: 'Budget per person', fieldKey: 'budget', source: 'custom', options: ['₹15k–30k', '₹30k–60k', '₹60k–1L', '₹1L+'] },
];

async function normalizeSortOrder() {
  for (const module of CMS_MODULES) {
    const unordered = await AdminRecord.find({ module, sortOrder: { $exists: false } })
      .sort({ createdAt: -1 })
      .select('_id')
      .lean();
    if (!unordered.length) continue;

    const last = await AdminRecord.findOne({ module, sortOrder: { $exists: true } }).sort({ sortOrder: -1 }).lean();
    const start = Number(last?.sortOrder) || 0;
    await AdminRecord.bulkWrite(unordered.map((doc, index) => ({
      updateOne: { filter: { _id: doc._id }, update: { $set: { sortOrder: start + index + 1 } } },
    })));
    console.log(`[seed:home] ${module}: ordered ${unordered.length} existing records`);
  }
}

async function seedSections() {
  let created = 0;
  for (const [index, section] of sections.entries()) {
    if (await AdminRecord.exists({ module: 'home-sections', 'data.key': section.data.key })) continue;
    await AdminRecord.create({ module: 'home-sections', title: section.title, status: 'active', sortOrder: index + 1, data: section.data });
    created += 1;
  }
  console.log(`[seed:home] home-sections: ${created} created`);
}

async function seedList(module, records) {
  if (await AdminRecord.exists({ module })) {
    console.log(`[seed:home] ${module}: already has records, skipped`);
    return;
  }
  await AdminRecord.insertMany(records.map((record, index) => ({ ...record, module, status: 'active', sortOrder: index + 1 })));
  console.log(`[seed:home] ${module}: ${records.length} created`);
}

async function main() {
  await connectDB({ retry: false });

  await normalizeSortOrder();
  await seedSections();

  await seedList('why-reasons', reasons.map(([title, description]) => ({ title, data: { title, description } })));

  const destinations = await Destination.find({ slug: { $in: locations.map(([, slug]) => slug) } }).select('slug').lean();
  const idBySlug = new Map(destinations.map((doc) => [doc.slug, String(doc._id)]));
  await seedList('map-locations', locations.map(([name, slug, mapX, mapY]) => ({
    title: name,
    data: { name, mapX, mapY, ...(idBySlug.has(slug) ? { destinationId: idBySlug.get(slug) } : {}) },
  })));

  await seedList('trip-planner-steps', plannerSteps.map((step) => ({ title: step.question, data: step })));

  console.log('[seed:home] done');
}

main()
  .catch((error) => {
    console.error('[seed:home] failed:', error);
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());
