import React from 'react';
import { ShieldCheck, AlertCircle, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/cn';

export default function ConfidenceBadge({
  score,
  size = 'sm',
  showLabel = true,
  className,
}) {
  const numericScore = typeof score === 'number' ? score : parseInt(score, 10) || 0;

  let colorClasses = 'bg-blue-500/15 text-blue-400 border-blue-500/30';
  let Icon = ShieldCheck;

  if (numericScore >= 90) {
    colorClasses = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold';
    Icon = ShieldCheck;
  } else if (numericScore >= 70) {
    colorClasses = 'bg-blue-500/15 text-blue-400 border-blue-500/30 font-bold';
    Icon = ShieldCheck;
  } else if (numericScore >= 50) {
    colorClasses = 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-bold';
    Icon = AlertTriangle;
  } else {
    colorClasses = 'bg-rose-500/15 text-rose-400 border-rose-500/30 font-bold';
    Icon = AlertCircle;
  }

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 rounded gap-1 font-semibold',
    sm: 'text-xs px-2 py-0.5 rounded-md gap-1.5 font-semibold',
    md: 'text-xs px-2.5 py-1 rounded-lg gap-1.5 font-bold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center border select-none leading-none tabular-nums font-mono',
        colorClasses,
        sizeClasses[size],
        className
      )}
    >
      <Icon size={size === 'xs' ? 11 : 13} className="shrink-0" />
      <span>{numericScore}%</span>
      {showLabel && <span className="font-sans font-medium text-[10px] opacity-80">Confidence</span>}
    </span>
  );
}
