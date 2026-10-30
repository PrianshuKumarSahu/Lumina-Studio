import { describe, it, expect } from 'vitest';
import {
  cn,
  formatCurrency,
  formatDate,
  daysUntil,
  getEventThemeColors,
  getProgressColor,
} from '@/lib/frontend/utils';

describe('Utility Functions', () => {
  describe('cn (Tailwind Merge)', () => {
    it('merges class names cleanly', () => {
      expect(cn('px-2 py-1', 'bg-red-500')).toBe('px-2 py-1 bg-red-500');
    });

    it('resolves conflicting tailwind classes', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2');
    });

    it('handles conditional classes properly', () => {
      expect(cn('base-class', false && 'hidden', true && 'block')).toBe('base-class block');
    });
  });

  describe('formatCurrency', () => {
    it('formats numbers into Indian Rupee format without decimals', () => {
      const formatted = formatCurrency(50000);
      expect(formatted).toContain('50,000');
    });

    it('handles zero correctly', () => {
      const formatted = formatCurrency(0);
      expect(formatted).toContain('0');
    });

    it('handles large budgets', () => {
      const formatted = formatCurrency(1000000);
      expect(formatted).toContain('10,00,000');
    });
  });

  describe('formatDate', () => {
    it('formats ISO date strings to readable local dates', () => {
      const result = formatDate('2026-12-25');
      expect(result).toMatch(/Dec|25|2026/);
    });
  });

  describe('daysUntil', () => {
    it('calculates days remaining for a future date', () => {
      const future = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
      const days = daysUntil(future);
      expect(days).toBeGreaterThanOrEqual(4);
      expect(days).toBeLessThanOrEqual(6);
    });

    it('returns negative or zero for past dates', () => {
      const past = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
      const days = daysUntil(past);
      expect(days).toBeLessThanOrEqual(0);
    });
  });

  describe('getEventThemeColors', () => {
    it('returns romantic rose tones for wedding', () => {
      const theme = getEventThemeColors('wedding');
      expect(theme.primary).toContain('rose');
      expect(theme.gradient).toContain('rose');
    });

    it('returns warm playful tones for birthday', () => {
      const theme = getEventThemeColors('birthday');
      expect(theme.primary).toContain('orange');
    });

    it('returns community teal tones for community events', () => {
      const theme = getEventThemeColors('community');
      expect(theme.primary).toContain('teal');
    });

    it('returns corporate slate tones for corporate events', () => {
      const theme = getEventThemeColors('corporate');
      expect(theme.primary).toContain('slate');
    });
  });

  describe('getProgressColor', () => {
    it('returns emerald for healthy budgets (<85%)', () => {
      expect(getProgressColor(60)).toBe('bg-emerald-500');
    });

    it('returns amber for warning budgets (85-100%)', () => {
      expect(getProgressColor(90)).toBe('bg-amber-500');
    });

    it('returns red for exceeded budgets (>100%)', () => {
      expect(getProgressColor(110)).toBe('bg-red-500');
    });
  });
});
