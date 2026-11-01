import React from 'react';
import { motion } from 'framer-motion';
import {
  Package, Hash, ShieldCheck, FileText, Globe,
  AlertTriangle, Compass, CheckCircle2, ArrowRight,
  Clock, AlertCircle, Loader2
} from 'lucide-react';
import Badge from '../ui/Badge';
import ConfidenceBadge from '../ui/ConfidenceBadge';
import { AI_AGENTS } from '../../data/agentsData';
import { useEvidence } from '../../context/EvidenceContext';
import { cn } from '../../lib/cn';

const ICONS = {
  Package,
  Hash,
  ShieldCheck,
  FileText,
  Globe,
  AlertTriangle,
  Compass,
};

export default function AgentTrace({
  agents = AI_AGENTS,
  className,
}) {
  const { openEvidence } = useEvidence();

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-[var(--color-primary)] tracking-tight">Live Multi-Agent Pipeline Trace</h3>
          <p className="text-xs text-[var(--color-muted)]">Autonomous sequential reasoning pipeline across 7 specialized trade agents</p>
        </div>
        <Badge variant="primary" size="xs" dot pulse>7/7 Agents Synchronized</Badge>
      </div>

      {/* Horizontal Pipeline Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5">
        {agents.map((ag, idx) => {
          const Icon = ICONS[ag.iconName] || Compass;
          const isLast = idx === agents.length - 1;

          return (
            <div
              key={ag.id}
              onClick={() => ag.evidence && openEvidence(ag.evidence)}
              className={cn(
                'relative p-3 rounded-xl border bg-[var(--color-surface-card)] backdrop-blur-xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/5 before:to-transparent before:pointer-events-none transition-all duration-300 cursor-pointer group',
                ag.status === 'completed'
                  ? 'border-[var(--color-border-base)] hover:border-[var(--brand-accent)] hover:shadow-lg hover:-translate-y-0.5'
                  : ag.status === 'review_required'
                  ? 'border-amber-500/50 before:from-amber-500/10'
                  : 'border-[var(--color-border-base)]'
              )}
            >
              {/* Top Step Number + Status Icon */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-muted">
                  0{idx + 1}
                </span>
                {ag.status === 'completed' ? (
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                ) : ag.status === 'review_required' ? (
                  <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                ) : (
                  <Clock size={14} className="text-muted shrink-0" />
                )}
              </div>

              {/* Agent Icon + Short Name */}
              <div className="flex items-center gap-1.5 mb-1.5 relative z-10">
                <div className="p-1 rounded-md bg-[var(--color-surface-base)] text-[var(--brand-accent)] border border-[var(--color-border-medium)] shadow-inner">
                  <Icon size={13} />
                </div>
                <h4 className="text-xs font-bold text-[var(--color-primary)] truncate leading-tight group-hover:text-[var(--brand-accent)] transition-colors">
                  {ag.name.replace(' Agent', '')}
                </h4>
              </div>

              {/* Confidence + Latency */}
              <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-[var(--color-border-base)] font-mono text-[var(--color-muted)] relative z-10">
                <span className="font-semibold text-[var(--color-secondary)]">{ag.confidence}% Conf</span>
                <span>{ag.executionTime}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
