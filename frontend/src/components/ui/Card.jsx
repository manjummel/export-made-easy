import React from 'react';
import { cn } from '../../lib/cn';

export default function Card({
  children,
  className,
  padding = 'p-5',
  variant = 'default',
  interactive = false,
  onClick,
  ...props
}) {
  const baseClasses = 'relative bg-[var(--color-surface-card)] backdrop-blur-xl rounded-xl border transition-all duration-300 overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:pointer-events-none shadow-[0_8px_30px_rgb(0,0,0,0.12)]';
  
  const variantClasses = {
    default: 'border-[var(--color-border-base)]',
    elevated: 'border-[var(--color-border-medium)] shadow-xl shadow-black/5 -translate-y-0.5',
    subtle: 'bg-[var(--color-surface-subtle)] border-[var(--color-border-base)] shadow-none',
    ai: 'border-indigo-900/50 bg-indigo-950/30 shadow-xs',
  };

  const interactiveClasses = interactive
    ? 'hover:border-[var(--color-border-medium)] hover:shadow-md hover:-translate-y-0.5 cursor-pointer active:translate-y-0'
    : '';

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], interactiveClasses, padding, className)}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  icon: Icon,
  action,
  className,
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-4', className)}>
      <div className="flex items-start gap-3 relative z-10">
        {Icon && (
          <div className="p-2 rounded-lg bg-[var(--color-surface-base)] text-[var(--brand-accent)] shrink-0 border border-[var(--color-border-medium)] shadow-inner">
            <Icon size={18} />
          </div>
        )}
        <div>
          <h3 className="text-sm font-bold text-[var(--color-primary)] tracking-tight leading-snug">{title}</h3>
          {subtitle && <p className="text-xs text-[var(--color-muted)] mt-0.5 leading-relaxed">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardFooter({ children, className }) {
  return (
    <div className={cn('relative z-10 mt-4 pt-3.5 border-t border-[var(--color-border-base)] flex items-center justify-between', className)}>
      {children}
    </div>
  );
}
