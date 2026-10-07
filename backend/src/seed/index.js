import env from '../config/env.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { AdminRecord, Destination, Event, Experience, Offer, Story, Tour, User } from '../models/index.js';
import { events } from './events.js';
import { offers } from './offers.js';
import { destinations, tours, experiences, stories, faqs, testimonials, moods, seasonal } from './content.js';

const force = process.argv.includes('--force');

async function upsertContent(Model, docs) {
  const operations = docs.filter(Boolean).map((doc) => ({
    updateOne: {
      filter: { slug: doc.slug },
      update: force
        ? { $set: doc }
        : { $setOnInsert: { ...doc } },
      upsert: true,
    },
  }));

  if (operations.length) {
    await Model.bulkWrite(operations);
  }

  console.log(`[seed] ${Model.modelName}: ${docs.length}`);
}

async function upsertRecords(module, records) {
  for (const record of records) {
    const title = record.title || record.data?.question || record.data?.customer || record.data?.title;
    if (!title) continue;

    const filter = { module, title };
    const update = {
      $set: {
        module,
        title,
        status: 'active',
        data: record.data,
      },
    };

    await AdminRecord.updateOne(filter, update, { upsert: true });
  }

  console.log(`[seed] AdminRecord/${module}: ${records.length}`);
}

async function ensureAdmin() {
  if (!env.admin.email || !env.admin.password) return;

  const email = env.admin.email.toLowerCase();
  if (!(await User.exists({ email }))) {
    await User.create({
      name: env.admin.name,
      email,
      password: env.admin.password,
      role: 'admin',
    });
  }
}

async function main() {
  await connectDB({ retry: false });

  await upsertContent(Destination, destinations);
  await upsertContent(Tour, tours);
  await Tour.updateMany(
    { $or: [{ totalSeats: { $exists: false } }, { availableSeats: { $exists: false } }] },
    [
      { $set: {
        totalSeats: { $ifNull: ['$totalSeats', 20] },
        availableSeats: { $ifNull: ['$availableSeats', { $ifNull: ['$totalSeats', 20] }] },
      } },
    ],
  );
  await upsertContent(Experience, experiences);
  await upsertContent(Event, events);
  await upsertContent(Story, stories.map((story) => ({
    ...story,
    date: new Date(story.date),
  })));
  await upsertContent(Offer, offers);

  await upsertRecords('faqs', faqs.map(([question, answer]) => ({
    title: question,
    data: { question, answer },
  })));

  await upsertRecords('testimonials', testimonials.map(([customer, trip, quote]) => ({
    title: customer,
    data: { customer, trip, quote },
  })));

  await upsertRecords('moods', moods.map(([title, description, image]) => ({
    title,
    data: { title, description, image },
  })));

  await upsertRecords('seasonal', seasonal.map(([title, description, season]) => ({
    title,
    data: { title, description, season },
  })));

  await ensureAdmin();
  console.log('[seed] done');
}

main()
  .catch((error) => {
    console.error('[seed] failed:', error);
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());
