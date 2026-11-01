import React from 'react';
import { cn } from '../../lib/cn';

export function Table({ children, className, ...props }) {
  return (
    <div className={cn('w-full overflow-x-auto rounded-xl border border-[var(--color-border-base)] bg-[var(--color-surface-card)] backdrop-blur-xl shadow-lg', className)}>
      <table className="w-full text-xs text-left border-collapse" {...props}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className, ...props }) {
  return (
    <thead className={cn('bg-[var(--color-surface-base)] border-b border-[var(--color-border-base)] text-[var(--text-secondary)] font-bold select-none', className)} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className, ...props }) {
  return (
    <tbody className={cn('divide-y divide-[var(--color-border-base)] text-[var(--text-primary)] font-medium', className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className, interactive = true, ...props }) {
  return (
    <tr
      className={cn(
        'transition-colors duration-150',
        interactive && 'hover:bg-[var(--color-surface-hover)] cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className, ...props }) {
  return (
    <th className={cn('p-3.5 text-xs font-bold text-[var(--text-secondary)] tracking-tight whitespace-nowrap', className)} {...props}>
      {children}
    </th>
  );
}

export function TableCell({ children, className, ...props }) {
  return (
    <td className={cn('p-3.5 text-xs text-[var(--text-primary)] align-middle font-medium', className)} {...props}>
      {children}
    </td>
  );
}

export default Table;
