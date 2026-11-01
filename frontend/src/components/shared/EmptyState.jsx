import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';

export default function EmptyState({
  icon: Icon,
  title = 'No records found',
  description,
  action,
  className,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex flex-col items-center justify-center text-center py-14 px-6 bg-[var(--color-surface-card)] backdrop-blur-md rounded-2xl border border-[#E2E8F0] shadow-xs',
        className
      )}
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-base)] flex items-center justify-center mb-4 text-[#1746D2]">
          <Icon size={24} />
        </div>
      )}
      <h3 className="text-sm font-bold text-[#111827] mb-1">{title}</h3>
      {description && <p className="text-xs text-[#64748B] max-w-md leading-relaxed">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
