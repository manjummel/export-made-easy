import React, { useState } from 'react';
import {
  Compass, PlayCircle, CheckCircle2, Circle, AlertCircle, ArrowRight,
  Clock, Calendar, FileText, Anchor, PieChart as PieChartIcon
} from 'lucide-react';
import {
  Button, Card, CardHeader, Badge, Input, Select, Progress, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, useToast
} from '../components/ui';
import PageHeader from '../components/shared/PageHeader';
import { EXPORT_PLANNER } from '../data/agentSyntheticData';
import { useEvidence } from '../context/EvidenceContext';
import {
  PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend
} from 'recharts';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#6366F1', '#8B5CF6', '#EC4899', '#14B8A6', '#F43F5E', '#8B5CF6'];

export default function ExportRoadmap() {
  const { openEvidence } = useEvidence();
  const toast = useToast();

  // Interactive form state
  const [productName, setProductName] = useState('');
  const [hsCode, setHsCode] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('United Arab Emirates');
  const [incoterm, setIncoterm] = useState('FOB');
  const [isPlanning, setIsPlanning] = useState(false);
  const [planDone, setPlanDone] = useState(false);

  const handlePlan = () => {
    setIsPlanning(true);
    toast.ai('Generating Export Roadmap', 'Synthesizing all agent outputs into an actionable export plan...');
    setTimeout(() => {
      setIsPlanning(false);
      setPlanDone(true);
      toast.success('Roadmap Generated', 'Your step-by-step export execution plan is ready.');
    }, 1600);
  };

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="AG-07: Export Planner Agent"
        subtitle="Synthesizes all agent outputs into an actionable, step-by-step export roadmap."
        icon={Compass}
        breadcrumb={['ExportEase', 'Agents', 'Export Planner']}
        badge={<Badge variant="primary" size="sm" dot pulse>Live Agent Active</Badge>}
        actions={
          <Button variant="primary" size="sm" icon={PlayCircle} onClick={handlePlan} loading={isPlanning}>
            {planDone ? 'Regenerate Plan' : 'Generate Export Plan'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Column: Input Form */}
        <div className="lg:col-span-4 space-y-5">
          <Card className="p-5 space-y-4">
            <div className="border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Export Plan Inputs</h3>
              <p className="text-xs text-[var(--text-muted)]">Provide your shipment details to generate a complete roadmap</p>
            </div>

            <div className="space-y-3 text-xs">
              <Input
                label="Product Name"
                placeholder="e.g., Handcrafted Brass Lamp"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
              <Input
                label="HS Code"
                placeholder="e.g., 9405.50"
                value={hsCode}
                onChange={(e) => setHsCode(e.target.value)}
              />
              <Select
                label="Destination Country"
                value={destinationCountry}
                onChange={(e) => setDestinationCountry(e.target.value)}
                options={[
                  { value: 'United Arab Emirates', label: '🇦🇪 United Arab Emirates' },
                  { value: 'Germany', label: '🇩🇪 Germany' },
                  { value: 'United States', label: '🇺🇸 United States' },
                  { value: 'Singapore', label: '🇸🇬 Singapore' },
                  { value: 'United Kingdom', label: '🇬🇧 United Kingdom' },
                ]}
              />
              <Select
                label="Incoterm"
                value={incoterm}
                onChange={(e) => setIncoterm(e.target.value)}
                options={[
                  { value: 'FOB', label: 'FOB — Free On Board' },
                  { value: 'CIF', label: 'CIF — Cost, Insurance, Freight' },
                  { value: 'EXW', label: 'EXW — Ex Works' },
                  { value: 'DAP', label: 'DAP — Delivered At Place' },
                  { value: 'DDP', label: 'DDP — Delivered Duty Paid' },
                ]}
              />
              <Button
                variant="primary"
                size="sm"
                fullWidth
                icon={PlayCircle}
                loading={isPlanning}
                onClick={handlePlan}
              >
                {planDone ? 'Update Export Plan' : 'Generate Export Plan'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-8 space-y-5">

          {!planDone && (
            <Card className="h-[400px] flex flex-col items-center justify-center p-8 text-center bg-slate-900/20 border-dashed border-2 border-slate-700/50">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                <Compass className="text-indigo-400 w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Ready to Generate Export Plan</h3>
              <p className="text-sm text-slate-400 max-w-sm">
                Enter your product details, HS code, destination country, and Incoterm on the left, then click "Generate Export Plan" to get a full step-by-step execution roadmap with cost breakdown and priority actions.
              </p>
            </Card>
          )}

          {planDone && (
            <>
              {/* KPI Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {EXPORT_PLANNER.kpis.map((kpi, idx) => (
                  <Card key={idx} className="p-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted font-medium">{kpi.label}</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-xl font-bold" style={{ color: kpi.color }}>{kpi.value}</span>
                        <span className="text-xs font-semibold" style={{ color: kpi.color }}>{kpi.unit}</span>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-medium text-muted bg-surface-subtle px-2 py-1 rounded-full">{kpi.trend}</span>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Roadmap Timeline */}
              <Card className="p-5">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">Execution Roadmap</h4>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      End-to-End Trade Clearance Playbook · {incoterm} · {destinationCountry}
                    </p>
                  </div>
                  <Button variant="outline" size="xs" onClick={() => openEvidence({
                        title: 'FIEO MSME Export Execution Framework',
                        type: 'roadmap',
                        confidence: 95,
                        content: 'Comprehensive consolidation of statutory clearances, logistics milestones, and bank payment realization steps for Indian exporters.',
                        sourceUrl: 'https://www.fieo.org'
                  })}>View Playbook</Button>
                </div>

                <div className="relative border-l-2 border-indigo-500/20 ml-3 space-y-6">
                  {EXPORT_PLANNER.roadmapSteps.map((step, idx) => (
                    <div key={idx} className="relative pl-6">
                      {/* Status Indicator */}
                      <span className="absolute -left-[11px] top-1 bg-[var(--surface-card)]">
                        {step.status === 'completed' ? (
                          <CheckCircle2 size={20} className="text-emerald-500" />
                        ) : step.status === 'in_progress' ? (
                          <div className="w-5 h-5 rounded-full border-[4px] border-indigo-500/40 bg-indigo-500 animate-pulse" />
                        ) : (
                          <Circle size={20} className="text-slate-600" />
                        )}
                      </span>
                      
                      <div className={`flex flex-col ${step.status === 'pending' ? 'opacity-50' : ''}`}>
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="text-sm font-bold text-[var(--text-primary)]">
                            {step.step}. {step.title}
                          </h5>
                          <Badge variant={step.status === 'completed' ? 'success' : step.status === 'in_progress' ? 'primary' : 'outline'} size="xs">
                            {step.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] mb-2">{step.details}</p>
                        <div className="flex items-center gap-4 text-[10px] font-medium text-muted">
                          <span className="flex items-center gap-1"><Clock size={12} /> {step.duration}</span>
                          <span className="flex items-center gap-1"><Calendar size={12} /> {step.completedDate || 'Pending'}</span>
                          <span className="flex items-center gap-1 text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">{step.owner}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Priority Actions */}
                <Card className="p-5 border border-indigo-500/20">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2 mb-4">
                    <AlertCircle size={16} className="text-indigo-400" /> Action Priority Matrix
                  </h4>
                  <div className="space-y-3">
                     {EXPORT_PLANNER.actionPriority.slice(0, 3).map((action, idx) => (
                       <div key={idx} className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border-subtle)] flex flex-col gap-2">
                         <div className="flex justify-between items-start">
                           <span className="text-xs font-bold text-[var(--text-primary)]">{action.action}</span>
                           <Badge variant={action.priority === 'Critical' ? 'danger' : action.priority === 'High' ? 'warning' : 'outline'} size="xs">
                             {action.priority}
                           </Badge>
                         </div>
                         <div className="flex items-center justify-between mt-1 text-[10px] text-muted">
                           <span className="font-mono text-indigo-400 bg-indigo-500/10 px-1.5 rounded">{action.agent}</span>
                           <span>Due: {action.deadline}</span>
                         </div>
                       </div>
                     ))}
                  </div>
                  <Button variant="primary" size="sm" fullWidth className="mt-4">View All Actions</Button>
                </Card>

                {/* Cost Breakdown */}
                <Card className="p-5">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">Cost Structure Breakdown</h4>
                  <p className="text-xs text-[var(--text-muted)] mb-4">Projected expenses for the first container shipment.</p>
                  <div className="h-[160px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={EXPORT_PLANNER.costBreakdown}
                          cx="50%" cy="50%"
                          innerRadius={50} outerRadius={70}
                          paddingAngle={5} dataKey="percentage" stroke="none"
                        >
                          {EXPORT_PLANNER.costBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px', background: '#0e1534', color: '#f0f6ff' }} formatter={(val) => `${val}%`} />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1.5 mt-2 max-h-[120px] overflow-y-auto pr-2">
                     {EXPORT_PLANNER.costBreakdown.map((entry, index) => (
                       <div key={index} className="flex justify-between items-center text-xs">
                         <div className="flex items-center gap-2 truncate pr-2">
                            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span className="text-[var(--text-secondary)] truncate">{entry.category}</span>
                         </div>
                         <div className="flex items-center gap-3 shrink-0">
                            <span className="font-mono text-[var(--text-muted)]">${entry.amount}</span>
                            <span className="font-bold text-[var(--text-primary)] w-8 text-right">{entry.percentage}%</span>
                         </div>
                       </div>
                     ))}
                  </div>
                </Card>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
