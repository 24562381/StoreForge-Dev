/**
 * Security Input Sanitization Utility
 * High-performance, pre-compiled regex sanitization minimizing CPU cycles and memory allocations.
 */

const CONTROL_CHARS_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
const SCRIPT_TAGS_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const HTML_TAGS_REGEX = /<[^>]+>/g;
const JS_PROTOCOL_REGEX = /javascript:/gi;
const VBS_PROTOCOL_REGEX = /vbscript:/gi;
const DATA_HTML_REGEX = /data:\s*text\/html/gi;
const PHONE_CHARS_REGEX = /[^\d+()-\s]/g;

export function sanitizeString(input: unknown, maxLength = 2000): string {
  if (input === null || input === undefined) return '';
  const val = typeof input === 'string' ? input : String(input);
  if (!val) return '';

  let str = val
    .replace(CONTROL_CHARS_REGEX, '')
    .replace(SCRIPT_TAGS_REGEX, '')
    .replace(HTML_TAGS_REGEX, '')
    .replace(JS_PROTOCOL_REGEX, '')
    .replace(VBS_PROTOCOL_REGEX, '')
    .replace(DATA_HTML_REGEX, '')
    .trim();

  if (maxLength && str.length > maxLength) {
    str = str.substring(0, maxLength);
  }

  return str;
}

export function sanitizePhone(input: unknown): string {
  if (!input) return '';
  return String(input).replace(PHONE_CHARS_REGEX, '').trim();
}

export function sanitizeNumber(input: unknown, fallback = 0, min?: number, max?: number): number {
  const num = Number(input);
  if (isNaN(num) || !isFinite(num)) return fallback;
  if (min !== undefined && num < min) return min;
  if (max !== undefined && num > max) return max;
  return num;
}
