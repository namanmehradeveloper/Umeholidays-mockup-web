import { connectDB, disconnectDB } from '../config/db.js';
import { Offer } from '../models/index.js';
import { offers } from './offers.js';

async function main() {
  await connectDB({ retry: false });

  let created = 0;
  for (const offer of offers) {
    if (await Offer.exists({ slug: offer.slug })) continue;
    await Offer.create(offer);
    created += 1;
  }

  console.log(`[seed:offers] ${created} created, ${offers.length - created} already existed`);
}

main()
  .catch((error) => {
    console.error('[seed:offers] failed:', error);
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());
