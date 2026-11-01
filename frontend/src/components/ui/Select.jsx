import React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn';

export default function Select({
  label,
  options = [],
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  required = false,
  className,
  wrapperClassName,
  id,
  placeholder = 'Select an option',
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', wrapperClassName)}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-semibold text-[var(--color-secondary)] flex items-center justify-between"
        >
          <span>
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </span>
        </label>
      )}

      <div className="relative flex items-center">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={cn(
            'w-full h-9.5 pl-3 pr-9 rounded-lg text-xs text-[var(--color-primary)] bg-[var(--color-surface-card)] backdrop-blur-md border appearance-none transition-all duration-150 cursor-pointer',
            'focus:outline-none focus:border-[#1746D2] focus:ring-2 focus:ring-[#1746D2]/15',
            'disabled:bg-[var(--color-surface-subtle)] disabled:text-muted disabled:border-[var(--color-border-base)] disabled:cursor-not-allowed',
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15'
              : 'border-[var(--color-border-medium)] hover:border-slate-400',
            className
          )}
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="absolute right-3 text-muted pointer-events-none flex items-center">
          <ChevronDown size={15} />
        </div>
      </div>

      {error && <p className="text-[11px] text-red-600 font-medium">{error}</p>}
      {!error && helperText && <p className="text-[11px] text-[var(--color-muted)]">{helperText}</p>}
    </div>
  );
}
