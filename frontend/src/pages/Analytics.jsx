import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, DollarSign, Globe, Sparkles,
  Users, Ship, FileText, Download, ArrowUpRight, Filter,
  Calendar, Layers, CheckCircle2, ChevronRight, PieChart as PieIcon
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, Cell
} from 'recharts';

import {
  Button, Card, CardHeader, CardFooter, Badge, Progress,
  useToast
} from '../components/ui';
import { StatCard, ChartCard } from '../components/dashboard';
import PageHeader from '../components/shared/PageHeader';
import {
  COMPANY_PROFILE,
  ANALYTICS_SUMMARY_KPIS,
  REVENUE_OPPORTUNITY_CHART,
  MARKET_GROWTH_DATA,
  BUYER_FUNNEL_DATA,
  EXPORT_PIPELINE_CONSIGNMENTS,
  COUNTRY_PERFORMANCE_METRICS
} from '../data/analyticsData';

export default function Analytics() {
  const navigate = useNavigate();
  const toast = useToast();
  const [revenueRange, setRevenueRange] = useState('8M');

  const iconMap = {
    TrendingUp,
    DollarSign,
    Sparkles,
    Globe,
  };

  const handleExportReport = () => {
    toast.success('Analytics Report Exported', 'Full Q3 export performance dossier downloaded as CSV/PDF.');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <PageHeader
        title="Export Analytics"
        subtitle="Comprehensive performance analytics, revenue projections, and trade funnel telemetry."
        icon={BarChart3}
        breadcrumb={['Home', 'Export Analytics']}
        badge={<Badge variant="primary" size="sm" dot>Live Telemetry</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Download}
              onClick={handleExportReport}
            >
              Export Report
            </Button>
            <Button
              variant="ai"
              size="sm"
              icon={Sparkles}
              onClick={() => navigate('/ai-consultant')}
            >
              Ask AI Analyst
            </Button>
          </div>
        }
      />

      {/* ── Top Metric Summary KPIs ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ANALYTICS_SUMMARY_KPIS.map((kpi, i) => {
          const IconComp = iconMap[kpi.icon] || TrendingUp;
          return (
            <motion.div
              key={kpi.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <StatCard
                title={kpi.label}
                value={kpi.value}
                change={kpi.change}
                changeType={kpi.changeType}
                subtext={kpi.subtext}
                icon={IconComp}
              />
            </motion.div>
          );
        })}
      </div>

      {/* ── Main Row: Revenue Opportunity & Market Growth Charts ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Opportunity Forecast Chart (2 Cols) */}
        <ChartCard
          title="Export Revenue Trajectory: Realized vs Projected"
          subtitle="Monthly financial pacing against Total Addressable Market (TAM) capacity"
          className="lg:col-span-2"
          onExport={handleExportReport}
          badge={<Badge variant="success" size="xs">On Track: +22% YoY</Badge>}
        >
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_OPPORTUNITY_CHART} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="realizedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="projectedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#16223b" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#1a2948' }} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={{ stroke: '#1a2948' }}
                  tickLine={false}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />

                <RechartsTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-3.5 rounded-xl border border-[#1e2f52] bg-[#0a1226]/95 backdrop-blur-xl shadow-2xl text-xs space-y-1 min-w-[160px]">
                          <p className="font-bold text-primary border-b border-[#16233d] pb-1">{label}</p>
                          {payload.map((p, idx) => (
                            <div key={idx} className="flex justify-between items-center gap-2" style={{ color: p.color }}>
                              <span>{p.name}:</span>
                              <span className="font-mono font-bold">${p.value?.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />

                <Area type="monotone" dataKey="tam" stroke="var(--text-muted)" strokeDasharray="3 3" fill="transparent" name="Total Market TAM" />
                <Area type="monotone" dataKey="projected" stroke="#3b82f6" strokeWidth={2} fill="url(#projectedGrad)" name="Projected Run-Rate" />
                <Area type="monotone" dataKey="realized" stroke="#10b981" strokeWidth={2.5} fill="url(#realizedGrad)" name="Realized Revenue" dot={{ fill: '#10b981', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Market Growth & Potential Bar Chart (1 Col) */}
        <ChartCard
          title="Market Share vs Growth %"
          subtitle="Regional distribution across top 5 corridors"
          badge={<Badge variant="ai" size="xs">Target: 38% UAE</Badge>}
        >
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MARKET_GROWTH_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#16223b" vertical={false} />
                <XAxis dataKey="market" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#1a2948' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#1a2948' }} tickLine={false} tickFormatter={(v) => `${v}%`} />
                <RechartsTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="p-3 rounded-xl border border-[#1e2f52] bg-[#0a1226]/95 backdrop-blur-xl shadow-2xl text-xs space-y-1">
                          <p className="font-bold text-primary border-b border-[#16233d] pb-1">{label}</p>
                          <p className="text-blue-400">Current Share: <strong className="font-mono">{payload[0]?.value}%</strong></p>
                          <p className="text-emerald-400">Projected Growth: <strong className="font-mono">+{payload[1]?.value}%</strong></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar dataKey="currentShare" name="Current Share %" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="potentialGrowth" name="YoY Growth Potential %" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* ── Middle Row: Buyer Conversion Funnel & Active Consignments ─ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Buyer Conversion Funnel (1 Col) */}
        <Card className="flex flex-col justify-between">
          <CardHeader
            title="Buyer Conversion Funnel"
            subtitle="Pipeline efficiency from AI matching to PO purchase orders"
            icon={Users}
            badge={<Badge variant="ai" size="xs">8.3% Win Rate</Badge>}
          />

          <div className="space-y-3 my-auto">
            {BUYER_FUNNEL_DATA.map((step, idx) => (
              <div key={step.stage} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-secondary flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: step.fill }} />
                    {step.stage}
                  </span>
                  <span className="font-mono font-bold text-primary">
                    {step.count} <span className="text-[10px] text-muted font-normal">({step.percentage})</span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#121c33] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: step.percentage }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: step.fill }}
                  />
                </div>
              </div>
            ))}
          </div>

          <CardFooter>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              iconRight={ChevronRight}
              onClick={() => navigate('/buyer-discovery')}
            >
              Manage Buyer Pipeline
            </Button>
          </CardFooter>
        </Card>

        {/* Active Export Consignment Pipeline (2 Cols) */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <CardHeader
            title="Export Consignment Pipeline"
            subtitle="Real-time shipment status across global ocean & air corridors"
            icon={Ship}
            badge={<Badge variant="success" size="xs" dot>4 Active Consignments</Badge>}
          />

          <div className="space-y-3">
            {EXPORT_PIPELINE_CONSIGNMENTS.map((shp) => {
              const statusColor = shp.color === 'emerald' ? 'success' : shp.color === 'blue' ? 'primary' : shp.color === 'amber' ? 'warning' : 'neutral';
              return (
                <div
                  key={shp.id}
                  className="p-3.5 rounded-xl bg-[#080d19] border border-[#16223b] hover:border-[#223354] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-blue-400">{shp.id}</span>
                      <span className="text-xs font-bold text-primary">{shp.destination}</span>
                      <Badge variant={statusColor} size="xs" dot>{shp.status}</Badge>
                    </div>
                    <p className="text-[11px] text-muted">
                      Buyer: <strong className="text-secondary">{shp.buyer}</strong> · {shp.volume}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                    <div className="text-right">
                      <span className="font-mono font-bold text-sm text-emerald-400 block">{shp.value}</span>
                      <span className="text-[10px] text-muted">ETA: {shp.eta}</span>
                    </div>

                    <div className="w-20 hidden sm:block">
                      <Progress value={shp.progress} color={shp.color} size="xs" showValue={false} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <CardFooter>
            <div className="flex items-center justify-between w-full text-xs">
              <span className="text-muted">Total Active Consignment Value: <strong className="font-mono text-primary">$225,400</strong></span>
              <Button variant="ghost" size="xs" onClick={() => navigate('/documents')} iconRight={ChevronRight}>
                View Shipping Docs
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* ── Bottom Row: Country Performance Breakdown Matrix ───── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#16233d] pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Globe size={16} className="text-blue-400" />
              Country Performance Matrix & Margin Realization
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Historical margin realization, volume pacing, and treaty utilization across top markets
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-[#16223b] bg-[#090f20] shadow-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#16233d] bg-[#060a14] text-muted">
                <th className="p-4 font-semibold">Destination Country</th>
                <th className="p-4 font-semibold">Export Revenue YTD</th>
                <th className="p-4 font-semibold">Volume Delivered</th>
                <th className="p-4 font-semibold">Avg Margin %</th>
                <th className="p-4 font-semibold">Tariff Concession</th>
                <th className="p-4 font-semibold">Corridor Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#142038] text-secondary">
              {COUNTRY_PERFORMANCE_METRICS.map((row) => (
                <tr key={row.country} className="hover:bg-[#0c1426] transition-colors">
                  <td className="p-4 font-bold text-primary">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{row.flag}</span>
                      <span>{row.country}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold text-emerald-400">{row.exportRevenue}</td>
                  <td className="p-4 font-mono text-secondary">{row.volume}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-mono font-bold">
                      {row.avgMargin}
                    </span>
                  </td>
                  <td className="p-4">
                    <Badge variant={row.tariff.includes('0%') ? 'success' : 'warning'} size="xs">
                      {row.tariff}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge variant="primary" size="xs" dot>{row.status}</Badge>
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      variant="ghost"
                      size="xs"
                      iconRight={ChevronRight}
                      onClick={() => navigate('/market-intelligence')}
                    >
                      Inspect
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
