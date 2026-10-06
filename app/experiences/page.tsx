import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock3, MapPin } from "lucide-react";

import Container from "../../components/common/Container";
import SectionHeading from "../../components/common/SectionHeading";

import { apiList } from "../../lib/api";
import type { Experience } from "../../types";
import RichText from "../../components/common/RichText";
import { richTextToPlainText } from "../../lib/rich-text";

export const dynamic = "force-dynamic";

export default async function Experiences() {
  const experiences = await apiList<Experience>("/experiences?limit=100");
  return (
    <main className="min-h-screen bg-white text-[#1b1917]">
      {/* =====================================================
          INTRO
      ====================================================== */}
      <section
        className="
          relative
          overflow-hidden
          bg-[#faf8f4]
          pb-16
          pt-24
          sm:pb-20
          sm:pt-28
          lg:pb-24
          lg:pt-36
        "
      >
        {/* Decorative circles */}
        <div
          className="
            pointer-events-none
            absolute
            -right-32
            -top-32
            h-80
            w-80
            rounded-full
            bg-[#b76b43]/10
            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-28
            -left-32
            h-72
            w-72
            rounded-full
            bg-[#d8c2a9]/20
            blur-3xl
          "
        />

        <Container>
          <div className="relative">
            <SectionHeading
              eyebrow="Experiences"
              title="The moments between the landmarks."
              text="Discover the slower, more personal side of Rajasthan through local experiences, culture, food and unforgettable moments."
            />

            <div
              className="
                mt-8
                flex
                items-center
                gap-3
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.24em]
                text-[#1b1917]/40
              "
            >
              <span className="h-px w-8 bg-[#b76b43]/60" />
              <span>Live · Feel · Discover</span>
            </div>
          </div>
        </Container>
      </section>

      {/* =====================================================
          EXPERIENCES GRID
      ====================================================== */}
      <section className="bg-white pb-24 pt-16 sm:pb-28 sm:pt-20 lg:pb-36">
        <Container>
          <div
            className="
              grid
              gap-x-6
              gap-y-14
              sm:grid-cols-2
              sm:gap-y-16
              lg:grid-cols-3
              lg:gap-x-7
              lg:gap-y-20
            "
          >
            {experiences.map((experience, index) => (
              <Link
                key={experience.slug}
                href={`/experiences/${experience.slug}`}
                className="
                  group
                  block
                  min-w-0
                  outline-none
                  focus-visible:rounded-[28px]
                  focus-visible:ring-2
                  focus-visible:ring-[#b76b43]
                "
              >
                {/* =================================================
                    IMAGE
                ================================================== */}
                <div
                  className="
                    relative
                    aspect-[4/3]
                    w-full
                    overflow-hidden
                    rounded-[26px]
                    bg-[#eee8df]
                    shadow-[0_15px_45px_rgba(27,25,23,0.07)]
                    transition-all
                    duration-700
                    group-hover:-translate-y-1
                    group-hover:shadow-[0_25px_60px_rgba(27,25,23,0.13)]
                    sm:rounded-[30px]
                  "
                >
                  <Image
                    src={experience.image}
                    alt={`${experience.title} - UME Holidays`}
                    fill
                    sizes="
                      (max-width: 639px) 100vw,
                      (max-width: 1023px) 50vw,
                      33vw
                    "
                    className="
                      object-cover
                      transition-transform
                      duration-[1200ms]
                      ease-out
                      group-hover:scale-[1.06]
                    "
                  />

                  {/* Image overlay */}
                  <div
                    className="
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-black/60
                      via-black/5
                      to-transparent
                    "
                  />

                  {/* Hover overlay */}
                  <div
                    className="
                      absolute
                      inset-0
                      bg-[#b76b43]/10
                      opacity-0
                      transition-opacity
                      duration-500
                      group-hover:opacity-100
                    "
                  />

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
                      text-[10px]
                      font-semibold
                      tracking-[0.15em]
                      text-white
                      backdrop-blur-md
                      sm:left-5
                      sm:top-5
                    "
                  >
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  {/* Explore badge */}
                  <div
                    className="
                      absolute
                      right-4
                      top-4
                      flex
                      items-center
                      gap-2
                      rounded-full
                      border
                      border-white/20
                      bg-black/15
                      px-3
                      py-2
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.15em]
                      text-white
                      backdrop-blur-md
                      sm:right-5
                      sm:top-5
                    "
                  >
                    Experience
                  </div>

                  {/* Bottom image content */}
                  <div
                    className="
                      absolute
                      bottom-0
                      left-0
                      right-0
                      p-5
                      sm:p-6
                    "
                  >
                    <p
                      className="
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.22em]
                        text-[#e8bda6]
                      "
                    >
                      Discover Rajasthan
                    </p>

                    <div className="mt-2 flex items-end justify-between gap-4">
                      <h2
                        className="
                          max-w-[80%]
                          font-serif
                          text-2xl
                          leading-tight
                          text-white
                          sm:text-3xl
                        "
                      >
                        {experience.title}
                      </h2>

                      <span
                        className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          translate-y-2
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-white/30
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
                        <ArrowUpRight
                          size={17}
                          strokeWidth={1.6}
                        />
                      </span>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    CARD DETAILS
                ================================================== */}
                <div className="px-1 pt-5 sm:pt-6">
                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.14em]
                        text-[#a35b36]
                      "
                    >
                      <MapPin
                        size={12}
                        strokeWidth={1.6}
                      />

                      {experience.location}
                    </span>

                    <span className="h-1 w-1 rounded-full bg-[#b76b43]/40" />

                    <span
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.14em]
                        text-[#777068]
                      "
                    >
                      <Clock3
                        size={12}
                        strokeWidth={1.6}
                      />

                      {experience.duration}
                    </span>
                  </div>

                  <h3
                    className="
                      mt-3
                      font-serif
                      text-2xl
                      text-[#1b1917]
                      transition-colors
                      duration-300
                      group-hover:text-[#b76b43]
                    "
                  >
                    {experience.title}
                  </h3>

                  <p
                    className="
                      mt-2
                      text-sm
                      leading-6
                      text-[#746c64]
                    "
                  >
                    {richTextToPlainText(experience.description)}
                  </p>

                  {/* Bottom row */}
                  <div className="mt-5 flex items-center justify-between">
                    <span
                      className="
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.2em]
                        text-black/30
                      "
                    >
                      UME Holidays
                    </span>

                    <span
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.12em]
                        text-[#a35b36]
                        transition-transform
                        duration-300
                        group-hover:translate-x-1
                      "
                    >
                      Explore
                      <ArrowUpRight
                        size={13}
                        strokeWidth={1.8}
                      />
                    </span>
                  </div>

                  <div className="mt-4 h-px w-full bg-black/[0.07]" />
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* =====================================================
          BOTTOM CTA
      ====================================================== */}
      <section
        className="
          border-t
          border-[#e7dfd6]
          bg-[#faf8f4]
          py-20
          sm:py-24
          lg:py-28
        "
      >
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <p
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.24em]
                text-[#b76b43]
              "
            >
              Go beyond sightseeing
            </p>

            <h2
              className="
                mt-3
                font-serif
                text-4xl
                leading-tight
                tracking-[-0.02em]
                text-[#1b1917]
                sm:text-5xl
                lg:text-6xl
              "
            >
              Experience Rajasthan
              <br />
              at your own pace.
            </h2>

            <p
              className="
                mx-auto
                mt-5
                max-w-xl
                text-sm
                leading-7
                text-[#1b1917]/55
                sm:text-base
              "
            >
              From quiet mornings and local flavours to unforgettable cultural
              encounters, let us build experiences around the way you want to
              travel.
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
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-white
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-[#b76b43]
                hover:shadow-[0_15px_35px_rgba(183,107,67,.22)]
              "
            >
              Plan my experience
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}