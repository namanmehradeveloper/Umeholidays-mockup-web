"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

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

const AUTOPLAY_MS = 5000;

const ARROW =
  "absolute top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-12 sm:w-12";

export default function Hero({ slides, labels }: { slides: BannerSlide[]; labels: HeroLabels }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  // `index` is a dependency so manual navigation restarts the autoplay timer.
  useEffect(() => {
    if (paused || count <= 1) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [paused, count, index]);

  useEffect(() => {
    if (index >= count && count > 0) setIndex(0);
  }, [index, count]);

  if (!count) return null;

  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);

  return (
    <section
      className="relative mt-[76px] h-[360px] w-full select-none overflow-hidden bg-[#171513] sm:mt-[80px] sm:h-[460px] lg:mt-[84px] lg:h-[590px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label={labels.title || "Featured destinations"}
    >
      {slides.map((slide, slideIndex) => {
        const active = slideIndex === index;
        return (
          <div
            key={slide.id}
            aria-hidden={!active}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              active ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <Image
              src={slide.img}
              alt={slide.place ?? slide.headline ?? ""}
              fill
              priority={slideIndex === 0}
              sizes="100vw"
              quality={100}
              unoptimized
              className="object-cover object-center"
            />
          </div>
        );
      })}

      {count > 1 && (
        <>
          <button type="button" onClick={() => go(-1)} aria-label="Previous slide" className={`${ARROW} left-4 sm:left-6`}>
            <ChevronLeft size={22} strokeWidth={2.2} />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next slide" className={`${ARROW} right-4 sm:right-6`}>
            <ChevronRight size={22} strokeWidth={2.2} />
          </button>
        </>
      )}
    </section>
  );
}
