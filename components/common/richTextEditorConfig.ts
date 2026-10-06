import {
  Alignment,
  Autoformat,
  AutoLink,
  BlockQuote,
  Bold,
  Code,
  CodeBlock,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  Heading,
  HorizontalLine,
  Italic,
  Link,
  List,
  Paragraph,
  PasteFromOffice,
  Strikethrough,
  Underline,
} from 'ckeditor5';
import type { EditorConfig } from 'ckeditor5';

const TEXT_COLORS = [
  { color: '#1b1917', label: 'Ink' },
  { color: '#625a54', label: 'Stone' },
  { color: '#94a3b8', label: 'Slate' },
  { color: '#ffffff', label: 'White', hasBorder: true },
  { color: '#b76b43', label: 'Terracotta' },
  { color: '#9c5735', label: 'Rust' },
  { color: '#e03131', label: 'Red' },
  { color: '#f08c00', label: 'Orange' },
  { color: '#2f9e44', label: 'Green' },
  { color: '#1971c2', label: 'Blue' },
  { color: '#7048e8', label: 'Purple' },
  { color: '#c2255c', label: 'Pink' },
];

const BACKGROUND_COLORS = [
  { color: '#fff3bf', label: 'Yellow' },
  { color: '#fff9f5', label: 'Sand' },
  { color: '#f6e9df', label: 'Peach' },
  { color: '#ffe3e3', label: 'Rose' },
  { color: '#d3f9d8', label: 'Mint' },
  { color: '#d0ebff', label: 'Sky' },
  { color: '#e5dbff', label: 'Lavender' },
  { color: '#f1f3f5', label: 'Grey' },
  { color: '#1b1917', label: 'Ink' },
  { color: '#ffffff', label: 'White', hasBorder: true },
];

export const RICH_TEXT_EDITOR_PLUGINS = [
  Essentials,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  FontFamily,
  FontSize,
  FontColor,
  FontBackgroundColor,
  Link,
  AutoLink,
  List,
  Alignment,
  BlockQuote,
  CodeBlock,
  HorizontalLine,
  Autoformat,
  PasteFromOffice,
];

export const RICH_TEXT_EDITOR_TOOLBAR = [
  'undo',
  'redo',
  '|',
  'heading',
  '|',
  'fontFamily',
  'fontSize',
  'fontColor',
  'fontBackgroundColor',
  '|',
  'bold',
  'italic',
  'underline',
  'strikethrough',
  'code',
  '|',
  'link',
  'blockQuote',
  'codeBlock',
  'horizontalLine',
  '|',
  'alignment',
  'bulletedList',
  'numberedList',
];

export type RichTextEditorOptions = {
  placeholder?: string;
};

export function createRichTextEditorConfig({
  placeholder,
}: RichTextEditorOptions = {}): EditorConfig {
  return {
    licenseKey: process.env.NEXT_PUBLIC_CKEDITOR_LICENSE_KEY || 'GPL',
    plugins: RICH_TEXT_EDITOR_PLUGINS,
    toolbar: {
      items: RICH_TEXT_EDITOR_TOOLBAR,
      shouldNotGroupWhenFull: true,
    },
    heading: {
      options: [
        { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
        { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
        { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
        { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
      ],
    },
    fontFamily: {
      options: [
        'default',
        'Arial, Helvetica, sans-serif',
        'Georgia, serif',
        'Times New Roman, Times, serif',
        'Trebuchet MS, Helvetica, sans-serif',
        'Verdana, Geneva, sans-serif',
        'Courier New, Courier, monospace',
      ],
      supportAllValues: false,
    },
    fontSize: {
      options: [12, 14, 'default', 18, 20, 24, 28, 32],
      supportAllValues: false,
    },
    fontColor: {
      colors: TEXT_COLORS,
      columns: 6,
      colorPicker: { format: 'hex' },
    },
    fontBackgroundColor: {
      colors: BACKGROUND_COLORS,
      columns: 5,
      colorPicker: { format: 'hex' },
    },
    alignment: {
      options: ['left', 'center', 'right', 'justify'],
    },
    link: {
      addTargetToExternalLinks: true,
      defaultProtocol: 'https://',
    },
    codeBlock: {
      languages: [
        { language: 'plaintext', label: 'Plain text' },
        { language: 'html', label: 'HTML' },
        { language: 'css', label: 'CSS' },
        { language: 'javascript', label: 'JavaScript' },
        { language: 'typescript', label: 'TypeScript' },
        { language: 'json', label: 'JSON' },
        { language: 'bash', label: 'Bash' },
      ],
    },
    placeholder,
  };
}
