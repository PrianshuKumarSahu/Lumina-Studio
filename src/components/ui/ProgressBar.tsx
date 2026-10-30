import { cn } from '@/lib/frontend/utils';

interface ProgressBarProps {
  value: number;
  max: number;
  colorClass?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
  label?: string;
}

export default function ProgressBar({
  value,
  max,
  colorClass = 'bg-emerald-600',
  showLabel = true,
  size = 'md',
  label = 'Progress',
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;

  return (
    <div className="space-y-1.5" role="region" aria-label={label}>
      <div
        className={cn(
          'w-full rounded-full bg-gray-200 overflow-hidden',
          size === 'sm' ? 'h-1.5' : 'h-2.5'
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuetext={`${percentage}% completed`}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-gray-600 font-medium">
          <span>{label}</span>
          <span>{percentage}%</span>
        </div>
      )}
    </div>
  );
}
