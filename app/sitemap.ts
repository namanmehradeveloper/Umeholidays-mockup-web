import type { MetadataRoute } from 'next';
import { apiList } from '../lib/api';
import type { Destination, Event, Experience, Offer, Story, Tour } from '../types';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

  const [destinations, tours, experiences, stories, events, offers] = await Promise.all([
    apiList<Destination>('/destinations?limit=200'),
    apiList<Tour>('/tours?limit=200'),
    apiList<Experience>('/experiences?limit=200'),
    apiList<Story>('/stories?limit=200'),
    apiList<Event>('/events?limit=200'),
    apiList<Offer>('/offers/public?limit=200').catch(() => [] as Offer[]),
  ]);

  const paths = [
    '/', '/about', '/contact', '/destinations', '/tours', '/experiences', '/stories', '/offers',
    '/events', '/plan-your-trip', '/trip-calculator', '/wishlist', '/compare', '/search',
    ...destinations.map((item) => `/destinations/${item.slug}`),
    ...tours.map((item) => `/tours/${item.slug}`),
    ...experiences.map((item) => `/experiences/${item.slug}`),
    ...stories.map((item) => `/stories/${item.slug}`),
    ...events.map((item) => `/events/${item.slug}`),
    ...offers.map((item) => `/offers/${item.slug}`),
  ];

  return paths.map((path) => ({ url: `${base}${path}`, lastModified: new Date() }));
}
