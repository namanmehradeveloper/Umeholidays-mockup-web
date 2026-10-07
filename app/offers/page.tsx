import Image from "next/image";
import Link from "next/link";
import Container from "../../components/common/Container";
import SectionHeading from "../../components/common/SectionHeading";
import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  MapPin,
  Sparkles,
  Star,
} from "lucide-react";
import { apiList } from "../../lib/api";
import {
  formatInr,
  hasOfferDiscount,
  offerDiscountLabel,
  offerValidityLabel,
} from "../../lib/offers";
import type { Offer } from "../../types";

export const dynamic = "force-dynamic";

export default async function Offers() {
  const offers = await apiList<Offer>("/offers/public?limit=100").catch(() => [] as Offer[]);

  return (
    <main className="min-h-screen bg-white text-[#1b1917]">
      {/* =====================================================
          HERO / INTRO
      ====================================================== */}
      <section className="relative overflow-hidden bg-[#faf8f4] pb-16 pt-24 sm:pb-20 sm:pt-28 lg:pb-24 lg:pt-36">
        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#b76b43]/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-[#d8c2a9]/20 blur-3xl" />

        <Container>
          <div className="relative">
            <SectionHeading
              eyebrow="Seasonal offers"
              title="Good reasons to go soon."
              text="Indicative packages only. Final pricing depends on dates, stays and inclusions."
            />

            <div className="mt-8 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#1b1917]/40">
              <span className="h-px w-8 bg-[#b76b43]/60" />
              <span>Curated journeys · Seasonal escapes</span>
            </div>
          </div>
        </Container>
      </section>

      {/* =====================================================
          OFFERS
      ====================================================== */}
      <section className="bg-white pb-24 pt-16 sm:pb-28 sm:pt-20 lg:pb-36">
        <Container>
          {offers.length ? (
            <div className="grid gap-6 lg:grid-cols-3">
              {offers.map((offer, index) => {
                const href = `/offers/${offer.slug}`;
                const discount = offerDiscountLabel(offer);
                const discounted = hasOfferDiscount(offer);
                const price = formatInr(offer.finalPrice);

                return (
                  <article
                    key={offer._id}
                    className="
                      group
                      relative
                      flex
                      flex-col
                      overflow-hidden
                      rounded-[28px]
                      border
                      border-[#e7dfd6]
                      bg-white
                      shadow-[0_12px_40px_rgba(27,25,23,0.05)]
                      transition-all
                      duration-500
                      hover:-translate-y-1
                      hover:border-[#b76b43]/30
                      hover:shadow-[0_25px_60px_rgba(27,25,23,0.10)]
                    "
                  >
                    {/* Top accent */}
                    <div className="absolute left-0 right-0 top-0 z-10 h-1 bg-gradient-to-r from-[#b76b43] via-[#d09270] to-transparent" />

                    {offer.image ? (
                      <Link href={href} className="relative block aspect-[16/10] overflow-hidden bg-[#e9e1d8]">
                        <Image
                          src={offer.image}
                          alt={offer.title}
                          fill
                          sizes="(max-width: 1023px) 100vw, 33vw"
                          className="object-cover transition-transform duration-[1000ms] ease-out group-hover:scale-105"
                        />
                        {discount ? (
                          <span className="absolute bottom-4 left-4 rounded-full bg-[#b76b43] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-lg">
                            {discount}
                          </span>
                        ) : null}
                      </Link>
                    ) : null}

                    <div className="flex flex-1 flex-col p-7 sm:p-8">
                      {/* Number + offer badge */}
                      <div className="flex items-center justify-between">
                        <span
                          className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-full
                            bg-[#faf8f4]
                            text-[10px]
                            font-semibold
                            tracking-[0.12em]
                            text-[#1b1917]/50
                          "
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span
                          className="
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-full
                            border
                            border-[#b76b43]/20
                            bg-[#b76b43]/[0.06]
                            px-3
                            py-1.5
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-[0.16em]
                            text-[#a35b36]
                          "
                        >
                          {offer.featured ? <Star size={11} /> : <Sparkles size={11} />}
                          {offer.featured ? "Featured" : !offer.image && discount ? discount : "Offer"}
                        </span>
                      </div>

                      {/* Title */}
                      <h2
                        className="
                          mt-7
                          font-serif
                          text-3xl
                          leading-tight
                          text-[#1b1917]
                          transition-colors
                          duration-300
                          group-hover:text-[#b76b43]
                        "
                      >
                        <Link href={href}>{offer.title}</Link>
                      </h2>

                      {offer.subtitle ? (
                        <p className="mt-2 text-sm leading-6 text-[#1b1917]/55">{offer.subtitle}</p>
                      ) : null}

                      {/* Details */}
                      <div className="mt-6 space-y-3 border-y border-[#ebe4dc] py-5">
                        {offer.duration ? (
                          <OfferDetail icon={CalendarDays} label="Duration" value={offer.duration} />
                        ) : null}

                        {offer.destinations?.length ? (
                          <OfferDetail icon={MapPin} label="Destinations" value={offer.destinations.join(" · ")} />
                        ) : null}

                        <OfferDetail icon={Clock3} label="Validity" value={offerValidityLabel(offer)} />
                      </div>

                      {/* Price */}
                      <div className="mt-7">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#1b1917]/35">
                          {price ? "Starting from" : "Pricing"}
                        </p>

                        <div className="mt-1 flex flex-wrap items-baseline gap-x-3">
                          <p className="font-serif text-3xl text-[#1b1917]">{price || "On request"}</p>
                          {discounted ? (
                            <p className="text-sm text-[#1b1917]/40 line-through">{formatInr(offer.originalPrice)}</p>
                          ) : null}
                        </div>

                        <p className="mt-1 text-[11px] text-[#1b1917]/40">Indicative pricing</p>
                      </div>

                      {/* CTA */}
                      <div className="mt-auto pt-7">
                        <Link
                          href={href}
                          className="
                            inline-flex
                            w-full
                            items-center
                            justify-center
                            gap-2
                            rounded-full
                            bg-[#b76b43]
                            px-5
                            py-3.5
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.15em]
                            text-white
                            transition-all
                            duration-300
                            hover:bg-[#934f30]
                            hover:shadow-[0_12px_30px_rgba(183,107,67,0.20)]
                          "
                        >
                          View offer
                          <ArrowUpRight
                            size={14}
                            strokeWidth={1.8}
                            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mx-auto max-w-xl rounded-[28px] border border-dashed border-[#e7dfd6] bg-[#faf8f4] px-6 py-16 text-center">
              <Sparkles className="mx-auto text-[#b76b43]" size={22} />
              <h2 className="mt-4 font-serif text-3xl text-[#1b1917]">New offers are on the way.</h2>
              <p className="mt-3 text-sm leading-7 text-[#1b1917]/55">
                There are no live offers right now. Tell us your dates and we will shape a journey around your budget.
              </p>
            </div>
          )}
        </Container>
      </section>

      {/* =====================================================
          NOTE / CUSTOM JOURNEY CTA
      ====================================================== */}
      <section className="border-t border-[#e7dfd6] bg-[#faf8f4] py-20 sm:py-24 lg:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#b76b43]">
              Something more personal?
            </p>

            <h2 className="mt-3 font-serif text-4xl leading-tight tracking-[-0.02em] text-[#1b1917] sm:text-5xl lg:text-6xl">
              Your journey does not
              <br />
              have to follow a package.
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#1b1917]/55 sm:text-base">
              Tell us your dates, interests and preferred pace. We can shape a
              private Rajasthan journey around you.
            </p>

            <Link
              href="/plan-your-trip"
              className="
                mt-8
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-[#b76b43]
                px-6
                py-3.5
                text-[10px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-white
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-[#934f30]
                hover:shadow-[0_15px_35px_rgba(183,107,67,0.22)]
              "
            >
              Plan my journey
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}

function OfferDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={16} strokeWidth={1.6} className="mt-0.5 shrink-0 text-[#b76b43]" />

      <div>
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#1b1917]/35">{label}</p>

        <p className="mt-1 text-sm leading-6 text-[#514a44]">
          {value}
        </p>
      </div>
    </div>
  );
}
