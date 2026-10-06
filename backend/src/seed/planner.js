/**
 * Initial Travel Planner configuration. Everything here is editable afterwards in
 * Admin -> Travel Planner; the frontend never falls back to these values.
 *
 *   npm run seed:planner                         # insert option types that have no records yet
 *   npm run seed:planner -- --enable-destinations # also open published destinations for planning
 */
import { connectDB, disconnectDB } from '../config/db.js';
import { Destination, PlannerOption, PlannerSettings } from '../models/index.js';

const enableDestinations = process.argv.includes('--enable-destinations');
const DEFAULT_BASE_PRICE = 2500;

const options = {
  duration: [
    { name: '3 Days / 2 Nights', days: 3, nights: 2, priceModifier: 0 },
    { name: '5 Days / 4 Nights', days: 5, nights: 4, priceModifier: 0 },
    { name: '7 Days / 6 Nights', days: 7, nights: 6, priceModifier: -3 },
    { name: '10 Days / 9 Nights', days: 10, nights: 9, priceModifier: -5 },
    { name: '14 Days / 13 Nights', days: 14, nights: 13, priceModifier: -8 },
  ],
  'travel-style': [
    { name: 'Heritage', icon: 'Landmark', description: 'Forts, palaces and living history.', priceModifier: 0 },
    { name: 'Luxury', icon: 'Crown', description: 'Palace stays and private experiences.', priceModifier: 25 },
    { name: 'Adventure', icon: 'Mountain', description: 'Dunes, trails and open skies.', priceModifier: 10 },
    { name: 'Romantic', icon: 'Heart', description: 'Slow evenings and lakeside views.', priceModifier: 15 },
    { name: 'Family', icon: 'Users', description: 'Easy pacing for every age.', priceModifier: 0 },
    { name: 'Wildlife', icon: 'PawPrint', description: 'Safaris and nature reserves.', priceModifier: 12 },
  ],
  hotel: [
    { name: 'Boutique', icon: 'Home', description: 'Characterful, intimate stays.', pricePerNight: 4500 },
    { name: '4 Star', icon: 'Star', description: 'Comfortable and well located.', pricePerNight: 6500 },
    { name: '5 Star', icon: 'Sparkles', description: 'Full-service luxury hotels.', pricePerNight: 14000 },
    { name: 'Heritage Palace', icon: 'Castle', description: 'Restored palaces and havelis.', pricePerNight: 18000 },
  ],
  transport: [
    { name: 'Private Sedan', icon: 'Car', description: 'Chauffeur-driven, up to 3 guests.', pricingType: 'per_day', price: 3200 },
    { name: 'Private SUV', icon: 'CarFront', description: 'Extra space for families and luggage.', pricingType: 'per_day', price: 4200 },
    { name: 'Train + Car', icon: 'TrainFront', description: 'Scenic rail legs with local transfers.', pricingType: 'per_person', price: 3500 },
    { name: 'Self-arranged', icon: 'Route', description: 'You handle travel between cities.', pricingType: 'per_trip', price: 0 },
  ],
  activity: [
    { name: 'Heritage walk', description: 'A guided walk through the old city.', pricePerPerson: 1200 },
    { name: 'Cooking class', description: 'Cook Rajasthani dishes with a local family.', pricePerPerson: 1800 },
    { name: 'Block printing workshop', description: 'Hands-on craft session with artisans.', pricePerPerson: 1500, destinations: ['jaipur'] },
    { name: 'Amber Fort elephant-free sunrise tour', description: 'Beat the crowds at Amber Fort.', pricePerPerson: 2200, destinations: ['jaipur'] },
    { name: 'Mehrangarh flying fox', description: 'Zipline over the fort ramparts.', pricePerPerson: 2400, destinations: ['jodhpur'] },
    { name: 'Lake Pichola sunset cruise', description: 'Golden hour on the lake.', pricePerPerson: 900, destinations: ['udaipur'] },
    { name: 'Desert camel safari', description: 'Ride into the dunes at dusk.', pricePerPerson: 2500, destinations: ['bikaner'] },
    { name: 'Nakki Lake boating', description: 'A quiet hour on the hill-station lake.', pricePerPerson: 600, destinations: ['mount-abu'] },
  ],
};

async function seedType(type, records) {
  if (await PlannerOption.exists({ type })) {
    console.log(`[seed:planner] ${type}: already configured, skipped`);
    return;
  }

  let slugToId = new Map();
  if (type === 'activity') {
    const destinations = await Destination.find({}).select('slug').lean();
    slugToId = new Map(destinations.map((destination) => [destination.slug, destination._id]));
  }

  const docs = [];
  for (const [index, { destinations, ...record }] of records.entries()) {
    const destinationIds = (destinations || []).map((slug) => slugToId.get(slug)).filter(Boolean);
    // A destination-specific activity must never silently become available everywhere.
    if (destinations?.length && !destinationIds.length) continue;
    docs.push({ ...record, type, status: 'active', sortOrder: index + 1, destinationIds });
  }

  await PlannerOption.insertMany(docs);
  console.log(`[seed:planner] ${type}: ${docs.length} inserted`);
}

async function main() {
  await connectDB({ retry: false });
  await PlannerSettings.getSingleton();
  console.log('[seed:planner] settings: ensured');

  for (const [type, records] of Object.entries(options)) await seedType(type, records);

  if (enableDestinations) {
    const published = await Destination.find({ isPublished: true }).sort({ createdAt: 1 }).select('_id plannerBasePrice');
    for (const [index, destination] of published.entries()) {
      await Destination.updateOne(
        { _id: destination._id },
        {
          $set: {
            plannerEnabled: true,
            plannerSortOrder: index + 1,
            ...(destination.plannerBasePrice ? {} : { plannerBasePrice: DEFAULT_BASE_PRICE }),
          },
        },
      );
    }
    console.log(`[seed:planner] destinations: ${published.length} enabled for planning`);
  }

  console.log('[seed:planner] done');
}

main()
  .catch((error) => {
    console.error('[seed:planner] failed:', error);
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());
