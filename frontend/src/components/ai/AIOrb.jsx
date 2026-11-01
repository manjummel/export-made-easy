import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';

export default function AIOrb({
  status = 'idle', // 'idle' | 'thinking' | 'speaking'
  size = 'md', // 'sm' | 'md' | 'lg'
  className,
}) {
  const isThinking = status === 'thinking';

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  return (
    <div className={cn('relative flex items-center justify-center select-none', sizeClasses[size], className)}>
      {/* Outer ambient blur glow */}
      <motion.div
        animate={{
          scale: isThinking ? [1, 1.35, 1] : [1, 1.12, 1],
          opacity: isThinking ? [0.4, 0.75, 0.4] : [0.25, 0.4, 0.25],
        }}
        transition={{
          duration: isThinking ? 1.6 : 3.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 blur-xl pointer-events-none"
      />

      {/* Rotating outer ring */}
      <motion.div
        animate={{
          rotate: 360,
          scale: isThinking ? [1, 1.08, 1] : 1,
        }}
        transition={{
          rotate: { duration: isThinking ? 3.5 : 12, repeat: Infinity, ease: 'linear' },
          scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="absolute inset-0 rounded-full border border-indigo-400/40 p-0.5"
      >
        <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8]" />
      </motion.div>

      {/* Counter-rotating secondary ring */}
      <motion.div
        animate={{
          rotate: -360,
        }}
        transition={{
          duration: isThinking ? 4.5 : 16,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute inset-1 rounded-full border border-blue-400/30 p-0.5"
      >
        <div className="w-1 h-1 rounded-full bg-indigo-300 ml-auto shadow-[0_0_6px_#818cf8]" />
      </motion.div>

      {/* Core glowing sphere */}
      <motion.div
        animate={{
          scale: isThinking ? [0.95, 1.05, 0.95] : [1, 1.02, 1],
        }}
        transition={{
          duration: isThinking ? 1.2 : 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative w-3/4 h-3/4 rounded-full bg-gradient-to-br from-blue-500 via-indigo-600 to-cyan-500 shadow-inner flex items-center justify-center overflow-hidden border border-medium"
      >
        {/* Core highlight reflection */}
        <div className="absolute top-1 left-2 w-3 h-2 rounded-full bg-[var(--color-surface-card)] backdrop-blur-md/40 blur-[1px]" />
        
        {/* Swirling energy */}
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: isThinking ? 2 : 6,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="w-full h-full opacity-60 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-indigo-400 to-transparent"
        />
      </motion.div>
    </div>
  );
}
