'use client';

import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  BlockQuote,
  Bold,
  ClassicEditor,
  Essentials,
  Heading,
  Italic,
  Link,
  List,
  Paragraph,
} from 'ckeditor5';
import type { EditorConfig } from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';

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
  const config: EditorConfig = useMemo(
    () => ({
      licenseKey: process.env.NEXT_PUBLIC_CKEDITOR_LICENSE_KEY || 'GPL',
      plugins: [
        Essentials,
        Paragraph,
        Heading,
        Bold,
        Italic,
        Link,
        List,
        BlockQuote,
      ],
      toolbar: {
        items: [
          'heading',
          '|',
          'bold',
          'italic',
          'link',
          '|',
          'bulletedList',
          'numberedList',
          'blockQuote',
          '|',
          'undo',
          'redo',
        ],
        shouldNotGroupWhenFull: false,
      },
      heading: {
        options: [
          { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
          { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
          { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
        ],
      },
      link: {
        addTargetToExternalLinks: true,
        defaultProtocol: 'https://',
      },
      placeholder,
    }),
    [placeholder]
  );

  return (
    <div
      className="ume-rich-editor overflow-hidden rounded-2xl border border-[#e2ddd7] bg-white shadow-[0_6px_24px_rgba(27,25,23,0.04)] transition focus-within:border-[#b76b43]/60 focus-within:ring-2 focus-within:ring-[#b76b43]/10"
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
