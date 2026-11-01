import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, TrendingDown, Sparkles,
  AlertTriangle, ChevronRight, Calculator, Lock,
  CheckCircle2, ShieldAlert
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip, Legend
} from 'recharts';

import {
  Button, Card, CardHeader, CardFooter, Badge, Input,
  Progress, CircularProgress, Tabs, useToast
} from '../components/ui';
import { ChartCard } from '../components/dashboard';
import PageHeader from '../components/shared/PageHeader';
import {
  CURRENCY_CARDS_DATA,
  CURRENCY_RISK_SCORE,
  CURRENCY_AI_RECOMMENDATION,
  CURRENCY_HISTORICAL_SERIES,
  CURRENCY_ALERTS
} from '../services/currencyService';
import { COMPANY } from '../data/dashboardData';

export default function CurrencyRisk() {
  const navigate = useNavigate();
  const toast = useToast();

  const [activeTimeRange, setActiveTimeRange] = useState('90D');
  const [selectedPair, setSelectedPair] = useState('usd-inr');

  // Hedging Simulator State
  const [invoiceAmount, setInvoiceAmount] = useState(84000); // USD
  const [hedgeRatio, setHedgeRatio] = useState(60); // 60%
  const [tenureDays, setTenureDays] = useState(60); // 60 days

  const currentSeries = CURRENCY_HISTORICAL_SERIES[activeTimeRange] || CURRENCY_HISTORICAL_SERIES['90D'];

  // Hedging calculations
  const spotRate = 84.30;
  const forwardRate = 84.85; // with forward premium
  const hedgedAmountUSD = (invoiceAmount * hedgeRatio) / 100;
  const unhedgedAmountUSD = invoiceAmount - hedgedAmountUSD;
  const hedgedRupeeRealization = hedgedAmountUSD * forwardRate;
  const spotRupeeRealization = unhedgedAmountUSD * spotRate;
  const totalRealization = hedgedRupeeRealization + spotRupeeRealization;
  const fxPremiumGain = (hedgedAmountUSD * (forwardRate - spotRate)).toFixed(0);

  const riskBadgeVariant = {
    Low: 'success',
    Moderate: 'warning',
    High: 'danger',
    Critical: 'danger',
  };

  const handleBookHedge = () => {
    toast.success('Hedging Request Prepared', `Forward Contract application for $${hedgedAmountUSD.toLocaleString()} USD drafted for bank submission.`);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <PageHeader
        title="Currency Risk Intelligence"
        subtitle="Understand currency exposure before you close an international deal."
        icon={DollarSign}
        breadcrumb={['Home', 'Currency Risk']}
        badge={<Badge variant="ai" size="sm" dot pulse>Live FX Volatility Telemetry</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Calculator}
              onClick={() => {
                const el = document.getElementById('hedging-simulator');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Hedging Simulator
            </Button>
            <Button
              variant="ai"
              size="sm"
              icon={Sparkles}
              onClick={() => navigate('/ai-consultant')}
            >
              Ask FX Advisor
            </Button>
          </div>
        }
      />

      {/* ── 4 Currency Cards (USD, EUR, AED, GBP) ───────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CURRENCY_CARDS_DATA.map((card, i) => {
          const isUp = card.change24h > 0;
          const isSelected = selectedPair === card.id;

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                variant={isSelected ? 'elevated' : 'interactive'}
                className={`p-5 flex flex-col justify-between gap-4 h-full ${
                  isSelected ? 'border-blue-500/60 bg-[#0f1b36]' : ''
                }`}
                onClick={() => setSelectedPair(card.id)}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{card.flag}</span>
                      <div>
                        <h3 className="text-xs font-bold text-primary">{card.pair}</h3>
                        <p className="text-[10px] text-muted">{card.name}</p>
                      </div>
                    </div>
                    <Badge variant={riskBadgeVariant[card.riskLevel] || 'warning'} size="xs">
                      {card.riskLevel} Risk
                    </Badge>
                  </div>

                  {/* Spot Rate & 24h Change */}
                  <div className="flex items-baseline justify-between mt-3">
                    <span className="text-2xl font-bold font-mono text-primary tracking-tight">
                      ₹{card.rate.toFixed(2)}
                    </span>
                    <span
                      className={`inline-flex items-center gap-0.5 text-xs font-mono font-bold ${
                        isUp ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                      {card.change24h > 0 ? `+${card.change24h}%` : `${card.change24h}%`} (24h)
                    </span>
                  </div>

                  {/* Trends Grid */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#142038] text-[11px]">
                    <div className="text-muted">
                      <span>7D Trend: </span>
                      <strong className="text-emerald-400 font-mono">+{card.trend7d}%</strong>
                    </div>
                    <div className="text-muted text-right">
                      <span>30D Trend: </span>
                      <strong className="text-emerald-400 font-mono">+{card.trend30d}%</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#16233d] flex items-center justify-between text-[10px] text-muted">
                  <span>Open Receivables: <strong className="text-secondary font-mono">{card.openExposure}</strong></span>
                  <span className="text-blue-400 font-medium">({card.invoiceCount} invoices)</span>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* ── AI Currency Risk Recommendation Banner ───────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-[#0c122e] via-[#0e163b] to-[#090f24] p-5 sm:p-6 shadow-xl relative overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 shrink-0 mt-0.5">
              <Sparkles size={24} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="ai" size="xs" dot pulse>AI Hedging Advisory</Badge>
                <span className="text-xs font-mono text-muted">Receivable Portfolio: $178K</span>
                <Badge variant="warning" size="xs">Moderate FX Risk</Badge>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-primary tracking-tight">
                {CURRENCY_AI_RECOMMENDATION.headline}
              </h3>

              <div className="space-y-1.5 pt-1 text-xs text-indigo-200/80 leading-relaxed">
                {CURRENCY_AI_RECOMMENDATION.reasons.map((reason, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 shrink-0 self-start lg:self-auto min-w-[220px]">
            <Button
              variant="ai"
              size="md"
              icon={Lock}
              onClick={handleBookHedge}
            >
              Lock Forward Cover
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconRight={ChevronRight}
              onClick={() => navigate('/documents')}
            >
              Review Open Invoices
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── Main Interactive Currency Historical Chart ──────────── */}
      <ChartCard
        title="Multi-Currency Exchange Rate & Volatility Trajectory"
        subtitle="INR benchmark rates vs major export settlement currencies"
        timeRanges={['7D', '30D', '90D', '1Y']}
        activeRange={activeTimeRange}
        onRangeChange={setActiveTimeRange}
        badge={<Badge variant="primary" size="xs">RBI Reference Rates</Badge>}
      >
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={currentSeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#16223b" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#1a2948' }} tickLine={false} />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={{ stroke: '#1a2948' }}
                tickLine={false}
                tickFormatter={(v) => `₹${v}`}
              />

              <RechartsTooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="p-3.5 rounded-xl border border-[#1e2f52] bg-[#0a1226]/95 backdrop-blur-xl shadow-2xl text-xs space-y-1.5 min-w-[180px]">
                        <p className="font-bold text-primary border-b border-[#16233d] pb-1 font-mono">{label}</p>
                        {payload.map((p, idx) => (
                          <div key={idx} className="flex justify-between items-center gap-3" style={{ color: p.color }}>
                            <span>{p.name}:</span>
                            <span className="font-mono font-bold">₹{parseFloat(p.value).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />

              <Line type="monotone" dataKey="usdInr" name="USD / INR" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 3 }} />
              <Line type="monotone" dataKey="eurInr" name="EUR / INR" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 3 }} />
              <Line type="monotone" dataKey="gbpInr" name="GBP / INR" stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="aedInr" name="AED / INR" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* ── Two-Column Row: Risk Score & Hedging Simulator ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Currency Risk Score Breakdown Card */}
        <Card className="flex flex-col justify-between">
          <CardHeader
            title="Composite Export Currency Risk Score"
            subtitle="Calculated across 4 foreign exchange exposure pillars"
            icon={ShieldAlert}
            action={<Badge variant="warning" size="xs">72 / 100 · Moderate Risk</Badge>}
          />

          <div className="flex items-center justify-center py-2 mb-4">
            <CircularProgress
              value={CURRENCY_RISK_SCORE.overall}
              size={92}
              strokeWidth={7}
              color="amber"
              sublabel="Risk"
            />
          </div>

          <div className="space-y-3 my-auto">
            {CURRENCY_RISK_SCORE.breakdown.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-secondary">{item.name}</span>
                  <span className="font-mono font-bold text-secondary">{item.score}%</span>
                </div>
                <Progress
                  value={item.score}
                  color={item.status === 'low' ? 'emerald' : 'amber'}
                  size="xs"
                  showValue={false}
                />
                <span className="text-[10px] text-muted block">{item.desc}</span>
              </div>
            ))}
          </div>

          <CardFooter>
            <div className="flex items-center justify-between w-full text-xs">
              <span className="text-muted">Net FX Exposure: <strong className="font-mono text-primary">$178,400 USD eq.</strong></span>
              <span className="text-emerald-400 font-medium">Hedging Recommended</span>
            </div>
          </CardFooter>
        </Card>

        {/* Interactive Export Hedging Simulator */}
        <Card id="hedging-simulator" className="flex flex-col justify-between space-y-4">
          <CardHeader
            title="Export Receivable Hedging Simulator"
            subtitle="Calculate forward contract margin protection on your active shipments"
            icon={Calculator}
            badge={<Badge variant="ai" size="xs">Interactive Model</Badge>}
          />

          <div className="space-y-4">
            {/* Input Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-muted block mb-1">Invoice Value (USD)</label>
                <input
                  type="number"
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#060a14] border border-[#1b2a47] rounded-lg p-2 text-primary font-mono font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-muted block mb-1">Hedging Ratio: {hedgeRatio}%</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={10}
                  value={hedgeRatio}
                  onChange={(e) => setHedgeRatio(parseInt(e.target.value))}
                  className="w-full mt-2 accent-blue-500"
                />
              </div>

              <div>
                <label className="text-muted block mb-1">Settlement Tenure</label>
                <select
                  value={tenureDays}
                  onChange={(e) => setTenureDays(parseInt(e.target.value))}
                  className="w-full bg-[#060a14] border border-[#1b2a47] rounded-lg p-2 text-primary font-mono focus:outline-none"
                >
                  <option value={30}>30 Days (Forward: ₹84.55)</option>
                  <option value={60}>60 Days (Forward: ₹84.85)</option>
                  <option value={90}>90 Days (Forward: ₹85.20)</option>
                </select>
              </div>
            </div>

            {/* Simulation Results Box */}
            <div className="p-4 rounded-xl bg-[#060a14] border border-[#16223b] space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-muted block">Hedged Portion ({hedgeRatio}%)</span>
                  <span className="font-mono font-bold text-blue-400">${hedgedAmountUSD.toLocaleString()} USD</span>
                  <span className="text-[10px] text-muted block mt-0.5">Locked at ₹{forwardRate}/USD</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted block">Unhedged Floating ({100 - hedgeRatio}%)</span>
                  <span className="font-mono font-bold text-secondary">${unhedgedAmountUSD.toLocaleString()} USD</span>
                  <span className="text-[10px] text-muted block mt-0.5">Spot: ₹{spotRate}/USD</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#142038] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-muted block">Total Guaranteed Rupee Realization</span>
                  <span className="text-base font-bold font-mono text-emerald-400">
                    ₹{totalRealization.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted block">Forward Premium Yield</span>
                  <span className="text-xs font-bold font-mono text-emerald-400">+₹{parseInt(fxPremiumGain).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <CardFooter>
            <Button
              variant="ai"
              size="sm"
              icon={Lock}
              onClick={handleBookHedge}
              fullWidth
            >
              Book Forward Contract ({hedgeRatio}% of ${invoiceAmount.toLocaleString()} USD)
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* ── Real-Time Risk Alerts List ─────────────────────────── */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
          Active Foreign Exchange Risk Alerts ({CURRENCY_ALERTS.length})
        </h3>
        <div className="space-y-2.5">
          {CURRENCY_ALERTS.map((alert) => (
            <div
              key={alert.id}
              className="p-3.5 rounded-xl bg-[#080d19] border border-[#16223b] flex items-start gap-3"
            >
              <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0 mt-0.5">
                <AlertTriangle size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-xs text-primary">{alert.pair}</span>
                  <Badge variant={alert.severity === 'high' ? 'danger' : 'warning'} size="xs">
                    {alert.severity.toUpperCase()} PRIORITY
                  </Badge>
                </div>
                <p className="text-xs text-secondary leading-relaxed">{alert.message}</p>
              </div>
              <Button
                variant="ghost"
                size="xs"
                iconRight={ChevronRight}
                onClick={handleBookHedge}
              >
                Hedge Now
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
