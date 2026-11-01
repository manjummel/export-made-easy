import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';

export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  breadcrumb,
  actions,
  badge,
  className,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn('mb-6', className)}
    >
      {/* Breadcrumb Navigation */}
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex items-center gap-1 mb-2">
          {breadcrumb.map((item, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={12} className="text-muted" />}
              <span
                className={cn(
                  'text-[11px] font-semibold',
                  i === breadcrumb.length - 1
                    ? 'text-[#1746D2]'
                    : 'text-[#64748B] hover:text-[var(--color-primary)] transition-colors cursor-pointer'
                )}
              >
                {item}
              </span>
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="p-2 rounded-xl bg-indigo-950/50 border border-blue-100 text-[#1746D2] mt-0.5 shrink-0">
              <Icon size={20} />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--color-primary)] tracking-tight leading-tight">{title}</h1>
              {badge && badge}
            </div>
            {subtitle && (
              <p className="text-xs sm:text-sm text-[#64748B] mt-0.5 leading-relaxed">{subtitle}</p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2 shrink-0 flex-wrap">{actions}</div>
        )}
      </div>
    </motion.div>
  );
}
