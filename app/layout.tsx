import type { Metadata } from 'next';
import './globals.css';
import SiteChrome from '../components/layout/SiteChrome';
import { site } from '../lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: 'UME Holidays',
    template: '%s | UME Holidays',
  },
  description: 'Premium, thoughtfully planned journeys across Rajasthan.',
  openGraph: {
    title: 'UME Holidays',
    description: 'Journeys shaped by stories, landscapes and local experiences.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UME Holidays',
    description: 'Thoughtful journeys across Rajasthan.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
