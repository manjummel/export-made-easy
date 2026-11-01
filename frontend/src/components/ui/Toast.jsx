import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, Sparkles, X } from 'lucide-react';
import { cn } from '../../lib/cn';

const ToastContext = createContext(null);

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
  ai: Sparkles,
};

const styles = {
  success: 'border-emerald-200 bg-[var(--color-surface-card)] backdrop-blur-md text-emerald-900 shadow-md shadow-emerald-500/5',
  error: 'border-red-200 bg-[var(--color-surface-card)] backdrop-blur-md text-red-900 shadow-md shadow-red-500/5',
  info: 'border-indigo-900/50 bg-[var(--color-surface-card)] backdrop-blur-md text-blue-900 shadow-md shadow-blue-500/5',
  warning: 'border-amber-200 bg-[var(--color-surface-card)] backdrop-blur-md text-amber-900 shadow-md shadow-amber-500/5',
  ai: 'border-indigo-900/50 bg-[var(--color-surface-card)] backdrop-blur-md text-blue-900 shadow-md shadow-blue-500/10',
};

const iconColors = {
  success: 'text-emerald-600',
  error: 'text-red-600',
  info: 'text-[#1746D2]',
  warning: 'text-amber-600',
  ai: 'text-[#1746D2]',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, description, type = 'info', duration = 4000 }) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    show: (props) => addToast(props),
    success: (title, description) => addToast({ title, description, type: 'success' }),
    error: (title, description) => addToast({ title, description, type: 'error' }),
    info: (title, description) => addToast({ title, description, type: 'info' }),
    warning: (title, description) => addToast({ title, description, type: 'warning' }),
    ai: (title, description) => addToast({ title, description, type: 'ai' }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = icons[t.type] || Info;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                className={cn(
                  'pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border',
                  styles[t.type]
                )}
              >
                <Icon size={18} className={cn('shrink-0 mt-0.5', iconColors[t.type])} />
                <div className="flex-1 min-w-0">
                  {t.title && (
                    <p className="text-xs font-bold text-[var(--color-primary)] leading-tight">
                      {t.title}
                    </p>
                  )}
                  {t.description && (
                    <p className="text-[11px] text-[var(--color-muted)] mt-0.5 leading-relaxed">
                      {t.description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(t.id)}
                  className="text-muted hover:text-[var(--color-secondary)] p-0.5 rounded cursor-pointer"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastProvider;
