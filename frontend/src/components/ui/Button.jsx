import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

const variants = {
  primary:
    'bg-[#1746D2] text-white hover:bg-[#1338a8] active:bg-[#0f2d87] shadow-sm shadow-blue-500/10 border border-[#1746D2] focus-visible:ring-[#1746D2]',
  navy:
    'bg-[#0B1736] text-white hover:bg-[#15234a] active:bg-[#081026] shadow-sm border border-[#0B1736] focus-visible:ring-[#0B1736]',
  secondary:
    'bg-[var(--color-surface-card)] backdrop-blur-md text-[var(--color-primary)] hover:bg-[var(--color-surface-subtle)] hover:text-[var(--color-primary)] border border-[var(--color-border-base)] active:bg-[var(--color-surface-base)] shadow-xs focus-visible:ring-slate-400',
  outline:
    'bg-transparent text-[var(--color-secondary)] hover:bg-[var(--color-surface-base)] hover:text-[var(--color-primary)] border border-[var(--color-border-medium)] active:bg-[var(--color-border-base)] focus-visible:ring-[#1746D2]',
  ghost:
    'bg-transparent text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-base)] active:bg-[var(--color-border-base)] focus-visible:ring-slate-400',
  danger:
    'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 active:bg-red-500/30 focus-visible:ring-red-500',
  success:
    'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 active:bg-emerald-500/30 focus-visible:ring-emerald-500',
  ai:
    'bg-gradient-to-r from-[#1746D2] via-[#2563EB] to-[#3B82F6] text-white hover:from-[#1338a8] hover:to-[#2563eb] shadow-sm shadow-blue-500/20 border border-blue-500/30 focus-visible:ring-[#1746D2]',
};

const sizes = {
  xs: 'h-7 px-2.5 text-xs gap-1.5 rounded-md font-medium',
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg font-medium',
  md: 'h-9 px-4 text-sm gap-2 rounded-lg font-medium',
  lg: 'h-11 px-5 text-sm gap-2.5 rounded-xl font-semibold',
  icon: 'h-8 w-8 p-0 rounded-lg justify-center',
  'icon-sm': 'h-7 w-7 p-0 rounded-md justify-center',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  kbd,
  className,
  onClick,
  type = 'button',
  fullWidth = false,
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center select-none transition-all duration-150 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin shrink-0" size={size === 'xs' || size === 'sm' ? 13 : 15} />
      ) : (
        Icon && <Icon size={size === 'xs' || size === 'sm' ? 13 : 15} className="shrink-0" />
      )}
      {children}
      {!loading && IconRight && (
        <IconRight size={size === 'xs' || size === 'sm' ? 13 : 15} className="shrink-0" />
      )}
      {kbd && (
        <kbd className="ml-1 px-1.5 py-0.5 text-[10px] font-mono rounded bg-[var(--color-surface-base)] text-[var(--color-muted)] border border-[var(--color-border-base)]">
          {kbd}
        </kbd>
      )}
    </button>
  );
}
