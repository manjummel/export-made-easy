import React from 'react';
import { motion } from 'framer-motion';
import {
  Globe, ShieldAlert, Clock, TrendingUp, AlertTriangle, ShieldCheck
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, Legend, LineChart, Line,
} from 'recharts';
import { useTheme } from '../context/ThemeContext';

/* ── chart tick / grid colors that adapt per theme ── */
function useChartColors() {
  const { theme } = useTheme();
  const isLight = theme === 'enterprise-light' || theme === 'corporate-light';
  return {
    tick:    isLight ? '#1e3a5f' : '#c8d8f0',
    grid:    isLight ? '#cbd5e1' : 'rgba(255,255,255,0.08)',
    tooltip: isLight
      ? { background: '#ffffff', border: '#cbd5e1', color: '#0c1a3a' }
      : { background: '#0e1534', border: 'rgba(255,255,255,0.12)', color: '#f0f6ff' },
  };
}

/* ── Metric Card using CSS variables ── */
function MetricCard({ title, value, subtitle, icon: Icon, accentColor, accentBg }) {
  return (
    <motion.div
      className="rounded-2xl p-5 border"
      style={{
        background:   'var(--surface-card)',
        borderColor:  'var(--border-subtle)',
        boxShadow:    '0 2px 12px rgba(0,0,0,0.15)',
      }}
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
      transition={{ duration: 0.18 }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p
            className="text-sm font-semibold"
            style={{ color: 'var(--text-muted)' }}
          >
            {title}
          </p>
          <h3
            className="text-2xl font-extrabold tracking-tight"
            style={{ color: 'var(--text-highlight, var(--text-primary))' }}
          >
            {value}
          </h3>
          <p
            className="text-xs font-semibold"
            style={{ color: accentColor }}
          >
            {subtitle}
          </p>
        </div>
        <div
          className="p-3 rounded-xl"
          style={{ background: accentBg }}
        >
          <Icon size={20} style={{ color: accentColor }} />
        </div>
      </div>
    </motion.div>
  );
}

/* ── Section card wrapper ── */
function ChartCard({ children, className = '' }) {
  return (
    <div
      className={`rounded-2xl p-5 border ${className}`}
      style={{
        background:  'var(--surface-card)',
        borderColor: 'var(--border-subtle)',
        boxShadow:   '0 2px 12px rgba(0,0,0,0.15)',
      }}
    >
      {children}
    </div>
  );
}

/* ── Custom Recharts Tooltip ── */
function CustomTooltip({ active, payload, label, colors }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs font-medium shadow-xl"
      style={{
        background:  colors.tooltip.background,
        border:     `1px solid ${colors.tooltip.border}`,
        color:       colors.tooltip.color,
      }}
    >
      <div className="font-bold mb-1" style={{ color: colors.tooltip.color }}>{label}</div>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span style={{ color: colors.tooltip.color }}>{entry.name}: <b>{entry.value}</b></span>
        </div>
      ))}
    </div>
  );
}

/* ── Data ── */
const EXPORT_RATE_DATA = [
  { country: 'UAE',       rate: 94 },
  { country: 'USA',       rate: 88 },
  { country: 'Germany',   rate: 76 },
  { country: 'Singapore', rate: 82 },
  { country: 'UK',        rate: 65 },
];

const RISK_DANGER_DATA = [
  { subject: 'Political Instability', UAE: 20, USA: 30, Germany: 15 },
  { subject: 'Payment Default',       UAE: 15, USA: 10, Germany:  5 },
  { subject: 'Customs Strictness',    UAE: 35, USA: 80, Germany: 90 },
  { subject: 'Tariff Volatility',     UAE: 10, USA: 60, Germany: 20 },
  { subject: 'Transit Piracy',        UAE: 40, USA:  5, Germany:  5 },
];

const TRANSIT_TIME_DATA = [
  { month: 'Jan', UAE: 4, USA: 28, Germany: 22 },
  { month: 'Feb', UAE: 5, USA: 30, Germany: 24 },
  { month: 'Mar', UAE: 4, USA: 27, Germany: 21 },
  { month: 'Apr', UAE: 6, USA: 32, Germany: 25 },
  { month: 'May', UAE: 4, USA: 26, Germany: 20 },
  { month: 'Jun', UAE: 3, USA: 25, Germany: 19 },
];

