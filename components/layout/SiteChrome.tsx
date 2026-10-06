'use client';

import { MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import { useSiteSettings } from '../common/useSiteSettings';

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const site = useSiteSettings();
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <a
        href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent('Hi UME Holidays, I would like to plan a trip.')}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-5 right-5 z-40 inline-flex h-12 items-center gap-2 rounded-full border border-[#e8e1da] bg-white px-4 text-xs font-semibold text-[#6a5e55] shadow-[0_12px_35px_rgba(27,25,23,0.12)] transition-all hover:-translate-y-0.5 hover:border-[#b76b43] hover:text-[#9c5735]"
      >
        <MessageCircle size={16} />
        WhatsApp
      </a>
    </>
  );
}
