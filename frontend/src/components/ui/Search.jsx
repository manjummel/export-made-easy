import React from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { cn } from '../../lib/cn';

export default function Search({
  value,
  onChange,
  onClear,
  placeholder = 'Search markets, buyers, HS codes, documents...',
  onClick,
  showShortcut = true,
  shortcutKey = 'Ctrl + K',
  size = 'md',
  className,
  autoFocus = false,
  ...props
}) {
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const displayShortcut = isMac ? '⌘K' : 'Ctrl K';

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative flex items-center w-full bg-[#080e1c] border border-[#1a2845] rounded-xl text-secondary',
        'transition-all duration-150',
        'hover:border-[#2b406b] hover:bg-[#0c1326]',
        'focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 focus-within:bg-[#0c1326]',
        size === 'sm' && 'h-8 px-2.5 text-xs',
        size === 'md' && 'h-9 px-3 text-sm',
        size === 'lg' && 'h-11 px-3.5 text-sm',
        className
      )}
    >
      <SearchIcon
        size={size === 'sm' ? 14 : 15}
        className="text-[var(--color-muted)] group-focus-within:text-blue-400 shrink-0 mr-2.5 transition-colors"
      />

      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full bg-transparent border-none p-0 text-slate-100 placeholder:text-[var(--color-muted)] focus:outline-none text-inherit"
        {...props}
      />

      {value && onClear && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="p-1 text-muted hover:text-secondary transition-colors ml-1"
        >
          <X size={13} />
        </button>
      )}

      {showShortcut && !value && (
        <div className="flex items-center gap-1 shrink-0 ml-2 pointer-events-none select-none">
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-[#152037] text-muted border border-[#223354]">
            {shortcutKey || displayShortcut}
          </kbd>
        </div>
      )}
    </div>
  );
}
