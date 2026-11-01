import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';

export default function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'max-w-lg', // 'max-w-md' | 'max-w-lg' | 'max-w-xl' | 'max-w-2xl'
  badge,
  footer,
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs cursor-pointer"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className={cn(
              'relative z-10 w-full h-full bg-[var(--color-surface-card)] backdrop-blur-md shadow-2xl border-l border-[var(--color-border-base)] flex flex-col',
              width
            )}
          >
            {/* Drawer Header */}
            <div className="flex items-start justify-between p-5 border-b border-[var(--color-border-base)] bg-[var(--color-surface-subtle)] shrink-0">
              <div className="space-y-1 pr-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-bold text-[var(--color-primary)] tracking-tight leading-snug">
                    {title}
                  </h2>
                  {badge}
                </div>
                {subtitle && <p className="text-xs text-[var(--color-muted)] leading-relaxed">{subtitle}</p>}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted hover:text-[var(--color-secondary)] hover:bg-[var(--color-border-base)]/60 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">{children}</div>

            {/* Optional Drawer Footer */}
            {footer && (
              <div className="p-4 border-t border-[var(--color-border-base)] bg-[var(--color-surface-subtle)] shrink-0 flex items-center justify-between gap-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
