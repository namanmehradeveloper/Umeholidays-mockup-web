import mongoose from 'mongoose';
import { imageUrl, schemaOptions } from './plugins/content.js';

/** Canonical step order of the /plan-your-trip builder. Only `activities` may be switched off. */
export const PLANNER_STEP_KEYS = ['destination', 'duration', 'travel-style', 'hotel', 'transport', 'activities', 'travellers', 'details'];
export const OPTIONAL_PLANNER_STEPS = ['activities'];

const text = (max, value = '') => ({ type: String, trim: true, maxlength: max, default: value });

const stepSchema = new mongoose.Schema(
  {
    key: { type: String, enum: PLANNER_STEP_KEYS, required: true },
    eyebrow: text(80),
    title: text(160),
    description: text(600),
    summaryLabel: text(60),
    emptyMessage: text(400),
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { _id: false },
);

const DEFAULT_STEPS = [
  {
    key: 'destination',
    eyebrow: 'Start your journey',
    title: 'Where would you like to go?',
    description: 'Choose the destination your journey begins with.',
    summaryLabel: 'Destination',
    emptyMessage: 'No destinations are open for planning right now. Please check back soon or contact our team.',
  },
  {
    key: 'duration',
    eyebrow: 'Your pace',
    title: 'How long would you like to travel?',
    description: 'Pick the length of trip that fits your plans.',
    summaryLabel: 'Duration',
    emptyMessage: 'Trip lengths are being updated. Please check back shortly.',
  },
  {
    key: 'travel-style',
    eyebrow: 'Travel style',
    title: 'What kind of journey suits you?',
    description: 'Tell us the mood you want the trip to have.',
    summaryLabel: 'Travel style',
    emptyMessage: 'Travel styles are being updated. Please check back shortly.',
  },
  {
    key: 'hotel',
    eyebrow: 'Your stay',
    title: 'Where would you like to stay?',
    description: 'Choose the kind of hotel you would enjoy most.',
    summaryLabel: 'Hotel',
    emptyMessage: 'Hotel categories are being updated. Please check back shortly.',
  },
  {
    key: 'transport',
    eyebrow: 'Getting around',
    title: 'How would you like to travel between places?',
    description: 'Select the transport that suits your group.',
    summaryLabel: 'Transport',
    emptyMessage: 'Transport options are being updated. Please check back shortly.',
  },
  {
    key: 'activities',
    eyebrow: 'Experiences',
    title: 'What would you like to experience?',
    description: 'Add as many as you like, or skip this step.',
    summaryLabel: 'Activities',
    emptyMessage: 'There are no add-on experiences for this destination yet. You can continue without them.',
  },
  {
    key: 'travellers',
    eyebrow: 'Travellers',
    title: 'Who is travelling?',
    description: 'Let us know how many adults and children are joining.',
    summaryLabel: 'Travellers',
  },
  {
    key: 'details',
    eyebrow: 'Almost there',
    title: 'Where should we send your journey?',
    description: 'Share your details and our Rajasthan specialists will shape this into a full itinerary.',
    summaryLabel: 'Contact',
  },
];

const plannerSettingsSchema = new mongoose.Schema(
  {
    /** Singleton key; there is only ever one settings document. */
    key: { type: String, default: 'default', unique: true, immutable: true },

    builder: {
      eyebrow: text(80, 'Build your own trip'),
      title: text(160, 'Shape it around you.'),
    },
    summary: {
      eyebrow: text(80, 'Live summary'),
      title: text(160, 'Your journey'),
      notSelectedLabel: text(60, 'Not selected'),
      estimateLabel: text(80, 'Estimated budget'),
      estimatePendingLabel: text(160, 'Complete your selections to see an estimate.'),
      adultsLabel: text(40, 'Adults'),
      childrenLabel: text(40, 'Children'),
    },
    labels: {
      back: text(40, 'Back'),
      continue: text(40, 'Continue'),
      request: text(60, 'Request this journey'),
      submit: text(60, 'Send my journey request'),
      sending: text(40, 'Sending…'),
      retry: text(40, 'Try again'),
      loading: text(60, 'Loading options…'),
      loadError: text(200, 'We could not load these options. Please try again.'),
      unavailable: text(300, 'The trip planner is unavailable right now. Please try again later or contact our team.'),
      name: text(40, 'Full name'),
      email: text(40, 'Email'),
      phone: text(40, 'Phone / WhatsApp'),
      message: text(80, 'Anything else we should know? (optional)'),
      contactRequired: text(200, 'Please enter your name, email and phone number.'),
      invalidEmail: text(200, 'Please enter a valid email address.'),
    },
    success: {
      eyebrow: text(80, 'Request received'),
      title: text(160, 'We’ll shape the journey with you.'),
      description: text(600, 'Your journey has been sent to the UME Holidays team. We’ll contact you using the details provided.'),
      resetLabel: text(60, 'Plan another journey'),
    },
    page: {
      heroEyebrow: text(80, 'Plan Your Journey'),
      heroTitle: text(120, 'Your Rajasthan.'),
      heroTitleMuted: text(120, 'Your way.'),
      heroDescription: text(600, 'Tell us how you want to travel, what you want to discover and how much time you have. We’ll help shape a journey around you.'),
      heroImage: {
        ...imageUrl,
        maxlength: 1000,
        default: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=2000&q=90',
      },
      trustPoints: {
        type: [{ type: String, trim: true, maxlength: 60 }],
        default: ['Personalised planning', 'Rajasthan specialists', 'Made around you'],
      },
      howItWorksEyebrow: text(80, 'How it works'),
      howItWorksTitle: text(160, 'A journey shaped around you.'),
      howItWorksDescription: text(600, 'No fixed template. Tell us what matters to you and we’ll build from there.'),
      howItWorks: {
        type: [new mongoose.Schema({ title: text(120), text: text(400) }, { _id: false })],
        default: [
          { title: 'Tell us what you love', text: 'Choose your destinations, travel style and the experiences that interest you.' },
          { title: 'Shape the details', text: 'Share your dates, pace and budget so the journey fits naturally into your plans.' },
          { title: 'We’ll take it from there', text: 'Our team can turn your starting point into a thoughtful Rajasthan itinerary.' },
        ],
      },
      showDestinations: { type: Boolean, default: true },
      destinationsLimit: { type: Number, min: 0, max: 12, default: 3 },
      destinationLinkLabel: text(60, 'Explore'),
      finalEyebrow: text(80, 'Take your time'),
      finalTitle: text(200, 'There is no wrong way to discover Rajasthan.'),
      finalCtaLabel: text(60, 'Explore destinations'),
      finalCtaHref: text(300, '/destinations'),
    },
    pricing: {
      currency: { type: String, trim: true, uppercase: true, maxlength: 3, default: 'INR' },
      /** Children are charged this fraction of an adult for per-person costs (0–1). */
      childRate: { type: Number, min: 0, max: 1, default: 0.5 },
      guestsPerRoom: { type: Number, min: 1, max: 6, default: 2 },
      taxPercent: { type: Number, min: 0, max: 50, default: 5 },
      /** Estimates are rounded up to this multiple. */
      roundTo: { type: Number, min: 1, max: 10000, default: 100 },
      disclaimer: text(400, 'Final pricing may vary after confirmation.'),
    },
    limits: {
      maxAdults: { type: Number, min: 1, max: 50, default: 12 },
      maxChildren: { type: Number, min: 0, max: 50, default: 8 },
    },
    steps: { type: [stepSchema], default: DEFAULT_STEPS },
  },
  schemaOptions,
);

/** Always returns every canonical step, in canonical order, merging stored copy over the defaults. */
plannerSettingsSchema.methods.resolvedSteps = function resolvedSteps() {
  const stored = new Map((this.steps || []).map((step) => [step.key, step.toObject ? step.toObject() : step]));
  return PLANNER_STEP_KEYS.map((key) => {
    const fallback = DEFAULT_STEPS.find((step) => step.key === key);
    const step = { ...fallback, status: 'active', ...(stored.get(key) || {}) };
    if (!OPTIONAL_PLANNER_STEPS.includes(key)) step.status = 'active';
    return step;
  });
};

plannerSettingsSchema.statics.getSingleton = async function getSingleton() {
  const existing = await this.findOne({ key: 'default' });
  if (existing) return existing;
  try {
    return await this.create({ key: 'default' });
  } catch (error) {
    if (error?.code === 11000) return this.findOne({ key: 'default' });
    throw error;
  }
};

export default mongoose.model('PlannerSettings', plannerSettingsSchema);
