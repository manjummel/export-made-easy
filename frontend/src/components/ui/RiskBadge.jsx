import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';
import { cn } from '../../lib/cn';

export default function RiskBadge({
  level = 'low', // 'low' | 'medium' | 'high' | 'critical'
  score,
  size = 'sm',
  className,
}) {
  const normLevel = String(level).toLowerCase();

  const configs = {
    low: {
      label: 'Low Risk',
      classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold',
      icon: ShieldCheck,
    },
    medium: {
      label: 'Medium Risk',
      classes: 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-bold',
      icon: AlertTriangle,
    },
    moderate: {
      label: 'Moderate Risk',
      classes: 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-bold',
      icon: AlertTriangle,
    },
    high: {
      label: 'High Risk',
      classes: 'bg-rose-500/15 text-rose-400 border-rose-500/30 font-bold',
      icon: AlertOctagon,
    },
    critical: {
      label: 'Critical Risk',
      classes: 'bg-rose-600/25 text-rose-300 border-rose-500/50 font-extrabold',
      icon: AlertOctagon,
    },
  };

  const cfg = configs[normLevel] || configs.low;
  const Icon = cfg.icon;

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 rounded gap-1 font-medium',
    sm: 'text-xs px-2 py-0.5 rounded-md gap-1.5 font-semibold',
    md: 'text-xs px-2.5 py-1 rounded-lg gap-1.5 font-bold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center border select-none leading-none tabular-nums',
        cfg.classes,
        sizeClasses[size],
        className
      )}
    >
      <Icon size={size === 'xs' ? 10 : 12} className="shrink-0" />
      <span>{cfg.label}</span>
      {score !== undefined && (
        <span className="font-mono text-[10px] opacity-75 font-normal">({score})</span>
      )}
    </span>
  );
}
