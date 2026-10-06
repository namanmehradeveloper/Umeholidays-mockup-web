export const dynamic = 'force-dynamic';

import { SearchCategories, SearchCta, SearchHero } from '../../components/search/SearchSections';
import { fetchSections } from '../../lib/cms';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const initialQuery = Array.isArray(params.q) ? params.q[0] || '' : params.q || '';
  const sections = await fetchSections('search-sections');
  const results = sections.find((section) => section.key === 'results');

  return (
    <main className="min-h-screen bg-white pt-[84px] text-[#1b1917]">
      {sections.map((section) => {
        switch (section.key) {
          case 'hero':
            return <SearchHero key={section.key} section={section} results={results} initialQuery={initialQuery} />;
          case 'categories':
            return <SearchCategories key={section.key} section={section} />;
          case 'cta':
            return <SearchCta key={section.key} section={section} />;
          default:
            return null;
        }
      })}
    </main>
  );
}
