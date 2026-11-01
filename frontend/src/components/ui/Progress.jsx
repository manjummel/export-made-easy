import React from 'react';
import { cn } from '../../lib/cn';

const colorVariants = {
  blue: 'bg-[#1746D2]',
  emerald: 'bg-emerald-600',
  amber: 'bg-amber-500',
  red: 'bg-red-600',
  indigo: 'bg-indigo-600',
  navy: 'bg-[#0B1736]',
};

export function Progress({
  value = 0,
  max = 100,
  variant = 'blue',
  size = 'md',
  showLabel = false,
  label,
  className,
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('w-full space-y-1.5', className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="font-semibold text-[var(--color-secondary)]">{label}</span>}
          {showLabel && (
            <span className="font-mono text-[var(--color-muted)] ml-auto font-medium">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      <div className={cn('w-full bg-[var(--color-surface-base)] rounded-full overflow-hidden border border-[var(--color-border-base)]/60', sizeClasses[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorVariants[variant] || colorVariants.blue
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function CircularProgress({
  value = 0,
  max = 100,
  size = 56,
  strokeWidth = 5,
  variant = 'blue',
  showText = true,
  className,
}) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const strokeColors = {
    blue: '#1746D2',
    emerald: '#16A34A',
    amber: '#F59E0B',
    red: '#DC2626',
    indigo: '#4F46E5',
    navy: '#0B1736',
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColors[variant] || strokeColors.blue}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {showText && (
        <span className="absolute font-mono font-bold text-xs text-[var(--color-primary)]">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}

export default Progress;
