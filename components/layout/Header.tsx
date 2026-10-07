
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Menu,
  Search,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const nav = [
  { label: "Home", href: "/" },
  { label: "Journeys", href: "/tours" },
  { label: "Destinations", href: "/destinations" },
  { label: "Experiences", href: "/experiences" },
  { label: "Travel Essentials", href: "/travel-essentials" },
  { label: "City Events", href: "/events" },
  { label: "About", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

const mobileNav = [
  ...nav,
  {
    label: "Plan My Trip",
    href: "/plan-your-trip",
  },
  {
    label: "Saved Journeys",
    href: "/wishlist",
  },
];

export default function Header() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow =
      document.body.style.overflow;

    const onKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.body.style.overflow =
      "hidden";

    document.addEventListener(
      "keydown",
      onKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        onKeyDown
      );
    };
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#ece7e2] bg-white/95 text-[#1b1917] shadow-[0_6px_24px_rgba(27,25,23,0.05)] backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] w-full max-w-[1500px] items-center justify-between px-4 sm:h-[80px] sm:px-6 md:px-8 lg:h-[84px] lg:px-12">
          {/* LOGO */}

          <Link
            href="/"
            aria-label="UME Holidays home"
            className="group flex shrink-0 items-center outline-none"
          >
            <Image
              src="/images/logo.png"
              alt="Umeholidays - Explore Rajasthan"
              width={320}
              height={250}
              priority
              className="h-[58px] w-auto max-w-[170px] object-contain object-left transition-transform duration-300 group-hover:scale-[1.02] sm:h-[64px] sm:max-w-[190px] lg:h-[70px] lg:max-w-[215px]"
            />
          </Link>

          {/* DESKTOP NAVIGATION */}

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-5 lg:flex xl:gap-7"
          >
            {nav.map((item) => {
              const active =
                pathname === item.href ||
                pathname.startsWith(
                  `${item.href}/`
                );

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    relative
                    py-2

                    text-[15px]
                    font-semibold
                    tracking-[-0.01em]

                    transition-colors
                    duration-200

                    after:absolute
                    after:bottom-0
                    after:left-0
                    after:h-[2px]
                    after:bg-[#b76b43]
                    after:transition-all
                    after:duration-200

                    ${
                      active
                        ? "text-[#1b1917] after:w-full"
                        : "text-[#1b1917] after:w-0 hover:text-[#9c5735] hover:after:w-full"
                    }
                  `}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* DESKTOP ACTIONS */}

          <div className="hidden items-center gap-2 lg:flex">
            <Link
              href="/search"
              aria-label="Search UME Holidays"
              className="grid h-10 w-10 place-items-center rounded-full border border-[#ece7e2] bg-white text-[#4f4944] transition-all hover:border-[#b76b43]/35 hover:bg-[#fff9f5] hover:text-[#9c5735]"
            >
              <Search
                size={17}
                strokeWidth={1.9}
              />
            </Link>

            <Link
              href="/plan-your-trip"
              className="group inline-flex h-11 items-center gap-2 rounded-full bg-[#b76b43] px-5 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_8px_22px_rgba(183,107,67,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#934f30]"
            >
              <span>Plan a trip</span>

              <ArrowUpRight
                size={14}
                strokeWidth={1.9}
                className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </Link>
          </div>

          {/* MOBILE ACTIONS */}

          <div className="flex items-center gap-1 lg:hidden">
            <Link
              href="/search"
              aria-label="Search"
              className="grid h-10 w-10 place-items-center rounded-full text-[#4f4944] transition hover:bg-[#faf6f2] hover:text-[#9c5735]"
            >
              <Search
                size={19}
                strokeWidth={1.9}
              />
            </Link>

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={open}
              className="grid h-10 w-10 place-items-center rounded-full text-[#4f4944] transition hover:bg-[#faf6f2] hover:text-[#9c5735]"
            >
              <Menu
                size={22}
                strokeWidth={1.9}
              />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}

      <div
        aria-hidden={!open}
        className={`
          fixed
          inset-0
          z-[100]
          lg:hidden

          ${
            open
              ? "pointer-events-auto visible"
              : "pointer-events-none invisible"
          }
        `}
      >
        {/* BACKDROP */}

        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setOpen(false)}
          className={`
            absolute
            inset-0

            bg-[#1b1917]/20
            backdrop-blur-[2px]

            transition-opacity

            ${
              open
                ? "opacity-100"
                : "opacity-0"
            }
          `}
        />

        {/* DRAWER */}

        <div
          className={`
            absolute
            inset-y-0
            right-0

            flex
            w-[min(92vw,430px)]
            flex-col

            border-l
            border-[#ece7e2]

            bg-white

            shadow-[-20px_0_60px_rgba(27,25,23,0.12)]

            transition-transform
            duration-300

            ${
              open
                ? "translate-x-0"
                : "translate-x-full"
            }
          `}
        >
          {/* MOBILE HEADER */}

          <div className="flex h-[76px] items-center justify-between border-b border-[#ece7e2] px-5">
            <Link
              href="/"
              onClick={() =>
                setOpen(false)
              }
              aria-label="UME Holidays home"
            >
              <Image
                src="/images/logo.png"
                alt="UME Holidays"
                width={220}
                height={160}
                className="h-14 w-auto object-contain"
              />
            </Link>

            <button
              type="button"
              onClick={() =>
                setOpen(false)
              }
              aria-label="Close navigation menu"
              className="grid h-10 w-10 place-items-center rounded-full border border-[#ece7e2] text-[#4f4944] hover:bg-[#faf6f2]"
            >
              <X size={20} />
            </button>
          </div>

          {/* MOBILE NAVIGATION */}

          <nav
            className="flex-1 overflow-y-auto px-5 py-7"
            aria-label="Mobile navigation"
          >
            <div className="space-y-1">
              {mobileNav.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(
                    `${item.href}/`
                  );

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() =>
                      setOpen(false)
                    }
                    className={`
                      flex
                      items-center
                      justify-between

                      rounded-2xl

                      px-4
                      py-3.5

                      font-serif
                      text-[26px]
                      font-semibold

                      transition-colors

                      ${
                        active
                          ? "bg-[#fff7f2] text-[#1b1917]"
                          : "text-[#1b1917] hover:bg-[#faf8f5] hover:text-[#9c5735]"
                      }
                    `}
                  >
                    {item.label}

                    <ArrowUpRight
                      size={17}
                      strokeWidth={1.6}
                    />
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* MOBILE CTA */}

          <div className="border-t border-[#ece7e2] p-5">
            <Link
              href="/plan-your-trip"
              onClick={() =>
                setOpen(false)
              }
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#b76b43] px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-white"
            >
              Start planning

              <ArrowUpRight
                size={14}
              />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}