'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  BadgePercent,
  BarChart3,
  BookOpen,
  CalendarDays,
  Car,
  ClipboardList,
  Compass,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  MapPinned,
  Menu,
  MessageSquareQuote,
  Route,
  Search as SearchIcon,
  Settings,
  Sparkles,
  Users,
  X,
} from 'lucide-react';

import { api, clearAdminSession, getAdminToken, getAdminUser } from '../../lib/admin-api';
import AdminHeader from './AdminHeader';
import AdminFooter from './AdminFooter';

type AdminUser = { name?: string; email?: string; role?: string };
type NavItem = [label: string, href: string, icon: LucideIcon];
type NavGroup = { title: string; items: NavItem[] };

const groups: NavGroup[] = [
  {
    title: 'Overview', items: [
      ['Dashboard', '/admin/dashboard', LayoutDashboard],
      ['Users', '/admin/users', Users],
      ['Bookings', '/admin/bookings', CalendarDays],
      ['Contact & Enquiries', '/admin/leads', Users]


    ]
  },
  {
    title: 'Content',
    items: [
      ['Destinations', '/admin/destinations', MapPinned],
      ['Tours', '/admin/tours', Compass],
      ['Experiences', '/admin/experiences', Sparkles],
      ['Events', '/admin/events', CalendarDays],
      ['Stories', '/admin/stories', BookOpen],
      ['Offers', '/admin/offers', BadgePercent],
      ['Banners', '/admin/banners', ImageIcon],
      ['FAQs', '/admin/faqs', FileText],
      ['Testimonials', '/admin/testimonials', MessageSquareQuote],
    ],
  },
  { title: 'Travel Planner', items: [['Travel Planner', '/admin/planner', Route]] },
  {
    title: 'Pages & Content', items: [
      ['Homepage', '/admin/website/homepage', LayoutTemplate],
      ['Search Page', '/admin/website/search', SearchIcon],
      ['Travel Essentials', '/admin/website/travel-essentials', Car],
    ]
  },


  {
    title: 'System',
    items: [
      ['Analytics', '/admin/analytics', BarChart3],
      ['Audit Logs', '/admin/audit-logs', ClipboardList],
      ['System Health', '/admin/system-health', BarChart3],
      ['Company Settings', '/admin/settings/company', Settings],
    ],
  },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setReady(true);
      return;
    }

    try {
      const currentUser = getAdminUser();
      if (!getAdminToken() || currentUser?.role !== 'admin') {
        router.replace('/admin/login');
        return;
      }
      setUser(currentUser);
      setReady(true);
    } catch {
      clearAdminSession();
      router.replace('/admin/login');
    }
  }, [router, pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (pathname === '/admin/login') return <>{children}</>;

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-white text-sm font-semibold text-[#423b36]">
        Checking admin session…
      </div>
    );
  }

  const signOut = async () => {
    try {
      await api('/auth/logout', { method: 'POST' });
    } catch {
      // Local logout should still complete when the API is unavailable.
    }
    clearAdminSession();
    router.replace('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#071F3D] text-[#1b1917]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Toggle admin menu"
        className="fixed left-4 top-4 z-50 grid h-11 w-11 place-items-center rounded-xl border border-[#e6dfd8] bg-white text-[#5d544d] shadow-md transition hover:border-[#b76b43]/40 hover:text-[#9c5735] lg:hidden"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {open ? (
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close admin menu"
          className="fixed inset-0 z-30 bg-[#1b1917]/20 backdrop-blur-[1px] lg:hidden"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 overflow-y-auto border-r border-white/5 bg-[#071F3D] p-5 [scrollbar-color:#2a4a78_transparent] [scrollbar-width:thin] shadow-[8px_0_30px_rgba(7,31,61,0.25)] transition-transform duration-200 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="mb-7 border-b border-white/10 pb-5">
          <p className="font-serif text-2xl font-semibold tracking-wide text-white">UME HOLIDAYS</p>
        </div>

        <nav className="space-y-6">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="mb-2 px-3 text-[9px] font-extrabold uppercase tracking-[.22em] text-[#7f93b3]">{group.title}</p>
              <div className="space-y-1">
                {group.items.map(([label, href, Icon]) => {
                  const isActive = pathname === href || pathname.startsWith(`${href}/`);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${isActive
                        ? 'bg-[#1769ff] font-bold text-white shadow-[0_8px_20px_rgba(23,105,255,0.35)]'
                        : 'font-semibold text-[#c3cfe2] hover:bg-white/[0.06] hover:text-white'
                        }`}
                    >
                      <span className={isActive ? 'text-white' : 'text-[#7f93b3] transition-colors group-hover:text-[#8fb6ff]'}>
                        <Icon size={16} strokeWidth={isActive ? 2.2 : 1.9} />
                      </span>
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <button
          type="button"
          onClick={signOut}
          className="mt-8 flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm font-bold text-[#c3cfe2] transition-all hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={16} strokeWidth={2} />
          Sign out
        </button>
      </aside>

      <main className="admin-main min-h-screen bg-[#fbfaf8] text-[#1b1917] lg:pl-72">
        <AdminHeader user={user} />
        <div className="min-h-[calc(100vh-130px)] p-5 lg:p-8">{children}</div>
        <AdminFooter />
      </main>
    </div>
  );
}
