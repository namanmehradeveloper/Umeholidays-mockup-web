'use client';

import { Bell, UserRound } from 'lucide-react';

type AdminHeaderProps = { user?: { name?: string; email?: string } | null };

export default function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#e8e2dc] bg-white/95 px-4 py-3.5 shadow-[0_1px_3px_rgba(27,25,23,0.04)] backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex min-h-9 items-center justify-between gap-4 pl-12 lg:pl-0">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#a35b36]">UME Holidays</p>
          <p className="mt-0.5 truncate text-sm font-bold text-[#1b1917]">Admin workspace</p>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-3 border-l border-[#e8e2dc] pl-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-[#1b1917]">{user?.name || 'Admin'}</p>
              <p className="mt-0.5 max-w-[220px] truncate text-[11px] font-medium text-[#847a72]">{user?.email || 'Administrator'}</p>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-full border border-[#e3dbd4] bg-[#fff8f3] text-[#9c5735]">
              <UserRound size={17} strokeWidth={2} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
