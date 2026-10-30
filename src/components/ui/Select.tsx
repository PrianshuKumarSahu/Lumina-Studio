'use client';

import { cn } from '@/lib/frontend/utils';
import { useId } from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Array<{ value: string; label: string }>;
}

export default function Select({ label, options, className, id: customId, ...props }: SelectProps) {
  const generatedId = useId();
  const selectId = customId || generatedId;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-800">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900',
          'transition-all duration-200',
          'focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10',
          'hover:border-gray-400',
          'appearance-none cursor-pointer',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
