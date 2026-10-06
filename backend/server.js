import env from './src/config/env.js';
import app from './src/app.js';
import { connectDB, disconnectDB } from './src/config/db.js';

const server = app.listen(env.port, () => {
  console.log(`[api] UME Holidays API listening on http://localhost:${env.port} (${env.nodeEnv})`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`[api] port ${env.port} is already in use. Stop the other process or set PORT in backend/.env`);
  } else {
    console.error('[api] server error:', error);
  }
  process.exit(1);
});

connectDB().catch((error) => console.error('[db] giving up:', error.message));

let shuttingDown = false;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[api] ${signal} received, shutting down...`);
  server.close(async () => {
    await disconnectDB().catch(() => {});
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('unhandledRejection', (reason) => console.error('[api] unhandled rejection:', reason));
