/**
 * AnimatedCard
 * A motion-enhanced card wrapper with:
 *  - Scroll-triggered scaleIn + fadeUp reveal
 *  - Smooth hover lift with shadow enhancement
 *  - Subtle tap press feedback
 *
 * Drop-in replacement wrapping any Card content.
 * Does NOT change any styles — purely motion layer.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { staggerItem, viewportOnce, EASE_OUT_EXPO } from '../../lib/animations';

export default function AnimatedCard({ children, className = '', delay = 0, ...props }) {
  return (
    <motion.div
      variants={staggerItem}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      whileHover={{
        y: -4,
        transition: { duration: 0.22, ease: 'easeOut' },
      }}
      whileTap={{ scale: 0.985 }}
      transition={{
        delay,
        duration: 0.6,
        ease: EASE_OUT_EXPO,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * AnimatedCardGroup
 * Stagger container for a group of AnimatedCards.
 */
export function AnimatedCardGroup({
  children,
  className = '',
  staggerDelay = 0.09,
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.05,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
