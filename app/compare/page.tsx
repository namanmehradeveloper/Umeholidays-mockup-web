import Link from "next/link";
import {
  ArrowUpRight,
  GitCompareArrows,
  Sparkles,
} from "lucide-react";

import Container from "../../components/common/Container";
import SectionHeading from "../../components/common/SectionHeading";
import Compare from "../../components/common/Compare";

export default function ComparePage() {
  return (
    <main className="min-h-screen bg-white text-[#1b1917]">
      {/* =========================================================
          HERO / INTRO
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#faf8f4] pb-16 pt-24 sm:pb-20 sm:pt-28 lg:pb-24 lg:pt-36">
        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-40 -top-40 h-[460px] w-[460px] rounded-full bg-[#b76b43]/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full bg-[#d8c2a9]/20 blur-3xl" />

        <Container>
          <div className="relative">
            <SectionHeading
              eyebrow="Compare journeys"
              title="Put a few routes side by side."
              text="Select up to three starting points. Final inclusions and pricing are confirmed during planning."
            />

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#1b1917]/35">
              <span className="flex items-center gap-2">
                <GitCompareArrows
                  size={14}
                  className="text-[#b76b43]"
                />
                Compare up to three
              </span>

              <span className="h-1 w-1 rounded-full bg-[#b76b43]/50" />

              <span className="flex items-center gap-2">
                <Sparkles
                  size={13}
                  className="text-[#b76b43]"
                />
                Shape it your way
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================
          COMPARE
      ========================================================= */}
      <section className="pb-20 pt-12 sm:pb-24 sm:pt-16 lg:pb-32">
        <Container>
          <div
            className="
              overflow-hidden
              rounded-[28px]
              border
              border-[#e7dfd6]
              bg-white
              p-4
              shadow-[0_20px_65px_rgba(27,25,23,0.07)]
              sm:rounded-[34px]
              sm:p-6
              lg:rounded-[40px]
              lg:p-8
            "
          >
            <div className="mb-7 flex items-center justify-between gap-4 border-b border-[#e7dfd6] pb-5">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#a35b36]">
                  Your shortlist
                </p>

                <h2 className="mt-1 font-serif text-2xl text-[#1b1917] sm:text-3xl">
                  Compare journeys
                </h2>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#faf8f4] text-[#b76b43]">
                <GitCompareArrows size={18} />
              </div>
            </div>

            <Compare />
          </div>
        </Container>
      </section>

      {/* =========================================================
          INFO STRIP
      ========================================================= */}
      <section className="border-y border-[#e7dfd6] bg-[#faf8f4] py-16 sm:py-20">
        <Container>
          <div className="grid gap-8 md:grid-cols-3 md:gap-0 md:divide-x md:divide-[#1b1917]/10">
            <div className="px-0 md:px-8 md:first:pl-0">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#b76b43]">
                01
              </p>

              <h3 className="mt-3 font-serif text-2xl text-[#1b1917]">
                Compare the starting points
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#1b1917]/45">
                Look at different routes, durations and starting prices before
                deciding where to go next.
              </p>
            </div>

            <div className="px-0 md:px-8">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#b76b43]">
                02
              </p>

              <h3 className="mt-3 font-serif text-2xl text-[#1b1917]">
                Keep what feels right
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#1b1917]/45">
                Use the comparison as a starting point rather than a fixed
                itinerary.
              </p>
            </div>

            <div className="px-0 md:px-8 md:last:pr-0">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#b76b43]">
                03
              </p>

              <h3 className="mt-3 font-serif text-2xl text-[#1b1917]">
                Make it personal
              </h3>

              <p className="mt-2 text-sm leading-6 text-[#1b1917]/45">
                Final inclusions and pricing can be shaped around your dates,
                pace and interests.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================
          CTA
      ========================================================= */}
      <section className="bg-white py-20 sm:py-24 lg:py-28">
        <Container>
          <div className="rounded-[30px] border border-[#e7dfd6] bg-[#faf8f4] px-6 py-14 text-center shadow-[0_15px_45px_rgba(27,25,23,0.05)] sm:rounded-[36px] sm:px-10 sm:py-16 lg:px-16">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#a35b36]">
              Need help choosing?
            </p>

            <h2 className="mx-auto mt-4 max-w-3xl font-serif text-4xl leading-tight tracking-[-0.03em] text-[#1b1917] sm:text-5xl lg:text-6xl">
              Let the journey take shape around you.
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#1b1917]/50 sm:text-base">
              Tell us what matters to you and we'll help turn your shortlist
              into a Rajasthan journey that fits your time and pace.
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
                hover:shadow-[0_18px_40px_rgba(183,107,67,0.22)]
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