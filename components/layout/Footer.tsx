'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  Instagram,
  MessageCircle,
} from 'lucide-react';

import Container from '../common/Container';
import { useSiteSettings } from '../common/useSiteSettings';

const exploreLinks = [
  ['Destinations', '/destinations'],
  ['Journeys', '/tours'],
  ['Experiences', '/experiences'],
  ['Stories', '/stories'],
];

const companyLinks = [
  ['About UME', '/about'],
  ['Contact', '/contact'],
  ['Offers', '/offers'],
  ['Events', '/events'],
  ['Stories ', '/stories'],
];


export default function Footer() {
  const site = useSiteSettings();

  return (
    <footer className="border-t border-white/10 bg-[#0b0b0b] text-white">
      <Container className="py-14 sm:py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_repeat(3,1fr)] lg:gap-12">
          {/* BRAND */}

          <div>
            <Link
              href="/"
              aria-label="UME Holidays home"
              className="inline-flex"
            >
              <Image
                src="/images/logo.png"
                alt="Umeholidays - Explore Rajasthan"
                width={300}
                height={240}
                className="h-[82px] w-auto max-w-[215px] object-contain object-left"
              />
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-white/60">
              Thoughtful journeys across Rajasthan,
              designed around place, pace and people.
            </p>

            <Link
              href="/plan-your-trip"
              className="
                group
                mt-6
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-[#b76b43]
                px-5
                py-3
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-white
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-[#934f30]
              "
            >
              Start planning

              <ArrowUpRight
                size={14}
                className="
                  transition-transform
                  group-hover:translate-x-0.5
                  group-hover:-translate-y-0.5
                "
              />
            </Link>
          </div>

          {/* LINKS */}

          <FooterColumn
            title="Explore"
            links={exploreLinks}
          />

          <FooterColumn
            title="Company"
            links={companyLinks}
          />

          {/* CONTACT */}

          <div>
            <h3
              className="
                mb-5
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.22em]
                text-white/40
              "
            >
              Stay in touch
            </h3>

            <div className="space-y-2 text-sm leading-6 text-white/60">
              <a
                href={`mailto:${site.email}`}
                className="
                  block
                  transition-colors
                  hover:text-[#d98a61]
                "
              >
                {site.email}
              </a>

              <a
                href={`tel:${site.phone.replace(/\D/g, '')}`}
                className="
                  block
                  transition-colors
                  hover:text-[#d98a61]
                "
              >
                {site.phone}
              </a>
            </div>

            {/* SOCIALS */}

            <div className="mt-6 flex items-center gap-3">
              <a
                href={site.instagram || '/contact'}
                target={site.instagram ? '_blank' : undefined}
                rel={site.instagram ? 'noreferrer' : undefined}
                aria-label="UME Holidays Instagram"
                className="
                  grid
                  h-10
                  w-10
                  place-items-center
                  rounded-full
                  border
                  border-white/15
                  bg-white/[0.04]
                  text-white/65
                  transition-all
                  duration-200
                  hover:border-[#b76b43]
                  hover:bg-[#b76b43]/10
                  hover:text-[#d98a61]
                "
              >
                <Instagram size={16} />
              </a>

              <a
                href={`https://wa.me/${site.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                aria-label="UME Holidays WhatsApp"
                className="
                  grid
                  h-10
                  w-10
                  place-items-center
                  rounded-full
                  border
                  border-white/15
                  bg-white/[0.04]
                  text-white/65
                  transition-all
                  duration-200
                  hover:border-[#b76b43]
                  hover:bg-[#b76b43]/10
                  hover:text-[#d98a61]
                "
              >
                <MessageCircle size={16} />
              </a>

              <Link
                href="/contact"
                className="
                  ml-1
                  inline-flex
                  h-10
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-white/15
                  px-4
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.14em]
                  text-white/65
                  transition-all
                  duration-200
                  hover:border-[#b76b43]
                  hover:text-[#d98a61]
                "
              >
                Contact

                <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}

        <div
          className="
            mt-10
            flex
            flex-col
            gap-4
            border-t
            border-white/10
            pt-6
            text-[10px]
            text-white/40

            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <span>
            © {new Date().getFullYear()} UME Holidays.
            All rights reserved.
          </span>

          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link
              href="/privacy"
              className="
                transition-colors
                hover:text-[#d98a61]
              "
            >
              Privacy
            </Link>

            <Link
              href="/terms"
              className="
                transition-colors
                hover:text-[#d98a61]
              "
            >
              Terms
            </Link>

            <Link
              href="/cancellation"
              className="
                transition-colors
                hover:text-[#d98a61]
              "
            >
              Cancellation
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: string[][];
}) {
  return (
    <div>
      <h3
        className="
          mb-5
          text-[10px]
          font-semibold
          uppercase
          tracking-[0.22em]
          text-white/40
        "
      >
        {title}
      </h3>

      <div className="space-y-3.5">
        {links.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="
              group
              flex
              w-fit
              items-center
              gap-2
              text-sm
              text-white/60
              transition-colors
              duration-200
              hover:text-[#d98a61]
            "
          >
            <span>{label}</span>

            <ArrowUpRight
              size={13}
              className="
                opacity-0
                transition-all
                duration-200
                group-hover:translate-x-0.5
                group-hover:-translate-y-0.5
                group-hover:opacity-100
              "
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
