'use client';

import { useEffect, useState } from 'react';
import { site as defaults } from '../../lib/site';

export type SiteSettings = typeof defaults & {
  companyName: string;
  tagline: string;
  address: string;
  instagram: string;
  facebook: string;
  youtube: string;
  linkedin: string;
};

const fallback: SiteSettings = {
  ...defaults,
  companyName: defaults.name,
  tagline: defaults.tagline,
  address: 'Jaipur, Rajasthan, India',
  instagram: '',
  facebook: '',
  youtube: '',
  linkedin: '',
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(fallback);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/settings/public', { headers: { Accept: 'application/json' } })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error('Settings request failed'))))
      .then((body) => {
        if (!cancelled && body?.data) setSettings((current) => ({ ...current, ...body.data }));
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  return settings;
}
