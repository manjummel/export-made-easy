/**
 * AnimatedPage
 * Wraps a page's root element with a smooth entrance animation.
 * Used at the top of every page for consistent page transitions.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { pageVariants } from '../../lib/animations';

export default function AnimatedPage({ children, className = '' }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}
