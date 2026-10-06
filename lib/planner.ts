import {
  Baby,
  BedDouble,
  Bike,
  Building2,
  Bus,
  Camera,
  Car,
  CarFront,
  Castle,
  Compass,
  Crown,
  Gem,
  Heart,
  Home,
  Hotel,
  Landmark,
  Leaf,
  Mountain,
  Music,
  Palmtree,
  PawPrint,
  Plane,
  Route,
  Sparkles,
  Star,
  Sun,
  TrainFront,
  Tent,
  Users,
  Utensils,
  Waves,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/** Icons an admin can assign to planner options (stored by name). */
export const PLANNER_ICONS: Record<string, LucideIcon> = {
  Baby,
  BedDouble,
  Bike,
  Building2,
  Bus,
  Camera,
  Car,
  CarFront,
  Castle,
  Compass,
  Crown,
  Gem,
  Heart,
  Home,
  Hotel,
  Landmark,
  Leaf,
  Mountain,
  Music,
  Palmtree,
  PawPrint,
  Plane,
  Route,
  Sparkles,
  Star,
  Sun,
  TrainFront,
  Tent,
  Users,
  Utensils,
  Waves,
};

export type PlannerStepKey =
  | 'destination'
  | 'duration'
  | 'travel-style'
  | 'hotel'
  | 'transport'
  | 'activities'
  | 'travellers'
  | 'details';

export type PlannerStep = {
  key: PlannerStepKey;
  eyebrow?: string;
  title?: string;
  description?: string;
  summaryLabel?: string;
  emptyMessage?: string;
  status?: 'active' | 'inactive';
};

export type PlannerPageSettings = {
  heroEyebrow?: string;
  heroTitle?: string;
  heroTitleMuted?: string;
  heroDescription?: string;
  heroImage?: string;
  trustPoints?: string[];
  howItWorksEyebrow?: string;
  howItWorksTitle?: string;
  howItWorksDescription?: string;
  howItWorks?: Array<{ title?: string; text?: string }>;
  showDestinations?: boolean;
  destinationsLimit?: number;
  destinationLinkLabel?: string;
  finalEyebrow?: string;
  finalTitle?: string;
  finalCtaLabel?: string;
  finalCtaHref?: string;
};

export type PlannerSettings = {
  builder: { eyebrow?: string; title?: string };
  summary: {
    eyebrow?: string;
    title?: string;
    notSelectedLabel?: string;
    estimateLabel?: string;
    estimatePendingLabel?: string;
    adultsLabel?: string;
    childrenLabel?: string;
  };
  labels: Record<string, string | undefined>;
  success: { eyebrow?: string; title?: string; description?: string; resetLabel?: string };
  page: PlannerPageSettings;
  steps: PlannerStep[];
  limits: { maxAdults: number; maxChildren: number };
  pricing: { currency: string; disclaimer?: string };
};

export type PlannerChoice = {
  id: string;
  name: string;
  label?: string;
  description?: string;
  icon?: string;
  image?: string;
  days?: number;
  nights?: number;
};

export type PlannerDestination = {
  id: string;
  name: string;
  slug: string;
  region?: string;
  image?: string;
  shortDescription?: string;
};

export type PlannerSelection = {
  destinationId: string;
  durationId: string;
  travelStyleId: string;
  hotelId: string;
  transportId: string;
  activityIds: string[];
  adults: number;
  children: number;
};

export type PlannerQuote = {
  currency: string;
  destination: number;
  hotel: number;
  transport: number;
  activities: number;
  subtotal: number;
  adjustments: number;
  taxes: number;
  estimatedTotal: number;
  days: number;
  nights: number;
  disclaimer?: string;
};

export function formatPlannerAmount(amount: number, currency = 'INR') {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString('en-IN')}`;
  }
}
