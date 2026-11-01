/**
 * AnimatedSection
 * Wraps a section with scroll-triggered stagger animation.
 * Children with staggerItem variant will animate one after another.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, viewportOnce } from '../../lib/animations';

export default function AnimatedSection({
  children,
  className = '',
  staggerDelay = 0.09,
  delayChildren = 0.05,
  as: Tag = 'div',
}) {
  const MotionTag = motion[Tag] || motion.div;

  return (
    <MotionTag
      variants={staggerContainer(staggerDelay, delayChildren)}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className={className}
    >
      {children}
    </MotionTag>
  );
}
