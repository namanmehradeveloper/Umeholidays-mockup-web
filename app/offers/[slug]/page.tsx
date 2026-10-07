import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  Sparkles,
  Star,
} from "lucide-react";

import Container from "../../../components/common/Container";
import RichText from "../../../components/common/RichText";
import { apiOne } from "../../../lib/api";
import {
  formatInr,
  hasOfferDiscount,
  offerDiscountLabel,
  offerValidityLabel,
} from "../../../lib/offers";
import { isRichTextEmpty, richTextToPlainText } from "../../../lib/rich-text";
import type { Offer } from "../../../types";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

async function loadOffer(slug: string) {
  try {
    return await apiOne<Offer>(`/offers/slug/${encodeURIComponent(slug)}`);
  } catch {
    return undefined;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const offer = await loadOffer(slug);
  if (!offer) return {};

  const description =
    offer.metaDescription ||
    (richTextToPlainText(offer.summary) || richTextToPlainText(offer.description)).slice(0, 170) ||
    undefined;

  return {
    title: offer.metaTitle || offer.title,
    description,
    openGraph: offer.image ? { images: [offer.image] } : undefined,
  };
}

export default async function OfferPage({ params }: PageProps) {
  const { slug } = await params;
  const offer = await loadOffer(slug);
  if (!offer) notFound();

  const price = formatInr(offer.finalPrice);
  const discount = offerDiscountLabel(offer);
  const discounted = hasOfferDiscount(offer);
  const gallery = (offer.gallery || []).filter((url) => url && url !== offer.image);

  return (
    <main className="min-h-screen bg-white text-[#1b1917]">
      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="relative overflow-hidden bg-[#faf8f4] pb-14 pt-24 sm:pb-16 sm:pt-28 lg:pt-32">
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#b76b43]/10 blur-3xl" />

        <Container>
          <div className="relative">
            <Link
              href="/offers"
              className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#1b1917]/45 transition-colors hover:text-[#b76b43]"
            >
              <ArrowLeft size={13} />
              All offers
            </Link>

            <div className="mt-8 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#b76b43]/20 bg-[#b76b43]/[0.06] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#a35b36]">
                {offer.featured ? <Star size={11} /> : <Sparkles size={11} />}
                {offer.featured ? "Featured offer" : "Seasonal offer"}
              </span>

              {discount ? (
                <span className="rounded-full bg-[#b76b43] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white">
                  {discount}
                </span>
              ) : null}
            </div>

            <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-[0.95] tracking-[-0.03em] text-[#1b1917] sm:text-6xl lg:text-7xl">
              {offer.title}
            </h1>

            {offer.subtitle ? (
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#1b1917]/55">{offer.subtitle}</p>
            ) : null}
          </div>
        </Container>
      </section>

      {/* =====================================================
          CONTENT
      ====================================================== */}
      <section className="pb-24 pt-12 sm:pb-28 lg:pb-36">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.35fr_.65fr] lg:gap-14">
            <div className="min-w-0">
              {offer.image ? (
                <div className="relative aspect-[16/9] overflow-hidden rounded-[28px] bg-[#e9e1d8]">
                  <Image
                    src={offer.image}
                    alt={offer.title}
                    fill
                    priority
                    sizes="(max-width: 1023px) 100vw, 65vw"
                    className="object-cover"
                  />
                </div>
              ) : null}

              {!isRichTextEmpty(offer.summary) ? (
                <RichText
                  value={offer.summary}
                  className={`${offer.image ? "mt-10" : ""} font-serif text-2xl leading-snug text-[#1b1917] sm:text-3xl`}
                />
              ) : null}

              {!isRichTextEmpty(offer.description) ? (
                <RichText value={offer.description} className="mt-6 text-base leading-8 text-[#1b1917]/65" />
              ) : null}

              {offer.highlights?.length ? (
                <div className="mt-14 border-t border-[#ebe4dc] pt-12">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a35b36]">What&apos;s included</p>
                  <h2 className="mt-3 font-serif text-4xl tracking-[-0.02em]">Offer highlights</h2>

                  <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                    {offer.highlights.map((item) => (
                      <li key={item} className="flex items-start gap-3 rounded-2xl border border-[#ebe4dc] bg-[#faf8f4] p-4 text-sm leading-6 text-[#514a44]">
                        <Check size={16} className="mt-0.5 shrink-0 text-[#b76b43]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {gallery.length ? (
                <div className="mt-14 border-t border-[#ebe4dc] pt-12">
                  <h2 className="font-serif text-4xl tracking-[-0.02em]">Gallery</h2>
                  <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {gallery.map((url, index) => (
                      <div key={url} className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[#e9e1d8]">
                        <Image
                          src={url}
                          alt={`${offer.title} photo ${index + 1}`}
                          fill
                          sizes="(max-width: 639px) 50vw, 22vw"
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {!isRichTextEmpty(offer.terms) ? (
                <div className="mt-14 border-t border-[#ebe4dc] pt-12">
                  <h2 className="font-serif text-3xl tracking-[-0.02em]">Terms &amp; conditions</h2>
                  <RichText value={offer.terms} className="mt-5 text-sm leading-7 text-[#1b1917]/60" />
                </div>
              ) : null}
            </div>

            {/* Booking card */}
            <aside className="h-fit rounded-[28px] border border-[#e7dfd6] bg-[#faf8f4] p-7 shadow-[0_12px_40px_rgba(27,25,23,0.05)] lg:sticky lg:top-28">
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#1b1917]/35">
                {price ? "Starting from" : "Pricing"}
              </p>

              <div className="mt-1 flex flex-wrap items-baseline gap-x-3">
                <p className="font-serif text-4xl text-[#1b1917]">{price || "On request"}</p>
                {discounted ? (
                  <p className="text-base text-[#1b1917]/40 line-through">{formatInr(offer.originalPrice)}</p>
                ) : null}
              </div>

              {discounted ? (
                <p className="mt-1 text-xs font-semibold text-emerald-700">
                  You save {formatInr(offer.discountAmount)}
                </p>
              ) : (
                <p className="mt-1 text-[11px] text-[#1b1917]/40">Indicative pricing</p>
              )}

              <div className="mt-6 space-y-4 border-y border-[#ebe4dc] py-5 text-sm text-[#514a44]">
                {offer.duration ? (
                  <p className="flex items-start gap-3">
                    <CalendarDays size={16} className="mt-0.5 shrink-0 text-[#b76b43]" />
                    {offer.duration}
                  </p>
                ) : null}

                {offer.destinations?.length ? (
                  <p className="flex items-start gap-3">
                    <MapPin size={16} className="mt-0.5 shrink-0 text-[#b76b43]" />
                    {offer.destinations.join(" · ")}
                  </p>
                ) : null}

                <p className="flex items-start gap-3">
                  <Clock3 size={16} className="mt-0.5 shrink-0 text-[#b76b43]" />
                  {offerValidityLabel(offer)}
                </p>
              </div>

              <div className="mt-6 grid gap-3">
                {offer.tour ? (
                  <Link
                    href={`/tours/${offer.tour.slug}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#b76b43] px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white transition-all duration-300 hover:bg-[#934f30]"
                  >
                    View &amp; book tour
                    <ArrowUpRight size={14} />
                  </Link>
                ) : null}

                <Link
                  href="/contact"
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3.5 text-[10px] font-bold uppercase tracking-[0.15em] transition-all duration-300 ${
                    offer.tour
                      ? "border border-[#1b1917]/10 bg-white text-[#1b1917]/75 hover:border-[#b76b43] hover:text-[#b76b43]"
                      : "bg-[#b76b43] text-white hover:bg-[#934f30]"
                  }`}
                >
                  Enquire about this offer
                  <ArrowUpRight size={14} />
                </Link>

                <Link
                  href="/plan-your-trip"
                  className="text-center text-[10px] font-semibold uppercase tracking-[0.15em] text-[#1b1917]/45 transition-colors hover:text-[#b76b43]"
                >
                  Or plan a custom journey
                </Link>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </main>
  );
}
