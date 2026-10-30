import { describe, it, expect, beforeEach } from 'vitest';
import {
  sanitizeInput,
  checkRateLimit,
  PlanRequestSchema,
  GenerateRequestSchema,
} from '@/lib/backend/security';

describe('Security Layer', () => {
  describe('Input Sanitization', () => {
    it('strips dangerous script tags', () => {
      const malicious = '<script>alert("hacked")</script>Hello World';
      expect(sanitizeInput(malicious)).toBe('Hello World');
    });

    it('strips iframe and embedded exploits', () => {
      const malicious = '<iframe src="evil.com"></iframe>My Party';
      expect(sanitizeInput(malicious)).toBe('My Party');
    });

    it('strips null bytes', () => {
      const inputWithNull = 'Test\0String\0Attack';
      expect(sanitizeInput(inputWithNull)).toBe('TestStringAttack');
    });

    it('strips javascript pseudo-protocols', () => {
      const jsUrl = 'javascript:doEvil()';
      expect(sanitizeInput(jsUrl)).toBe('doEvil()');
    });

    it('returns empty string for non-string types safely', () => {
      expect(sanitizeInput(null)).toBe('');
      expect(sanitizeInput(undefined)).toBe('');
      expect(sanitizeInput(12345)).toBe('');
    });
  });

  describe('Rate Limiter', () => {
    const testIp = 'test-client-ip-1';

    it('permits requests under the threshold', () => {
      const check = checkRateLimit(testIp, 5, 5000);
      expect(check.success).toBe(true);
      expect(check.remaining).toBe(4);
    });

    it('blocks requests once limit is breached', () => {
      const spamIp = 'spammer-ip';
      for (let i = 0; i < 3; i++) {
        checkRateLimit(spamIp, 3, 5000);
      }
      const breach = checkRateLimit(spamIp, 3, 5000);
      expect(breach.success).toBe(false);
      expect(breach.remaining).toBe(0);
      expect(breach.resetMs).toBeGreaterThan(0);
    });
  });

  describe('Zod Schema Validation', () => {
    describe('PlanRequestSchema', () => {
      it('accepts valid wedding plan request', () => {
        const valid = {
          eventType: 'wedding',
          guestCount: 150,
          budget: 500000,
          targetDate: '2026-11-20',
          location: 'Udaipur',
          theme: 'Royal Rajputana',
          additionalNotes: 'Vegetarian only',
        };
        const result = PlanRequestSchema.safeParse(valid);
        expect(result.success).toBe(true);
      });

      it('rejects unsupported event types', () => {
        const invalid = {
          eventType: 'alien_invasion',
          guestCount: 50,
          budget: 10000,
        };
        const result = PlanRequestSchema.safeParse(invalid);
        expect(result.success).toBe(false);
      });

      it('rejects negative budgets', () => {
        const invalid = {
          eventType: 'birthday',
          guestCount: 20,
          budget: -500,
        };
        const result = PlanRequestSchema.safeParse(invalid);
        expect(result.success).toBe(false);
      });

      it('rejects zero or negative guest counts', () => {
        const invalid = {
          eventType: 'birthday',
          guestCount: 0,
          budget: 5000,
        };
        const result = PlanRequestSchema.safeParse(invalid);
        expect(result.success).toBe(false);
      });
    });

    describe('GenerateRequestSchema', () => {
      it('accepts valid creative prompt', () => {
        const valid = {
          prompt: '5 rustic centerpiece ideas',
          context: 'Event: Wedding',
        };
        const result = GenerateRequestSchema.safeParse(valid);
        expect(result.success).toBe(true);
      });

      it('rejects empty prompts', () => {
        const invalid = { prompt: '' };
        const result = GenerateRequestSchema.safeParse(invalid);
        expect(result.success).toBe(false);
      });
    });
  });
});
