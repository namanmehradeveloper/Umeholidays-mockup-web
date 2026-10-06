import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-white px-6 text-center text-[#111827]">
      <div className="w-full max-w-xl">

        {/* 404 */}
        <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-[#B76B43]">
          404
        </p>

        {/* Heading */}
        <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight tracking-[-0.025em] sm:text-5xl">
          This road is not on our map.
        </h1>

        {/* Description */}
        <p className="mx-auto mt-5 max-w-md text-sm font-medium leading-7 text-[#6B7280]">
          The page you are looking for may have moved, been removed, or is no
          longer available.
        </p>

        {/* Button */}
        <Link
          href="/"
          className="
            mt-8
            inline-flex
            items-center
            justify-center
            rounded-full
            bg-[#b76b43]
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
            hover:bg-[#B76B43]
            hover:shadow-[0_12px_30px_rgba(183,107,67,0.20)]
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-[#B76B43]/30
          "
        >
          Return Home
        </Link>

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