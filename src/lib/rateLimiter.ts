// Client-side rate limiter to prevent abuse before requests hit the server
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkClientRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now >= entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, retryAfterMs: entry.resetTime - now };
  }

  entry.count++;
  return { allowed: true, retryAfterMs: 0 };
}

// Sanitize user input for display (strip potential XSS vectors)
export function sanitizeInput(input: string, maxLength: number = 10000): string {
  if (typeof input !== 'string') return '';
  return input.slice(0, maxLength).replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

// Validate URL to prevent SSRF
export function isValidUrl(url: string, allowedDomains?: string[]): boolean {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    if (allowedDomains && !allowedDomains.some(d => parsed.hostname.endsWith(d))) return false;
    return true;
  } catch {
    return false;
  }
}
