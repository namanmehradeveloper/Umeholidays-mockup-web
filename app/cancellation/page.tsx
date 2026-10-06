import type { Metadata } from 'next';
import Container from '../../components/common/Container';

export const metadata: Metadata = {
  title: 'Cancellation Policy',
  robots: { index: false, follow: true },
};

export default function CancellationPage() {
  return (
    <main className="min-h-screen bg-white pb-24 pt-32 text-[#1b1917]">
      <Container>
        <div className="mx-auto max-w-3xl">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#a35b36]">Legal</p>
          <h1 className="mt-3 font-serif text-5xl sm:text-6xl">Cancellation Policy</h1>
          <div className="mt-8 rounded-3xl border border-black/10 bg-[#faf8f4] p-6 text-sm leading-7 text-black/65 sm:p-8">
            <p>The public cancellation-policy content for UME Holidays is being finalized.</p>
            <p className="mt-4">If you already have a booking, sign in to view its current status and available cancellation action, or contact the UME Holidays team for assistance.</p>
          </div>
        </div>
      </Container>
    </main>
  );
}
