import { cn } from '@/lib/frontend/utils';

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  bg?: string;
  className?: string;
}

export default function Badge({ children, color, bg, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full',
        color || 'text-gray-700',
        bg || 'bg-gray-100',
        className
      )}
    >
      {children}
    </span>
  );
}
