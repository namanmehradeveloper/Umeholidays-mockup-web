import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";

import Container from "../../components/common/Container";
import SectionHeading from "../../components/common/SectionHeading";

import { apiList } from "../../lib/api";

export const dynamic = "force-dynamic";

type Destination = {
  _id?: string;
  slug: string;
  name: string;
  tagline?: string;
  heroImage: string;
};

export default async function Destinations() {
  const destinations = await apiList<Destination>(
    "/destinations?limit=100"
  );

  return (
    <main className="min-h-screen bg-white text-[#1b1917]">
      {/* =========================================================
          INTRO
      ========================================================= */}

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
        {/* Decorative background */}
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
            -left-40
            bottom-0
            h-72
            w-72
            rounded-full
            bg-[#d8c2a9]/20
            blur-3xl
          "
        />

        {/* Small decorative line */}
        <div
          className="
            pointer-events-none
            absolute
            right-[12%]
            top-20
            hidden
            h-24
            w-px
            bg-[#b76b43]/15
            lg:block
          "
        />

        <Container>
          <div className="relative">
            <SectionHeading
              eyebrow="Destinations"
              title="Start with a place that calls you."
              text="Explore Rajasthan through its cities, landscapes, stories and slower ways of travelling."
            />

            {/* Intro line */}
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
              <span>Rajasthan · India</span>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================
          DESTINATIONS
      ========================================================= */}

      <section className="bg-white pb-24 pt-16 sm:pb-28 sm:pt-20 lg:pb-36">
        <Container>
          <div
            className="
              grid
              grid-cols-1
              gap-x-6
              gap-y-14
              sm:grid-cols-2
              sm:gap-x-6
              sm:gap-y-16
              lg:grid-cols-3
              lg:gap-x-7
              lg:gap-y-20
            "
          >
            {destinations.map((destination, index) => (
              <Link
                key={destination.slug}
                href={`/destinations/${destination.slug}`}
                className={`
                  group
                  block
                  min-w-0
                  outline-none
                  focus-visible:rounded-[28px]
                  focus-visible:ring-2
                  focus-visible:ring-[#b76b43]

                  ${
                    index % 3 === 1
                      ? "lg:translate-y-12"
                      : ""
                  }
                `}
              >
                {/* =================================================
                    IMAGE CARD
                ================================================== */}

                <div
                  className="
                    relative
                    aspect-[4/5]
                    w-full
                    overflow-hidden
                    rounded-[28px]
                    bg-[#ded2c2]
                    shadow-[0_18px_50px_rgba(27,25,23,.08)]
                    transition-all
                    duration-700
                    ease-out
                    group-hover:-translate-y-1
                    group-hover:shadow-[0_28px_70px_rgba(27,25,23,.16)]
                    sm:rounded-[32px]
                  "
                >
                  {/* Image */}
                  <Image
                    src={destination.heroImage}
                    alt={`${destination.name} - UME Holidays`}
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
                      group-hover:scale-[1.07]
                    "
                  />

                  {/* Main cinematic overlay */}
                  <div
                    className="
                      absolute
                      inset-0
                      bg-gradient-to-b
                      from-black/5
                      via-transparent
                      to-black/75
                    "
                  />

                  {/* Warm subtle overlay */}
                  <div
                    className="
                      absolute
                      inset-0
                      bg-gradient-to-tr
                      from-[#5a3020]/15
                      via-transparent
                      to-transparent
                    "
                  />

                  {/* Hover overlay */}
                  <div
                    className="
                      absolute
                      inset-0
                      bg-gradient-to-r
                      from-black/10
                      via-transparent
                      to-black/10
                      opacity-0
                      transition-opacity
                      duration-700
                      group-hover:opacity-100
                    "
                  />

                  {/* =================================================
                      TOP BADGES
                  ================================================== */}

                  <div
                    className="
                      absolute
                      left-4
                      right-4
                      top-4
                      flex
                      items-center
                      justify-between
                      sm:left-5
                      sm:right-5
                      sm:top-5
                    "
                  >
                    {/* Number */}
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-white/30
                        bg-black/15
                        text-[10px]
                        font-semibold
                        tracking-[0.16em]
                        text-white
                        backdrop-blur-md
                      "
                    >
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    {/* Rajasthan badge */}
                    <div
                      className="
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
                        font-medium
                        uppercase
                        tracking-[0.18em]
                        text-white/90
                        backdrop-blur-md
                      "
                    >
                      <MapPin size={11} strokeWidth={1.5} />
                      Rajasthan
                    </div>
                  </div>

                  {/* =================================================
                      IMAGE CONTENT
                  ================================================== */}

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
                        mb-2
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.24em]
                        text-[#e8bda6]
                      "
                    >
                      Discover
                    </p>

                    <div className="flex items-end justify-between gap-4">
                      <div className="min-w-0">
                        <h2
                          className="
                            font-serif
                            text-3xl
                            leading-none
                            tracking-[-0.02em]
                            text-white
                            sm:text-4xl
                            lg:text-[2.6rem]
                          "
                        >
                          {destination.name}
                        </h2>

                        <p
                          className="
                            mt-2
                            max-w-[260px]
                            text-xs
                            leading-5
                            text-white/65
                          "
                        >
                          {destination.tagline}
                        </p>
                      </div>

                      {/* Arrow */}
                      <div
                        className="
                          flex
                          h-11
                          w-11
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
                          size={18}
                          strokeWidth={1.5}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    BELOW CARD
                ================================================== */}

                <div className="px-1 pt-5 sm:pt-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p
                        className="
                          text-[9px]
                          font-semibold
                          uppercase
                          tracking-[0.22em]
                          text-[#b76b43]
                        "
                      >
                        Destination
                      </p>

                      <h3
                        className="
                          mt-1
                          font-serif
                          text-xl
                          text-[#1b1917]
                          transition-colors
                          duration-300
                          group-hover:text-[#b76b43]
                          sm:text-2xl
                        "
                      >
                        {destination.name}
                      </h3>
                    </div>

                    <span
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-black/10
                        text-[#1b1917]/45
                        transition-all
                        duration-300
                        group-hover:border-[#b76b43]/30
                        group-hover:bg-[#b76b43]
                        group-hover:text-white
                      "
                    >
                      <ArrowUpRight
                        size={15}
                        strokeWidth={1.6}
                      />
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="mt-5 h-px w-full bg-black/[0.07]" />

                  <div className="mt-3 flex items-center justify-between">
                    <span
                      className="
                        text-[10px]
                        uppercase
                        tracking-[0.18em]
                        text-black/35
                      "
                    >
                      UME Holidays
                    </span>

                    <span className="text-[10px] text-black/35">
                      Explore →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* =========================================================
          BOTTOM CTA
      ========================================================= */}

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
              Can&apos;t decide?
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
              Let Rajasthan choose
              <br />
              your next story.
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
              Tell us how you want to travel, and we&apos;ll help shape a
              journey around your pace, interests and time.
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
              Plan my journey
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}