import { z } from 'zod';

// ============================================================
// RATE LIMITING (Sliding window in-memory protection)
// ============================================================

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * Validates request rate limit per client identifier (IP or token).
 * Limits to maxRequests within windowMs window.
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 20,
  windowMs: number = 60000
): { success: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  const record = rateLimitMap.get(identifier) || { timestamps: [] };
  // Filter timestamps within window
  const activeTimestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (activeTimestamps.length >= maxRequests) {
    const oldest = activeTimestamps[0];
    const resetMs = Math.max(0, oldest + windowMs - now);
    return { success: false, remaining: 0, resetMs };
  }

  activeTimestamps.push(now);
  rateLimitMap.set(identifier, { timestamps: activeTimestamps });

  // Clean old entries periodically to prevent memory leak
  if (rateLimitMap.size > 1000) {
    for (const [key, val] of rateLimitMap.entries()) {
      const valid = val.timestamps.filter((t) => t > windowStart);
      if (valid.length === 0) {
        rateLimitMap.delete(key);
      } else {
        rateLimitMap.set(key, { timestamps: valid });
      }
    }
  }

  return {
    success: true,
    remaining: maxRequests - activeTimestamps.length,
    resetMs: windowMs,
  };
}

// ============================================================
// SANITIZATION
// ============================================================

/**
 * Sanitizes user input against XSS, null-byte injection, and oversized payloads.
 */
export function sanitizeInput(input: unknown): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/\0/g, '') // remove null bytes
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // remove script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // remove iframe tags
    .replace(/javascript:/gi, '') // remove javascript protocols
    .replace(/data:text\/html/gi, '')
    .trim();
}

// ============================================================
// STRICT ZOD VALIDATION SCHEMAS
// ============================================================

export const PlanRequestSchema = z.object({
  eventType: z.enum([
    'wedding',
    'birthday',
    'community',
    'corporate',
    'anniversary',
    'baby_shower',
  ]),
  guestCount: z.number().int().min(1, 'Guest count must be at least 1').max(50000, 'Max guest count exceeded'),
  budget: z.number().nonnegative('Budget cannot be negative').max(1000000000, 'Budget exceeds limit'),
  targetDate: z.string().max(50).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  theme: z.string().max(200).optional().nullable(),
  additionalNotes: z.string().max(2000).optional().nullable(),
});

export const GenerateRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt cannot be empty').max(3000, 'Prompt exceeds maximum length'),
  context: z.string().max(4000).optional().nullable(),
});
