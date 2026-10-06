import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";

import Container from "../../components/common/Container";
import { apiList } from "../../lib/api";
import { richTextToPlainText } from "../../lib/rich-text";
import type { Story } from "../../types";

export const dynamic = "force-dynamic";

export default async function Stories() {
  const stories = await apiList<Story>("/stories?limit=100");
  const featuredStory = stories[0];
  const remainingStories = stories.slice(1);

  return (
    <main className="min-h-screen bg-white text-[#1b1917]">
      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#faf8f4]">
        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#b76b43]/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full bg-[#d8c2a9]/20 blur-3xl" />

        <Container className="relative py-24 sm:py-28 lg:py-36">
          <div className="max-w-4xl">
            {/* Eyebrow */}
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-[#b76b43]" />

              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#a35b36]">
                UME Journal
              </p>
            </div>

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
              Stories from
              <br />
              <span className="text-[#1b1917]/25">the road.</span>
            </h1>

            <p className="mt-7 max-w-xl text-sm leading-7 text-[#1b1917]/55 sm:text-base">
              Travel notes, local stories and thoughtful guides for curious
              people who want to experience Rajasthan beyond the usual route.
            </p>

            {/* Journal categories */}
            <div className="mt-8 flex items-center gap-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#1b1917]/35">
              <BookOpen size={13} className="text-[#b76b43]" />
              Stories · Places · People · Culture
            </div>
          </div>
        </Container>
      </section>

      {/* =========================================================
          FEATURED STORY
      ========================================================= */}
      {featuredStory && (
        <section className="relative z-10 -mt-10 pb-20 sm:-mt-16 sm:pb-24 lg:-mt-20 lg:pb-32">
          <Container>
            <Link
              href={`/stories/${featuredStory.slug}`}
              className="
                group
                grid
                overflow-hidden
                rounded-[30px]
                border
                border-[#e7dfd6]
                bg-white
                shadow-[0_25px_80px_rgba(27,25,23,.10)]
                lg:grid-cols-[1.25fr_.75fr]
                lg:rounded-[38px]
              "
            >
              {/* Image */}
              <div className="relative aspect-[4/3] min-h-[320px] overflow-hidden bg-[#e9e1d8] lg:aspect-auto lg:min-h-[560px]">
                <Image
                  src={featuredStory.image}
                  alt={featuredStory.title}
                  fill
                  priority
                  sizes="(max-width: 1023px) 100vw, 60vw"
                  quality={90}
                  className="
                    object-cover
                    transition-transform
                    duration-[1200ms]
                    ease-out
                    group-hover:scale-105
                  "
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/10" />

                {/* Featured badge */}
                <div className="absolute left-5 top-5">
                  <span
                    className="
                      rounded-full
                      border
                      border-white/25
                      bg-black/20
                      px-3
                      py-2
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.18em]
                      text-white
                      backdrop-blur-md
                    "
                  >
                    Featured story
                  </span>
                </div>

                {/* Image bottom label */}
                <div className="absolute bottom-5 left-5 right-5 lg:hidden">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/70">
                    UME Journal
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col justify-center bg-[#faf8f4] p-7 sm:p-10 lg:p-14">
                <div className="flex items-center gap-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#a35b36]">
                  <span>{featuredStory.category}</span>

                  <span className="h-1 w-1 rounded-full bg-[#b76b43]" />

                  <span className="text-[#1b1917]/35">
                    {featuredStory.reading}
                  </span>
                </div>

                <h2
                  className="
                    mt-5
                    font-serif
                    text-3xl
                    leading-tight
                    tracking-[-0.02em]
                    text-[#1b1917]
                    transition-colors
                    duration-300
                    group-hover:text-[#a35b36]
                    sm:text-4xl
                    lg:text-5xl
                  "
                >
                  {featuredStory.title}
                </h2>

                <p className="mt-5 max-w-xl text-sm leading-7 text-[#1b1917]/50">
                  {richTextToPlainText(featuredStory.excerpt)}
                </p>

                <div className="mt-8 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1b1917]">
                  Read the story

                  <span
                    className="
                      flex
                      h-10
                      w-10
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
                    <ArrowUpRight size={15} />
                  </span>
                </div>
              </div>
            </Link>
          </Container>
        </section>
      )}

      {/* =========================================================
          JOURNAL
      ========================================================= */}
      <section className="bg-white pb-24 sm:pb-28 lg:pb-36">
        <Container>
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end lg:mb-14">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#a35b36]">
                From the journal
              </p>

              <h2 className="mt-3 font-serif text-4xl tracking-[-0.02em] text-[#1b1917] sm:text-5xl">
                More to discover.
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-6 text-[#1b1917]/45">
              Places worth knowing, experiences worth remembering and stories
              that make you want to pack your bags.
            </p>
          </div>

          {/* Story Grid */}
          <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-7 lg:gap-y-20">
            {remainingStories.map((story, index) => (
              <Link
                key={story.slug}
                href={`/stories/${story.slug}`}
                className={`
                  group
                  block
                  ${
                    index % 3 === 1
                      ? "lg:translate-y-10"
                      : ""
                  }
                `}
              >
                {/* Image */}
                <div
                  className="
                    relative
                    aspect-[4/3]
                    overflow-hidden
                    rounded-[26px]
                    bg-[#e9e1d8]
                    shadow-[0_15px_40px_rgba(27,25,23,.07)]
                  "
                >
                  <Image
                    src={story.image}
                    alt={story.title}
                    fill
                    sizes="
                      (max-width: 639px) 100vw,
                      (max-width: 1023px) 50vw,
                      33vw
                    "
                    quality={90}
                    className="
                      object-cover
                      transition-transform
                      duration-[1000ms]
                      ease-out
                      group-hover:scale-105
                    "
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-80" />

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
                      border-white/30
                      bg-black/15
                      text-[9px]
                      font-semibold
                      tracking-[0.16em]
                      text-white
                      backdrop-blur-md
                    "
                  >
                    {String(index + 2).padStart(2, "0")}
                  </div>

                  {/* Arrow */}
                  <div
                    className="
                      absolute
                      bottom-4
                      right-4
                      flex
                      h-10
                      w-10
                      translate-y-2
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/30
                      bg-black/15
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
                  </div>
                </div>

                {/* Content */}
                <div className="pt-5">
                  <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#a35b36]">
                    <span>{story.category}</span>

                    <span className="h-1 w-1 rounded-full bg-[#b76b43]" />

                    <span className="text-[#1b1917]/35">
                      {story.reading}
                    </span>
                  </div>

                  <h3
                    className="
                      mt-3
                      font-serif
                      text-2xl
                      leading-tight
                      text-[#1b1917]
                      transition-colors
                      duration-300
                      group-hover:text-[#a35b36]
                      sm:text-3xl
                    "
                  >
                    {story.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#1b1917]/50">
                    {richTextToPlainText(story.excerpt)}
                  </p>

                  <div
                    className="
                      mt-5
                      flex
                      items-center
                      gap-2
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.15em]
                      text-[#1b1917]/35
                      transition-colors
                      group-hover:text-[#a35b36]
                    "
                  >
                    Continue reading
                    <ArrowUpRight size={13} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* =========================================================
          JOURNAL CTA
      ========================================================= */}
      <section className="relative overflow-hidden bg-[#faf8f4]">
        {/* Decorative background */}
        <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#b76b43]/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full bg-[#d8c2a9]/20 blur-3xl" />

        <Container className="relative py-24 sm:py-28 lg:py-36">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#a35b36]">
              Keep exploring
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
              The road always has
              <br />
              another story.
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#1b1917]/50">
              Explore Rajasthan through destinations, experiences and journeys
              designed around how you want to travel.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/destinations"
                className="
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
                  tracking-[0.14em]
                  text-white
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:bg-[#934f30]
                  hover:shadow-[0_18px_40px_rgba(183,107,67,.25)]
                "
              >
                Explore destinations
                <ArrowUpRight size={15} />
              </Link>

              <Link
                href="/plan-your-trip"
                className="
                  inline-flex
                  items-center
                  gap-2
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
                  text-[#1b1917]/75
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-[#b76b43]
                  hover:bg-[#b76b43]
                  hover:text-white
                "
              >
                Plan your journey
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}