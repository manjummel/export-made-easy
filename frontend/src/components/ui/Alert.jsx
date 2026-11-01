import React from 'react';
import { Info, CheckCircle2, AlertTriangle, AlertOctagon, Sparkles } from 'lucide-react';
import { cn } from '../../lib/cn';

const variants = {
  info: {
    container: 'bg-blue-500/10 border-blue-500/30 text-[var(--text-primary)]',
    icon: Info,
    iconColor: 'text-blue-400',
  },
  success: {
    container: 'bg-emerald-500/10 border-emerald-500/30 text-[var(--text-primary)]',
    icon: CheckCircle2,
    iconColor: 'text-emerald-400',
  },
  warning: {
    container: 'bg-amber-500/10 border-amber-500/30 text-[var(--text-primary)]',
    icon: AlertTriangle,
    iconColor: 'text-amber-400',
  },
  error: {
    container: 'bg-rose-500/10 border-rose-500/30 text-[var(--text-primary)]',
    icon: AlertOctagon,
    iconColor: 'text-rose-400',
  },
  ai: {
    container: 'bg-indigo-500/10 border-indigo-500/30 text-[var(--text-primary)]',
    icon: Sparkles,
    iconColor: 'text-blue-400',
  },
};

export default function Alert({
  variant = 'info',
  title,
  children,
  action,
  className,
}) {
  const cfg = variants[variant] || variants.info;
  const Icon = cfg.icon;

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border transition-all text-xs leading-relaxed',
        cfg.container,
        className
      )}
    >
      <div className={cn('p-1 rounded-lg shrink-0 mt-0.5', cfg.iconColor)}>
        <Icon size={16} />
      </div>

      <div className="flex-1 min-w-0">
        {title && <h4 className="font-bold text-[var(--color-primary)] mb-1">{title}</h4>}
        <div className="text-[var(--color-secondary)]">{children}</div>
      </div>

      {action && <div className="shrink-0 ml-2">{action}</div>}
    </div>
  );
}
