import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck, AlertTriangle, FileCheck, Search, Globe,
  CheckCircle2, AlertCircle, ArrowRight, BookOpen, Layers,
  Scale, Sparkles
} from 'lucide-react';
import {
  Button, Card, CardHeader, Badge, Input, Select, Tabs, useToast, ConfidenceBadge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Progress, CircularProgress
} from '../components/ui';
import PageHeader from '../components/shared/PageHeader';
import { useEvidence } from '../context/EvidenceContext';
import { COMPLIANCE_DATA } from '../data/agentSyntheticData';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';

export default function ComplianceCenter() {
  const navigate = useNavigate();
  const toast = useToast();
  const { openEvidence } = useEvidence();

  // Interactive form state
  const [productName, setProductName] = useState('');
  const [hsCode, setHsCode] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('United Arab Emirates');
  const [tradeAgreement, setTradeAgreement] = useState('CEPA');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditDone, setAuditDone] = useState(false);

  const handleAudit = () => {
    setIsAuditing(true);
    toast.ai('Running Compliance Audit', 'Cross-checking Foreign Trade Policy, bilateral FTAs, and mandatory destination rules...');
    setTimeout(() => {
      setIsAuditing(false);
      setAuditDone(true);
      toast.success('Audit Complete', 'Compliance checklist and regulatory risk matrix generated.');
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="AG-03: Compliance Agent"
        subtitle="Cross-checks Foreign Trade Policy, bilateral FTAs, and mandatory destination rules."
        icon={ShieldCheck}
        breadcrumb={['ExportEase', 'Agents', 'Compliance Agent']}
        badge={<Badge variant="primary" size="sm" dot pulse>Live Agent Active</Badge>}
        actions={
          <Button variant="primary" size="sm" icon={ShieldCheck} onClick={handleAudit} loading={isAuditing}>
            {auditDone ? 'Re-Run Audit' : 'Run Full Audit'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Column: Input Form */}
        <div className="lg:col-span-4 space-y-5">
          <Card className="p-5 space-y-4">
            <div className="border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Compliance Check Details</h3>
              <p className="text-xs text-[var(--text-muted)]">Enter product & destination for automated compliance audit</p>
            </div>

            <div className="space-y-3 text-xs">
              <Input
                label="Product Name"
                placeholder="e.g., Organic Cotton Kurta"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
              <Input
                label="HS Code"
                placeholder="e.g., 6204.42"
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
                label="Trade Agreement"
                value={tradeAgreement}
                onChange={(e) => setTradeAgreement(e.target.value)}
                options={[
                  { value: 'CEPA', label: 'India-UAE CEPA' },
                  { value: 'GSP', label: 'EU GSP' },
                  { value: 'SAFTA', label: 'SAFTA' },
                  { value: 'None', label: 'No FTA' },
                ]}
              />
              <Button
                variant="primary"
                size="sm"
                fullWidth
                icon={ShieldCheck}
                loading={isAuditing}
                onClick={handleAudit}
              >
                {auditDone ? 'Update Compliance Audit' : 'Run Compliance Audit'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-8 space-y-5">

          {!auditDone && (
            <Card className="h-[400px] flex flex-col items-center justify-center p-8 text-center bg-slate-900/20 border-dashed border-2 border-slate-700/50">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="text-emerald-400 w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Ready for Compliance Audit</h3>
              <p className="text-sm text-slate-400 max-w-sm">
                Enter your product details, HS code, and destination country on the left, then click "Run Compliance Audit" to generate a full regulatory compliance report.
              </p>
            </Card>
          )}

          {auditDone && (
            <>
              {/* KPI Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {COMPLIANCE_DATA.kpis.map((kpi, idx) => (
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

              {/* Checklist */}
              <Card className="overflow-hidden flex flex-col">
                <CardHeader className="border-b border-base bg-surface-subtle py-4 px-5 shrink-0">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-primary">Pre-Shipment Compliance Checklist</h3>
                    <Badge variant="success" size="xs">94% Verified</Badge>
                  </div>
                </CardHeader>
                <div className="flex-1 overflow-y-auto max-h-[300px]">
                  <Table>
                    <TableBody>
                      {COMPLIANCE_DATA.complianceChecklist.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="w-8">
                            {item.status === 'verified' ? <CheckCircle2 size={16} className="text-emerald-500" /> : 
                             item.status === 'pending' ? <AlertCircle size={16} className="text-amber-500" /> : 
                             <div className="w-4 h-4 rounded-full border-2 border-slate-200" />}
                          </TableCell>
                          <TableCell className="font-medium text-xs">{item.item}</TableCell>
                          <TableCell className="text-xs text-muted hidden sm:table-cell">{item.authority}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={item.status === 'verified' ? 'success' : item.status === 'pending' ? 'warning' : 'outline'} size="xs">
                              {item.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>

              {/* Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* FTA Radar Chart */}
                <Card className="p-5">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">FTA Benefit Comparison</h4>
                  <p className="text-xs text-[var(--text-muted)] mb-4">India's Trade Agreements evaluated for your product.</p>
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="60%" data={COMPLIANCE_DATA.ftaBenefitRadar}>
                        <PolarGrid stroke="rgba(255,255,255,0.08)" />
                        <PolarAngleAxis dataKey="agreement" tick={{ fill: '#c8d8f0', fontSize: 10 }} />
                        <Radar name="UAE CEPA" dataKey="CEPA" stroke="#10B981" fill="#10B981" fillOpacity={0.4} />
                        <Radar name="EU GSP" dataKey="GSP" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#c8d8f0' }} />
                        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', fontSize: '12px', background: '#0e1534', color: '#f0f6ff' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Compliance Trend Chart */}
                <Card className="p-5">
                  <h4 className="text-sm font-bold text-[var(--text-primary)] mb-1">Compliance Health Trend</h4>
                  <p className="text-xs text-[var(--text-muted)] mb-4">Your organization's readiness score over time.</p>
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={COMPLIANCE_DATA.complianceTrend.slice(-6)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#c8d8f0' }} />
                        <YAxis domain={[50, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#c8d8f0' }} />
                        <RechartsTooltip cursor={{ stroke: '#94A3B8', strokeWidth: 1, strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', fontSize: '12px', background: '#0e1534', color: '#f0f6ff' }} />
                        <Area type="monotone" dataKey="score" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              {/* Regulatory Risk Matrix */}
              <Card className="overflow-hidden">
                 <CardHeader className="border-b border-base bg-surface-subtle py-3 px-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-primary">Regulatory Risk Matrix</h3>
                    <Button variant="outline" size="xs" onClick={() => openEvidence({
                          title: 'India-UAE CEPA Treaty',
                          type: 'compliance',
                          confidence: 94,
                          content: 'Textile articles classified in Chapter 62 originating from India qualify for 0% customs duty at UAE ports upon issuance of Form AI Certificate of Origin.',
                          sourceUrl: 'https://commerce.gov.in'
                    })}>View CEPA Rules</Button>
                  </div>
                </CardHeader>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Risk Factor</TableHead>
                      <TableHead>Probability</TableHead>
                      <TableHead>Impact</TableHead>
                      <TableHead>Mitigation Strategy</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {COMPLIANCE_DATA.regulatoryRiskGrid.slice(0, 4).map((risk, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium text-xs text-primary">{risk.risk}</TableCell>
                        <TableCell>
                          <Badge variant={risk.probability === 'High' ? 'danger' : risk.probability === 'Medium' ? 'warning' : 'success'} size="xs">{risk.probability}</Badge>
                        </TableCell>
                        <TableCell>
                           <Badge variant={risk.impact === 'Critical' || risk.impact === 'High' ? 'danger' : risk.impact === 'Medium' ? 'warning' : 'outline'} size="xs">{risk.impact}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted">{risk.mitigation}</TableCell>
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
