import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import Container from "../common/Container";
import RichText from "../common/RichText";
import SectionHeading from "../common/SectionHeading";
import FAQ from "../common/FAQ";
import { cmsNumber, cmsText, fetchCmsRecords, fetchList } from "../../lib/cms";
import type { HomeSectionContent } from "../../lib/cms";
import type { Destination, Experience, Story, Tour } from "../../types";
import { CMS_ICONS } from "./cmsIcons";
import { onlyPublished } from "./published";

type SectionProps = { section: HomeSectionContent };

function heading(section: HomeSectionContent) {
  return {
    eyebrow: cmsText(section, "eyebrow"),
    title: cmsText(section, "title"),
    text: cmsText(section, "description"),
  };
}

/* -------------------------------------------------------------------------- */
/* DESTINATIONS                                                               */
/* -------------------------------------------------------------------------- */

export async function Destinations({ section }: SectionProps) {
  const destinations = onlyPublished(await fetchList<Destination>("/destinations?limit=6&sort=createdAt"));
  if (!destinations.length) return null;

  return (
    <section className="relative bg-white py-20 sm:py-28 lg:py-32">
      <Container>
        <SectionHeading {...heading(section)} />

        <div className="mt-10 grid gap-5 lg:mt-12 lg:grid-cols-12">
          {destinations.map((destination, index) => (
            <Link
              key={destination.slug}
              href={`/destinations/${destination.slug}`}
              className={`
                group
                relative
                min-h-[280px]
                overflow-hidden
                rounded-[24px]
                border
                border-[#e8e1d8]
                bg-[#faf8f4]
                shadow-[0_8px_30px_rgba(35,30,25,0.05)]
                transition-all
                duration-500
                hover:-translate-y-1
                hover:border-[#b76b43]/40
                hover:shadow-[0_20px_50px_rgba(35,30,25,0.11)]
                ${
                  index === 0
                    ? "lg:col-span-7 lg:row-span-2 lg:min-h-[620px]"
                    : index === 1
                      ? "lg:col-span-5 lg:min-h-[300px]"
                      : index === 2
                        ? "lg:col-span-5 lg:min-h-[300px]"
                        : "lg:col-span-4 lg:min-h-[300px]"
                }
              `}
            >
              {destination.heroImage && (
                <Image
                  src={destination.heroImage}
                  alt={destination.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="
                    object-cover
                    transition-transform
                    duration-700
                    group-hover:scale-105
                  "
                />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                {destination.region && (
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#e3a17b]">
                    {destination.region}
                  </p>
                )}

                <div className="mt-1 flex items-end justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-3xl font-medium tracking-[-0.02em] text-white sm:text-4xl">
                      {destination.name}
                    </h3>

                    {destination.tagline && (
                      <p className="mt-1 max-w-sm text-sm leading-6 text-white/75">
                        {destination.tagline}
                      </p>
                    )}
                  </div>

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
                      border-white/30
                      bg-white/10
                      text-white
                      backdrop-blur-md
                      transition-all
                      duration-300
                      group-hover:border-[#b76b43]
                      group-hover:bg-[#b76b43]
                    "
                  >
                    <ArrowUpRight
                      size={16}
                      strokeWidth={1.7}
                    />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* STORY                                                                      */
/* -------------------------------------------------------------------------- */

export function Story({ section }: SectionProps) {
  const eyebrow = cmsText(section, "eyebrow");
  const title = cmsText(section, "title");
  const highlightedTitle = cmsText(section, "highlightedTitle");
  const description = cmsText(section, "description");
  const secondaryText = cmsText(section, "secondaryText");
  const image = cmsText(section, "image");
  const imageAlt = cmsText(section, "imageAlt") ?? "";
  const imageBadge = cmsText(section, "imageBadge");
  const buttonLabel = cmsText(section, "buttonLabel");
  const buttonUrl = cmsText(section, "buttonUrl");

  const hasText = Boolean(eyebrow || title || highlightedTitle || description || secondaryText || (buttonLabel && buttonUrl));
  if (!hasText && !image) return null;

  return (
    <section className="relative overflow-hidden border-y border-[#ebe4da] bg-[#faf8f4] py-20 sm:py-28 lg:py-32">
      <Container>
        <div className={`grid items-center gap-10 lg:gap-16 ${image && hasText ? "lg:grid-cols-2" : ""}`}>
          {image && (
            <div
              className="
                relative
                aspect-[4/5]
                overflow-hidden
                rounded-[28px]
                border
                border-[#e8e1d8]
                bg-white
                shadow-[0_15px_45px_rgba(35,30,25,0.08)]
              "
            >
              <Image
                src={image}
                alt={imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="
                  object-cover
                  transition-transform
                  duration-700
                  hover:scale-105
                "
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

              {imageBadge && (
                <div
                  className="
                    absolute
                    bottom-5
                    left-5
                    rounded-full
                    border
                    border-white/30
                    bg-white/85
                    px-4
                    py-2
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.18em]
                    text-[#3b332d]
                    backdrop-blur-md
                  "
                >
                  {imageBadge}
                </div>
              )}
            </div>
          )}

          {hasText && (
            <div className={image ? "lg:pl-6" : ""}>
              <div className="max-w-2xl text-[#1b1917]">
                {eyebrow && (
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#a35b36]">
                    {eyebrow}
                  </p>
                )}

                {(title || highlightedTitle) && (
                  <h2 className="font-serif text-4xl leading-[0.98] sm:text-5xl lg:text-6xl">
                    {title}
                    {title && highlightedTitle ? " " : null}
                    {highlightedTitle && <span className="text-[#b76b43]">{highlightedTitle}</span>}
                  </h2>
                )}

                {description && (
                  <p className="mt-5 text-base leading-7 text-black/60">{description}</p>
                )}

                {secondaryText && (
                  <p className="mt-4 text-sm leading-7 text-black/50">{secondaryText}</p>
                )}
              </div>

              {buttonLabel && buttonUrl && (
                <Link
                  href={buttonUrl}
                  className="
                    group
                    mt-8
                    inline-flex
                    items-center
                    gap-2
                    border-b
                    border-[#b76b43]
                    pb-2
                    text-sm
                    font-medium
                    text-[#934f30]
                    transition-colors
                    hover:text-[#b76b43]
                  "
                >
                  {buttonLabel}

                  <ArrowUpRight
                    size={16}
                    className="
                      transition-transform
                      duration-300
                      group-hover:translate-x-1
                      group-hover:-translate-y-1
                    "
                  />
                </Link>
              )}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* MOODS                                                                      */
/* -------------------------------------------------------------------------- */

export async function Moods({ section }: SectionProps) {
  const records = onlyPublished(await fetchCmsRecords("moods"));
  const moods = records
    .map((record) => ({
      id: record._id,
      title: cmsText(record.data, "moodTitle") ?? cmsText(record.data, "title") ?? cmsText(record, "title"),
      description: record.data?.description,
      image: cmsText(record.data, "image"),
    }))
    .filter((mood) => mood.title);

  if (!moods.length) return null;

  const itemLabel = cmsText(section, "itemLabel");

  return (
    <section className="bg-white py-20 sm:py-28 lg:py-32">
      <Container>
        <SectionHeading {...heading(section)} />

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3">
          {moods.map((mood) => (
            <article
              key={mood.id}
              className="group overflow-hidden rounded-[24px] border border-[#e8e1d8] bg-white shadow-[0_8px_30px_rgba(35,30,25,0.045)] transition-all duration-300 hover:-translate-y-1 hover:border-[#b76b43]/25 hover:shadow-[0_18px_45px_rgba(35,30,25,0.08)]"
            >
              {mood.image ? (
                <div className="relative aspect-[16/10] overflow-hidden bg-[#faf8f4]">
                  <Image
                    src={mood.image}
                    alt={mood.title ?? ""}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div aria-hidden className="aspect-[16/10] bg-[#fff9f5]" />
              )}

              <div className="p-6">
                {itemLabel && (
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b76b43]">{itemLabel}</p>
                )}
                <h3 className="mt-2 font-serif text-3xl font-medium text-[#211d19]">{mood.title}</h3>
                <RichText value={mood.description} className="mt-3 text-sm leading-6 text-[#68615a]" />
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* TOURS                                                                      */
/* -------------------------------------------------------------------------- */

function tourMeta(tour: Tour, priceLabel?: string) {
  const price = Number(tour.price);
  return [
    tour.duration,
    Number.isFinite(price) && price > 0
      ? `${priceLabel ? `${priceLabel} ` : ""}₹${price.toLocaleString("en-IN")}`
      : undefined,
    tour.rating ? `${tour.rating} ★` : undefined,
  ]
    .filter(Boolean)
    .join(" · ");
}

export async function Tours({ section }: SectionProps) {
  const tours = onlyPublished(await fetchList<Tour>("/tours?limit=4&sort=createdAt"));
  if (!tours.length) return null;

  const ctaLabel = cmsText(section, "ctaLabel");
  const ctaUrl = cmsText(section, "ctaUrl");
  const priceLabel = cmsText(section, "priceLabel");

  return (
    <section className="border-y border-[#ebe4da] bg-[#faf8f4] py-20 sm:py-28 lg:py-32">
      <Container>
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <SectionHeading {...heading(section)} />

          {ctaLabel && ctaUrl && (
            <Link
              href={ctaUrl}
              className="
                group
                inline-flex
                items-center
                gap-2
                text-sm
                font-medium
                text-[#934f30]
                transition-colors
                hover:text-[#b76b43]
              "
            >
              {ctaLabel}

              <ArrowUpRight
                size={16}
                className="
                  transition-transform
                  group-hover:translate-x-1
                  group-hover:-translate-y-1
                "
              />
            </Link>
          )}
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:mt-12 lg:grid-cols-4">
          {tours.map((tour) => {
            const meta = tourMeta(tour, priceLabel);

            return (
              <Link
                href={`/tours/${tour.slug}`}
                key={tour.slug}
                className="
                  group
                  overflow-hidden
                  rounded-[22px]
                  border
                  border-[#e8e1d8]
                  bg-white
                  shadow-[0_8px_30px_rgba(35,30,25,0.05)]
                  transition-all
                  duration-500
                  hover:-translate-y-1
                  hover:shadow-[0_18px_45px_rgba(35,30,25,0.10)]
                "
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-[#faf8f4]">
                  {tour.image && (
                    <Image
                      src={tour.image}
                      alt={tour.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="
                        object-cover
                        transition-transform
                        duration-700
                        group-hover:scale-105
                      "
                    />
                  )}

                  {tour.category && (
                    <div
                      className="
                        absolute
                        left-4
                        top-4
                        rounded-full
                        border
                        border-white/30
                        bg-white/90
                        px-3
                        py-1.5
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-[0.14em]
                        text-[#3b332d]
                        backdrop-blur-md
                      "
                    >
                      {tour.category}
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3
                      className="
                        font-serif
                        text-xl
                        font-medium
                        leading-tight
                        text-[#211d19]
                        transition-colors
                        group-hover:text-[#934f30]
                      "
                    >
                      {tour.title}
                    </h3>

                    <ArrowUpRight
                      size={18}
                      className="
                        mt-1
                        shrink-0
                        text-[#b76b43]
                        transition-transform
                        duration-300
                        group-hover:translate-x-1
                        group-hover:-translate-y-1
                      "
                    />
                  </div>

                  {meta && (
                    <p className="mt-2 text-xs font-medium text-[#8e4e30]">{meta}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* EXPERIENCES                                                                */
/* -------------------------------------------------------------------------- */

export async function Experiences({ section }: SectionProps) {
  const experiences = onlyPublished(await fetchList<Experience>("/experiences?limit=4&sort=createdAt"));
  if (!experiences.length) return null;

  return (
    <section className="bg-white py-20 sm:py-28 lg:py-32">
      <Container>
        <SectionHeading {...heading(section)} />

        <div className="mt-10 grid gap-8 md:grid-cols-2 lg:mt-12 lg:grid-cols-3">
          {experiences.map((experience) => {
            const meta = [experience.location, experience.duration].filter(Boolean).join(" · ");

            return (
              <Link
                href={`/experiences/${experience.slug}`}
                key={experience.slug}
                className="
                  group
                  rounded-[22px]
                  border
                  border-[#e8e1d8]
                  bg-white
                  p-3
                  shadow-[0_6px_25px_rgba(35,30,25,0.04)]
                  transition-all
                  duration-500
                  hover:-translate-y-1
                  hover:shadow-[0_18px_45px_rgba(35,30,25,0.09)]
                "
              >
                <div className="relative aspect-[16/10] overflow-hidden rounded-[17px] bg-[#faf8f4]">
                  {experience.image && (
                    <Image
                      src={experience.image}
                      alt={experience.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="
                        object-cover
                        transition-transform
                        duration-700
                        group-hover:scale-105
                      "
                    />
                  )}
                </div>

                <div className="flex items-start justify-between gap-4 px-3 pb-3 pt-5">
                  <div>
                    {meta && (
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#934f30]">
                        {meta}
                      </p>
                    )}

                    <h3
                      className="
                        mt-1
                        font-serif
                        text-2xl
                        font-medium
                        text-[#211d19]
                        transition-colors
                        group-hover:text-[#934f30]
                      "
                    >
                      {experience.title}
                    </h3>

                    <RichText value={experience.description} className="mt-2 text-sm leading-6 text-[#68615a]" />
                  </div>

                  <ArrowUpRight
                    className="
                      mt-1
                      shrink-0
                      text-[#b76b43]
                      transition-transform
                      duration-300
                      group-hover:translate-x-1
                      group-hover:-translate-y-1
                    "
                    size={18}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* WHY CHOOSE US                                                              */
/* -------------------------------------------------------------------------- */

export async function Why({ section }: SectionProps) {
  const records = onlyPublished(await fetchCmsRecords("why-reasons"));
  const reasons = records
    .map((record) => ({
      id: record._id,
      title: cmsText(record.data, "title") ?? cmsText(record, "title"),
      description: record.data?.description,
      icon: CMS_ICONS[cmsText(record.data, "icon") ?? ""],
    }))
    .filter((reason) => reason.title);

  if (!reasons.length) return null;

  return (
    <section className="border-y border-[#ebe4da] bg-[#faf8f4] py-20 sm:py-28 lg:py-32">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <SectionHeading {...heading(section)} />

          <div className="grid gap-8 sm:grid-cols-2">
            {reasons.map(({ id, title, description, icon: Icon }, index) => (
              <div
                key={id}
                className="
                  border-t
                  border-[#ded6cc]
                  pt-5
                  transition-colors
                  hover:border-[#b76b43]
                "
              >
                <span className="flex items-center gap-2 text-xs font-semibold text-[#b76b43]">
                  {Icon && <Icon size={16} strokeWidth={1.7} aria-hidden />}
                  {String(index + 1).padStart(2, "0")}
                </span>

                <h3 className="mt-3 font-serif text-2xl font-medium text-[#211d19]">
                  {title}
                </h3>

                <RichText value={description} className="mt-2 text-sm leading-6 text-[#68615a]" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* SEASONAL                                                                    */
/* -------------------------------------------------------------------------- */

export async function Seasonal({ section }: SectionProps) {
  const records = onlyPublished(await fetchCmsRecords("seasonal"));
  const seasonal = records
    .map((record) => ({
      id: record._id,
      title: cmsText(record.data, "seasonTitle") ?? cmsText(record.data, "title") ?? cmsText(record, "title"),
      description: record.data?.description,
      season: cmsText(record.data, "season"),
    }))
    .filter((item) => item.title);

  if (!seasonal.length) return null;

  const { eyebrow, title, text } = heading(section);

  return (
    <section className="border-y border-[#ebe4da] bg-white py-20 sm:py-24 lg:py-28">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
          <div>
            {eyebrow && (
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#b76b43]">
                {eyebrow}
              </p>
            )}

            {title && (
              <h2
                className="
                  mt-3
                  max-w-md
                  font-serif
                  text-4xl
                  font-medium
                  leading-tight
                  tracking-[-0.025em]
                  text-[#211d19]
                  sm:text-5xl
                "
              >
                {title}
              </h2>
            )}

            {text && (
              <p className="mt-5 max-w-md text-sm leading-7 text-[#68615a]">
                {text}
              </p>
            )}
          </div>

          <div className="grid gap-0 sm:grid-cols-2">
            {seasonal.map((item) => (
              <div
                key={item.id}
                className="
                  border-t
                  border-[#ded6cc]
                  py-5
                  sm:px-5
                "
              >
                {item.season && (
                  <p className="text-xs font-semibold text-[#b76b43]">
                    {item.season}
                  </p>
                )}

                <h3 className="mt-1 font-serif text-2xl font-medium text-[#211d19]">
                  {item.title}
                </h3>

                <RichText value={item.description} className="mt-2 text-sm leading-6 text-[#68615a]" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* TESTIMONIALS                                                               */
/* -------------------------------------------------------------------------- */

export async function Testimonials({ section }: SectionProps) {
  const records = onlyPublished(await fetchCmsRecords("testimonials"));
  const testimonials = records
    .map((record) => {
      const rating = cmsNumber(record.data, "rating");
      return {
        id: record._id,
        name: cmsText(record.data, "customer") ?? cmsText(record, "title"),
        trip: cmsText(record.data, "trip") ?? cmsText(record.data, "journey"),
        review: record.data?.quote ?? record.data?.review,
        rating: rating === undefined ? undefined : Math.max(0, Math.min(5, Math.round(rating))),
        avatar: cmsText(record.data, "avatar"),
      };
    })
    .filter((testimonial) => testimonial.review);

  if (!testimonials.length) return null;

  return (
    <section className="bg-[#faf8f4] py-20 sm:py-28 lg:py-32">
      <Container>
        <SectionHeading {...heading(section)} />

        <div className="mt-10 grid gap-5 md:grid-cols-3 lg:mt-12">
          {testimonials.map((testimonial) => {
            const caption = [testimonial.name, testimonial.trip].filter(Boolean).join(" · ");

            return (
              <figure
                key={testimonial.id}
                className="
                  rounded-[22px]
                  border
                  border-[#e8e1d8]
                  bg-white
                  p-6
                  shadow-[0_8px_30px_rgba(35,30,25,0.04)]
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-[0_18px_40px_rgba(35,30,25,0.08)]
                "
              >
                {(testimonial.avatar || testimonial.rating !== undefined) && (
                  <div className="flex items-center gap-3">
                    {testimonial.avatar ? <img src={testimonial.avatar} alt={testimonial.name ?? ""} className="h-10 w-10 rounded-full object-cover" /> : null}
                    {testimonial.rating !== undefined && (
                      <div className="text-sm tracking-[0.15em] text-[#b76b43]">
                        {"★".repeat(testimonial.rating)}{"☆".repeat(5 - testimonial.rating)}
                      </div>
                    )}
                  </div>
                )}

                <RichText value={testimonial.review} className="mt-4 font-serif text-xl leading-relaxed text-[#312b26]" />

                {caption && (
                  <figcaption className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-[#934f30]">
                    {caption}
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* JOURNAL                                                                    */
/* -------------------------------------------------------------------------- */

export async function Journal({ section }: SectionProps) {
  const stories = onlyPublished(await fetchList<Story>("/stories?limit=3"));
  if (!stories.length) return null;

  const ctaLabel = cmsText(section, "ctaLabel");
  const ctaUrl = cmsText(section, "ctaUrl");

  return (
    <section className="border-t border-[#ebe4da] bg-white py-20 sm:py-28 lg:py-32">
      <Container>
        <div className="flex items-end justify-between gap-5">
          <SectionHeading {...heading(section)} />

          {ctaLabel && ctaUrl && (
            <Link
              href={ctaUrl}
              className="
                hidden
                items-center
                gap-2
                text-sm
                font-medium
                text-[#934f30]
                transition-colors
                hover:text-[#b76b43]
                sm:inline-flex
              "
            >
              {ctaLabel}

              <ArrowUpRight size={16} />
            </Link>
          )}
        </div>

        <div className="mt-10 grid gap-6 lg:mt-12 lg:grid-cols-3">
          {stories.map((story) => {
            const meta = [story.category, story.reading].filter(Boolean).join(" · ");

            return (
              <Link
                key={story.slug}
                href={`/stories/${story.slug}`}
                className="group"
              >
                <div
                  className="
                    relative
                    aspect-[4/3]
                    overflow-hidden
                    rounded-[22px]
                    border
                    border-[#e8e1d8]
                    bg-[#faf8f4]
                  "
                >
                  {story.image && (
                    <Image
                      src={story.image}
                      alt={story.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="
                        object-cover
                        transition-transform
                        duration-700
                        group-hover:scale-105
                      "
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>

                <h3
                  className="
                    mt-4
                    font-serif
                    text-2xl
                    font-medium
                    text-[#211d19]
                    transition-colors
                    group-hover:text-[#934f30]
                  "
                >
                  {story.title}
                </h3>

                <div className="mt-2 flex items-center justify-between">
                  {meta && (
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#b76b43]">
                      {meta}
                    </p>
                  )}

                  <ArrowUpRight
                    size={15}
                    className="
                      ml-auto
                      text-[#b76b43]
                      transition-transform
                      duration-300
                      group-hover:translate-x-1
                      group-hover:-translate-y-1
                    "
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* FAQ                                                                        */
/* -------------------------------------------------------------------------- */

export async function FAQSection({ section }: SectionProps) {
  const records = onlyPublished(await fetchCmsRecords("faqs"));
  const faqs = records
    .map((record) => [cmsText(record.data, "question") ?? cmsText(record, "title") ?? "", record.data?.answer ?? ""])
    .filter(([question]) => question);

  if (!faqs.length) return null;

  return (
    <section className="bg-[#faf8f4] py-20 sm:py-28 lg:py-32">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr]">
          <SectionHeading {...heading(section)} />

          <FAQ items={faqs} />
        </div>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* FINAL CTA                                                                  */
/* -------------------------------------------------------------------------- */

export function FinalCTA({ section }: SectionProps) {
  const { eyebrow, title, text } = heading(section);
  const backgroundImage = cmsText(section, "backgroundImage");
  const primaryLabel = cmsText(section, "primaryButtonLabel");
  const primaryUrl = cmsText(section, "primaryButtonUrl");
  const secondaryLabel = cmsText(section, "secondaryButtonLabel");
  const secondaryUrl = cmsText(section, "secondaryButtonUrl");
  const showPrimary = Boolean(primaryLabel && primaryUrl);
  const showSecondary = Boolean(secondaryLabel && secondaryUrl);

  if (!eyebrow && !title && !text && !showPrimary && !showSecondary) return null;

  return (
    <section
      className="
        relative
        overflow-hidden
        border-t
        border-[#ebe4da]
        bg-[#faf8f4]
        py-24
        text-center
        sm:py-32
      "
    >
      {backgroundImage && (
        <>
          <Image src={backgroundImage} alt="" fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-[#faf8f4]/85" />
        </>
      )}

      {/* Soft decorative circle */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-[520px]
          w-[520px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-[#b76b43]/[0.06]
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-0
          h-px
          w-40
          -translate-x-1/2
          bg-[#b76b43]/40
        "
      />

      <Container>
        {eyebrow && (
          <p className="relative text-[10px] font-semibold uppercase tracking-[0.3em] text-[#b76b43]">
            {eyebrow}
          </p>
        )}

        {title && (
          <h2
            className="
              relative
              mx-auto
              mt-4
              max-w-3xl
              font-serif
              text-4xl
              font-medium
              leading-tight
              tracking-[-0.025em]
              text-[#211d19]
              sm:text-6xl
            "
          >
            {title}
          </h2>
        )}

        {text && (
          <p className="relative mx-auto mt-5 max-w-xl text-sm leading-7 text-[#68615a]">
            {text}
          </p>
        )}

        {(showPrimary || showSecondary) && (
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
            {showPrimary && (
              <Link
                href={primaryUrl!}
                className="
                  group
                  relative
                  inline-flex
                  items-center
                  gap-2
                  bg-[#b76b43]
                  px-7
                  py-4
                  text-sm
                  font-semibold
                  uppercase
                  tracking-[0.08em]
                  text-white
                  shadow-[0_12px_35px_rgba(183,107,67,0.18)]
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-[#934f30]
                "
              >
                {primaryLabel}

                <ArrowUpRight
                  size={17}
                  className="
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                    group-hover:-translate-y-1
                  "
                />
              </Link>
            )}

            {showSecondary && (
              <Link
                href={secondaryUrl!}
                className="
                  group
                  relative
                  inline-flex
                  items-center
                  gap-2
                  border
                  border-[#b76b43]
                  px-7
                  py-4
                  text-sm
                  font-semibold
                  uppercase
                  tracking-[0.08em]
                  text-[#934f30]
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-[#b76b43]
                  hover:text-white
                "
              >
                {secondaryLabel}

                <ArrowUpRight size={17} />
              </Link>
            )}
          </div>
        )}
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* MAP                                                                        */
/* -------------------------------------------------------------------------- */

type MapLocation = {
  id: string;
  name: string;
  x: number;
  y: number;
  href?: string;
  description?: string;
};

export async function MapSection({ section }: SectionProps) {
  const records = onlyPublished(await fetchCmsRecords("map-locations"));
  const locations = records
    .map((record): MapLocation | null => {
      const destination = record.data?.destination as { slug?: string; name?: string } | undefined;
      const name = cmsText(record.data, "name") ?? cmsText(destination, "name");
      const x = cmsNumber(record.data, "mapX");
      const y = cmsNumber(record.data, "mapY");
      if (!name || x === undefined || y === undefined) return null;

      const slug = cmsText(destination, "slug");
      return {
        id: record._id,
        name,
        x,
        y,
        href: slug ? `/destinations/${slug}` : undefined,
        description: cmsText(record.data, "shortDescription"),
      };
    })
    .filter((location): location is MapLocation => location !== null);

  if (!locations.length) return null;

  const ctaLabel = cmsText(section, "ctaLabel");
  const ctaUrl = cmsText(section, "ctaUrl");
  const mapLabel = cmsText(section, "mapLabel");
  const mapImage = cmsText(section, "mapImage");

  const pinClassName = `
    group
    absolute
    -translate-x-1/2
    -translate-y-1/2
  `;

  const pin = (location: MapLocation) => (
    <>
      <span
        className="
          flex
          h-4
          w-4
          rounded-full
          border-2
          border-white
          bg-[#b76b43]
          shadow-[0_3px_12px_rgba(183,107,67,0.25)]
          transition-transform
          duration-300
          group-hover:scale-125
        "
      />

      <span
        className="
          absolute
          left-5
          top-0
          whitespace-nowrap
          text-xs
          font-medium
          text-[#3f3730]
          transition-colors
          group-hover:text-[#934f30]
        "
      >
        {location.name}
      </span>
    </>
  );

  return (
    <section className="border-t border-[#ebe4da] bg-white py-20 sm:py-28 lg:py-32">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading {...heading(section)} />

            {ctaLabel && ctaUrl && (
              <Link
                href={ctaUrl}
                className="
                  group
                  mt-7
                  inline-flex
                  items-center
                  gap-2
                  bg-[#b76b43]
                  px-6
                  py-3.5
                  text-sm
                  font-semibold
                  text-white
                  shadow-[0_10px_30px_rgba(183,107,67,0.15)]
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-[#934f30]
                "
              >
                {ctaLabel}

                <ArrowUpRight
                  size={16}
                  className="
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                    group-hover:-translate-y-1
                  "
                />
              </Link>
            )}
          </div>

          <div className="relative aspect-square w-full max-w-[600px] justify-self-center">
            <div
              className="
                absolute
                inset-[8%]
                rotate-3
                overflow-hidden
                rounded-[45%_55%_48%_52%/50%_44%_56%_50%]
                border
                border-[#d9cfc2]
                bg-[#faf8f4]
                shadow-[inset_0_0_50px_rgba(35,30,25,0.03)]
              "
            >
              {mapImage && (
                <Image src={mapImage} alt="" fill sizes="(max-width: 1024px) 100vw, 600px" className="-rotate-3 object-cover opacity-60" />
              )}
            </div>

            <div className="absolute inset-0">
              {locations.map((location) =>
                location.href ? (
                  <Link
                    key={location.id}
                    href={location.href}
                    title={location.description}
                    style={{ left: `${location.x}%`, top: `${location.y}%` }}
                    className={pinClassName}
                  >
                    {pin(location)}
                  </Link>
                ) : (
                  <span
                    key={location.id}
                    title={location.description}
                    style={{ left: `${location.x}%`, top: `${location.y}%` }}
                    className={pinClassName}
                  >
                    {pin(location)}
                  </span>
                ),
              )}
            </div>

            {mapLabel && (
              <div
                className="
                  absolute
                  bottom-3
                  left-1/2
                  -translate-x-1/2
                  whitespace-nowrap
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.25em]
                  text-[#934f30]/60
                "
              >
                {mapLabel}
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
