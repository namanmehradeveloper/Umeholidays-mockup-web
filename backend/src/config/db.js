import mongoose from 'mongoose';
import dns from 'node:dns';
import env from './env.js';

const RETRY_DELAY_MS = 5000;

mongoose.set('strictQuery', true);

// Local development: use reliable DNS servers for MongoDB SRV resolution.
// Production/Render keeps the default resolver.
if (env.nodeEnv === 'development') {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}

export const isDbConnected = () => mongoose.connection.readyState === 1;

export async function connectDB({ retry = true } = {}) {
  for (;;) {
    try {
      await mongoose.connect(env.mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });

      console.log(
        `[db] connected to ${mongoose.connection.host}/${mongoose.connection.name}`
      );

      return mongoose.connection;
    } catch (error) {
      console.error(`[db] connection failed: ${error.message}`);

      if (!retry) throw error;

      console.log(`[db] retrying in ${RETRY_DELAY_MS / 1000}s...`);

      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_DELAY_MS)
      );
    }
  }
}

export async function disconnectDB() {
  await mongoose.connection.close();
}