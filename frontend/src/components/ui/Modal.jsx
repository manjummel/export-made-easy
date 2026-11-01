import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
  icon: Icon,
  footer,
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) onClose();
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
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative z-10 w-full bg-[var(--color-surface-card)] backdrop-blur-md rounded-2xl shadow-xl border border-[var(--color-border-base)] overflow-hidden',
              maxWidth
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-slate-100 bg-[var(--color-surface-subtle)]">
              <div className="flex items-start gap-3">
                {Icon && (
                  <div className="p-2 rounded-xl bg-indigo-950/50 text-[#1746D2] border border-blue-100 shrink-0">
                    <Icon size={20} />
                  </div>
                )}
                <div>
                  <h3 className="text-base font-bold text-[var(--color-primary)] leading-snug">{title}</h3>
                  {subtitle && <p className="text-xs text-[var(--color-muted)] mt-0.5">{subtitle}</p>}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-muted hover:text-[var(--color-secondary)] hover:bg-[var(--color-border-base)]/60 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 max-h-[75vh] overflow-y-auto">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="p-4 border-t border-slate-100 bg-[var(--color-surface-subtle)] flex items-center justify-end gap-2.5">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
