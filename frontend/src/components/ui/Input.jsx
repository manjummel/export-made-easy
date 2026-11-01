import React from 'react';
import { cn } from '../../lib/cn';

export default function Input({
  label,
  error,
  helperText,
  icon: Icon,
  iconRight: IconRight,
  className,
  wrapperClassName,
  id,
  type = 'text',
  disabled = false,
  required = false,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', wrapperClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-[var(--color-secondary)] flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-muted pointer-events-none flex items-center">
            <Icon size={16} />
          </div>
        )}

        <input
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          className={cn(
            'w-full h-9.5 px-3 rounded-lg text-xs font-normal text-[var(--color-primary)] bg-[var(--color-surface-card)] backdrop-blur-md border transition-all duration-150',
            'placeholder:text-muted',
            'focus:outline-none focus:border-[#1746D2] focus:ring-2 focus:ring-[#1746D2]/15',
            'disabled:bg-[var(--color-surface-subtle)] disabled:text-muted disabled:border-[var(--color-border-base)] disabled:cursor-not-allowed',
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15'
              : 'border-[var(--color-border-medium)] hover:border-slate-400',
            Icon && 'pl-9',
            IconRight && 'pr-9',
            className
          )}
          {...props}
        />

        {IconRight && (
          <div className="absolute right-3 text-muted pointer-events-none flex items-center">
            <IconRight size={16} />
          </div>
        )}
      </div>

      {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
      {!error && helperText && <p className="text-[11px] text-[var(--color-muted)]">{helperText}</p>}
    </div>
  );
}
