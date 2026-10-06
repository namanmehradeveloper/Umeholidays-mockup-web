import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import Container from '../../../components/common/Container';
import SaveButton from '../../../components/common/SaveButton';
import BookingForm from '../../../components/common/BookingForm';
import FAQ from '../../../components/common/FAQ';
import RichText from '../../../components/common/RichText';

import { apiList, apiOne } from '../../../lib/api';
import { richTextToPlainText } from '../../../lib/rich-text';
import type { Tour } from '../../../types';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const t = await apiOne<Tour>(
    `/tours/${encodeURIComponent(slug)}`
  );

  return t
    ? {
        title: t.metaTitle || t.title,
        description: t.metaDescription || richTextToPlainText(t.description),
        alternates: t.canonicalUrl
          ? { canonical: t.canonicalUrl }
          : undefined,
        robots: t.noIndex
          ? {
              index: false,
              follow: true,
            }
          : undefined,
        openGraph: t.ogImage
          ? {
              images: [t.ogImage],
            }
          : undefined,
      }
    : {};
}

export default async function TourPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [t, faqs] = await Promise.all([
    apiOne<Tour>(
      `/tours/${encodeURIComponent(slug)}`
    ),
    apiList<any>('/public-records/faqs'),
  ]);

  if (!t) notFound();

  return (
    <main className="min-h-screen bg-white text-[#1b1917] pt-20">
      <Container>

        {/* =====================================================
            HERO / BOOKING
        ===================================================== */}
        <section className="grid gap-8 py-10 lg:grid-cols-[1.4fr_.6fr] lg:py-14">

          {/* Image */}
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-[#f3eee8]">
            <Image
              src={t.image}
              alt={t.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 70vw"
            />
          </div>

          {/* Booking Sidebar */}
          <aside className="h-fit border border-black/[0.08] bg-white p-7 shadow-[0_12px_40px_rgba(27,25,23,0.05)] lg:sticky lg:top-24">

            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a35b36]">
              {t.eyebrow}
            </p>

            <h1 className="mt-2 font-serif text-4xl leading-tight tracking-[-0.02em] sm:text-5xl">
              {t.title}
            </h1>

            <div className="mt-4 flex items-center gap-3 text-sm text-black/50">
              <span>{t.duration}</span>

              <span className="h-1 w-1 rounded-full bg-[#b76b43]" />

              <span>{t.rating} ★</span>
            </div>

            <div className="mt-6 border-t border-black/[0.08] pt-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/40">
                Starting from
              </p>

              <p className="mt-1 font-serif text-3xl text-[#1b1917]">
                ₹{t.price.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="mt-5">
              <SaveButton slug={t.slug} />
            </div>

            <Link
              href="/plan-your-trip"
              className="mt-3 flex items-center justify-center border border-[#1b1917]/15 px-5 py-3 text-sm font-medium transition hover:border-[#b76b43] hover:text-[#a35b36]"
            >
              Ask about this journey
            </Link>

            <BookingForm tour={t} />
          </aside>
        </section>


        {/* =====================================================
            OVERVIEW
        ===================================================== */}
        <section className="grid gap-12 border-t border-black/[0.08] py-20 lg:grid-cols-[.8fr_1.2fr] lg:py-24">

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a35b36]">
              Overview
            </p>

            <h2 className="mt-3 font-serif text-4xl leading-tight tracking-[-0.02em] sm:text-5xl">
              A journey designed to breathe.
            </h2>
          </div>

          <div>
            <RichText
              value={t.description}
              className="text-lg leading-8 text-black/65"
            />

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {t.highlights.map((x) => (
                <div
                  key={x}
                  className="border-t border-black/[0.08] pt-4 text-sm text-[#1b1917]"
                >
                  {x}
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* =====================================================
            ITINERARY
        ===================================================== */}
        <section className="border-t border-black/[0.08] py-20 lg:py-24">

          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a35b36]">
            The itinerary
          </p>

          <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
            Day by day
          </h2>

          <div className="mt-10 divide-y divide-black/[0.08]">
            {t.itinerary.map((x) => (
              <div
                key={x.day}
                className="grid gap-3 py-7 sm:grid-cols-[100px_1fr]"
              >
                <div className="text-xs font-semibold tracking-[0.15em] text-[#a35b36]">
                  DAY {x.day}
                </div>

                <div>
                  <h3 className="font-serif text-2xl text-[#1b1917]">
                    {x.title}
                  </h3>

                  <p className="mt-2 max-w-3xl text-sm leading-7 text-black/55">
                    {x.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* =====================================================
            TOUR DETAILS
        ===================================================== */}
        <section className="grid gap-5 border-t border-black/[0.08] py-20 sm:grid-cols-2 lg:grid-cols-4">

          {[
            ['Hotel category', t.hotel],
            ['Transport', t.transport],
            ['Difficulty', t.difficulty],
            ['Ideal traveller', t.ideal],
          ].map(([label, value]) => (
            <div
              key={label}
              className="border-l border-[#b76b43]/30 pl-4"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-black/40">
                {label}
              </p>

              <p className="mt-2 text-sm text-[#1b1917]">
                {value}
              </p>
            </div>
          ))}
        </section>


        {/* =====================================================
            FAQ
        ===================================================== */}
        <section className="border-t border-black/[0.08] py-20 lg:py-24">

          <div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr]">

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a35b36]">
                Questions
              </p>

              <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
                Before you book
              </h2>

              <p className="mt-4 max-w-sm text-sm leading-6 text-black/50">
                Everything you may want to know before starting your Rajasthan journey.
              </p>
            </div>

            <FAQ
              items={faqs.map((r: any) => [
                r.data?.question || r.title,
                r.data?.answer || '',
              ])}
            />

          </div>
        </section>

      </Container>
    </main>
  );
}