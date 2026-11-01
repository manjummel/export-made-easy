import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Hash, ShieldCheck, FileText, Globe,
  AlertTriangle, Compass, CheckCircle2, Clock, ArrowRight,
  ExternalLink, TrendingUp, Zap, Bot, Radio,
  BarChart3, Shield, DollarSign, ChevronRight, Activity,
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts';
import { Badge, Button, Card, Progress, ConfidenceBadge } from '../components/ui';
import PageHeader from '../components/shared/PageHeader';
import { AI_AGENTS } from '../data/agentsData';
import {
  PRODUCT_INTEL, HS_CLASSIFICATION, COMPLIANCE_DATA,
  DOCUMENT_AGENT, MARKET_INTEL, RISK_AGENT, EXPORT_PLANNER
} from '../data/agentSyntheticData';
import { useEvidence } from '../context/EvidenceContext';

const AGENT_DATA_MAP = {
  'product-agent': PRODUCT_INTEL,
  'hs-agent': HS_CLASSIFICATION,
  'compliance-agent': COMPLIANCE_DATA,
  'document-agent': DOCUMENT_AGENT,
  'market-agent': MARKET_INTEL,
  'risk-agent': RISK_AGENT,
  'planner-agent': EXPORT_PLANNER,
};

const ICONS = { Package, Hash, ShieldCheck, FileText, Globe, AlertTriangle, Compass };

