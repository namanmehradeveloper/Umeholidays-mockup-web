import { Destination, Event, Experience, Story, Tour } from '../models/index.js';
import { createContentController } from './contentController.js';

const SHARED = ['slug', 'isPublished', 'featured', 'metaTitle', 'metaDescription', 'canonicalUrl', 'ogImage', 'noIndex'];

export const destinationController = createContentController(Destination, {
  label: 'Destination',
  writableFields: [
    ...SHARED,
    'name',
    'region',
    'tagline',
    'description',
    'heroImage',
    'bestTime',
    'recommendedDays',
    'highlights',
    'experiences',
    'food',
    'tips',
    'plannerEnabled',
    'plannerBasePrice',
    'plannerSortOrder',
  ],
  searchFields: ['name', 'region', 'tagline', 'description', 'highlights'],
  filters: { region: 'region' },
  sortFields: ['name', 'recommendedDays', 'createdAt'],
  defaultSort: { createdAt: 1 },
  wishlistType: 'destination',
});

export const tourController = createContentController(Tour, {
  label: 'Tour',
  writableFields: [
    ...SHARED,
    'title',
    'eyebrow',
    'duration',
    'price',
    'totalSeats',
    'availableSeats',
    'destinations',
    'category',
    'rating',
    'hotel',
    'transport',
    'difficulty',
    'ideal',
    'image',
    'description',
    'highlights',
    'itinerary',
  ],
  searchFields: ['title', 'eyebrow', 'description', 'category', 'destinations', 'highlights'],
  filters: { category: 'category', destination: 'destinations', difficulty: 'difficulty' },
  ranges: ['price'],
  sortFields: ['price', 'rating', 'title', 'createdAt'],
  defaultSort: { createdAt: 1 },
  wishlistType: 'tour',
});

export const experienceController = createContentController(Experience, {
  label: 'Experience',
  writableFields: [...SHARED, 'title', 'location', 'duration', 'description', 'image', 'category'],
  searchFields: ['title', 'location', 'description', 'category'],
  filters: { category: 'category', location: 'location' },
  sortFields: ['title', 'createdAt'],
  defaultSort: { createdAt: 1 },
  wishlistType: 'experience',
});

export const eventController = createContentController(Event, {
  label: 'Event',
  writableFields: [
    ...SHARED,
    'title',
    'location',
    'category',
    'date',
    'startDate',
    'endDate',
    'image',
    'description',
    'highlights',
  ],
  searchFields: ['title', 'location', 'category', 'description'],
  filters: { category: 'category', location: 'location' },
  sortFields: ['startDate', 'title', 'createdAt'],
  defaultSort: { createdAt: 1 },
  ownerField: 'organizer',
  wishlistType: 'event',
});

export const storyController = createContentController(Story, {
  label: 'Story',
  writableFields: [...SHARED, 'title', 'category', 'author', 'date', 'reading', 'excerpt', 'image', 'content'],
  searchFields: ['title', 'excerpt', 'category', 'author'],
  filters: { category: 'category' },
  sortFields: ['date', 'title', 'createdAt'],
  defaultSort: { date: -1 },
  wishlistType: 'story',
});
