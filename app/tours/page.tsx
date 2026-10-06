import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Sparkles } from "lucide-react";

import Container from "../../components/common/Container";
import SectionHeading from "../../components/common/SectionHeading";

import { apiList } from "../../lib/api";
import { richTextToPlainText } from "../../lib/rich-text";
import type { Tour } from "../../types";

export const dynamic = "force-dynamic";

export default async function Tours() {
  const tours = await apiList<Tour>("/tours?limit=100");
  return (
    <main className="min-h-screen bg-white text-[#1b1917]">
      {/* =========================================================
          HERO / INTRO
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#faf8f4] pb-16 pt-24 sm:pb-20 sm:pt-28 lg:pb-24 lg:pt-36">
        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-40 -top-40 h-[480px] w-[480px] rounded-full bg-[#b76b43]/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-[#d8c2a9]/20 blur-3xl" />

        <Container>
          <div className="relative">
            <SectionHeading
              eyebrow="Journeys"
              title="Routes with a point of view."
              text="Use these as starting points. Every itinerary can be shaped around your pace."
            />

            <div className="mt-8 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#1b1917]/35">
              <span className="h-px w-8 bg-[#b76b43]" />
              <span>Curated routes · Made around you</span>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================
          TOURS GRID
      ========================================================= */}
      <section className="bg-white pb-24 pt-16 sm:pb-28 sm:pt-20 lg:pb-36">
        <Container>
          <div className="grid gap-x-8 gap-y-16 md:grid-cols-2 lg:gap-x-10 lg:gap-y-20">
            {tours.map((tour, index) => (
              <Link
                href={`/tours/${tour.slug}`}
                key={tour.slug}
                className="group block"
              >
                <div className="grid gap-5 sm:grid-cols-2 sm:gap-7">
                  {/* =================================================
                      IMAGE
                  ================================================== */}
                  <div
                    className="
                      relative
                      aspect-[4/5]
                      overflow-hidden
                      rounded-[26px]
                      bg-[#e9e1d8]
                      shadow-[0_15px_45px_rgba(27,25,23,0.07)]
                      transition-all
                      duration-700
                      group-hover:-translate-y-1
                      group-hover:shadow-[0_25px_60px_rgba(27,25,23,0.12)]
                    "
                  >
                    <Image
                      src={tour.image}
                      alt={`${tour.title} - UME Holidays`}
                      fill
                      sizes="
                        (max-width: 639px) 100vw,
                        (max-width: 767px) 50vw,
                        45vw
                      "
                      quality={90}
                      className="
                        object-cover
                        transition-transform
                        duration-[1200ms]
                        ease-out
                        group-hover:scale-[1.06]
                      "
                    />

                    {/* Image overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

                    {/* Number */}
                    <div
                      className="
                        absolute
                        left-4
                        top-4
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-white/25
                        bg-black/15
                        text-[9px]
                        font-semibold
                        tracking-[0.16em]
                        text-white
                        backdrop-blur-md
                      "
                    >
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    {/* Journey badge */}
                    <div
                      className="
                        absolute
                        right-4
                        top-4
                        rounded-full
                        border
                        border-white/20
                        bg-black/15
                        px-3
                        py-2
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.15em]
                        text-white
                        backdrop-blur-md
                      "
                    >
                      Journey
                    </div>

                    {/* Bottom label */}
                    <div className="absolute bottom-5 left-5 right-5">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#e3b193]">
                        UME Holidays
                      </p>

                      <div className="mt-2 flex items-end justify-between gap-3">
                        <p className="font-serif text-2xl leading-tight text-white">
                          {tour.title}
                        </p>

                        <span
                          className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-white/25
                            bg-white/10
                            text-white
                            opacity-0
                            backdrop-blur-md
                            transition-all
                            duration-500
                            group-hover:translate-y-0
                            group-hover:opacity-100
                          "
                        >
                          <ArrowUpRight size={16} />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* =================================================
                      CONTENT
                  ================================================== */}
                  <div className="flex flex-col justify-end pb-2 sm:pb-3">
                    {/* Eyebrow */}
                    <div className="flex items-center gap-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#a35b36]">
                        {tour.eyebrow}
                      </p>

                      <span className="h-1 w-1 rounded-full bg-[#b76b43]" />

                      <Sparkles
                        size={12}
                        className="text-[#b76b43]"
                      />
                    </div>

                    {/* Title */}
                    <h2
                      className="
                        mt-3
                        font-serif
                        text-3xl
                        leading-tight
                        tracking-[-0.02em]
                        text-[#1b1917]
                        transition-colors
                        duration-300
                        group-hover:text-[#a35b36]
                        lg:text-4xl
                      "
                    >
                      {tour.title}
                    </h2>

                    {/* Description */}
                    <p className="mt-3 text-sm leading-6 text-[#1b1917]/50">
                      {richTextToPlainText(tour.description)}
                    </p>

                    {/* Meta */}
                    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#1b1917]/45">
                        <CalendarDays
                          size={13}
                          strokeWidth={1.6}
                          className="text-[#b76b43]"
                        />
                        {tour.duration}
                      </span>

                      <span className="h-1 w-1 rounded-full bg-[#b76b43]/40" />

                      <span className="text-xs font-medium text-[#1b1917]/55">
                        From ₹{tour.price.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="mt-6 h-px w-full bg-[#1b1917]/[0.08]" />

                    {/* CTA */}
                    <div
                      className="
                        mt-5
                        flex
                        items-center
                        justify-between
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.15em]
                      "
                    >
                      <span className="text-[#1b1917]/35">
                        UME Holidays
                      </span>

                      <span
                        className="
                          inline-flex
                          items-center
                          gap-2
                          text-[#a35b36]
                          transition-transform
                          duration-300
                          group-hover:translate-x-1
                        "
                      >
                        View journey
                        <ArrowUpRight size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* =========================================================
          CUSTOM JOURNEY CTA
      ========================================================= */}
      <section className="border-t border-[#e7dfd6] bg-[#faf8f4] py-20 sm:py-24 lg:py-28">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#a35b36]">
              Make it yours
            </p>

            <h2
              className="
                mt-4
                font-serif
                text-4xl
                leading-tight
                tracking-[-0.03em]
                text-[#1b1917]
                sm:text-5xl
                lg:text-6xl
              "
            >
              Every journey can
              <br />
              take a different route.
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#1b1917]/50 sm:text-base">
              These itineraries are only starting points. Tell us your dates,
              interests and preferred pace, and we'll shape the journey around
              you.
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
                font-semibold
                uppercase
                tracking-[0.16em]
                text-white
                transition-all
                duration-300
                hover:-translate-y-1
                hover:bg-[#934f30]
                hover:shadow-[0_18px_40px_rgba(183,107,67,.22)]
              "
            >
              Build my journey
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}