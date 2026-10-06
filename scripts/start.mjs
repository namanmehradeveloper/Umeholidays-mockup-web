// Production entry for a single Render Web Service: runs the Express backend on
// an internal port and Next.js on the public $PORT, and exits if either dies so
// the platform restarts the whole service.
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);

// Must match the port in LOCAL_BACKEND_URL (lib/backend-url.ts), which is baked
// into the /api rewrite at build time.
const BACKEND_PORT = '5000';
const webPort = process.env.PORT || '3000';

if (webPort === BACKEND_PORT) {
  console.error(`[start] PORT=${webPort} collides with the internal backend port ${BACKEND_PORT}. Use a different PORT.`);
  process.exit(1);
}

const backendEnv = {
  ...process.env,
  PORT: BACKEND_PORT,
  NODE_ENV: process.env.NODE_ENV || 'production',
};

// Browsers send an Origin header that the Next.js proxy forwards; default the
// backend's CORS allow-list to Render's public URL when it is not set explicitly.
if (!process.env.CLIENT_URL && process.env.RENDER_EXTERNAL_URL) {
  backendEnv.CLIENT_URL = process.env.RENDER_EXTERNAL_URL;
}
if (!process.env.APP_URL && process.env.RENDER_EXTERNAL_URL) {
  backendEnv.APP_URL = process.env.RENDER_EXTERNAL_URL;
}

const children = [];
let shuttingDown = false;

function run(name, args, options) {
  const child = spawn(process.execPath, args, { stdio: 'inherit', ...options });

  child.on('exit', (code, signal) => {
    if (shuttingDown) return;
    console.error(`[start] ${name} exited (${signal || `code ${code}`}); stopping the service.`);
    shutdown(code || 1);
  });

  children.push(child);
  return child;
}

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGTERM');
  }

  let pending = children.filter((child) => child.exitCode === null && child.signalCode === null).length;
  if (pending === 0) process.exit(exitCode);

  for (const child of children) {
    child.once('exit', () => {
      pending -= 1;
      if (pending <= 0) process.exit(exitCode);
    });
  }

  setTimeout(() => process.exit(exitCode), 12_000).unref();
}

run('backend', ['server.js'], { cwd: path.join(root, 'backend'), env: backendEnv });
run('next', [require.resolve('next/dist/bin/next'), 'start', '-p', webPort], { cwd: root, env: process.env });

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
