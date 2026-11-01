import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package, Hash, ShieldCheck, FileText, Globe,
  AlertTriangle, Compass, Sparkles, CheckCircle2,
  Activity, ArrowRight, Clock, ExternalLink, RefreshCw, AlertCircle
} from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import ConfidenceBadge from '../ui/ConfidenceBadge';
import { AI_AGENTS } from '../../data/agentsData';
import { useEvidence } from '../../context/EvidenceContext';
import { cn } from '../../lib/cn';
import { useNavigate } from 'react-router-dom';

const ICONS = {
  Package,
  Hash,
  ShieldCheck,
  FileText,
  Globe,
  AlertTriangle,
  Compass,
};

const STATUS_CONFIG = {
  waiting: { label: 'Waiting', variant: 'neutral', icon: Clock, class: 'bg-[var(--color-surface-base)] text-[var(--color-muted)] border-[var(--color-border-base)]' },
  processing: { label: 'Processing', variant: 'primary', icon: RefreshCw, spin: true, class: 'bg-indigo-950/50 text-[#1746D2] border-indigo-900/50' },
  completed: { label: 'Completed', variant: 'success', icon: CheckCircle2, class: 'bg-emerald-50 text-[#16A34A] border-emerald-200' },
  review_required: { label: 'Review Required', variant: 'warning', icon: AlertTriangle, class: 'bg-amber-50 text-[#F59E0B] border-amber-200' },
  failed: { label: 'Failed', variant: 'danger', icon: AlertCircle, class: 'bg-red-50 text-[#DC2626] border-red-200' },
};

