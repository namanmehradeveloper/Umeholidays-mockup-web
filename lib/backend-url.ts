// Internal backend started alongside Next.js by `npm run dev` / `npm run start`.
// 127.0.0.1 avoids `localhost` resolving to ::1 on hosts without IPv6.
export const LOCAL_BACKEND_URL = 'http://127.0.0.1:5000';

/**
 * Normalizes a backend URL to a bare origin (plus optional base path) with no
 * trailing slash and no trailing `/api`, because callers append `/api` themselves.
 * Accepts values without a scheme, e.g. Render's `fromService` `host`/`hostport`.
 */
export function normalizeBackendUrl(raw: string): string {
  let url = raw.trim().replace(/^['"]+|['"]+$/g, '');

  if (!/^https?:\/\//i.test(url)) {
    const host = url.split('/')[0].replace(/:\d+$/, '');
    const isPrivateHost = /^(localhost|127\.|0\.0\.0\.0|\[::1\])/i.test(host) || !host.includes('.');
    url = `${isPrivateHost ? 'http' : 'https'}://${url}`;
  }

  return url.replace(/\/+$/, '').replace(/\/api$/i, '').replace(/\/+$/, '');
}

export function getConfiguredBackendUrl(): string | undefined {
  const raw = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  return raw?.trim() ? normalizeBackendUrl(raw) : undefined;
}

export function resolveBackendUrl(): string {
  return getConfiguredBackendUrl() || LOCAL_BACKEND_URL;
}
