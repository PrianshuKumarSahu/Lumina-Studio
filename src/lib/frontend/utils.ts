import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getEventThemeColors(eventType: string): {
  primary: string;
  secondary: string;
  accent: string;
  bg: string;
  gradient: string;
} {
  switch (eventType) {
    case 'wedding':
      return {
        primary: 'text-rose-700',
        secondary: 'text-amber-800',
        accent: 'bg-rose-500',
        bg: 'bg-rose-50',
        gradient: 'from-rose-50 via-amber-50 to-emerald-50',
      };
    case 'birthday':
      return {
        primary: 'text-orange-600',
        secondary: 'text-pink-600',
        accent: 'bg-orange-500',
        bg: 'bg-orange-50',
        gradient: 'from-orange-50 via-pink-50 to-yellow-50',
      };
    case 'community':
      return {
        primary: 'text-teal-700',
        secondary: 'text-amber-700',
        accent: 'bg-teal-500',
        bg: 'bg-teal-50',
        gradient: 'from-teal-50 via-emerald-50 to-amber-50',
      };
    case 'corporate':
      return {
        primary: 'text-slate-700',
        secondary: 'text-blue-600',
        accent: 'bg-blue-600',
        bg: 'bg-slate-50',
        gradient: 'from-slate-50 via-blue-50 to-indigo-50',
      };
    case 'anniversary':
      return {
        primary: 'text-purple-700',
        secondary: 'text-rose-600',
        accent: 'bg-purple-500',
        bg: 'bg-purple-50',
        gradient: 'from-purple-50 via-rose-50 to-amber-50',
      };
    case 'baby_shower':
      return {
        primary: 'text-sky-600',
        secondary: 'text-pink-500',
        accent: 'bg-sky-400',
        bg: 'bg-sky-50',
        gradient: 'from-sky-50 via-pink-50 to-yellow-50',
      };
    default:
      return {
        primary: 'text-gray-800',
        secondary: 'text-gray-600',
        accent: 'bg-gray-600',
        bg: 'bg-gray-50',
        gradient: 'from-gray-50 via-slate-50 to-zinc-50',
      };
  }
}

export function getProgressColor(percentage: number): string {
  if (percentage > 100) return 'bg-red-500';
  if (percentage > 85) return 'bg-amber-500';
  return 'bg-emerald-500';
}
