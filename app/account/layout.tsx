'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { apiFetch } from '../../lib/api';

type AccountUser = {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  role?: 'user' | 'organizer' | 'admin' | string;
};

export default function AccountLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      const token = localStorage.getItem('ume_token');

      if (!token) {
        router.replace(`/auth/login?next=${encodeURIComponent(pathname || '/account')}`);
        return;
      }

      try {
        const result = await apiFetch<AccountUser>('/auth/me');
        const user = result.data;

        if (!user) {
          throw new Error('Account session could not be verified');
        }

        localStorage.setItem('ume_user', JSON.stringify(user));
        if (!cancelled) setReady(true);
      } catch {
        localStorage.removeItem('ume_token');
        localStorage.removeItem('ume_user');

        if (!cancelled) {
          router.replace(`/auth/login?next=${encodeURIComponent(pathname || '/account')}`);
        }
      }
    }

    void verifySession();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center bg-white px-5 pt-24">
        <p className="text-sm text-black/50">Checking your account session…</p>
      </main>
    );
  }

  return <>{children}</>;
}
