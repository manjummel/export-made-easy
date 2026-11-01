import React, { useState } from 'react';
import {
  AlertTriangle, ShieldCheck, DollarSign, Globe,
  FileCheck, Scale, AlertOctagon, HelpCircle, ArrowRight
} from 'lucide-react';
import {
  Button, Card, CardHeader, Badge, Input, Select, Progress, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, useToast
} from '../components/ui';
import PageHeader from '../components/shared/PageHeader';
import { useEvidence } from '../context/EvidenceContext';
import { RISK_AGENT } from '../data/agentSyntheticData';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

export default function RiskCenter() {
  const { openEvidence } = useEvidence();
  const toast = useToast();

  // Interactive form state
  const [productName, setProductName] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('United Arab Emirates');
  const [shipmentValue, setShipmentValue] = useState('');
  const [currency, setCurrency] = useState('USD/INR');
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessDone, setAssessDone] = useState(false);

  const handleAssess = () => {
    setIsAssessing(true);
    toast.ai('Assessing Export Risk', 'Analyzing forex volatility, payment terms, and regulatory uncertainty...');
    setTimeout(() => {
      setIsAssessing(false);
      setAssessDone(true);
      toast.success('Risk Assessment Complete', 'Forex exposure, hedging strategies, and buyer risk matrix generated.');
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="AG-06: Risk Agent"
        subtitle="Monitors foreign exchange volatility, payment settlement terms, and regulatory uncertainty."
        icon={AlertTriangle}
        breadcrumb={['ExportEase', 'Agents', 'Risk Agent']}
        badge={<Badge variant="primary" size="sm" dot pulse>Live Agent Active</Badge>}
        actions={
          <Button variant="primary" size="sm" icon={AlertTriangle} onClick={handleAssess} loading={isAssessing}>
            {assessDone ? 'Re-Assess Risk' : 'Assess Risk'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Column: Input Form */}
        <div className="lg:col-span-4 space-y-5">
          <Card className="p-5 space-y-4">
            <div className="border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Risk Assessment Inputs</h3>
              <p className="text-xs text-[var(--text-muted)]">Enter shipment details to generate a risk profile</p>
            </div>

            <div className="space-y-3 text-xs">
              <Input
                label="Product / Shipment Name"
                placeholder="e.g., Organic Cotton Garments"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
              <Input
                label="Shipment Value (USD)"
                placeholder="e.g., 84000"
                value={shipmentValue}
                onChange={(e) => setShipmentValue(e.target.value)}
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
                label="Currency Pair"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                options={[
                  { value: 'USD/INR', label: 'USD / INR' },
                  { value: 'EUR/INR', label: 'EUR / INR' },
                  { value: 'GBP/INR', label: 'GBP / INR' },
                  { value: 'AED/INR', label: 'AED / INR' },
                ]}
              />
              <Button
                variant="primary"
                size="sm"
                fullWidth
                icon={AlertTriangle}
                loading={isAssessing}
                onClick={handleAssess}
              >
                {assessDone ? 'Update Risk Assessment' : 'Assess Risk'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-8 space-y-5">

          {!assessDone && (
            <Card className="h-[400px] flex flex-col items-center justify-center p-8 text-center bg-slate-900/20 border-dashed border-2 border-slate-700/50">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="text-amber-400 w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Ready for Risk Assessment</h3>
              <p className="text-sm text-slate-400 max-w-sm">
                Enter your product name, shipment value, destination country, and currency pair, then click "Assess Risk" to generate forex volatility analysis, hedging strategies, and buyer payment risk ratings.
              </p>
            </Card>
          )}

          {assessDone && (
            <>
              {/* KPI Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {RISK_AGENT.kpis.map((kpi, idx) => (
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

              {/* Forex Chart */}
              <Card className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">{currency} Forex Volatility (30 Days)</h4>
                    <p className="text-xs text-[var(--text-muted)]">Live interbank rates monitoring for your ${shipmentValue || '84,000'} exposure.</p>
                  </div>
                  <Button variant="outline" size="xs" onClick={() => openEvidence({
                        title: 'RBI Reference Rates & FEDAI',
                        type: 'risk',
                        confidence: 88,
                        content: 'Exporters with open receivables exceeding $50,000 are advised to utilize 3-month forward sales contracts to insulate operating margins.',
                        sourceUrl: 'https://www.rbi.org.in'
                  })}>View RBI Advisory</Button>
                </div>
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={RISK_AGENT.fxVolatility30d} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#c8d8f0' }} />
                      <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#c8d8f0' }} tickFormatter={(val) => `₹${val}`} />
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', fontSize: '12px', background: '#0e1534', color: '#f0f6ff' }} formatter={(val) => `₹${val}`} />
                      <Line type="monotone" name={currency + ' Spot'} dataKey="usdInr" stroke="#F59E0B" strokeWidth={3} dot={{ r: 0 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                   <div className="flex items-start gap-2">
                     <AlertTriangle size={16} className="text-amber-400 mt-0.5" />
                     <div>
                       <span className="text-xs font-bold text-amber-300 block">AI Hedging Recommendation</span>
                       <span className="text-xs text-amber-400/80">Lock in 60% of anticipated export receivables via 3-month Forward Sale Contract to protect operating margins.</span>
                     </div>
                   </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Risk Exposure Breakdown */}
                <Card className="p-5">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">Risk Exposure Breakdown</h4>
                  <p className="text-xs text-[var(--text-muted)] mb-4">Weighted analysis of potential disruptors.</p>
                  <div className="space-y-4">
                     {RISK_AGENT.riskExposureBreakdown.map((risk, idx) => (
                       <div key={idx} className="space-y-1.5">
                         <div className="flex justify-between items-center text-xs">
                           <span className="font-bold text-[var(--text-secondary)]">{risk.category}</span>
                           <span className="font-mono text-[var(--text-primary)]">{risk.score}/100</span>
                         </div>
                         <Progress value={risk.score} variant={risk.score > 60 ? 'danger' : risk.score > 30 ? 'warning' : 'primary'} className="h-1.5" />
                       </div>
                     ))}
                  </div>
                </Card>

                {/* Hedging Strategies */}
                <Card className="overflow-hidden">
                  <CardHeader className="border-b border-base bg-surface-subtle py-3 px-4">
                    <h3 className="text-sm font-bold text-primary">Hedging Strategy Comparison</h3>
                  </CardHeader>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Strategy</TableHead>
                        <TableHead>Coverage</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {RISK_AGENT.hedgingStrategies.map((strat, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium text-xs text-primary">
                            {strat.strategy}
                            {strat.recommended && <Badge variant="primary" size="xs" className="ml-2">Recommended</Badge>}
                          </TableCell>
                          <TableCell className="text-xs">{strat.coverage}</TableCell>
                          <TableCell className="text-xs text-muted text-right">{strat.cost}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>

              {/* Buyer Payment Risk Matrix */}
              <Card className="overflow-hidden">
                <CardHeader className="border-b border-base bg-surface-subtle py-3 px-4">
                  <h3 className="text-sm font-bold text-primary">Buyer Payment Risk Matrix</h3>
                </CardHeader>
                <Table>
                  <TableBody>
                    {RISK_AGENT.paymentRiskMatrix.map((buyer, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="w-full">
                          <div className="flex flex-col">
                            <span className="font-bold text-xs text-primary">{buyer.buyer}</span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-muted">{buyer.country}</span>
                              <span className="text-[10px] text-muted border-l border-base pl-2">{buyer.terms}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                           <div className="flex flex-col items-end">
                              <span className="text-xs font-mono font-bold text-secondary">{buyer.exposure}</span>
                              <Badge variant={buyer.risk === 'Low' ? 'success' : buyer.risk === 'Medium' ? 'warning' : 'danger'} size="xs" className="mt-1">
                                {buyer.risk}
                              </Badge>
                           </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
