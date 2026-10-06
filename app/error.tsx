'use client';

import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-white px-6 py-24 text-[#111827]">
      <div className="w-full max-w-xl text-center">

        {/* Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#B76B43] shadow-[0_10px_30px_rgba(17,24,39,0.06)]">
          <AlertCircle
            size={27}
            strokeWidth={1.8}
          />
        </div>

        {/* Eyebrow */}
        <p className="mt-7 text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#B76B43]">
          Something went wrong
        </p>

        {/* Heading */}
        <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-[-0.025em] text-[#111827] sm:text-5xl">
          We could not load this page.
        </h1>

        {/* Description */}
        <p className="mx-auto mt-5 max-w-md text-sm font-medium leading-7 text-[#6B7280]">
          Something unexpected happened while loading this page. Please try
          again or return to the beginning of your journey.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">

          {/* Try Again */}
          <button
            type="button"
            onClick={() => reset()}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-full
              bg-[#B76B43]
              px-6
              py-3.5
              text-[10px]
              font-extrabold
              uppercase
              tracking-[0.16em]
              text-white
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:bg-[#934F30]
              hover:shadow-[0_12px_30px_rgba(183,107,67,0.20)]
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#B76B43]/30
            "
          >
            <RefreshCw
              size={14}
              strokeWidth={2}
            />
            Try again
          </button>

          {/* Back Home */}
          <Link
            href="/"
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-full
              border
              border-[#D1D5DB]
              bg-white
              px-6
              py-3.5
              text-[10px]
              font-extrabold
              uppercase
              tracking-[0.16em]
              text-[#111827]
              transition-all
              duration-300
              hover:-translate-y-0.5
              hover:border-[#B76B43]
              hover:text-[#B76B43]
              hover:shadow-[0_10px_25px_rgba(17,24,39,0.06)]
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#B76B43]/20
            "
          >
            <ArrowLeft
              size={14}
              strokeWidth={2}
            />
            Back home
          </Link>

        </div>

        {/* Brand */}
        <div className="mt-12 border-t border-[#E5E7EB] pt-6">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-[#9CA3AF]">
            UME Holidays · Rajasthan, India
          </p>
        </div>

      </div>
    </main>
  );
}