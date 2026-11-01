import React from 'react';
import { cn } from '../../lib/cn';

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse bg-[var(--color-border-base)]/80 rounded-md', className)}
      {...props}
    />
  );
}

export default Skeleton;
