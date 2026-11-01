import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp, Sparkles, Globe, ShieldCheck, ArrowRight,
  SlidersHorizontal, ChevronRight, CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip, Legend
} from 'recharts';

import {
  Button, Card, Badge, Progress
} from '../components/ui';
import { StatCard, ChartCard } from '../components/dashboard';
import PageHeader from '../components/shared/PageHeader';
import {
  COMPANY_PROFILE,
  DEMAND_FORECAST_KPIS,
  DEMAND_FORECAST_SERIES,
  DEMAND_MARKET_COMPARISON,
  DEMAND_AI_INSIGHT
} from '../data/analyticsData';

export default function DemandForecast() {
  const navigate = useNavigate();
  const [activeTimeRange, setActiveTimeRange] = useState('90D');
  const [selectedMarketId, setSelectedMarketId] = useState('uae');

  const currentSeriesData = DEMAND_FORECAST_SERIES[activeTimeRange] || DEMAND_FORECAST_SERIES['90D'];

  const iconMap = {
    TrendingUp,
    Sparkles,
    Globe,
    ShieldCheck,
  };

  return (
    <div className="space-y-8 pb-16">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <PageHeader
        title="Demand Forecast"
        subtitle="Understand where demand is heading before you export."
        icon={TrendingUp}
        breadcrumb={['Home', 'Demand Forecast']}
        badge={<Badge variant="ai" size="sm" dot pulse>AI Predictive Engine v2.4</Badge>}
        actions={
          <Button
            variant="ai"
            size="sm"
            icon={Sparkles}
            onClick={() => navigate('/ai-consultant')}
          >
            Ask AI Forecast Advisor
          </Button>
        }
      />

      {/* ── Top KPI Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {DEMAND_FORECAST_KPIS.map((kpi, i) => {
          const IconComponent = iconMap[kpi.icon] || TrendingUp;
          return (
            <motion.div
              key={kpi.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <StatCard
                title={kpi.label}
                value={kpi.value}
                change={kpi.change}
                changeType={kpi.changeType}
                subtext={kpi.subtext}
                icon={IconComponent}
              />
            </motion.div>
          );
        })}
      </div>

      {/* ── AI Forecast Highlighted Panel ───────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-[var(--border-active)] bg-[var(--color-surface-card)] p-5 sm:p-6 shadow-xl relative overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 shrink-0 mt-0.5">
              <Sparkles size={24} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="ai" size="xs" dot pulse>AI Forecast</Badge>
                <span className="text-xs font-mono text-muted">HS: {COMPANY_PROFILE.hsCode}</span>
                <Badge variant="success" size="xs">Confidence {DEMAND_AI_INSIGHT.confidence}%</Badge>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-primary tracking-tight">
                {DEMAND_AI_INSIGHT.headline}
              </h3>

              <p className="text-xs text-indigo-200/80 leading-relaxed max-w-3xl">
                {DEMAND_AI_INSIGHT.recommendation}
              </p>

              {/* Key Drivers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                {DEMAND_AI_INSIGHT.drivers.map((driver, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[var(--color-surface-base)] border border-[var(--border-subtle)] flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-[11px] text-secondary leading-tight">{driver}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 shrink-0 self-start lg:self-auto">
            <Button
              variant="ai"
              size="md"
              iconRight={ArrowRight}
              onClick={() => window.dispatchEvent(new CustomEvent('exportease:open-strategy'))}
              fullWidth
            >
              Generate Export Strategy
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Globe}
              onClick={() => navigate('/market-intelligence')}
              fullWidth
            >
              Explore Target Markets
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── Main Interactive Forecasting Chart ─────────────────── */}
      <ChartCard
        title="Interactive Demand Trend & Predictive Forecast"
        subtitle={`Historical actuals vs AI predictive confidence corridor for ${COMPANY_PROFILE.product}`}
        timeRanges={['7D', '30D', '90D', '6M', '1Y']}
        activeRange={activeTimeRange}
        onRangeChange={setActiveTimeRange}
        badge={<Badge variant="primary" size="xs">Confidence Band: 91%</Badge>}
      >
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={currentSeriesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                {/* Historical gradient */}
                <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>

                {/* AI Forecast gradient */}
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>

                {/* Confidence Corridor */}
                <linearGradient id="corridorGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#16223b" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#1a2948' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#1a2948' }}
                tickLine={false}
                tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
              />

              <RechartsTooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const hist = payload.find((p) => p.dataKey === 'historical')?.value;
                    const fore = payload.find((p) => p.dataKey === 'forecast')?.value;
                    const up = payload.find((p) => p.dataKey === 'upper')?.value;
                    const low = payload.find((p) => p.dataKey === 'lower')?.value;

                    return (
                      <div className="p-3.5 rounded-xl border border-[var(--border-medium)] bg-[var(--color-surface-raised)]/95 backdrop-blur-xl shadow-2xl text-xs space-y-1.5 min-w-[170px]">
                        <p className="font-bold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-1 font-mono">{label}</p>
                        {hist !== null && hist !== undefined && (
                          <div className="flex items-center justify-between gap-3 text-blue-400">
                            <span>Historical Actual:</span>
                            <span className="font-mono font-bold">{hist.toLocaleString()} units</span>
                          </div>
                        )}
                        {fore !== null && fore !== undefined && (
                          <div className="flex items-center justify-between gap-3 text-cyan-400">
                            <span>AI Forecast:</span>
                            <span className="font-mono font-bold">{fore.toLocaleString()} units</span>
                          </div>
                        )}
                        {up && low && (
                          <div className="flex items-center justify-between gap-3 text-indigo-300 text-[10px] pt-1 border-t border-[#16233d]">
                            <span>91% CI Range:</span>
                            <span className="font-mono">{low.toLocaleString()} - {up.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                formatter={(value) => <span className="text-muted text-xs mr-4">{value}</span>}
              />

              {/* Confidence interval band */}
              <Area
                type="monotone"
                dataKey="upper"
                stroke="transparent"
                fill="url(#corridorGrad)"
                name="Confidence Corridor (Upper)"
              />
              <Area
                type="monotone"
                dataKey="lower"
                stroke="transparent"
                fill="transparent"
                name="Confidence Corridor (Lower)"
              />

              {/* Historical Solid Line */}
              <Area
                type="monotone"
                dataKey="historical"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#histGrad)"
                name="Historical Demand"
                dot={{ fill: '#3b82f6', r: 3 }}
              />

              {/* AI Forecast Dashed Line */}
              <Area
                type="monotone"
                dataKey="forecast"
                stroke="#06b6d4"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                fill="url(#forecastGrad)"
                name="AI Projected Demand"
                dot={{ fill: '#06b6d4', r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* ── 5-Country Market Comparison Matrix ─────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-blue-400" />
              5-Market Demand & Growth Benchmarking
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Compare projected trajectory, competitive intensity, and risk profiles across major trade corridors
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {DEMAND_MARKET_COMPARISON.map((m) => {
            const isSelected = selectedMarketId === m.id;
            return (
              <Card
                key={m.id}
                variant={isSelected ? 'elevated' : 'interactive'}
                className={`p-4 flex flex-col justify-between gap-3.5 ${
                  isSelected ? 'border-[var(--border-active)] bg-[var(--color-surface-hover)]' : ''
                }`}
                onClick={() => setSelectedMarketId(m.id)}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{m.flag}</span>
                      <div>
                        <h4 className="text-xs font-bold text-primary">{m.country}</h4>
                        <span className="text-[10px] text-emerald-400 font-mono">{m.growth} YoY</span>
                      </div>
                    </div>
                    <Badge variant={m.demandScore >= 90 ? 'success' : 'primary'} size="xs">
                      {m.demandScore}%
                    </Badge>
                  </div>

                  <div className="space-y-2 mt-3 text-[11px]">
                    <div className="flex justify-between items-center text-muted">
                      <span>Demand:</span>
                      <span className="font-semibold text-secondary">{m.demandLevel}</span>
                    </div>
                    <div className="flex justify-between items-center text-muted">
                      <span>Competition:</span>
                      <span className="font-semibold text-amber-400">{m.competition}</span>
                    </div>
                    <div className="flex justify-between items-center text-muted">
                      <span>Risk Profile:</span>
                      <span className="font-semibold text-blue-400">{m.risk}</span>
                    </div>
                    <div className="flex justify-between items-center text-muted pt-1 border-t border-[#16233d]">
                      <span>Tariff:</span>
                      <span className="font-mono text-emerald-400">{m.tariff}</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant={isSelected ? 'primary' : 'ghost'}
                  size="xs"
                  fullWidth
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/market-intelligence');
                  }}
                  iconRight={ChevronRight}
                >
                  Analyze Lane
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
