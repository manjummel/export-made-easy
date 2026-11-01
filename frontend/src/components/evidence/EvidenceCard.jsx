import React from 'react';
import { ShieldCheck, ExternalLink, FileSearch } from 'lucide-react';
import { useEvidence } from '../../context/EvidenceContext';
import { cn } from '../../lib/cn';

export default function EvidenceCard({
  evidence,
  variant = 'button', // 'button' | 'card' | 'badge'
  label = 'View Evidence',
  className,
}) {
  const { openEvidence } = useEvidence();

  const handleClick = (e) => {
    e.stopPropagation();
    openEvidence(evidence);
  };

  if (variant === 'badge') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold select-none cursor-pointer',
          'bg-indigo-950/50 text-[#1746D2] hover:bg-blue-100 border border-indigo-900/50 transition-colors',
          className
        )}
      >
        <ShieldCheck size={12} className="text-[#1746D2]" />
        <span>{evidence?.authority?.split(' ')[0] || 'Verified Source'}</span>
      </button>
    );
  }

  if (variant === 'card') {
    return (
      <div
        onClick={handleClick}
        className={cn(
          'p-3 rounded-xl bg-[var(--color-surface-subtle)] hover:bg-indigo-950/50/40 border border-[var(--color-border-base)] hover:border-indigo-900/50 transition-all cursor-pointer group',
          className
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-[#1746D2]" />
            <span className="text-xs font-bold text-[var(--color-primary)] group-hover:text-[#1746D2] transition-colors">
              {evidence?.authority || 'Official Regulatory Evidence'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
            {evidence?.confidence || 98}% Verified
          </span>
        </div>
        <p className="text-[11px] text-[var(--color-muted)] mt-1 line-clamp-2 leading-relaxed">
          {evidence?.document || 'Foreign Trade Policy & Customs Schedule'} · {evidence?.section}
        </p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-semibold text-[#1746D2] hover:text-[#1338a8] select-none transition-colors cursor-pointer group',
        className
      )}
    >
      <ShieldCheck size={14} className="text-[#1746D2] group-hover:scale-110 transition-transform" />
      <span className="underline decoration-blue-300 underline-offset-2">{label}</span>
    </button>
  );
}