export default function AgentCommandCenter({
  selectedAgentId = null,
  onSelectAgent = () => {},
  className,
}) {
  const { openEvidence } = useEvidence();
  const navigate = useNavigate();
  const [activeAgent, setActiveAgent] = useState(AI_AGENTS[0]);

  const handleSelect = (ag) => {
    setActiveAgent(ag);
    onSelectAgent(ag);
  };

  const SelectedIcon = ICONS[activeAgent.iconName] || Compass;
  const activeStatusCfg = STATUS_CONFIG[activeAgent.status] || STATUS_CONFIG.completed;
  const ActiveStatusIcon = activeStatusCfg.icon;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Central Interactive Agent Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left / Center Node Cluster */}
        <div className="lg:col-span-7 bg-gradient-to-b from-white via-slate-50/50 to-slate-100/50 p-6 rounded-2xl border border-[var(--color-border-base)] shadow-xs relative overflow-hidden">
          {/* Subtle Background Grid */}
          <div
            className="absolute inset-0 opacity-[0.3] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#1746D2]" />
              <h3 className="text-sm font-bold text-[var(--color-primary)]">EXA Multi-Agent Command Mesh</h3>
            </div>
            <Badge variant="success" size="xs" dot pulse>7 Synchronized Agents</Badge>
          </div>

          {/* Central EXA Core Hub */}
          <div className="flex flex-col items-center justify-center my-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0B1736] via-[#1746D2] to-[#2563EB] flex flex-col items-center justify-center text-primary shadow-lg shadow-blue-500/20 border border-blue-400/30 select-none">
                <Compass size={28} className="animate-spin" style={{ animationDuration: '30s' }} />
                <span className="text-[10px] font-mono font-bold mt-1 tracking-wider">EXA CORE</span>
              </div>
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" />
            </div>
            <p className="text-xs font-semibold text-[var(--color-secondary)] mt-2">Export Intelligence Controller</p>
            <p className="text-[11px] text-[var(--color-muted)]">Autonomous RAG & Statutory Reasoning</p>
          </div>

          {/* 7 Surrounding Satellite Agents Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-2">
            {AI_AGENTS.map((ag) => {
              const Icon = ICONS[ag.iconName] || Compass;
              const isSelected = activeAgent.id === ag.id;
              const stCfg = STATUS_CONFIG[ag.status] || STATUS_CONFIG.completed;
              const StIcon = stCfg.icon;

              return (
                <button
                  key={ag.id}
                  type="button"
                  onClick={() => handleSelect(ag)}
                  className={cn(
                    'p-2.5 rounded-xl border text-left transition-all duration-150 select-none cursor-pointer relative',
                    isSelected
                      ? 'bg-indigo-950/50/80 border-[#1746D2] shadow-xs'
                      : 'bg-[var(--color-surface-card)] backdrop-blur-md border-[var(--color-border-base)] hover:border-[var(--color-border-medium)] hover:bg-[var(--color-surface-subtle)]'
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div
                      className={cn(
                        'p-1.5 rounded-lg shrink-0',
                        isSelected ? 'bg-[#1746D2] text-primary' : 'bg-[var(--color-surface-base)] text-[var(--color-secondary)]'
                      )}
                    >
                      <Icon size={14} />
                    </div>
                    <span className="text-[9px] font-mono font-bold text-muted">{ag.code}</span>
                  </div>

                  <p className={cn('text-xs font-bold truncate leading-tight', isSelected ? 'text-[#1746D2]' : 'text-[var(--color-primary)]')}>
                    {ag.name.replace(' Agent', '')}
                  </p>

                  <div className="flex items-center justify-between text-[10px] mt-1.5">
                    <span className={cn('inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.2 rounded border', stCfg.class)}>
                      <StIcon size={10} className={stCfg.spin ? 'animate-spin' : ''} />
                      {stCfg.label}
                    </span>
                    <span className="font-mono text-[var(--color-muted)]">{ag.confidence}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Active Agent Inspector Dossier */}
        <div className="lg:col-span-5">
          <Card className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-950/50 text-[#1746D2] border border-blue-100">
                  <SelectedIcon size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-[var(--color-primary)]">{activeAgent.name}</h3>
                    <Badge variant="primary" size="xs">{activeAgent.code}</Badge>
                  </div>
                  <p className="text-xs text-[var(--color-muted)] mt-0.5">{activeAgent.role}</p>
                </div>
              </div>
            </div>

            {/* Telemetry Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border-base)]">
                <span className="text-[10px] text-[var(--color-muted)] block uppercase font-semibold">Status</span>
                <span className={cn('inline-flex items-center gap-1 font-mono font-bold text-xs mt-0.5', activeStatusCfg.class)}>
                  <ActiveStatusIcon size={12} className={activeStatusCfg.spin ? 'animate-spin' : ''} />
                  {activeStatusCfg.label}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border-base)]">
                <span className="text-[10px] text-[var(--color-muted)] block uppercase font-semibold">Confidence</span>
                <span className="font-mono font-bold text-sm text-emerald-700">{activeAgent.confidence}%</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border-base)]">
                <span className="text-[10px] text-[var(--color-muted)] block uppercase font-semibold">Latency</span>
                <span className="font-mono font-bold text-sm text-[var(--color-primary)]">{activeAgent.executionTime}</span>
              </div>
            </div>

            {/* Current Active Task Output */}
            <div className="p-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-base)] space-y-1">
              <span className="text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-wider">
                Current Output Synthesis
              </span>
              <p className="text-xs text-[var(--color-primary)] font-medium leading-relaxed">
                {activeAgent.activeTask}
              </p>
            </div>

            {/* Authority Reference */}
            <div className="p-3 rounded-xl bg-indigo-950/50/50 border border-blue-100 space-y-1">
              <span className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-wider">
                Primary Statutory Authority
              </span>
              <p className="text-xs font-semibold text-[#1746D2]">{activeAgent.leadAuthority}</p>
              <p className="text-[11px] text-[var(--color-muted)] font-serif italic">
                "{activeAgent.evidence?.excerpt}"
              </p>
            </div>

            {/* Action */}
            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant="primary"
                size="sm"
                fullWidth
                icon={ExternalLink}
                onClick={() => navigate(activeAgent.route)}
              >
                Open Full Agent Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                icon={ShieldCheck}
                onClick={() => activeAgent.evidence && openEvidence({ ...activeAgent.evidence, agent: activeAgent.name })}
              >
                Inspect Official Evidence Drawer
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
