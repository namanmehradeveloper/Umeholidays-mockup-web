'use client';

import { useMemo } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import { ClassicEditor } from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';
import { createRichTextEditorConfig } from './richTextEditorConfig';

export type RichTextEditorClientProps = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

export default function RichTextEditorClient({
  value,
  onChange,
  disabled = false,
  placeholder,
}: RichTextEditorClientProps) {
  const config = useMemo(
    () => createRichTextEditorConfig({ placeholder }),
    [placeholder]
  );

  return (
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
  );
}
