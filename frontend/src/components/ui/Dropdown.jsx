import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../../lib/cn';

export default function Dropdown({
  trigger,
  items = [],
  value,
  onChange,
  align = 'right',
  width = 'w-56',
  className,
  label,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectedItem = items.find((i) => i.value === value);

  return (
    <div className={cn('relative inline-block text-left', className)} ref={dropdownRef}>
      {label && <label className="block text-xs font-medium text-secondary mb-1.5">{label}</label>}

      {/* Trigger */}
      {trigger ? (
        <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'inline-flex items-center justify-between gap-2 h-9 px-3 text-xs font-medium rounded-lg',
            'bg-[#0a1020] border border-[#1b2b4a] text-secondary hover:bg-[#0f1830] hover:border-[#273d69]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 w-full'
          )}
        >
          <span className="flex items-center gap-2 truncate">
            {selectedItem?.icon && <selectedItem.icon size={14} className="text-muted shrink-0" />}
            <span>{selectedItem?.label || 'Select option...'}</span>
          </span>
          <ChevronDown size={14} className={cn('text-[var(--color-muted)] transition-transform duration-200', isOpen && 'rotate-180')} />
        </button>
      )}

      {/* Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 2, scale: 0.98, transition: { duration: 0.1 } }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute z-50 mt-1.5 rounded-xl border border-[#1e2e4f] bg-[#0c1326] p-1.5 shadow-2xl shadow-black/80 backdrop-blur-xl',
              align === 'right' ? 'right-0' : 'left-0',
              width
            )}
          >
            <div className="space-y-0.5 max-h-64 overflow-y-auto">
              {items.map((item, idx) => {
                if (item.divider) {
                  return <div key={idx} className="my-1 border-t border-[#18253e]" />;
                }

                if (item.header) {
                  return (
                    <div key={idx} className="px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase text-[var(--color-muted)]">
                      {item.header}
                    </div>
                  );
                }

                const isSelected = item.value !== undefined && item.value === value;

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={item.disabled}
                    onClick={() => {
                      if (item.onClick) item.onClick();
                      if (onChange && item.value !== undefined) onChange(item.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'flex items-center justify-between w-full px-2.5 py-2 text-xs font-medium rounded-lg text-left transition-colors',
                      isSelected
                        ? 'bg-blue-600/15 text-blue-300 border border-blue-500/20'
                        : 'text-secondary hover:bg-[#15203b] hover:text-primary',
                      item.danger && 'text-rose-400 hover:bg-rose-950/30 hover:text-rose-300',
                      item.disabled && 'opacity-40 cursor-not-allowed pointer-events-none'
                    )}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {item.icon && <item.icon size={14} className={cn('shrink-0', item.danger ? 'text-rose-400' : 'text-muted')} />}
                      <div>
                        <p className="leading-tight">{item.label}</p>
                        {item.description && <p className="text-[10px] text-[var(--color-muted)] mt-0.5 leading-tight">{item.description}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {item.badge && <span className="text-[10px]">{item.badge}</span>}
                      {isSelected && <Check size={13} className="text-blue-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
