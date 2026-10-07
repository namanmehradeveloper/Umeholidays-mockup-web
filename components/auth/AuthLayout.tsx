import Image from 'next/image';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

import Container from '../common/Container';

export default function AuthLayout({
  title,
  description,
  image,
  imageAlt,
  panelTitle,
  perks,
  children,
}: {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  panelTitle: string;
  perks: Array<{ label: string; icon: LucideIcon }>;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#fbf6f0] via-[#fcf9f5] to-white pb-16 pt-28 text-[#1b1917] sm:pt-32 lg:pt-36">
      <Container>
        <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[32px] border border-[#ebe4da] bg-white shadow-[0_24px_70px_rgba(35,29,24,0.08)] lg:grid-cols-2">
          {/* Image panel */}
          <div className="relative hidden min-h-[620px] lg:block">
            <Image src={image} alt={imageAlt} fill sizes="(min-width: 1024px) 512px, 0px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1b1917]/85 via-[#1b1917]/30 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-10 text-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#f1c3a5]">Padharo Mhare Desh</p>
              <h2 className="mt-3 font-serif text-4xl leading-tight">{panelTitle}</h2>

              <ul className="mt-6 space-y-3">
                {perks.map(({ label, icon: Icon }) => (
                  <li key={label} className="flex items-center gap-3 text-sm text-white/85">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-white/15 backdrop-blur">
                      <Icon size={15} />
                    </span>
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Form panel */}
          <div className="flex flex-col justify-center p-7 sm:p-12">
            <div className="mb-8">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#b76b43]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#a35b36]">UME Holidays</p>
              </div>
              <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight sm:text-5xl">{title}</h1>
              <p className="mt-3 text-sm leading-6 text-[#746c64]">{description}</p>
            </div>

            {children}
          </div>
        </div>
      </Container>
    </main>
  );
}
