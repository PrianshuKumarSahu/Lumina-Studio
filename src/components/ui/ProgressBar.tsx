import { cn } from '@/lib/frontend/utils';

interface ProgressBarProps {
  value: number;
  max: number;
  colorClass?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export default function ProgressBar({
  value,
  max,
  colorClass = 'bg-emerald-500',
  showLabel = true,
  size = 'md',
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  return (
    <div className="space-y-1">
      <div
        className={cn(
          'w-full rounded-full bg-gray-100 overflow-hidden',
          size === 'sm' ? 'h-1.5' : 'h-2.5'
        )}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-gray-500 text-right">{Math.round(percentage)}%</p>
      )}
    </div>
  );
}
