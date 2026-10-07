'use client';

import { MousePointerClick, Sparkles } from 'lucide-react';

import { PageCMS, plainText, text, url } from './HomepageCMS';
import type { SectionSchema } from './HomepageCMS';

const TRAVEL_ESSENTIALS_SCHEMAS: Record<string, SectionSchema> = {
  hero: {
    label: 'Hero',
    fields: [
      text('eyebrow', 'Eyebrow', { icon: Sparkles }),
      text('title', 'Heading'),
      text('highlightedTitle', 'Highlighted Heading Part', { help: 'Shown after the heading in the accent colour.' }),
      plainText('description', 'Subtitle'),
    ],
  },
  services: {
    label: 'Services',
    items: { label: 'Services', tab: 'travel-essentials-services' },
    fields: [
      text('buttonLabel', 'Button Label', { icon: MousePointerClick, placeholder: 'Enquire Now' }),
      url('buttonUrl', 'Button Link'),
    ],
  },
};

const TRAVEL_ESSENTIALS_TABS = [{ id: 'travel-essentials-services', label: 'Services' }];

export default function TravelEssentialsCMS() {
  return (
    <PageCMS
      title="Travel Essentials"
      pageName="travel essentials page"
      module="travel-essentials-sections"
      schemas={TRAVEL_ESSENTIALS_SCHEMAS}
      tabs={TRAVEL_ESSENTIALS_TABS}
    />
  );
}
