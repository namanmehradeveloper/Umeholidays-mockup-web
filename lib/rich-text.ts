import DOMPurify from 'isomorphic-dompurify';
import type { UponSanitizeAttributeHook } from 'isomorphic-dompurify';

export const RICH_TEXT_TAGS = [
  'p',
  'h2',
  'h3',
  'h4',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'del',
  'code',
  'pre',
  'span',
  'a',
  'ul',
  'ol',
  'li',
  'blockquote',
  'br',
  'hr',
  'figure',
  'figcaption',
  'img',
  'table',
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'th',
  'td',
];

const RICH_TEXT_ATTRS = [
  'href',
  'target',
  'rel',
  'src',
  'alt',
  'width',
  'height',
  'colspan',
  'rowspan',
  'scope',
  'style',
  'class',
];

const COLOR = /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%]+\)|hsla?\([\d\s.,%deg]+\)|[a-z]+)$/i;
const SIZE = /^\d+(\.\d+)?(px|%)$/;

// Only the inline styles CKEditor produces for the enabled features.
const STYLE_RULES: Record<string, RegExp> = {
  color: COLOR,
  'background-color': COLOR,
  'font-size': /^\d+(\.\d+)?(px|em|rem|%)$/,
  'font-family': /^[\w\s,'"-]+$/,
  'text-align': /^(left|right|center|justify)$/,
  width: SIZE,
  height: SIZE,
  'aspect-ratio': /^\d+(\.\d+)?\s*\/\s*\d+(\.\d+)?$/,
};

const CLASS_RULES = [
  /^image$/,
  /^image-inline$/,
  /^image_resized$/,
  /^image-style-(side|align-(left|right|center)|block-align-(left|right))$/,
  /^table$/,
  /^language-[a-z0-9-]+$/,
];

function filterStyle(value: string) {
  return value
    .split(';')
    .map((declaration) => {
      const index = declaration.indexOf(':');
      if (index < 0) return '';
      const property = declaration.slice(0, index).trim().toLowerCase();
      const propertyValue = declaration.slice(index + 1).trim();
      const rule = STYLE_RULES[property];
      return rule && rule.test(propertyValue) ? `${property}:${propertyValue}` : '';
    })
    .filter(Boolean)
    .join(';');
}

function filterClass(value: string) {
  return value
    .split(/\s+/)
    .filter((name) => CLASS_RULES.some((rule) => rule.test(name)))
    .join(' ');
}

const filterAttribute: UponSanitizeAttributeHook = (_node, data) => {
  let next = data.attrValue;
  if (data.attrName === 'style') next = filterStyle(next);
  else if (data.attrName === 'class') next = filterClass(next);
  else if (data.attrName === 'src' && !/^(https?:\/\/|\/(?!\/))/i.test(next.trim())) next = '';
  else return;

  if (next) data.attrValue = next;
  else data.keepAttr = false;
};

function secureLinks(node: Element) {
  if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
    node.setAttribute('rel', 'noopener noreferrer');
  }
}

export function sanitizeRichText(value: unknown): string {
  // Hooks are attached per call because the server-side DOMPurify instance can be recreated.
  DOMPurify.addHook('uponSanitizeAttribute', filterAttribute);
  DOMPurify.addHook('afterSanitizeAttributes', secureLinks);
  try {
    return DOMPurify.sanitize(String(value ?? ''), {
      ALLOWED_TAGS: RICH_TEXT_TAGS,
      ALLOWED_ATTR: RICH_TEXT_ATTRS,
      ALLOW_DATA_ATTR: false,
      FORBID_ATTR: ['id'],
    });
  } finally {
    DOMPurify.removeHook('uponSanitizeAttribute', filterAttribute);
    DOMPurify.removeHook('afterSanitizeAttributes', secureLinks);
  }
}

export function richTextToPlainText(value: unknown): string {
  const html = sanitizeRichText(value);
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|h2|h3|h4|li|blockquote|pre|figcaption|td|th|tr)>|<hr\s*\/?>/gi, ' ')
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
  if (/<(img|table|hr)\b/i.test(sanitizeRichText(value))) return false;
  return richTextToPlainText(value).length === 0;
}
