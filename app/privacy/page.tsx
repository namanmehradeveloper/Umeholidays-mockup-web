import type { Metadata } from 'next';
import Container from '../../components/common/Container';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white pb-24 pt-32 text-[#1b1917]">
      <Container>
        <div className="mx-auto max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#a35b36]">Legal</p>
          <h1 className="mt-3 font-serif text-5xl sm:text-6xl">Privacy Policy</h1>
          <div className="mt-8 rounded-3xl border border-black/10 bg-[#faf8f4] p-6 text-sm leading-7 text-black/65 sm:p-8">
            <p>The privacy policy content for UME Holidays is being finalized.</p>
            <p className="mt-4">For privacy, personal-data, or account-related requests, please contact the UME Holidays team through the Contact page.</p>
          </div>
        </div>
      </Container>
    </main>
  );
}
