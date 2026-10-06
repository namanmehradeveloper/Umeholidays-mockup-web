import { resolveBackendUrl } from './backend-url';
import type { CmsRecord } from '../types';

/** Content that configures one home page section, stored as a `home-sections` CMS record. */
export type HomeSectionContent = {
  key: string;
  [field: string]: unknown;
};

const apiBase = () =>
  typeof window === 'undefined' ? `${resolveBackendUrl()}/api` : '/api';

/** Fresh (uncached) list fetch; an unreachable API yields no content rather than stale or placeholder data. */
export async function fetchList<T>(path: string): Promise<T[]> {
  try {
    const response = await fetch(`${apiBase()}${path}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return [];

    const body = await response.json();
    return Array.isArray(body?.data) ? (body.data as T[]) : [];
  } catch {
    return [];
  }
}

export function fetchCmsRecords(module: string) {
  return fetchList<CmsRecord>(`/public-records/${module}`);
}

/** Active records of a keyed section module (e.g. `home-sections`), in admin order. */
export async function fetchSections(module: string): Promise<HomeSectionContent[]> {
  const records = await fetchCmsRecords(module);

  return records
    .filter((record) => record.status === 'active' && typeof record.data?.key === 'string')
    .map((record) => ({ ...record.data, key: String(record.data?.key) }));
}

export function fetchHomeSections() {
  return fetchSections('home-sections');
}

/** Trimmed string value of a CMS field, or undefined when it is empty or not text. */
export function cmsText(source: Record<string, unknown> | undefined | null, field: string): string | undefined {
  const value = source?.[field];
  if (typeof value !== 'string' && typeof value !== 'number') return undefined;

  const text = String(value).trim();
  return text || undefined;
}

export function cmsNumber(source: Record<string, unknown> | undefined | null, field: string): number | undefined {
  const value = source?.[field];
  if (value === undefined || value === null || value === '') return undefined;

  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}
