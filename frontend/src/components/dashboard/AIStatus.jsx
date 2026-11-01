/**
 * AIStatus — Animated AI system status indicator widget.
 */
import { motion } from 'framer-motion';
import { Bot, Zap } from 'lucide-react';
import { cn } from '../../lib/cn';

export default function AIStatus({ status = 'online', processingText, className }) {
  const isOnline = status === 'online';
  const isProcessing = status === 'processing';

  return (
    <div
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-xl',
        'bg-violet-500/10 border border-violet-500/20',
        className
      )}
    >
      {/* Animated status dot */}
      <div className="relative flex items-center justify-center">
        <Bot size={16} className="text-violet-400" />
        <motion.span
          animate={
            isOnline || isProcessing
              ? { scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] }
              : {}
          }
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400"
        />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          {isProcessing && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            >
              <Zap size={10} className="text-amber-400" />
            </motion.div>
          )}
          <span className="text-xs font-medium text-violet-300">
            {isProcessing ? 'AI Processing' : 'AI Online'}
          </span>
        </div>
        {processingText && (
          <span className="text-xs text-[var(--color-muted)]">{processingText}</span>
        )}
      </div>
    </div>
  );
}
