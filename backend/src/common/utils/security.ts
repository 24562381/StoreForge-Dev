import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

let _cachedSecret: string | null = null;

const INSECURE_DEFAULT_SECRETS = new Set([
  'storeforge_super_secure_jwt_secret_change_in_production_2026',
  'default_jwt_secret',
  'supersecretjwtkey',
  'changeme',
]);

/**
 * Returns the cryptographically secure JWT secret from process.env,
 * or synthesizes and persists a 256-bit random key if missing or default placeholder.
 */
export function getJwtSecret(): string {
  const envSecret = process.env.JWT_SECRET?.trim();

  if (envSecret && envSecret.length >= 16 && !INSECURE_DEFAULT_SECRETS.has(envSecret)) {
    return envSecret;
  }

  if (!_cachedSecret) {
    _cachedSecret = crypto.randomBytes(32).toString('hex');
    process.env.JWT_SECRET = _cachedSecret;
    console.warn(
      '[SECURITY NOTICE] JWT_SECRET was not provided or matched an insecure default placeholder. A dynamic, high-entropy 256-bit session secret has been generated automatically.',
    );

    try {
      const candidatePaths = [
        path.join(process.cwd(), '.env'),
        path.resolve(__dirname, '..', '..', '..', '.env'),
        path.resolve(__dirname, '..', '..', '..', '..', '.env'),
      ];
      for (const envFile of candidatePaths) {
        if (fs.existsSync(envFile)) {
          let content = fs.readFileSync(envFile, 'utf8');
          if (content.includes('JWT_SECRET=')) {
            content = content.replace(/JWT_SECRET=["']?[^"'\n\r]+["']?/, `JWT_SECRET="${_cachedSecret}"`);
          } else {
            content += `\nJWT_SECRET="${_cachedSecret}"\n`;
          }
          fs.writeFileSync(envFile, content, 'utf8');
          break;
        }
      }
    } catch {}
  }

  return _cachedSecret;
}

const BLOCKED_METADATA_HOSTS = new Set([
  '169.254.169.254',
  'metadata.google.internal',
  'instance-data',
  'fd00:ec2::254',
]);

const DANGEROUS_INTERNAL_PORTS = new Set([
  22,    // SSH
  25,    // SMTP
  5432,  // PostgreSQL
  3306,  // MySQL
  6379,  // Redis
  27017, // MongoDB
  2375,  // Docker daemon
  2376,  // Docker TLS
]);

/**
 * SSRF Protection Validator for outbound HTTP requests
 * Strictly validates that the destination URL uses allowed protocols,
 * blocks cloud instance metadata services, sensitive internal ports,
 * and restricts private/loopback addresses in production.
 */
export function validateSafeUrl(urlStr: string): void {
  if (!urlStr || typeof urlStr !== 'string') {
    throw new Error('Destination URL must be a valid, non-empty string');
  }

  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    throw new Error(`Invalid URL format: "${urlStr}"`);
  }

  const isProd = process.env.NODE_ENV === 'production';

  // Only permit HTTP (dev only) and HTTPS
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error(`SSRF Blocked: Protocol "${parsed.protocol}" is not permitted. Only HTTPS is allowed.`);
  }

  if (isProd && parsed.protocol !== 'https:') {
    throw new Error('SSRF Blocked: Insecure HTTP protocol is forbidden in production. Must use HTTPS.');
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, '');

  // Block cloud instance metadata IP across all environments
  if (BLOCKED_METADATA_HOSTS.has(hostname) || hostname.endsWith('.internal')) {
    throw new Error('SSRF Blocked: Access to cloud instance metadata services is strictly forbidden.');
  }

  // Block dangerous internal service ports
  if (parsed.port) {
    const portNum = parseInt(parsed.port, 10);
    if (DANGEROUS_INTERNAL_PORTS.has(portNum)) {
      throw new Error(`SSRF Blocked: Connections to sensitive internal port ${portNum} are forbidden.`);
    }
  }

  // In production, block loopback and private RFC 1918 ranges
  if (isProd) {
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local') ||
      /^127\.\d+\.\d+\.\d+$/.test(hostname) ||
      /^10\.\d+\.\d+\.\d+$/.test(hostname) ||
      /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/.test(hostname) ||
      /^192\.168\.\d+\.\d+$/.test(hostname)
    ) {
      throw new Error(`SSRF Blocked: Requests to private or loopback host "${hostname}" are forbidden in production.`);
    }
  }
}

const SENSITIVE_KEY_REGEX =
  /^(password|currentPassword|newPassword|confirmPassword|secret|token|accessToken|refreshToken|jwt|authorization|cookie|apiKey|app_key|app_secret|cvv|creditCard|card_number|nidNumber|nidPhoto)$/i;

const SENSITIVE_VALUE_REGEXES = [
  /Bearer\s+[a-zA-Z0-9_\-\.]+/gi,
  /(key|api[-_]?key|secret|password|token)=([a-zA-Z0-9_\-\.%]+)/gi,
  /AIzaSy[a-zA-Z0-9_\-]{33}/g,
  /eyJ[a-zA-Z0-9_\-]{10,}\.eyJ[a-zA-Z0-9_\-]{10,}\.[a-zA-Z0-9_\-]*/g,
];

/**
 * Scrubs sensitive secrets, bearer tokens, API keys, and credentials from log strings.
 */
export function maskSensitiveLogString(str: string): string {
  if (!str || typeof str !== 'string') return str;
  let masked = str;
  for (const regex of SENSITIVE_VALUE_REGEXES) {
    masked = masked.replace(regex, (match, prefix, val) => {
      if (prefix && val) return `${prefix}=[REDACTED]`;
      return '[REDACTED]';
    });
  }
  return masked;
}

/**
 * Deep sanitization of objects, arrays, and errors to prevent credentials,
 * auth tokens, passwords, and PII from leaking into application logs.
 */
export function maskSensitiveLogData(data: any, depth = 0): any {
  if (depth > 6) return '[MAX_DEPTH]';
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    return maskSensitiveLogString(data);
  }

  if (typeof data !== 'object') {
    return data;
  }

  if (data instanceof Error) {
    const cleanError: Record<string, any> = {
      name: data.name,
      message: maskSensitiveLogString(data.message),
    };
    if (data.stack) {
      cleanError.stack = maskSensitiveLogString(data.stack);
    }
    for (const key of Object.keys(data)) {
      if (SENSITIVE_KEY_REGEX.test(key)) {
        cleanError[key] = '[REDACTED]';
      } else {
        cleanError[key] = maskSensitiveLogData((data as any)[key], depth + 1);
      }
    }
    return cleanError;
  }

  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveLogData(item, depth + 1));
  }

  const sanitized: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    if (SENSITIVE_KEY_REGEX.test(key)) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = maskSensitiveLogData(val, depth + 1);
    }
  }
  return sanitized;
}

