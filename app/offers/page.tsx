import Link from "next/link";
import Container from "../../components/common/Container";
import SectionHeading from "../../components/common/SectionHeading";
import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Sparkles,
} from "lucide-react";

const offers = [
  [
    "Jaipur Heritage Escape",
    "3 Days / 2 Nights",
    "Jaipur",
    "From ₹16,900",
  ],
  [
    "Desert to Palace",
    "6 Days / 5 Nights",
    "Jaisalmer · Jodhpur · Udaipur",
    "From ₹32,900",
  ],
  [
    "Udaipur & Mount Abu Retreat",
    "5 Days / 4 Nights",
    "Udaipur · Mount Abu",
    "From ₹28,900",
  ],
];

export default function Offers() {
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
          <div className="grid gap-6 lg:grid-cols-3">
            {offers.map((offer, index) => (
              <article
                key={offer[0]}
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-[28px]
                  border
                  border-[#e7dfd6]
                  bg-white
                  p-7
                  shadow-[0_12px_40px_rgba(27,25,23,0.05)]
                  transition-all
                  duration-500
                  hover:-translate-y-1
                  hover:border-[#b76b43]/30
                  hover:shadow-[0_25px_60px_rgba(27,25,23,0.10)]
                  sm:p-8
                "
              >
                {/* Top accent */}
                <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-[#b76b43] via-[#d09270] to-transparent" />

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
                    <Sparkles size={11} />
                    Offer
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
                  {offer[0]}
                </h2>

                {/* Details */}
                <div className="mt-6 space-y-3 border-y border-[#ebe4dc] py-5">
                  <div className="flex items-start gap-3">
                    <CalendarDays
                      size={16}
                      strokeWidth={1.6}
                      className="mt-0.5 shrink-0 text-[#b76b43]"
                    />

                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#1b1917]/35">
                        Duration
                      </p>

                      <p className="mt-1 text-sm text-[#514a44]">
                        {offer[1]}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin
                      size={16}
                      strokeWidth={1.6}
                      className="mt-0.5 shrink-0 text-[#b76b43]"
                    />

                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#1b1917]/35">
                        Destinations
                      </p>

                      <p className="mt-1 text-sm leading-6 text-[#514a44]">
                        {offer[2]}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="mt-7">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#1b1917]/35">
                    Starting from
                  </p>

                  <p className="mt-1 font-serif text-3xl text-[#1b1917]">
                    {offer[3]}
                  </p>

                  <p className="mt-1 text-[11px] text-[#1b1917]/40">
                    Indicative pricing
                  </p>
                </div>

                {/* CTA */}
                <Link
                  href="/plan-your-trip"
                  className="
                    mt-7
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
                    hover:bg-[#b76b43]
                    hover:shadow-[0_12px_30px_rgba(183,107,67,0.20)]
                  "
                >
                  Ask for dates
                  <ArrowUpRight
                    size={14}
                    strokeWidth={1.8}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              </article>
            ))}
          </div>
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