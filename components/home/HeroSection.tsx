import { cmsText, fetchCmsRecords } from "../../lib/cms";
import type { HomeSectionContent } from "../../lib/cms";
import Hero from "./Hero";
import type { BannerSlide } from "./Hero";
import { onlyPublished } from "./published";

export default async function HeroSection({ section }: { section: HomeSectionContent }) {
  const records = onlyPublished(await fetchCmsRecords("banners"));

  const slides: BannerSlide[] = records
    .map((record) => ({
      id: record._id,
      img: cmsText(record.data, "image") ?? "",
      place: cmsText(record.data, "place"),
      eyebrow: cmsText(record.data, "eyebrow"),
      line: cmsText(record.data, "line"),
      headline: cmsText(record.data, "headline"),
      cta: cmsText(record.data, "cta"),
    }))
    .filter((slide) => slide.img);

  if (!slides.length) return null;

  return (
    <Hero
      slides={slides}
      labels={{
        title: cmsText(section, "title"),
        topLabel: cmsText(section, "topLabel"),
        brandLabel: cmsText(section, "brandLabel"),
        primaryCtaLabel: cmsText(section, "primaryCtaLabel"),
        primaryCtaUrl: cmsText(section, "primaryCtaUrl"),
        secondaryCtaLabel: cmsText(section, "secondaryCtaLabel"),
        slideCountLabel: cmsText(section, "slideCountLabel"),
      }}
    />
  );
}