/* ── Page ── */
export default function GlobalExportDashboard() {
  const colors = useChartColors();

  return (
    <div
      className="flex flex-col h-full overflow-y-auto p-6 space-y-6"
      style={{ background: 'var(--bg-app)', fontFamily: "'Plus Jakarta Sans','Inter',sans-serif" }}
    >
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <h1
          className="text-2xl font-extrabold flex items-center gap-2.5 tracking-tight"
          style={{ color: 'var(--text-highlight, var(--text-primary))' }}
        >
          <Globe size={24} style={{ color: 'var(--border-active)' }} />
          Global Export Metrics
        </h1>
        <p
          className="text-sm mt-1 leading-relaxed"
          style={{ color: 'var(--text-muted)' }}
        >
          Live analytics on country export rates, risk indexes, and logistics times.
        </p>
      </motion.div>

      {/* ── KPI Cards ── */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08 }}
      >
        <MetricCard
          title="Highest Export Rate"
          value="UAE (94%)"
          subtitle="+12% YoY Demand"
          icon={TrendingUp}
          accentColor="#4ade80"
          accentBg="rgba(74,222,128,0.12)"
        />
        <MetricCard
          title="Avg Global Danger Rate"
          value="Low-Med"
          subtitle="Overall geopolitical risk"
          icon={ShieldAlert}
          accentColor="#fbbf24"
          accentBg="rgba(251,191,36,0.12)"
        />
        <MetricCard
          title="Fastest Transit Time"
          value="4 Days"
          subtitle="Nhava Sheva to Jebel Ali"
          icon={Clock}
          accentColor="var(--border-active)"
          accentBg="rgba(96,165,250,0.12)"
        />
        <MetricCard
          title="Safest Market"
          value="Germany"
          subtitle="99% Payment Realization"
          icon={ShieldCheck}
          accentColor="#60a5fa"
          accentBg="rgba(96,165,250,0.12)"
        />
      </motion.div>

      {/* ── Charts ── */}
      <motion.div
        className="grid grid-cols-1 xl:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.16 }}
      >

        {/* Bar Chart */}
        <ChartCard>
          <div className="mb-4">
            <h3
              className="text-base font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              Export Success Rates
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Market penetration percentage by destination.
            </p>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={EXPORT_RATE_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
                <XAxis dataKey="country" axisLine={false} tickLine={false}
                  tick={{ fontSize: 12, fill: colors.tick, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false}
                  tick={{ fontSize: 12, fill: colors.tick }} />
                <RechartsTooltip
                  cursor={{ fill: 'rgba(96,165,250,0.06)' }}
                  content={(props) => <CustomTooltip {...props} colors={colors} />}
                />
                <Bar dataKey="rate" name="Success Rate (%)" fill="var(--brand-accent, #60a5fa)"
                  radius={[6, 6, 0, 0]} barSize={38} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Radar Chart */}
        <ChartCard>
          <div className="mb-4">
            <h3
              className="text-base font-bold flex items-center gap-2"
              style={{ color: 'var(--text-primary)' }}
            >
              <AlertTriangle size={16} style={{ color: '#f87171' }} />
              Country Danger &amp; Risk Analysis
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Multi-dimensional risk assessment (0–100 scale).
            </p>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RISK_DANGER_DATA}>
                <PolarGrid stroke={colors.grid} />
                <PolarAngleAxis dataKey="subject"
                  tick={{ fill: colors.tick, fontSize: 11, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="UAE"     dataKey="UAE"     stroke="#4ade80" fill="#4ade80" fillOpacity={0.35} />
                <Radar name="USA"     dataKey="USA"     stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.35} />
                <Radar name="Germany" dataKey="Germany" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.35} />
                <Legend iconType="circle"
                  wrapperStyle={{ fontSize: '12px', color: colors.tick, fontWeight: 600 }} />
                <RechartsTooltip content={(props) => <CustomTooltip {...props} colors={colors} />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Line Chart — full width */}
        <ChartCard className="xl:col-span-2">
          <div className="mb-4">
            <h3
              className="text-base font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              Average Transit Time (Days)
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Historical shipping duration tracking — Jan to Jun 2026.
            </p>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TRANSIT_TIME_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.grid} />
                <XAxis dataKey="month" axisLine={false} tickLine={false}
                  tick={{ fontSize: 12, fill: colors.tick, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false}
                  tick={{ fontSize: 12, fill: colors.tick }} />
                <RechartsTooltip content={(props) => <CustomTooltip {...props} colors={colors} />} />
                <Legend iconType="circle"
                  wrapperStyle={{ fontSize: '12px', color: colors.tick, fontWeight: 600 }} />
                <Line type="monotone" dataKey="USA"     stroke="#fbbf24" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fbbf24' }} />
                <Line type="monotone" dataKey="Germany" stroke="#60a5fa" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#60a5fa' }} />
                <Line type="monotone" dataKey="UAE"     stroke="#4ade80" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#4ade80' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

      </motion.div>
    </div>
  );
}
