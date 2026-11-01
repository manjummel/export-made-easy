import { clsx } from 'clsx';

/**
 * Utility to merge class names conditionally.
 * Acts like a lightweight tailwind-merge + clsx combo.
 */
export function cn(...inputs) {
  return clsx(inputs);
}