const STATUS_CONFIG = {
  completed: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', icon: CheckCircle2, label: 'Completed' },
  review_required: { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', icon: AlertTriangle, label: 'Review Required' },
  processing: { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', icon: Activity, label: 'Processing' },
  waiting: { color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/30', icon: Clock, label: 'Waiting' },
};

/* ── Small chart tooltip ── */
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="p-2.5 rounded-xl bg-[var(--color-surface-raised)] border border-[var(--color-border-base)] shadow-xl text-xs space-y-1 min-w-[120px]">
      <p className="font-bold text-[var(--text-primary)] border-b border-[var(--color-border-base)] pb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex justify-between gap-3">
          <span style={{ color: p.color }}>{p.name}:</span>
          <span className="font-mono font-bold text-[var(--text-primary)]">{typeof p.value === 'number' && p.value > 1000 ? `${(p.value/1000).toFixed(1)}k` : p.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ── KPI Row ── */
function AgentKPIs({ kpis = [] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="p-3.5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border-base)]">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-1">{kpi.label}</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold tabular-nums" style={{ color: kpi.color }}>
              {typeof kpi.value === 'number' && kpi.value > 10000
                ? `$${(kpi.value / 1000).toFixed(0)}K`
                : kpi.value}
            </span>
            <span className="text-xs text-[var(--text-muted)]">{kpi.unit}</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-0.5 font-medium">{kpi.trend}</p>
        </div>
      ))}
    </div>
  );
}

/* ── Agent-specific content panels ── */
function AgentDetailPanel({ agent }) {
  const data = AGENT_DATA_MAP[agent.id];
  if (!data) return null;

  /* AG-01: Product Intelligence */
  if (agent.id === 'product-agent') return (
    <div className="space-y-4">
      <AgentKPIs kpis={data.kpis} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <p className="text-xs font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2"><BarChart3 size={14} className="text-blue-400" /> Monthly Export Volume vs Target</p>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyExportVolume} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#16223b" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <RechartsTooltip content={<ChartTip />} />
                <Bar dataKey="volume" name="Volume" fill="#1746D2" radius={[4,4,0,0]} />
                <Bar dataKey="target" name="Target" fill="#1746D2" fillOpacity={0.25} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2"><Shield size={14} className="text-emerald-400" /> Quality Metrics vs Benchmark</p>
          <div className="space-y-2.5">
            {data.qualityMetrics.map((m) => (
              <div key={m.metric}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[var(--text-secondary)]">{m.metric}</span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">{m.value} {m.unit}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[var(--color-surface-base)]">
                  <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${Math.min((m.value / m.benchmark) * 80, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card className="p-4">
        <p className="text-xs font-bold text-[var(--text-primary)] mb-3">Raw Material Breakdown</p>
        <div className="space-y-2">
          {data.materialBreakdown.map((m) => (
            <div key={m.material} className="flex items-center gap-3">
              <div className="w-28 shrink-0 text-[11px] text-[var(--text-secondary)] truncate">{m.material}</div>
              <div className="flex-1 h-2 rounded-full bg-[var(--color-surface-base)]">
                <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${m.percentage}%` }} />
              </div>
              <span className="text-[11px] font-mono font-bold text-[var(--text-primary)] w-8 text-right">{m.percentage}%</span>
              <div className="flex gap-1">{m.certifications.map(c => <span key={c} className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono">{c}</span>)}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  /* AG-02: HS Classification */
  if (agent.id === 'hs-agent') return (
    <div className="space-y-4">
      <AgentKPIs kpis={data.kpis} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <p className="text-xs font-bold text-[var(--text-primary)] mb-3">HS Code Candidates (AI Ranked)</p>
          <div className="space-y-2">
            {data.hsAlternatives.map((h) => (
              <div key={h.code} className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${h.selected ? 'border-blue-500/50 bg-blue-500/10' : 'border-[var(--color-border-base)] bg-[var(--color-surface-card)]'}`}>
                <div>
                  <span className={`font-mono font-bold ${h.selected ? 'text-blue-400' : 'text-[var(--text-primary)]'}`}>{h.code}</span>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5 max-w-[200px] truncate">{h.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-bold ${h.selected ? 'text-blue-300' : 'text-[var(--text-muted)]'}`}>{h.confidence}%</span>
                  {h.selected && <CheckCircle2 size={13} className="text-blue-400" />}
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-bold text-[var(--text-primary)] mb-3">Tariff Rates by Country</p>
          <div className="space-y-1.5">
            {data.tariffByCountry.map((c) => (
              <div key={c.country} className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border-base)] text-[11px]">
                <span>{c.flag} <span className="font-semibold text-[var(--text-primary)]">{c.country}</span></span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[var(--text-muted)]">{c.fta}</span>
                  <span className={`font-mono font-bold ${c.tariff === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>{c.tariff}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card className="p-4">
        <p className="text-xs font-bold text-[var(--text-primary)] mb-3">Rules of Origin Compliance</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {data.rulesOfOrigin.map((r) => (
            <div key={r.country} className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-[11px]">
              <p className="font-bold text-emerald-400">{r.country}</p>
              <p className="text-[var(--text-muted)] mt-0.5">{r.criterion}</p>
              <p className="font-mono font-bold text-[var(--text-primary)] mt-1">Your Value: {r.yourValue} ✅</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  /* AG-03: Compliance */
  if (agent.id === 'compliance-agent') return (
    <div className="space-y-4">
      <AgentKPIs kpis={data.kpis} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <p className="text-xs font-bold text-[var(--text-primary)] mb-3">Compliance Checklist</p>
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {data.complianceChecklist.map((item) => (
              <div key={item.item} className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border-base)] text-[11px]">
                <div className="flex items-center gap-2">
                  {item.status === 'verified' ? <CheckCircle2 size={12} className="text-emerald-400 shrink-0" /> :
                   item.status === 'pending' ? <Clock size={12} className="text-amber-400 shrink-0" /> :
                   <span className="w-3 h-3 rounded-full bg-slate-600 shrink-0" />}
                  <span className="text-[var(--text-primary)]">{item.item}</span>
                </div>
                <span className="text-[var(--text-muted)] font-mono">{item.authority}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-bold text-[var(--text-primary)] mb-3">Compliance Score Trend</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.complianceTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#16223b" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <RechartsTooltip content={<ChartTip />} />
                <Line type="monotone" dataKey="score" name="Score" stroke="#16A34A" strokeWidth={2.5} dot={{ fill: '#16A34A', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <Card className="p-4">
        <p className="text-xs font-bold text-[var(--text-primary)] mb-3">Regulatory Risk Grid</p>
        <div className="space-y-2">
          {data.regulatoryRiskGrid.map((r) => (
            <div key={r.risk} className="flex items-start justify-between p-2.5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border-base)] text-[11px] gap-4">
              <span className="font-semibold text-[var(--text-primary)] w-44 shrink-0">{r.risk}</span>
              <span className={`shrink-0 px-2 py-0.5 rounded-full font-bold text-[10px] ${r.probability === 'Very Low' || r.probability === 'Low' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>{r.probability}</span>
              <span className="text-[var(--text-muted)] flex-1">{r.mitigation}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  /* AG-04: Document */
  if (agent.id === 'document-agent') return (
    <div className="space-y-4">
      <AgentKPIs kpis={data.kpis} />
      <Card className="p-4">
        <p className="text-xs font-bold text-[var(--text-primary)] mb-3">Document Pipeline Status</p>
        <div className="space-y-2">
          {data.documentPipeline.map((d) => (
            <div key={d.doc} className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border-base)] text-[11px]">
              {d.status === 'completed' ? <CheckCircle2 size={14} className="text-emerald-400 shrink-0" /> :
               d.status === 'in_progress' ? <Activity size={14} className="text-blue-400 shrink-0" /> :
               <Clock size={14} className="text-slate-500 shrink-0" />}
              <span className="font-semibold text-[var(--text-primary)] flex-1">{d.doc}</span>
              <span className="text-[var(--text-muted)] font-mono">{d.refNo}</span>
              <span className="text-[var(--text-muted)]">{d.validated}/{d.fields} fields</span>
              <Badge variant={d.status === 'completed' ? 'success' : d.status === 'in_progress' ? 'primary' : 'default'} size="xs">
                {d.status.replace('_', ' ')}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <p className="text-xs font-bold text-[var(--text-primary)] mb-3">Field Validation Scores</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.fieldValidationScores} layout="vertical" margin={{ top: 0, right: 8, left: 60, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#16223b" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} width={58} />
                <RechartsTooltip content={<ChartTip />} />
                <Bar dataKey="score" name="Score" fill="#F59E0B" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-bold text-[var(--text-primary)] mb-3">Recent Documents</p>
          <div className="space-y-2">
            {data.recentDocuments.map((d) => (
              <div key={d.name} className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border-base)] text-[11px]">
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">{d.name}</p>
                  <p className="text-[var(--text-muted)]">{d.type} · {d.size}</p>
                </div>
                <Badge variant={d.status === 'verified' ? 'success' : d.status === 'submitted' ? 'primary' : 'default'} size="xs">{d.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  /* AG-05: Market Intelligence */
  if (agent.id === 'market-agent') return (
    <div className="space-y-4">
      <AgentKPIs kpis={data.kpis} />
      <Card className="p-4">
        <p className="text-xs font-bold text-[var(--text-primary)] mb-3">Demand Trend by Market (12 Months)</p>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.demandTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#16223b" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <RechartsTooltip content={<ChartTip />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="UAE" stroke="#1746D2" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Germany" stroke="#16A34A" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="Singapore" stroke="#F59E0B" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="UK" stroke="#0284C7" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <p className="text-xs font-bold text-[var(--text-primary)] mb-3">Market Opportunity Scores</p>
          <div className="space-y-2">
            {data.countryScores.slice(0,5).map((c) => (
              <div key={c.country} className="flex items-center gap-3 p-2 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border-base)] text-[11px]">
                <span className="text-base">{c.flag}</span>
                <span className="font-semibold text-[var(--text-primary)] w-20">{c.country}</span>
                <div className="flex-1 h-1.5 rounded-full bg-[var(--color-surface-base)]">
                  <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${c.score}%` }} />
                </div>
                <span className="font-mono font-bold text-blue-400 w-8 text-right">{c.score}</span>
                <span className="text-emerald-400">+{c.growth}%</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-bold text-[var(--text-primary)] mb-3">Buyer Procurement Segments</p>
          <div className="space-y-2">
            {data.buyerProcurement.map((b) => (
              <div key={b.segment} className="flex items-center gap-3 text-[11px]">
                <span className="w-28 shrink-0 text-[var(--text-secondary)]">{b.segment}</span>
                <div className="flex-1 h-2 rounded-full bg-[var(--color-surface-base)]">
                  <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${b.percentage * 2}%` }} />
                </div>
                <span className="font-bold text-[var(--text-primary)] w-8">{b.percentage}%</span>
                <span className="text-emerald-400 w-16 text-right font-mono">{b.avgOrder}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  /* AG-06: Risk */
  if (agent.id === 'risk-agent') return (
    <div className="space-y-4">
      <AgentKPIs kpis={[
        { label: 'Risk Score', value: data.kpis[0].value, unit: '/100', trend: data.kpis[0].trend, color: '#16A34A' },
        { label: 'FX Exposure', value: '$84K', unit: 'open', trend: 'USD/INR', color: '#F59E0B' },
        { label: 'Hedging Coverage', value: data.kpis[2].value, unit: '%', trend: data.kpis[2].trend, color: '#2563EB' },
        { label: 'Payment Risk', value: 'Low', unit: '', trend: 'LC at Sight', color: '#16A34A' },
      ]} />
      <Card className="p-4">
        <p className="text-xs font-bold text-[var(--text-primary)] mb-3">FX Rate Volatility — 30 Days</p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.fxVolatility30d} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#16223b" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} interval={2} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <RechartsTooltip content={<ChartTip />} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="usdInr" name="USD/INR" stroke="#F59E0B" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="eurInr" name="EUR/INR" stroke="#2563EB" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <p className="text-xs font-bold text-[var(--text-primary)] mb-3">Buyer Payment Risk Matrix</p>
          <div className="space-y-2">
            {data.paymentRiskMatrix.map((b) => (
              <div key={b.buyer} className="p-2.5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border-base)] text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--text-primary)]">{b.buyer}</span>
                  <Badge variant={b.risk === 'Low' ? 'success' : b.risk === 'Medium' ? 'warning' : 'error'} size="xs">{b.risk}</Badge>
                </div>
                <div className="flex gap-4 mt-1 text-[var(--text-muted)]">
                  <span>{b.country}</span>
                  <span>{b.terms}</span>
                  <span className="font-mono text-[var(--text-primary)] ml-auto">{b.exposure}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-bold text-[var(--text-primary)] mb-3">Hedging Strategies</p>
          <div className="space-y-2">
            {data.hedgingStrategies.map((h) => (
              <div key={h.strategy} className={`p-2.5 rounded-xl border text-[11px] ${h.recommended ? 'border-blue-500/40 bg-blue-500/10' : 'border-[var(--color-border-base)] bg-[var(--color-surface-card)]'}`}>
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${h.recommended ? 'text-blue-300' : 'text-[var(--text-primary)]'}`}>{h.strategy}</span>
                  {h.recommended && <Badge variant="primary" size="xs">Recommended</Badge>}
                </div>
                <p className="text-[var(--text-muted)] mt-0.5">{h.benefit} · Cost: {h.cost}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  /* AG-07: Export Planner */
  if (agent.id === 'planner-agent') return (
    <div className="space-y-4">
      <AgentKPIs kpis={data.kpis} />
      <Card className="p-4">
        <p className="text-xs font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2"><Compass size={14} className="text-blue-400" /> 8-Step Export Roadmap</p>
        <div className="space-y-2">
          {data.roadmapSteps.map((s) => (
            <div key={s.step} className={`flex items-start gap-3 p-2.5 rounded-xl border text-[11px] ${s.status === 'completed' ? 'border-emerald-500/30 bg-emerald-500/8' : s.status === 'in_progress' ? 'border-blue-500/30 bg-blue-500/8' : 'border-[var(--color-border-base)] bg-[var(--color-surface-card)]'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${s.status === 'completed' ? 'bg-emerald-500 text-white' : s.status === 'in_progress' ? 'bg-blue-500 text-white' : 'bg-[var(--color-surface-base)] text-[var(--text-muted)]'}`}>{s.step}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--text-primary)]">{s.title}</span>
                  <span className="text-[var(--text-muted)]">{s.duration}</span>
                </div>
                <p className="text-[var(--text-muted)] mt-0.5">{s.details}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <p className="text-xs font-bold text-[var(--text-primary)] mb-3">Priority Action Items</p>
          <div className="space-y-2">
            {data.actionPriority.map((a) => (
              <div key={a.action} className="p-2.5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border-base)] text-[11px]">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={a.priority === 'Critical' ? 'error' : a.priority === 'High' ? 'warning' : 'default'} size="xs">{a.priority}</Badge>
                  <span className="text-[var(--text-muted)]">Due: {a.deadline.slice(5)}</span>
                </div>
                <p className="font-semibold text-[var(--text-primary)]">{a.action}</p>
                <p className="text-[var(--text-muted)] mt-0.5">Impact: {a.impact}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-bold text-[var(--text-primary)] mb-3">Cost Breakdown</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.costBreakdown.slice(0, 6)} layout="vertical" margin={{ top: 0, right: 8, left: 70, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#16223b" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} width={68} />
                <RechartsTooltip content={<ChartTip />} />
                <Bar dataKey="amount" name="Amount ($)" fill="#1746D2" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );

  return null;
}

/* ═══════════════════════════════════════════════════════════════
   Main AgentsCommandCenter Page
═══════════════════════════════════════════════════════════════ */
export default function AgentsCommandCenter() {
  const navigate = useNavigate();
  const { openEvidence } = useEvidence();
  const [activeAgentId, setActiveAgentId] = useState('product-agent');

  const activeAgent = AI_AGENTS.find(a => a.id === activeAgentId);

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="AI Agent Command Center"
        subtitle="Monitor, inspect, and interact with all 7 autonomous export intelligence agents in real-time."
        icon={Bot}
        breadcrumb={['Home', 'AI Agents']}
        badge={<Badge variant="ai" size="sm" dot pulse>7/7 Agents Live</Badge>}
        actions={
          <Button variant="ai" size="sm" icon={Radio} onClick={() => navigate('/ai-consultant')}>
            AI Consultant
          </Button>
        }
      />

      {/* ── Agent Selector Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {AI_AGENTS.map((ag, idx) => {
          const Icon = ICONS[ag.iconName] || Compass;
          const status = STATUS_CONFIG[ag.status] || STATUS_CONFIG.waiting;
          const StatusIcon = status.icon;
          const isActive = ag.id === activeAgentId;

          return (
            <motion.button
              key={ag.id}
              onClick={() => setActiveAgentId(ag.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={`relative p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'border-blue-500/60 bg-blue-500/15 shadow-[0_0_20px_rgba(23,70,210,0.25)]'
                  : `${status.bg} hover:border-[var(--border-active)]`
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold text-[var(--text-muted)]">{ag.code}</span>
                <StatusIcon size={12} className={status.color} />
              </div>
              <div className="p-1.5 rounded-lg bg-[var(--color-surface-card)] border border-[var(--color-border-base)] w-fit mb-2" style={{ color: ag.color }}>
                <Icon size={14} />
              </div>
              <p className="text-[11px] font-bold text-[var(--text-primary)] leading-tight">{ag.name.replace(' Agent', '')}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] font-mono text-[var(--text-muted)]">{ag.confidence}%</span>
                <span className="text-[9px] text-[var(--text-muted)]">{ag.executionTime}</span>
              </div>
              {isActive && (
                <motion.div
                  layoutId="agent-indicator"
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500 rounded-b-xl"
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* ── Active Agent Detail Panel ── */}
      <AnimatePresence mode="wait">
        {activeAgent && (
          <motion.div
            key={activeAgent.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Agent Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 p-4 rounded-2xl bg-[var(--color-surface-card)] border border-[var(--color-border-base)]">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl border border-[var(--color-border-base)] bg-[var(--color-surface-base)]" style={{ color: activeAgent.color }}>
                  {React.createElement(ICONS[activeAgent.iconName] || Compass, { size: 22 })}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-base font-extrabold text-[var(--text-primary)]">{activeAgent.name}</h2>
                    <Badge variant={activeAgent.status === 'completed' ? 'success' : 'warning'} size="xs" dot>
                      {STATUS_CONFIG[activeAgent.status]?.label}
                    </Badge>
                    <ConfidenceBadge score={activeAgent.confidence} size="xs" />
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] max-w-xl">{activeAgent.role}</p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1 font-mono">⚡ {activeAgent.activeTask}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {activeAgent.evidence && (
                  <Button variant="outline" size="xs" icon={ShieldCheck} onClick={() => openEvidence(activeAgent.evidence)}>
                    View Evidence
                  </Button>
                )}
                <Button variant="secondary" size="xs" icon={ExternalLink} onClick={() => navigate(activeAgent.route)}>
                  Open Module
                </Button>
              </div>
            </div>

            {/* Agent-Specific Data Panel */}
            <AgentDetailPanel agent={activeAgent} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
