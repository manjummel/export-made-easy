import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';

export function LoadingSpinner({ size = 24, className }) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
      >
        <Loader2 size={size} className="text-[#1746D2]" />
      </motion.div>
    </div>
  );
}

export function SkeletonCard({ className }) {
  return (
    <div
      className={cn(
        'rounded-xl bg-[var(--color-surface-card)] backdrop-blur-md border border-[#E2E8F0] p-6 animate-pulse shadow-xs',
        className
      )}
    >
      <div className="h-3 w-24 bg-[var(--color-border-base)] rounded-full mb-4" />
      <div className="h-7 w-32 bg-[var(--color-border-base)] rounded-lg mb-3" />
      <div className="h-2 w-48 bg-[var(--color-surface-base)] rounded-full" />
    </div>
  );
}

export default function LoadingState({
  message = 'Loading Export Intelligence...',
  className,
  fullPage = false,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        fullPage ? 'min-h-[60vh]' : 'py-16',
        className
      )}
    >
      <div className="relative">
        <div className="w-12 h-12 rounded-xl bg-indigo-950/50 border border-indigo-900/50 flex items-center justify-center text-[#1746D2]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          >
            <Loader2 size={22} />
          </motion.div>
        </div>
      </div>
      <p className="text-xs font-semibold text-[#64748B] animate-pulse">{message}</p>
    </div>
  );
}
