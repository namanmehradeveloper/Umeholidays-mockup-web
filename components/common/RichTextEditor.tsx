'use client';

import dynamic from 'next/dynamic';
import type { CSSProperties } from 'react';

// CKEditor registers a process-wide version global, so it must never be evaluated on the server.
const RichTextEditorClient = dynamic(() => import('./RichTextEditorClient'), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden="true"
      className="animate-pulse rounded-2xl bg-[#faf8f5]"
      style={{ minHeight: 'calc(var(--ume-editor-min-height) + 44px)' }}
    />
  ),
});

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  minHeight?: number;
};

export default function RichTextEditor({
  value,
  onChange,
  disabled = false,
  placeholder,
  minHeight = 180,
}: Props) {
  return (
    <div
      className="ume-rich-editor rounded-2xl border border-[#e2ddd7] bg-white shadow-[0_6px_24px_rgba(27,25,23,0.04)] transition focus-within:border-[#b76b43]/60 focus-within:ring-2 focus-within:ring-[#b76b43]/10"
      style={{ '--ume-editor-min-height': `${Math.max(120, minHeight)}px` } as CSSProperties}
    >
      <RichTextEditorClient
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
      />
    </div>
  );
}
