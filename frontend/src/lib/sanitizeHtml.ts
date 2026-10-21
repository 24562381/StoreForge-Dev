/**
 * High-performance HTML Sanitization for Rich Text Content
 * Safely removes script tags, event handlers, and dangerous URL schemes
 * across both Server-Side (SSR) and Client-Side rendering.
 */

const DANGEROUS_TAGS_REGEX = /<\/?(script|iframe|object|embed|applet|form|meta|link|base|style)[^>]*>/gi;
const SCRIPT_BLOCK_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const EVENT_HANDLER_REGEX = /\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi;
const DANGEROUS_PROTOCOLS_REGEX = /(href|src)\s*=\s*(['"]?)\s*(javascript|vbscript|data:\s*text\/html):/gi;

export function sanitizeHtml(rawHtml: string): string {
  if (!rawHtml || typeof rawHtml !== 'string') return '';

  return rawHtml
    .replace(SCRIPT_BLOCK_REGEX, '')
    .replace(DANGEROUS_TAGS_REGEX, '')
    .replace(EVENT_HANDLER_REGEX, '')
    .replace(DANGEROUS_PROTOCOLS_REGEX, '$1=$2about:blank#blocked-')
    .trim();
}
