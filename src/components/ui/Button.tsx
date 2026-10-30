'use client';

import { cn } from '@/lib/frontend/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className,
  disabled,
  'aria-label': ariaLabel,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

  const variants: Record<string, string> = {
    primary:
      'bg-gray-950 text-white hover:bg-gray-800 focus-visible:ring-gray-950 shadow-sm hover:shadow',
    secondary:
      'bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus-visible:ring-gray-400',
    ghost: 'text-gray-700 hover:text-gray-950 hover:bg-gray-100 focus-visible:ring-gray-400',
    danger:
      'bg-red-50 text-red-700 border border-red-300 hover:bg-red-100 focus-visible:ring-red-500',
    outline:
      'border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white focus-visible:ring-gray-900',
  };

  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      aria-label={ariaLabel}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : icon}
      {children}
    </button>
  );
}
