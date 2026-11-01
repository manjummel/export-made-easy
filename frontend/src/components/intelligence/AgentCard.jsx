import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, Hash, ShieldCheck, FileText, Globe,
  AlertTriangle, Compass, Clock, CheckCircle2,
  Loader2, AlertCircle, ExternalLink
} from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import ConfidenceBadge from '../ui/ConfidenceBadge';
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

const statusConfig = {
  completed: {
    label: 'Completed',
    badgeVariant: 'success',
    icon: CheckCircle2,
    borderColor: 'border-emerald-200',
    dotColor: 'bg-emerald-500',
  },
  processing: {
    label: 'Processing',
    badgeVariant: 'primary',
    icon: Loader2,
    borderColor: 'border-blue-300',
    dotColor: 'bg-indigo-950/500 animate-pulse',
  },
  waiting: {
    label: 'Waiting',
    badgeVariant: 'default',
    icon: Clock,
    borderColor: 'border-[var(--color-border-base)]',
    dotColor: 'bg-slate-300',
  },
  review_required: {
    label: 'Review Required',
    badgeVariant: 'warning',
    icon: AlertTriangle,
    borderColor: 'border-amber-300',
    dotColor: 'bg-amber-500',
  },
  failed: {
    label: 'Failed',
    badgeVariant: 'danger',
    icon: AlertCircle,
    borderColor: 'border-red-300',
    dotColor: 'bg-red-500',
  },
};

export default function AgentCard({
  agent,
  interactive = true,
  className,
}) {
  const navigate = useNavigate();
  const { openEvidence } = useEvidence();
  const Icon = ICONS[agent.iconName] || Compass;
  const cfg = statusConfig[agent.status] || statusConfig.completed;
  const StatusIcon = cfg.icon;

  const handleEvidenceClick = (e) => {
    e.stopPropagation();
    if (agent.evidence) {
      openEvidence({
        ...agent.evidence,
        agent: agent.name,
      });
    }
  };

  return (
    <Card
      variant="default"
      interactive={interactive}
      className={cn(
        'flex flex-col justify-between p-4 transition-all duration-200',
        cfg.borderColor,
        className
      )}
    >
      <div className="cursor-pointer" onClick={() => navigate(agent.route || '/dashboard')}>
        {/* Top Agent Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-950/50 text-[#1746D2] border border-blue-100 shrink-0">
              <Icon size={17} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-bold text-[var(--color-primary)] tracking-tight leading-none">
                  {agent.name}
                </h4>
                <span className="text-[10px] font-mono text-muted">({agent.code})</span>
              </div>
              <p className="text-[11px] text-[var(--color-muted)] mt-0.5 line-clamp-1">{agent.leadAuthority}</p>
            </div>
          </div>

          <Badge variant={cfg.badgeVariant} size="xs" dot>
            {cfg.label}
          </Badge>
        </div>

        {/* Agent Active Task / Output */}
        <div className="p-2.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border-base)]/80 mb-3 text-xs">
          <span className="text-[10px] font-semibold text-[var(--color-muted)] uppercase tracking-wider block mb-0.5">
            Intelligence Telemetry
          </span>
          <p className="text-[var(--color-primary)] font-medium leading-relaxed line-clamp-2">
            {agent.activeTask}
          </p>
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <ConfidenceBadge score={agent.confidence} size="xs" />
          <span className="text-[11px] font-mono text-[var(--color-muted)] flex items-center gap-1">
            <Clock size={11} className="text-muted" />
            {agent.executionTime}
          </span>
        </div>

        <div className="flex items-center gap-2">
            <button
            type="button"
            onClick={handleEvidenceClick}
            className="text-[11px] font-semibold text-[#1746D2] hover:underline cursor-pointer select-none"
            >
            {agent.sourcesFound} Sources Traceable
            </button>
            <button
            type="button"
            onClick={() => navigate(agent.route || '/dashboard')}
            className="p-1 rounded bg-indigo-50 text-[#1746D2] hover:bg-indigo-100 transition-colors"
            title="Open Full Agent Dashboard"
            >
            <ExternalLink size={14} />
            </button>
        </div>
      </div>
    </Card>
  );
}
