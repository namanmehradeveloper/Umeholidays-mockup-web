"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Pause,
  Play,
} from "lucide-react";
import { useEffect, useState } from "react";

/* =========================================================
   TYPES
========================================================= */

export type BannerSlide = {
  id: string;
  img: string;
  place?: string;
  eyebrow?: string;
  line?: string;
  headline?: string;
  cta?: string;
};

export type HeroLabels = {
  title?: string;
  topLabel?: string;
  brandLabel?: string;
  primaryCtaLabel?: string;
  primaryCtaUrl?: string;
  secondaryCtaLabel?: string;
  slideCountLabel?: string;
};

/* =========================================================
   HERO
========================================================= */

export default function Hero({
  slides,
  labels,
}: {
  slides: BannerSlide[];
  labels: HeroLabels;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  /* =======================================================
     AUTO SLIDER
  ======================================================= */

  useEffect(() => {
    if (paused || slides.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((previous) => {
        return (previous + 1) % slides.length;
      });
    }, 6500);

    return () => {
      window.clearInterval(timer);
    };
  }, [paused, slides.length]);

  /* =======================================================
     INDEX SAFETY
  ======================================================= */

  useEffect(() => {
    if (
      index >= slides.length &&
      slides.length > 0
    ) {
      setIndex(0);
    }
  }, [index, slides.length]);

  /* =======================================================
     CONTROLS
  ======================================================= */

  const previousSlide = () => {
    if (slides.length <= 1) return;

    setIndex((previous) => {
      return (
        (previous - 1 + slides.length) %
        slides.length
      );
    });
  };

  const nextSlide = () => {
    if (slides.length <= 1) return;

    setIndex((previous) => {
      return (previous + 1) % slides.length;
    });
  };

  const currentSlide = slides[index];

  if (!currentSlide) {
    return null;
  }

  const showPrimaryCta = Boolean(labels.primaryCtaLabel && labels.primaryCtaUrl);
  const showSecondaryCta = Boolean(labels.secondaryCtaLabel && currentSlide.cta);

  /* =======================================================
     HERO BANNER
  ======================================================= */

  return (
    <section
      className="
        relative

        h-[500px]
        min-h-[500px]

        overflow-hidden

        bg-[#171513]

        text-white

        select-none

        sm:h-[550px]
        sm:min-h-[550px]

        lg:h-[600px]
        lg:min-h-[600px]

        xl:h-[630px]
        xl:min-h-[630px]
      "
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label={labels.title}
    >
      {/* ===================================================
          BACKGROUND SLIDES
      =================================================== */}

      {slides.map((slide, slideIndex) => {
        const active = slideIndex === index;

        return (
          <div
            key={slide.id}
            aria-hidden={!active}
            className={`
              absolute
              inset-0

              transition-opacity
              duration-1000
              ease-in-out

              ${
                active
                  ? "z-0 opacity-100"
                  : "pointer-events-none z-[-1] opacity-0"
              }
            `}
          >
            <Image
              src={slide.img}
              alt={slide.place ?? slide.headline ?? ""}
              fill
              priority={slideIndex === 0}
              sizes="100vw"
              quality={100}
              unoptimized
              className={`
                object-cover
                object-center

                transition-transform
                duration-[7000ms]
                ease-out

                ${
                  active
                    ? "scale-100"
                    : "scale-[1.03]"
                }
              `}
            />
          </div>
        );
      })}

      {/* ===================================================
          IMAGE OVERLAYS
      =================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-[1]

          bg-black/20
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-[2]

          bg-gradient-to-r

          from-black/75
          via-black/35
          to-black/5
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          z-[3]

          bg-gradient-to-t

          from-black/70
          via-transparent
          to-black/20
        "
      />

      {/* ===================================================
          TOP BRAND
      =================================================== */}

      {(labels.topLabel || labels.brandLabel) && (
        <div
          className="
            absolute

            left-5
            right-5
            top-20

            z-20

            flex
            items-center
            justify-between

            sm:left-8
            sm:right-8
            sm:top-24

            lg:left-12
            lg:right-12
          "
        >
          {labels.topLabel ? (
            <div className="flex items-center gap-3">
              <span
                className="
                  h-px
                  w-8
                  bg-white/70

                  sm:w-12
                "
              />

              <span
                className="
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.28em]

                  text-white

                  drop-shadow-[0_1px_4px_rgba(0,0,0,0.45)]

                  sm:text-[10px]
                  sm:tracking-[0.35em]
                "
              >
                {labels.topLabel}
              </span>
            </div>
          ) : (
            <span />
          )}

          {labels.brandLabel && (
            <span
              className="
                hidden

                text-[9px]
                font-semibold
                uppercase
                tracking-[0.25em]

                text-white

                drop-shadow-[0_1px_4px_rgba(0,0,0,0.45)]

                sm:block
              "
            >
              {labels.brandLabel}
            </span>
          )}
        </div>
      )}

      {/* ===================================================
          MAIN CONTENT
      =================================================== */}

      <div
        className="
          relative
          z-10

          mx-auto

          flex
          h-full
          max-w-[1500px]

          items-end

          px-5
          pb-24

          sm:px-8
          sm:pb-26

          lg:px-12
          lg:pb-24
        "
      >
        <div
          key={currentSlide.id}
          className="
            max-w-3xl
            animate-rise
          "
          aria-live="polite"
        >
          {/* Eyebrow */}

          <div
            className="
              mb-4
              flex
              items-center
              gap-3

              sm:mb-5
            "
          >
            <span
              className="
                text-[10px]
                font-bold
                text-[#d9895c]
              "
            >
              {String(index + 1).padStart(
                2,
                "0"
              )}
            </span>

            <span
              className="
                h-px
                w-8
                bg-[#d9895c]
              "
            />

            {currentSlide.eyebrow && (
              <span
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.2em]

                  text-white

                  drop-shadow-[0_1px_5px_rgba(0,0,0,0.6)]

                  sm:text-[10px]
                "
              >
                {currentSlide.eyebrow}
              </span>
            )}
          </div>

          {/* Heading */}

          {currentSlide.place && (
            <h1
              className="
                max-w-4xl

                font-serif

                text-[3.5rem]
                font-medium
                leading-[0.88]
                tracking-[-0.045em]

                text-white

                drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]

                sm:text-[4.8rem]
                md:text-[5.7rem]
                lg:text-[6.8rem]
                xl:text-[7.5rem]
              "
            >
              {currentSlide.place}

              <span className="text-[#d9895c]">
                .
              </span>
            </h1>
          )}

          {/* Optional headline */}

          {currentSlide.headline && (
            <p
              className="
                mt-4

                max-w-2xl

                font-serif
                text-lg
                leading-7

                text-white/95

                drop-shadow-[0_1px_6px_rgba(0,0,0,0.65)]

                sm:text-xl
              "
            >
              {currentSlide.headline}
            </p>
          )}

          {/* Description */}

          {currentSlide.line && (
            <p
              className="
                mt-4
                max-w-lg

                text-sm
                font-medium
                leading-6

                text-white

                drop-shadow-[0_1px_6px_rgba(0,0,0,0.65)]

                sm:text-base
                sm:leading-7

                lg:text-lg
              "
            >
              {currentSlide.line}
            </p>
          )}

          {/* CTA */}

          {(showPrimaryCta || showSecondaryCta) && (
            <div
              className="
                mt-7

                flex
                flex-wrap
                items-center
                gap-3

                sm:mt-8
              "
            >
              {showPrimaryCta && (
                <Link
                  href={labels.primaryCtaUrl!}
                  className="
                    group

                    inline-flex
                    min-h-11

                    items-center
                    justify-center
                    gap-2

                    bg-[#b76b43]

                    px-5

                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.12em]

                    text-white

                    transition-all
                    duration-300

                    hover:-translate-y-0.5
                    hover:bg-[#934f30]

                    hover:shadow-[0_12px_30px_rgba(183,107,67,0.30)]

                    sm:min-h-12
                    sm:px-6
                    sm:text-[11px]
                  "
                >
                  {labels.primaryCtaLabel}

                  <ArrowUpRight
                    size={15}
                    strokeWidth={1.8}
                    className="
                      transition-transform
                      duration-300

                      group-hover:translate-x-0.5
                      group-hover:-translate-y-0.5
                    "
                  />
                </Link>
              )}

              {showSecondaryCta && (
                <Link
                  href={currentSlide.cta!}
                  className="
                    group

                    inline-flex
                    min-h-11

                    items-center
                    justify-center
                    gap-2

                    border
                    border-white/60

                    bg-black/15

                    px-5

                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.12em]

                    text-white

                    backdrop-blur-sm

                    transition-all
                    duration-300

                    hover:-translate-y-0.5
                    hover:border-white
                    hover:bg-black/25

                    sm:min-h-12
                    sm:px-6
                    sm:text-[11px]
                  "
                >
                  {labels.secondaryCtaLabel}

                  <ArrowUpRight
                    size={15}
                    strokeWidth={1.8}
                    className="
                      transition-transform
                      duration-300

                      group-hover:translate-x-0.5
                      group-hover:-translate-y-0.5
                    "
                  />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ===================================================
          BOTTOM CONTROLS
      =================================================== */}

      <div
        className="
          absolute

          bottom-5
          left-5
          right-5

          z-20

          flex
          items-center
          justify-between

          sm:bottom-6
          sm:left-8
          sm:right-8

          lg:left-12
          lg:right-12
        "
      >
        {/* Counter */}

        <div className="flex items-center gap-4">
          <span
            className="
              font-serif
              text-lg

              text-white

              drop-shadow-[0_1px_5px_rgba(0,0,0,0.5)]

              sm:text-2xl
            "
          >
            {String(index + 1).padStart(
              2,
              "0"
            )}
          </span>

          <span
            className="
              h-px
              w-7

              bg-white/60

              sm:w-12
            "
          />

          <span
            className="
              text-[8px]
              font-medium
              uppercase
              tracking-[0.2em]

              text-white/80

              sm:text-[9px]
            "
          >
            {String(slides.length).padStart(
              2,
              "0"
            )}
            {labels.slideCountLabel ? ` ${labels.slideCountLabel}` : null}
          </span>
        </div>

        {/* Controls */}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={previousSlide}
            disabled={slides.length <= 1}
            aria-label="Previous slide"
            className="
              flex
              h-9
              w-9

              items-center
              justify-center

              border
              border-white/50

              bg-black/15

              text-white

              backdrop-blur-sm

              transition-all
              duration-300

              hover:border-white
              hover:bg-black/30

              disabled:cursor-not-allowed
              disabled:opacity-40

              sm:h-11
              sm:w-11
            "
          >
            <ArrowLeft
              size={16}
              strokeWidth={1.5}
            />
          </button>

          <button
            type="button"
            onClick={() =>
              setPaused((value) => !value)
            }
            disabled={slides.length <= 1}
            aria-label={
              paused
                ? "Play slideshow"
                : "Pause slideshow"
            }
            className="
              hidden

              h-9
              w-9

              items-center
              justify-center

              border
              border-white/50

              bg-black/15

              text-white

              backdrop-blur-sm

              transition-all
              duration-300

              hover:border-white
              hover:bg-black/30

              disabled:cursor-not-allowed
              disabled:opacity-40

              sm:flex
              sm:h-11
              sm:w-11
            "
          >
            {paused ? (
              <Play
                size={14}
                strokeWidth={1.5}
              />
            ) : (
              <Pause
                size={14}
                strokeWidth={1.5}
              />
            )}
          </button>

          <button
            type="button"
            onClick={nextSlide}
            disabled={slides.length <= 1}
            aria-label="Next slide"
            className="
              flex
              h-9
              w-9

              items-center
              justify-center

              border
              border-white/50

              bg-black/15

              text-white

              backdrop-blur-sm

              transition-all
              duration-300

              hover:border-white
              hover:bg-black/30

              disabled:cursor-not-allowed
              disabled:opacity-40

              sm:h-11
              sm:w-11
            "
          >
            <ArrowRight
              size={16}
              strokeWidth={1.5}
            />
          </button>
        </div>
      </div>

      {/* ===================================================
          PROGRESS BAR
      =================================================== */}

      <div
        className="
          absolute

          bottom-0
          left-0
          right-0

          z-30

          h-[2px]

          bg-white/30
        "
      >
        <div
          className="
            h-full

            bg-[#b76b43]

            transition-all
            duration-500
          "
          style={{
            width: `${
              ((index + 1) /
                slides.length) *
              100
            }%`,
          }}
        />
      </div>
    </section>
  );
}
