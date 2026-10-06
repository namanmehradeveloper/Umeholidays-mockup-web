'use client';

import { Database, Hash, MessageSquare, MousePointerClick, Sparkles } from 'lucide-react';

import { PageCMS, plainText, text, url } from './HomepageCMS';
import type { SectionSchema } from './HomepageCMS';

const SEARCH_SCHEMAS: Record<string, SectionSchema> = {
  hero: {
    label: 'Search Hero',
    items: { label: 'Popular Searches', tab: 'search-popular' },
    fields: [
      text('eyebrow', 'Eyebrow', { icon: Sparkles }),
      { ...plainText('title', 'Heading'), help: 'Each new line starts a new line on larger screens.' },
      plainText('description', 'Subtitle'),
      text('popularLabel', 'Popular Searches Label', { icon: Sparkles, placeholder: 'Popular' }),
      {
        key: 'popularSource',
        label: 'Popular Searches From',
        type: 'select',
        options: [
          { value: 'custom', label: 'Popular Searches list' },
          { value: 'destinations', label: 'Published destinations' },
        ],
        help: 'Published destinations update automatically as destinations are published or unpublished.',
        icon: Database,
      },
      text('popularLimit', 'Destination Chip Limit', {
        icon: Hash,
        placeholder: '5',
        help: 'Only used when popular searches come from published destinations.',
      }),
    ],
  },
  results: {
    label: 'Search Box & Results',
    fields: [
      text('placeholder', 'Search Box Placeholder', { icon: MessageSquare }),
      text('submitLabel', 'Search Button Label', { icon: MousePointerClick }),
      text('loadingLabel', 'Searching Label', { placeholder: 'Searching for' }),
      text('resultsHeading', 'Results Heading'),
      text('resultSingular', 'Result Count Word (1)', { placeholder: 'result' }),
      text('resultPlural', 'Result Count Word (many)', { placeholder: 'results' }),
      text('emptyTitle', 'No Results Title'),
      plainText('emptyMessage', 'No Results Message'),
      plainText('errorMessage', 'Error Message'),
      text('destinationsLabel', 'Destinations Group Label'),
      text('toursLabel', 'Tours Group Label'),
      text('experiencesLabel', 'Experiences Group Label'),
      text('storiesLabel', 'Stories Group Label'),
      text('eventsLabel', 'Events Group Label'),
    ],
  },
  categories: {
    label: 'Categories',
    items: { label: 'Search Categories', tab: 'search-categories' },
    fields: [
      text('eyebrow', 'Eyebrow', { icon: Sparkles }),
      text('title', 'Heading'),
      plainText('description', 'Subtitle'),
      text('itemCtaLabel', 'Card Link Label', { icon: MousePointerClick, placeholder: 'Explore' }),
    ],
  },
  cta: {
    label: 'Bottom CTA',
    fields: [
      text('title', 'Heading'),
      plainText('description', 'Description'),
      text('buttonLabel', 'Button Label', { icon: MousePointerClick }),
      url('buttonUrl', 'Button Link'),
    ],
  },
};

const SEARCH_TABS = [
  { id: 'search-categories', label: 'Categories' },
  { id: 'search-popular', label: 'Popular Searches' },
];

export default function SearchPageCMS() {
  return (
    <PageCMS
      title="Search Page"
      pageName="search page"
      module="search-sections"
      schemas={SEARCH_SCHEMAS}
      tabs={SEARCH_TABS}
    />
  );
}
