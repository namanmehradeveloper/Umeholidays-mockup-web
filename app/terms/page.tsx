import type { Metadata } from 'next';
import Container from '../../components/common/Container';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white pb-24 pt-32 text-[#1b1917]">
      <Container>
        <div className="mx-auto max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#a35b36]">Legal</p>
          <h1 className="mt-3 font-serif text-5xl sm:text-6xl">Terms &amp; Conditions</h1>
          <div className="mt-8 rounded-3xl border border-black/10 bg-[#faf8f4] p-6 text-sm leading-7 text-black/65 sm:p-8">
            <p>The terms and conditions for UME Holidays are being finalized.</p>
            <p className="mt-4">For booking terms or service questions in the meantime, please contact the UME Holidays team before completing your travel arrangements.</p>
          </div>
        </div>
      </Container>
    </main>
  );
}
