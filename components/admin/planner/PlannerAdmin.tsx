'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

import PlannerDestinationsAdmin from './PlannerDestinationsAdmin';
import PlannerOptionsAdmin from './PlannerOptionsAdmin';
import type { PlannerOptionTab } from './PlannerOptionsAdmin';
import { PlannerPricingAdmin, PlannerSettingsAdmin } from './PlannerSettingsAdmin';

export const PLANNER_TABS = [
  ['settings', 'Settings'],
  ['destinations', 'Destinations'],
  ['durations', 'Durations'],
  ['travel-styles', 'Travel Styles'],
  ['hotels', 'Hotels'],
  ['transport', 'Transport'],
  ['activities', 'Activities'],
  ['pricing', 'Pricing'],
] as const;

export type PlannerTab = (typeof PLANNER_TABS)[number][0];

export default function PlannerAdmin({ tab }: { tab: string }) {
  const active = PLANNER_TABS.find(([key]) => key === tab);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#6B7280]">Travel Planner</p>
          <h1 className="mt-2 font-serif text-4xl">{active ? active[1] : 'Travel Planner'}</h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Everything shown and priced on /plan-your-trip is managed here. The homepage Trip Planner is managed under{' '}
            <Link href="/admin/website/homepage" className="font-semibold text-[#b76b43] hover:underline">
              Content → Homepage
            </Link>
            ; it only shares the destinations enabled for planning.
          </p>
        </div>
        <Link
          href="/plan-your-trip"
          target="_blank"
          className="inline-flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold"
        >
          View planner <ExternalLink size={14} />
        </Link>
      </div>

      <nav className="mb-6 flex gap-1 overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white p-1.5" aria-label="Travel planner sections">
        {PLANNER_TABS.map(([key, label]) => (
          <Link
            key={key}
            href={`/admin/planner/${key}`}
            aria-current={key === tab ? 'page' : undefined}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition ${
              key === tab ? 'bg-[#b76b43] text-white' : 'text-[#475569] hover:bg-[#fff8f3] hover:text-[#b76b43]'
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {!active ? (
        <div className="rounded-2xl bg-red-50 p-5 text-sm text-red-700">Unknown planner section.</div>
      ) : tab === 'settings' ? (
        <PlannerSettingsAdmin />
      ) : tab === 'pricing' ? (
        <PlannerPricingAdmin />
      ) : tab === 'destinations' ? (
        <PlannerDestinationsAdmin />
      ) : (
        <PlannerOptionsAdmin key={tab} tab={tab as PlannerOptionTab} />
      )}
    </div>
  );
}
