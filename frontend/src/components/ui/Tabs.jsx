import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';

export default function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = 'underline', // 'underline' | 'pill' | 'card'
  size = 'md',
  className,
}) {
  if (variant === 'pill') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1 p-1 rounded-xl bg-[var(--color-surface-base)] border border-[var(--color-border-base)]',
          className
        )}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                'relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold select-none transition-colors duration-150 cursor-pointer',
                isActive ? 'text-[var(--color-primary)] font-bold' : 'text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-border-base)]/60'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="tabs-pill-indicator"
                  className="absolute inset-0 bg-[var(--color-surface-card)] backdrop-blur-md rounded-lg shadow-xs border border-[var(--color-border-base)]/80"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {Icon && <Icon size={14} className={isActive ? 'text-[#1746D2]' : 'text-[var(--color-muted)]'} />}
                {tab.label}
                {tab.badge !== undefined && tab.badge !== null && (
                  <span
                    className={cn(
                      'text-[10px] font-mono px-1.5 py-0.2 rounded-md font-medium',
                      isActive ? 'bg-indigo-950/50 text-[#1746D2] border border-indigo-900/50' : 'bg-[var(--color-border-base)] text-[var(--color-secondary)]'
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn('grid gap-2', className)}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={cn(
                'flex items-center justify-between p-3 rounded-xl border text-left transition-all select-none cursor-pointer',
                isActive
                  ? 'bg-indigo-950/50/60 border-blue-300 shadow-xs'
                  : 'bg-[var(--color-surface-card)] backdrop-blur-md border-[var(--color-border-base)] hover:border-[var(--color-border-medium)] hover:bg-[var(--color-surface-subtle)]'
              )}
            >
              <div className="flex items-center gap-2.5">
                {Icon && (
                  <div
                    className={cn(
                      'p-1.5 rounded-lg shrink-0',
                      isActive ? 'bg-blue-600 text-white' : 'bg-[var(--color-surface-base)] text-[var(--color-muted)]'
                    )}
                  >
                    <Icon size={16} />
                  </div>
                )}
                <div>
                  <p className={cn('text-xs font-semibold', isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-secondary)]')}>
                    {tab.label}
                  </p>
                  {tab.subtitle && <p className="text-[11px] text-[var(--color-muted)]">{tab.subtitle}</p>}
                </div>
              </div>
              {tab.badge && (
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-[var(--color-surface-card)] backdrop-blur-md border border-[var(--color-border-base)] text-[var(--color-secondary)]">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Default: 'underline'
  return (
    <div className={cn('flex items-center gap-6 border-b border-[var(--color-border-base)] overflow-x-auto scrollbar-none', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative pb-3 text-xs font-semibold select-none flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer',
              isActive ? 'text-[#1746D2]' : 'text-[var(--color-muted)] hover:text-[var(--color-primary)]'
            )}
          >
            {Icon && <Icon size={15} className={isActive ? 'text-[#1746D2]' : 'text-muted'} />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge !== null && (
              <span
                className={cn(
                  'text-[10px] font-mono px-1.5 py-0.2 rounded-md font-semibold',
                  isActive
                    ? 'bg-blue-100 text-[#1746D2]'
                    : 'bg-[var(--color-surface-base)] text-[var(--color-muted)]'
                )}
              >
                {tab.badge}
              </span>
            )}

            {isActive && (
              <motion.div
                layoutId="tabs-underline-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1746D2] rounded-full"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
