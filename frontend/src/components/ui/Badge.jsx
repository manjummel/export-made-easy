import React from 'react';
import { cn } from '../../lib/cn';

const variants = {
  default: 'bg-[var(--color-surface-base)] text-[var(--text-secondary)] border-[var(--color-border-base)] font-semibold',
  navy: 'bg-blue-500/15 text-blue-400 border-blue-500/30 font-bold',
  primary: 'bg-blue-600/20 text-blue-400 border-blue-500/40 font-bold',
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-bold',
  danger: 'bg-rose-500/15 text-rose-400 border-rose-500/30 font-bold',
  info: 'bg-sky-500/15 text-sky-400 border-sky-500/30 font-bold',
  ai: 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 border-blue-400/40 font-bold',
};

const dotColors = {
  default: 'bg-slate-400',
  navy: 'bg-blue-400',
  primary: 'bg-blue-400',
  success: 'bg-emerald-400',
  warning: 'bg-amber-400',
  danger: 'bg-rose-400',
  info: 'bg-sky-400',
  ai: 'bg-blue-400',
};

const sizes = {
  xs: 'text-[10px] px-1.5 py-0.5 rounded-md gap-1 font-medium',
  sm: 'text-xs px-2 py-0.5 rounded-md gap-1.5 font-medium',
  md: 'text-xs px-2.5 py-1 rounded-lg gap-1.5 font-semibold',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  pulse = false,
  icon: Icon,
  className,
  ...props
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center border select-none leading-none tabular-nums',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          {pulse && (
            <span
              className={cn(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                dotColors[variant]
              )}
            />
          )}
          <span className={cn('relative inline-flex rounded-full h-1.5 w-1.5', dotColors[variant])} />
        </span>
      )}
      {Icon && <Icon size={size === 'xs' ? 10 : 12} className="shrink-0" />}
      {children}
    </span>
  );
}
