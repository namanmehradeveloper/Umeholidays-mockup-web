import DOMPurify from 'isomorphic-dompurify';

export const RICH_TEXT_TAGS = [
  'p',
  'h2',
  'h3',
  'strong',
  'b',
  'em',
  'i',
  'a',
  'ul',
  'ol',
  'li',
  'blockquote',
  'br',
];

export function sanitizeRichText(value: unknown): string {
  return DOMPurify.sanitize(String(value ?? ''), {
    ALLOWED_TAGS: RICH_TEXT_TAGS,
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    FORBID_ATTR: ['style', 'class', 'id'],
  });
}

export function richTextToPlainText(value: unknown): string {
  const html = sanitizeRichText(value);
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>|<\/h2>|<\/h3>|<\/li>|<\/blockquote>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function isRichTextEmpty(value: unknown): boolean {
  return richTextToPlainText(value).length === 0;
}
