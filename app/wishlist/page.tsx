import Link from "next/link";
import { ArrowLeft, Heart, Sparkles } from "lucide-react";

import Container from "../../components/common/Container";
import SectionHeading from "../../components/common/SectionHeading";
import LocalStorageList from "../../components/common/LocalStorageList";

export default function Wishlist() {
  return (
    <main className="min-h-screen bg-white text-[#1b1917]">
      {/* =========================================================
          HERO / INTRO
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#faf8f4] pb-16 pt-24 sm:pb-20 sm:pt-28 lg:pb-24 lg:pt-36">
        {/* Decorative elements */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-[400px] w-[400px] rounded-full bg-[#b76b43]/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[360px] w-[360px] rounded-full bg-[#d8c2a9]/20 blur-3xl" />

        <Container>
          <div className="relative">
            <SectionHeading
              eyebrow="Saved journeys"
              title="Keep the ones you love."
            />

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#1b1917]/35">
              <span className="flex items-center gap-2">
                <Heart
                  size={13}
                  className="text-[#b76b43]"
                />
                Your saved places
              </span>

              <span className="h-1 w-1 rounded-full bg-[#b76b43]/50" />

              <span className="flex items-center gap-2">
                <Sparkles
                  size={13}
                  className="text-[#b76b43]"
                />
                Your next story
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================
          SAVED JOURNEYS
      ========================================================= */}
      <section className="pb-24 pt-12 sm:pt-16 lg:pb-32">
        <Container>
          <div
            className="
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
                  Your collection
                </p>

                <h2 className="mt-1 font-serif text-2xl text-[#1b1917] sm:text-3xl">
                  Saved journeys
                </h2>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#faf8f4] text-[#b76b43]">
                <Heart size={17} />
              </div>
            </div>

            <LocalStorageList kind="wishlist" />
          </div>
        </Container>
      </section>

      {/* =========================================================
          CTA
      ========================================================= */}
      <section className="border-t border-[#e7dfd6] bg-[#faf8f4] py-20 sm:py-24 lg:py-28">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a35b36]">
                Still exploring?
              </p>

              <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight tracking-[-0.03em] text-[#1b1917] sm:text-5xl lg:text-6xl">
                There is always another place worth saving.
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-[#1b1917]/50 sm:text-base">
                Explore Rajasthan's cities, landscapes and experiences, then
                save the ones that feel right for your journey.
              </p>
            </div>

            <Link
              href="/destinations"
              className="
                inline-flex
                w-fit
                items-center
                gap-2
                rounded-full
                border
                border-[#d9cfc4]
                bg-white
                px-6
                py-3.5
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-[#1b1917]
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-[#b76b43]
                hover:text-[#b76b43]
                hover:shadow-[0_15px_35px_rgba(27,25,23,0.08)]
              "
            >
              Explore destinations
              <ArrowLeft
                size={15}
                className="rotate-180"
              />
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}