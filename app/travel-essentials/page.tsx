import type { Metadata } from "next";
import Image from "next/image";
import { Check } from "lucide-react";

import Container from "../../components/common/Container";
import { Button } from "../../components/common/Button";
import { onlyPublished } from "../../components/home/published";
import { cmsText, fetchCmsRecords, fetchSections } from "../../lib/cms";
import type { HomeSectionContent } from "../../lib/cms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Travel Essentials",
  description:
    "Currency exchange, chauffeur driven cars and coaches for your Rajasthan journey.",
};

// Must mirror images.remotePatterns in next.config.ts; other hosts are served unoptimized.
const OPTIMIZABLE_IMAGE = /^(\/(?!\/)|https:\/\/(images\.unsplash\.com|res\.cloudinary\.com)\/)/;

export default async function TravelEssentials() {
  const sections = await fetchSections("travel-essentials-sections");

  return (
    <div className="relative min-h-screen bg-white pt-20 pb-16 font-sans text-[#1b1917] selection:bg-[#b76b43] selection:text-white">
      <div className="h-1 w-full bg-[#b76b43]" />

      <Container>
        {sections.map((section) => {
          switch (section.key) {
            case "hero":
              return <Hero key={section.key} section={section} />;
            case "services":
              return <Services key={section.key} section={section} />;
            default:
              return null;
          }
        })}
      </Container>
    </div>
  );
}

function Hero({ section }: { section: HomeSectionContent }) {
  const eyebrow = cmsText(section, "eyebrow");
  const title = cmsText(section, "title");
  const highlightedTitle = cmsText(section, "highlightedTitle");
  const description = cmsText(section, "description");

  if (!eyebrow && !title && !highlightedTitle && !description) return null;

  return (
    <section className="mx-auto max-w-3xl py-14 text-center sm:py-20">
      {eyebrow && (
        <span className="inline-flex items-center rounded-full border border-[#e5ddd3] bg-[#faf8f4] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#a35b36]">
          {eyebrow}
        </span>
      )}

      {(title || highlightedTitle) && (
        <h1 className="mt-6 font-serif text-4xl font-medium tracking-tight sm:text-5xl lg:text-6xl">
          {title}
          {title && highlightedTitle && " "}
          {highlightedTitle && <span className="text-[#b76b43]">{highlightedTitle}</span>}
        </h1>
      )}

      {description && (
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#68615a] sm:text-lg">
          {description}
        </p>
      )}

      <div className="my-7 flex items-center justify-center gap-3">
        <span className="h-px w-12 bg-[#d8cfc5]" />
        <span className="text-sm text-[#b76b43]">✦</span>
        <span className="h-px w-12 bg-[#d8cfc5]" />
      </div>
    </section>
  );
}

async function Services({ section }: { section: HomeSectionContent }) {
  const records = onlyPublished(await fetchCmsRecords("travel-essentials-services"));
  const services = records
    .map((record) => ({
      id: record._id,
      eyebrow: cmsText(record.data, "eyebrow"),
      title: cmsText(record.data, "title") ?? cmsText(record, "title"),
      description: cmsText(record.data, "description"),
      image: cmsText(record.data, "image"),
      features: (Array.isArray(record.data?.features) ? record.data.features : [])
        .map((feature: unknown) => String(feature ?? "").trim())
        .filter(Boolean) as string[],
    }))
    .filter((service) => service.title);

  if (!services.length) return null;

  const buttonLabel = cmsText(section, "buttonLabel");
  const buttonUrl = cmsText(section, "buttonUrl") ?? "/contact";

  return (
    <div className="space-y-16 pb-8 sm:space-y-24">
      {services.map((service, idx) => (
        <section
          key={service.id}
          className={`grid items-center gap-8 lg:gap-14 ${service.image ? "lg:grid-cols-2" : ""}`}
        >
          {service.image && (
            <div
              className={`relative aspect-[4/3] overflow-hidden rounded-[28px] border border-[#e8e1d8] shadow-[0_20px_60px_rgba(35,29,24,0.08)] ${
                idx % 2 === 1 ? "lg:order-2" : ""
              }`}
            >
              <Image
                src={service.image}
                alt={service.title ?? ""}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                unoptimized={!OPTIMIZABLE_IMAGE.test(service.image)}
                className="object-cover"
              />
            </div>
          )}

          <div>
            {service.eyebrow && (
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#a35b36]">
                {service.eyebrow}
              </span>
            )}

            <h2 className="mt-2 font-serif text-3xl font-medium sm:text-4xl">
              {service.title}
            </h2>

            {service.description && (
              <p className="mt-4 text-sm leading-7 text-[#68615a] sm:text-base">
                {service.description}
              </p>
            )}

            {service.features.length > 0 && (
              <ul className="mt-6 space-y-3">
                {service.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-[#4f4943]"
                  >
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#b76b43]/10 text-[#a35b36]">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            )}

            {buttonLabel && (
              <Button href={buttonUrl} className="mt-8 px-7 font-bold">
                {buttonLabel}
              </Button>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
