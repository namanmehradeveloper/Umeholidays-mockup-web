import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarDays, MapPin } from 'lucide-react';

import Container from '../../../components/common/Container';
import RichText from '../../../components/common/RichText';
import SaveButton from '../../../components/common/SaveButton';
import { apiOne } from '../../../lib/api';
import { richTextToPlainText } from '../../../lib/rich-text';
import type { Destination } from '../../../types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const destination = await apiOne<Destination>(`/destinations/${encodeURIComponent(slug)}`);

  return destination
    ? {
        title: destination.metaTitle || destination.name,
        description: destination.metaDescription || richTextToPlainText(destination.description),
        alternates: destination.canonicalUrl ? { canonical: destination.canonicalUrl } : undefined,
        robots: destination.noIndex ? { index: false, follow: true } : undefined,
        openGraph: destination.ogImage ? { images: [destination.ogImage] } : undefined,
      }
    : {};
}

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = await apiOne<Destination>(`/destinations/${encodeURIComponent(slug)}`);

  if (!destination) notFound();

  return (
    <main className="bg-white pb-20 pt-[84px] text-[#1b1917]">
      <section className="border-b border-[#eee8e2] bg-white">
        <Container className="py-10 sm:py-14 lg:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-[.82fr_1.18fr] lg:gap-12">
            <div className="order-2 lg:order-1">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a35b36]">
                <MapPin size={14} />
                {destination.region}
              </div>

              <h1 className="mt-5 font-serif text-5xl leading-[0.95] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
                {destination.name}<span className="text-[#b76b43]">.</span>
              </h1>

              {destination.tagline ? (
                <p className="mt-5 max-w-xl text-base leading-7 text-[#6d655f] sm:text-lg">{destination.tagline}</p>
              ) : null}

              <div className="mt-7 flex flex-wrap gap-3 text-xs text-[#675f58]">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#e8e1da] bg-white px-4 py-2">
                  <CalendarDays size={14} className="text-[#b76b43]" />
                  {destination.bestTime || 'October – March'}
                </span>
                <span className="rounded-full border border-[#e8e1da] bg-white px-4 py-2">
                  {destination.recommendedDays || 2} recommended days
                </span>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="relative aspect-[16/10] overflow-hidden rounded-[28px] border border-[#e8e1da] bg-[#f6f1ec] shadow-[0_20px_60px_rgba(27,25,23,0.08)] sm:rounded-[34px]">
                <Image src={destination.heroImage} alt={destination.name} fill priority sizes="(max-width: 1023px) 100vw, 58vw" className="object-cover" />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Container>
        <section className="grid gap-10 py-16 lg:grid-cols-[1fr_360px] lg:gap-14 lg:py-20">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a35b36]">About the destination</p>
            <RichText value={destination.description} className="mt-5 max-w-3xl text-base leading-8 text-[#5f5751] sm:text-lg" />

            {destination.highlights?.length ? (
              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {destination.highlights.map((highlight) => (
                  <div key={highlight} className="rounded-2xl border border-[#ece5df] bg-[#fdfbf9] p-4 text-sm text-[#5f5751]">
                    {highlight}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <aside className="h-fit rounded-3xl border border-[#e9e2dc] bg-[#fffaf7] p-7 shadow-[0_12px_35px_rgba(27,25,23,0.04)] lg:sticky lg:top-28">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#a35b36]">Plan your stay</p>
            <p className="mt-5 text-sm text-[#5f5751]">Best time: {destination.bestTime || 'October – March'}</p>
            <p className="mt-2 text-sm text-[#5f5751]">Recommended: {destination.recommendedDays || 2} days</p>
            <div className="mt-5"><SaveButton slug={destination.slug} itemType="destination" /></div>
            <Link href={`/plan-your-trip?destination=${encodeURIComponent(destination.name)}`} className="mt-3 block rounded-full bg-[#b76b43] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#934f30]">
              Plan this destination
            </Link>
          </aside>
        </section>

        <section className="grid gap-8 border-t border-[#eee8e2] py-16 md:grid-cols-3">
          <InfoList title="Experiences" items={destination.experiences} />
          <InfoList title="Food" items={destination.food} />
          <InfoList title="Tips" items={destination.tips} />
        </section>
      </Container>
    </main>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="font-serif text-3xl">{title}</h2>
      {items?.length ? (
        <ul className="mt-5 space-y-3 text-sm leading-6 text-[#68605a]">
          {items.map((item) => <li key={item}>— {item}</li>)}
        </ul>
      ) : (
        <p className="mt-5 text-sm text-[#9a9088]">Details will be added soon.</p>
      )}
    </div>
  );
}
