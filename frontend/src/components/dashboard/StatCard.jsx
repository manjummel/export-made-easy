import React from 'react';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight } from 'lucide-react';
import { cn } from '../../lib/cn';

export default function StatCard({
  title,
  value,
  unit,
  change,
  changeType = 'increase', // 'increase' | 'decrease' | 'neutral'
  changePeriod = 'vs last month',
  subtext,
  icon: Icon,
  badge,
  onClick,
  className,
}) {
  const isPositive = changeType === 'increase' || (typeof change === 'number' && change > 0);
  const isNegative = changeType === 'decrease' || (typeof change === 'number' && change < 0);
  const isNeutral = changeType === 'neutral' || change === 0 || change === null || change === undefined;

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative rounded-xl border border-[var(--border-subtle)] bg-[var(--color-surface-card)] p-5 shadow-sm',
        'transition-all duration-200',
        onClick && 'hover:bg-[var(--color-surface-hover)] hover:border-[var(--border-active)] cursor-pointer',
        className
      )}
    >
      {/* Top row: Title and Icon/Badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-xs font-medium text-muted tracking-wide uppercase">{title}</span>
        {Icon && (
          <div className="p-2 rounded-lg bg-[var(--color-surface-base)] border border-[var(--border-subtle)] text-blue-400 shrink-0">
            <Icon size={16} />
          </div>
        )}
        {badge && !Icon && <div className="shrink-0">{badge}</div>}
      </div>

      {/* Metric Value */}
      <div className="flex items-baseline gap-1.5 mb-2">
        <span className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] font-mono tracking-tight tabular-nums">
          {value}
        </span>
        {unit && <span className="text-sm font-medium text-muted">{unit}</span>}
      </div>

      {/* Delta & Subtext */}
      <div className="flex items-center gap-2 text-xs flex-wrap">
        {change !== undefined && change !== null && (
          <span
            className={cn(
              'inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono font-medium text-[11px] tabular-nums',
              isPositive && 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30',
              isNegative && 'bg-rose-950/50 text-rose-300 border border-rose-500/30',
              isNeutral && 'bg-[#15223e] text-muted border border-[#223354]'
            )}
          >
            {isPositive && <TrendingUp size={12} />}
            {isNegative && <TrendingDown size={12} />}
            {isNeutral && <Minus size={12} />}
            <span>
              {typeof change === 'number' && change > 0 ? `+${change}%` : typeof change === 'number' ? `${change}%` : change}
            </span>
          </span>
        )}

        {(changePeriod || subtext) && (
          <span className="text-[var(--color-muted)] text-[11px]">
            {subtext || changePeriod}
          </span>
        )}
      </div>
    </div>
  );
}
