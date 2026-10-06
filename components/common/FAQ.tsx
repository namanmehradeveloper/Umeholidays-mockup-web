'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import RichText from './RichText';

export default function FAQ({ items }: { items: string[][] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="divide-y divide-black/10 border-y border-black/10">
      {items.map(([question, answer], index) => {
        const expanded = open === index;
        const panelId = `faq-panel-${index}`;

        return (
          <div key={`${question}-${index}`}>
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls={panelId}
              onClick={() => setOpen(expanded ? null : index)}
              className="flex w-full items-center justify-between gap-5 py-5 text-left text-base font-medium"
            >
              <span>{question}</span>
              <Plus
                aria-hidden
                className={`shrink-0 transition ${expanded ? 'rotate-45' : ''}`}
                size={19}
              />
            </button>

            {expanded ? (
              <div id={panelId}>
                <RichText value={answer} className="pb-5 pr-10 text-sm leading-7 text-black/60" />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
