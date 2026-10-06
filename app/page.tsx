export const dynamic = 'force-dynamic';

import type { ComponentType } from 'react';
import HeroSection from '../components/home/HeroSection';
import TripPlannerSection from '../components/home/TripPlannerSection';
import {
  Destinations,
  Story,
  Moods,
  Tours,
  Experiences,
  MapSection,
  Why,
  Seasonal,
  Testimonials,
  Journal,
  FAQSection,
  FinalCTA,
} from '../components/home/HomeSections';
import { fetchHomeSections } from '../lib/cms';
import type { HomeSectionContent } from '../lib/cms';

const SECTION_COMPONENTS: Record<string, ComponentType<{ section: HomeSectionContent }>> = {
  hero: HeroSection,
  'trip-planner': TripPlannerSection,
  destinations: Destinations,
  story: Story,
  moods: Moods,
  tours: Tours,
  experiences: Experiences,
  map: MapSection,
  why: Why,
  seasonal: Seasonal,
  testimonials: Testimonials,
  journal: Journal,
  faqs: FAQSection,
  'final-cta': FinalCTA,
};

export default async function Home() {
  const sections = await fetchHomeSections();

  return (
    <main className="min-h-screen bg-white text-[#24211F]">
      {sections.map((section) => {
        const Section = SECTION_COMPONENTS[section.key];
        return Section ? <Section key={section.key} section={section} /> : null;
      })}
    </main>
  );
}
