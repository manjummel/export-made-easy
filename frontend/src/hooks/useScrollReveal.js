/**
 * useScrollReveal
 * A lightweight hook that combines useRef + useInView from framer-motion
 * for scroll-triggered animations. Triggers ONCE when element enters viewport.
 */
import { useRef } from 'react';
import { useInView } from 'framer-motion';

/**
 * @param {object} options
 * @param {string} [options.margin='-80px'] - Intersection margin before trigger
 * @param {number} [options.amount=0.1]     - Fraction of element visible to trigger
 * @returns {{ ref: React.Ref, isInView: boolean }}
 */
export function useScrollReveal({ margin = '-80px', amount = 0.1 } = {}) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin,
    amount,
  });

  return { ref, isInView };
}

export default useScrollReveal;
