import React from 'react';
import { Download, MoreVertical, Maximize2 } from 'lucide-react';
import { cn } from '../../lib/cn';
import Tabs from '../ui/Tabs';

export default function ChartCard({
  title,
  subtitle,
  badge,
  timeRanges,
  activeRange,
  onRangeChange,
  actions,
  children,
  minHeight = 'min-h-[260px]',
  className,
  onExport,
}) {
  return (
    <div className={cn('rounded-xl border border-[#16223b] bg-[#0b1325] p-5 shadow-sm', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-100 tracking-tight">{title}</h3>
            {badge && badge}
          </div>
          {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {timeRanges && (
            <Tabs
              tabs={timeRanges.map((r) => ({ id: r, label: r }))}
              activeTab={activeRange}
              onChange={onRangeChange}
              size="sm"
            />
          )}

          {onExport && (
            <button
              type="button"
              onClick={onExport}
              title="Export Chart Data"
              className="p-1.5 rounded-lg text-muted hover:text-secondary hover:bg-[#15223e] border border-[#1e2e50] transition-colors"
            >
              <Download size={14} />
            </button>
          )}

          {actions && <div className="flex items-center gap-1.5">{actions}</div>}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className={cn('w-full relative', minHeight)}>{children}</div>
    </div>
  );
}
