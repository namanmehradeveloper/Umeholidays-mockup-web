'use client';

import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { ClassicEditor } from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import { createRichTextEditorConfig } from './richTextEditorConfig';

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
  const config = useMemo(
    () => createRichTextEditorConfig({ placeholder }),
    [placeholder]
  );

  return (
    <div
      className="ume-rich-editor rounded-2xl border border-[#e2ddd7] bg-white shadow-[0_6px_24px_rgba(27,25,23,0.04)] transition focus-within:border-[#b76b43]/60 focus-within:ring-2 focus-within:ring-[#b76b43]/10"
      style={{ '--ume-editor-min-height': `${Math.max(120, minHeight)}px` } as CSSProperties}
    >
      <CKEditor
        editor={ClassicEditor}
        config={config}
        data={value || ''}
        disabled={disabled}
        onChange={(_, editor) => {
          const nextValue = editor.getData();
          if (nextValue !== value) onChange(nextValue);
        }}
      />
    </div>
  );
}
