import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

import Container from "../../components/common/Container";
import PlannerBuilder from "../../components/common/PlannerBuilder";
import { apiList, apiOne } from "../../lib/api";
import type { PlannerDestination, PlannerSettings } from "../../lib/planner";

export const dynamic = "force-dynamic";

// Must mirror images.remotePatterns in next.config.ts; other hosts are served unoptimized.
const OPTIMIZABLE_IMAGE = /^(\/(?!\/)|https:\/\/(images\.unsplash\.com|res\.cloudinary\.com)\/)/;

async function loadPlannerPage() {
  const [settings, destinations] = await Promise.all([
    apiOne<PlannerSettings>("/planner/settings").catch(() => undefined),
    apiList<PlannerDestination>("/planner/destinations").catch(() => [] as PlannerDestination[]),
  ]);
  return { settings, destinations };
}

export default async function Plan() {
  const { settings, destinations } = await loadPlannerPage();
  const page = settings?.page;
  const strip = page?.showDestinations ? destinations.slice(0, page.destinationsLimit ?? 3) : [];
  const steps = (page?.howItWorks || []).filter((item) => item.title || item.text);

  return (
    <main className="min-h-screen bg-white text-[#1b1917]">
      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#faf8f4]">
        {/* Background image */}
        <div className="absolute inset-0">
          {page?.heroImage ? (
            <Image
              src={page.heroImage}
              alt=""
              fill
              priority
              sizes="100vw"
              quality={90}
              unoptimized={!OPTIMIZABLE_IMAGE.test(page.heroImage)}
              className="object-cover object-center"
            />
          ) : null}

          {/* Light editorial overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/75 via-white/25 via-[35%] to-transparent to-[60%]" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#faf8f4] to-transparent" />
        </div>

        <Container className="relative py-24 sm:py-28 lg:py-36">
          {page ? (
            <div className="max-w-4xl [text-shadow:0_0_18px_rgba(255,255,255,0.9),0_0_4px_rgba(255,255,255,0.8)]">
              {/* Eyebrow */}
              {page.heroEyebrow ? (
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-[#b76b43]" />

                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a35b36]">
                    {page.heroEyebrow}
                  </p>
                </div>
              ) : null}

              {/* Heading */}
              <h1
                className="
                  mt-6
                  max-w-4xl
                  font-serif
                  text-5xl
                  leading-[0.92]
                  tracking-[-0.04em]
                  text-[#1b1917]
                  sm:text-6xl
                  lg:text-8xl
                "
              >
                {page.heroTitle}
                {page.heroTitleMuted ? (
                  <>
                    <br />
                    <span className="text-[#1b1917]/55">{page.heroTitleMuted}</span>
                  </>
                ) : null}
              </h1>

              {page.heroDescription ? (
                <p className="mt-7 max-w-xl text-sm font-medium leading-7 text-[#1b1917]/85 sm:text-base">
                  {page.heroDescription}
                </p>
              ) : null}

              {/* Trust line */}
              {page.trustPoints?.length ? (
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#1b1917]/75">
                  {page.trustPoints.map((point, index) =>
                    index === 0 ? (
                      <span key={point} className="flex items-center gap-2">
                        <Sparkles size={12} className="text-[#b76b43]" />
                        {point}
                      </span>
                    ) : (
                      <span key={point}>{point}</span>
                    ),
                  )}
                </div>
              ) : null}
            </div>
          ) : null}
        </Container>
      </section>

      {/* =========================================================
          PLANNER
      ========================================================= */}
      <section className="relative z-10 -mt-8 pb-20 sm:-mt-12 sm:pb-24 lg:-mt-16 lg:pb-32">
        <Container>
          <div
            className="
              rounded-[28px]
              border
              border-[#e7dfd6]
              bg-white
              p-3
              shadow-[0_25px_80px_rgba(27,25,23,.10)]
              sm:rounded-[34px]
              sm:p-5
              lg:rounded-[40px]
              lg:p-7
            "
          >
            <PlannerBuilder initialSettings={settings} />
          </div>
        </Container>
      </section>

      {/* =========================================================
          HOW IT WORKS
      ========================================================= */}
      {page && (page.howItWorksTitle || steps.length) ? (
        <section className="border-t border-[#e7dfd6] bg-[#faf8f4] py-20 sm:py-24 lg:py-28">
          <Container>
            <div className="grid gap-12 lg:grid-cols-[.75fr_1.5fr] lg:gap-20">
              {/* Intro */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a35b36]">
                  {page.howItWorksEyebrow}
                </p>

                <h2 className="mt-4 max-w-sm font-serif text-4xl leading-tight tracking-[-0.02em] text-[#1b1917] sm:text-5xl">
                  {page.howItWorksTitle}
                </h2>

                {page.howItWorksDescription ? (
                  <p className="mt-5 max-w-sm text-sm leading-7 text-[#1b1917]/50">
                    {page.howItWorksDescription}
                  </p>
                ) : null}
              </div>

              {/* Steps */}
              {steps.length ? (
                <div className="divide-y divide-[#1b1917]/10 border-y border-[#1b1917]/10">
                  {steps.map((item, index) => (
                    <div
                      key={`${index}-${item.title}`}
                      className="
                        grid
                        gap-4
                        py-7
                        sm:grid-cols-[60px_1fr]
                        sm:gap-7
                        sm:py-8
                      "
                    >
                      <span className="text-[10px] font-semibold tracking-[0.18em] text-[#b76b43]">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div>
                        <h3 className="font-serif text-2xl text-[#1b1917] sm:text-3xl">
                          {item.title}
                        </h3>

                        <p className="mt-2 max-w-xl text-sm leading-6 text-[#1b1917]/45">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </Container>
        </section>
      ) : null}

      {/* =========================================================
          DESTINATION STRIP
      ========================================================= */}
      {strip.length ? (
        <section className="bg-white py-20 sm:py-24">
          <Container>
            <div className="grid gap-6 md:grid-cols-3">
              {strip.map((destination) => (
                <Link
                  key={destination.id}
                  href={`/destinations/${destination.slug}`}
                  className="
                    group
                    rounded-[24px]
                    border
                    border-[#e7dfd6]
                    bg-[#faf8f4]
                    p-6
                    transition-all
                    duration-500
                    hover:-translate-y-1
                    hover:bg-white
                    hover:shadow-[0_18px_45px_rgba(27,25,23,.07)]
                  "
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b76b43]">
                      {destination.name}
                    </p>

                    <span
                      className="
                        flex
                        h-9
                        w-9
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-[#1b1917]/10
                        transition-all
                        duration-300
                        group-hover:border-[#b76b43]
                        group-hover:bg-[#b76b43]
                        group-hover:text-white
                      "
                    >
                      <ArrowUpRight size={14} />
                    </span>
                  </div>

                  <h3 className="mt-8 font-serif text-2xl text-[#1b1917]">
                    {destination.shortDescription || destination.region}
                  </h3>

                  <div className="mt-7 h-px bg-[#1b1917]/[0.07]" />

                  <p className="mt-4 text-[10px] uppercase tracking-[0.16em] text-[#1b1917]/30">
                    {page?.destinationLinkLabel} {destination.name}
                  </p>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {/* =========================================================
          FINAL CTA
      ========================================================= */}
      {page && (page.finalTitle || page.finalCtaLabel) ? (
        <section className="border-t border-[#e7dfd6] bg-[#faf8f4]">
          <Container className="py-20 sm:py-24 lg:py-28">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a35b36]">
                  {page.finalEyebrow}
                </p>

                <h2 className="mt-3 max-w-2xl font-serif text-4xl leading-tight tracking-[-0.02em] text-[#1b1917] sm:text-5xl">
                  {page.finalTitle}
                </h2>
              </div>

              {page.finalCtaLabel && page.finalCtaHref ? (
                <Link
                  href={page.finalCtaHref}
                  className="
                    inline-flex
                    w-fit
                    items-center
                    gap-3
                    rounded-full
                    border
                    border-[#1b1917]/10
                    bg-white
                    px-6
                    py-3.5
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.14em]
                    text-[#1b1917]
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:border-[#b76b43]
                    hover:bg-[#b76b43]
                    hover:text-white
                    hover:shadow-[0_15px_35px_rgba(183,107,67,.18)]
                  "
                >
                  {page.finalCtaLabel}
                  <ArrowUpRight size={15} />
                </Link>
              ) : null}
            </div>
          </Container>
        </section>
      ) : null}
    </main>
  );
}
