import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/cn';

export default function Tooltip({
  content,
  children,
  position = 'top',
  delay = 200,
  kbd,
  className,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const handleMouseEnter = () => {
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  if (!content) return children;

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.1 } }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className={cn(
              'absolute z-50 pointer-events-none whitespace-nowrap',
              'px-2.5 py-1 text-xs font-medium rounded-lg',
              'bg-[#0c1426] text-secondary border border-[#1e2e4f]',
              'shadow-xl shadow-black/80 flex items-center gap-1.5',
              positionClasses[position],
              className
            )}
          >
            <span>{content}</span>
            {kbd && (
              <kbd className="px-1 py-0.2 text-[10px] font-mono rounded bg-[var(--color-surface-card)] backdrop-blur-md/10 text-secondary border border-base">
                {kbd}
              </kbd>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
