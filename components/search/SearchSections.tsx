import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import Container from '../common/Container';
import SearchBox from '../common/SearchBox';
import type { SearchBoxLabels } from '../common/SearchBox';
import { CMS_ICONS } from '../home/cmsIcons';
import { onlyPublished } from '../home/published';
import { cmsNumber, cmsText, fetchCmsRecords, fetchList } from '../../lib/cms';
import type { HomeSectionContent } from '../../lib/cms';

type SectionProps = { section: HomeSectionContent };

const RESULT_LABEL_FIELDS = [
  'placeholder',
  'submitLabel',
  'loadingLabel',
  'resultsHeading',
  'resultSingular',
  'resultPlural',
  'emptyTitle',
  'emptyMessage',
  'errorMessage',
  'destinationsLabel',
  'toursLabel',
  'experiencesLabel',
  'storiesLabel',
  'eventsLabel',
] as const;

export function searchBoxLabels(section: HomeSectionContent | undefined): SearchBoxLabels {
  return Object.fromEntries(
    RESULT_LABEL_FIELDS.map((field) => [field, cmsText(section, field)]).filter(([, value]) => value),
  );
}

async function popularTerms(section: HomeSectionContent): Promise<string[]> {
  if (cmsText(section, 'popularSource') === 'destinations') {
    const limit = cmsNumber(section, 'popularLimit') ?? 5;
    const destinations = onlyPublished(
      await fetchList<{ name?: string }>(`/destinations?limit=${Math.max(1, Math.min(limit, 50))}`),
    );
    return destinations.map((destination) => cmsText(destination, 'name')).filter((name): name is string => Boolean(name));
  }

  const records = onlyPublished(await fetchCmsRecords('search-popular'));
  return records.map((record) => cmsText(record.data, 'term') ?? cmsText(record, 'title')).filter((term): term is string => Boolean(term));
}

export async function SearchHero({
  section,
  results,
  initialQuery,
}: SectionProps & { results?: HomeSectionContent; initialQuery: string }) {
  const eyebrow = cmsText(section, 'eyebrow');
  const titleLines = (cmsText(section, 'title') ?? '').split('\n').filter(Boolean);
  const description = cmsText(section, 'description');
  const popularLabel = cmsText(section, 'popularLabel');
  const popular = await popularTerms(section);

  return (
    <section className="relative overflow-hidden border-b border-[#eee9e4] bg-white">
      <div className="pointer-events-none absolute left-1/2 top-[-260px] h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-[#b76b43]/[0.055] blur-[100px]" />
      <Container className="relative py-16 sm:py-20 lg:py-24">
        <div className="mx-auto w-full max-w-4xl text-center">
          {eyebrow && (
            <div className="flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-[#b76b43]/60" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#a35b36]">{eyebrow}</span>
              <span className="h-px w-8 bg-[#b76b43]/60" />
            </div>
          )}

          {titleLines.length > 0 && (
            <h1 className="mx-auto mt-6 max-w-3xl font-serif text-[42px] font-medium leading-[0.98] tracking-[-0.04em] text-[#191715] sm:text-5xl md:text-6xl lg:text-[72px]">
              {titleLines.map((line, index) => (
                <span key={index}>
                  {index > 0 && <br className="hidden sm:block" />}
                  {index > 0 && ' '}
                  {line}
                </span>
              ))}
            </h1>
          )}

          {description && (
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-[#706963] sm:text-base">{description}</p>
          )}

          <div className="mx-auto mt-9 w-full max-w-3xl text-left">
            <SearchBox initialQuery={initialQuery} labels={searchBoxLabels(results)} />
          </div>

          {popular.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {popularLabel && (
                <span className="mr-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#1b1917]/35">{popularLabel}</span>
              )}
              {popular.map((item) => (
                <Link
                  key={item}
                  href={`/search?q=${encodeURIComponent(item)}`}
                  className="rounded-full border border-[#e9e4de] bg-white px-3.5 py-2 text-[11px] font-medium text-[#625b55] shadow-[0_3px_12px_rgba(27,25,23,0.03)] transition hover:border-[#b76b43]/40 hover:bg-[#fffaf7] hover:text-[#a35b36]"
                >
                  {item}
                </Link>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

export async function SearchCategories({ section }: SectionProps) {
  const records = onlyPublished(await fetchCmsRecords('search-categories'));
  const categories = records
    .map((record) => ({
      id: record._id,
      title: cmsText(record.data, 'title') ?? cmsText(record, 'title'),
      description: cmsText(record.data, 'description'),
      url: cmsText(record.data, 'url'),
      Icon: CMS_ICONS[cmsText(record.data, 'icon') ?? ''] as LucideIcon | undefined,
    }))
    .filter((category) => category.title && category.url);

  if (!categories.length) return null;

  const eyebrow = cmsText(section, 'eyebrow');
  const title = cmsText(section, 'title');
  const description = cmsText(section, 'description');
  const itemCtaLabel = cmsText(section, 'itemCtaLabel');

  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <Container>
        {(eyebrow || title || description) && (
          <div className="mx-auto max-w-2xl text-center">
            {eyebrow && <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#a35b36]">{eyebrow}</p>}
            {title && (
              <h2 className="mt-3 font-serif text-3xl font-medium tracking-[-0.025em] text-[#1b1917] sm:text-4xl">{title}</h2>
            )}
            {description && <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#1b1917]/50">{description}</p>}
          </div>
        )}

        <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map(({ id, title: itemTitle, description: itemDescription, url, Icon }) => (
            <Link
              key={id}
              href={url!}
              className="group rounded-[22px] border border-[#ece7e2] bg-white p-5 shadow-[0_8px_30px_rgba(27,25,23,0.035)] transition-all hover:-translate-y-1 hover:border-[#b76b43]/25 hover:shadow-[0_16px_40px_rgba(27,25,23,0.07)]"
            >
              {Icon && (
                <div className="grid h-11 w-11 place-items-center rounded-full bg-[#faf6f2] text-[#b76b43] transition group-hover:bg-[#b76b43] group-hover:text-white">
                  <Icon size={18} strokeWidth={1.7} />
                </div>
              )}
              <h3 className={`${Icon ? 'mt-5' : ''} font-serif text-xl font-medium text-[#1b1917] transition-colors group-hover:text-[#a35b36]`}>
                {itemTitle}
              </h3>
              {itemDescription && <p className="mt-2 text-xs leading-6 text-[#1b1917]/45">{itemDescription}</p>}
              {itemCtaLabel && (
                <span className="mt-5 inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[#b76b43]">
                  {itemCtaLabel} <span className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              )}
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function SearchCta({ section }: SectionProps) {
  const title = cmsText(section, 'title');
  const description = cmsText(section, 'description');
  const buttonLabel = cmsText(section, 'buttonLabel');
  const buttonUrl = cmsText(section, 'buttonUrl');
  const showButton = Boolean(buttonLabel && buttonUrl);

  if (!title && !description && !showButton) return null;

  return (
    <section className="border-t border-[#eee9e4] bg-[#fdfcfb]">
      <Container className="py-10">
        <div className="flex flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
          <div>
            {title && <p className="font-serif text-xl text-[#1b1917]">{title}</p>}
            {description && <p className="mt-1 text-xs leading-5 text-[#1b1917]/45">{description}</p>}
          </div>
          {showButton && (
            <Link
              href={buttonUrl!}
              className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-[#b76b43] px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#a35b36] transition hover:bg-[#b76b43] hover:text-white"
            >
              {buttonLabel}
            </Link>
          )}
        </div>
      </Container>
    </section>
  );
}
