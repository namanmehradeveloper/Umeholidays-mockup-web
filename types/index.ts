export type Tour = {
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  noIndex?: boolean;
  title: string;
  eyebrow?: string;
  duration: string;
  price: number;
  destinations: string[];
  category?: string;
  rating?: number;
  hotel?: string;
  transport?: string;
  difficulty?: string;
  ideal?: string;
  image: string;
  description: string;
  highlights: string[];
  itinerary: { day: string; title: string; text?: string }[];
};

export type Destination = {
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  noIndex?: boolean;
  name: string;
  region: string;
  tagline?: string;
  description: string;
  heroImage: string;
  bestTime?: string;
  recommendedDays?: number;
  highlights: string[];
  experiences: string[];
  food: string[];
  tips: string[];
};

export type Experience = {
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  noIndex?: boolean;
  title: string;
  location: string;
  duration?: string;
  description: string;
  image: string;
  category?: string;
};

export type Story = {
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  noIndex?: boolean;
  title: string;
  category?: string;
  author?: string;
  date?: string;
  reading?: string;
  excerpt?: string;
  image: string;
  content: string[];
};

export type OfferDiscountType = 'none' | 'percentage' | 'fixed';
export type OfferAvailability = 'live' | 'scheduled' | 'expired' | 'inactive';

export type Offer = {
  _id: string;
  slug: string;
  title: string;
  subtitle?: string;
  summary?: string;
  description?: string;
  terms?: string;
  highlights: string[];
  duration?: string;
  destinations: string[];
  tour?: Pick<Tour, 'title' | 'slug'> & { _id: string; image?: string; duration?: string; price?: number } | null;
  image?: string;
  gallery: string[];
  originalPrice?: number | null;
  discountType: OfferDiscountType;
  discountValue: number;
  discountAmount: number;
  finalPrice: number | null;
  startDate?: string | null;
  endDate?: string | null;
  status: 'active' | 'inactive';
  availability: OfferAvailability;
  featured: boolean;
  sortOrder: number;
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CmsRecord = {
  _id: string;
  title: string;
  status?: string;
  data?: Record<string, any>;
};

export type Event = {
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  noIndex?: boolean;
  title: string;
  location: string;
  category?: string;
  date?: string;
  image?: string;
  description?: string;
};
