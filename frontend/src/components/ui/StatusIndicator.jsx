import React from 'react';
import { cn } from '../../lib/cn';

const statusConfig = {
  live: {
    dot: 'bg-emerald-400',
    ping: 'bg-emerald-400',
    pill: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold',
    label: 'Live',
  },
  ai: {
    dot: 'bg-blue-400',
    ping: 'bg-blue-400',
    pill: 'bg-blue-500/15 text-blue-300 border-blue-500/30 font-bold',
    label: 'AI Online',
  },
  syncing: {
    dot: 'bg-sky-400',
    ping: 'bg-sky-400',
    pill: 'bg-sky-500/15 text-sky-300 border-sky-500/30 font-bold',
    label: 'Syncing',
  },
  optimal: {
    dot: 'bg-emerald-400',
    ping: null,
    pill: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold',
    label: 'Optimal',
  },
  warning: {
    dot: 'bg-amber-400',
    ping: 'bg-amber-400',
    pill: 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-bold',
    label: 'Attention Required',
  },
  error: {
    dot: 'bg-rose-400',
    ping: 'bg-rose-400',
    pill: 'bg-rose-500/15 text-rose-400 border-rose-500/30 font-bold',
    label: 'Action Required',
  },
  offline: {
    dot: 'bg-slate-400',
    ping: null,
    pill: 'bg-[var(--color-surface-base)] text-[var(--text-muted)] border-[var(--color-border-base)] font-medium',
    label: 'Offline',
  },
};

export default function StatusIndicator({
  status = 'live',
  label,
  showLabel = true,
  variant = 'pill', // 'pill' | 'dot'
  ping = true,
  className,
}) {
  const cfg = statusConfig[status] || statusConfig.live;
  const displayLabel = label || cfg.label;

  if (variant === 'dot') {
    return (
      <div className={cn('inline-flex items-center gap-2', className)}>
        <span className="relative flex h-2 w-2">
          {ping && cfg.ping && (
            <span className={cn('animate-ping-slow absolute inline-flex h-full w-full rounded-full opacity-75', cfg.ping)} />
          )}
          <span className={cn('relative inline-flex rounded-full h-2 w-2', cfg.dot)} />
        </span>
        {showLabel && <span className="text-xs text-[#64748B] font-medium">{displayLabel}</span>}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border select-none',
        cfg.pill,
        className
      )}
    >
      <span className="relative flex h-1.5 w-1.5">
        {ping && cfg.ping && (
          <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', cfg.ping)} />
        )}
        <span className={cn('relative inline-flex rounded-full h-1.5 w-1.5', cfg.dot)} />
      </span>
      <span>{displayLabel}</span>
    </div>
  );
}
