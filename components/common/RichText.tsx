'use client';
import { sanitizeRichText } from '../../lib/rich-text';

type Props = { value?: unknown; className?: string };

export default function RichText({ value, className = '' }: Props) {
  const html = sanitizeRichText(value);
  if (!html) return null;
  return <div className={`rich-text ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}
