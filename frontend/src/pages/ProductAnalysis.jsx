import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Package, Sparkles, UploadCloud, Search, CheckCircle2,
  TrendingUp, Globe, DollarSign, FileText, ArrowRight,
  ShieldCheck, AlertCircle, BarChart3, Layers
} from 'lucide-react';
import {
  Button, Card, CardHeader, Badge, Input, Select,
  Progress, CircularProgress, Tabs, useToast, ConfidenceBadge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '../components/ui';
import PageHeader from '../components/shared/PageHeader';
import { PRODUCT_INTEL } from '../data/agentSyntheticData';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';

export default function ProductAnalysis() {
  const navigate = useNavigate();
  const toast = useToast();

  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [material, setMaterial] = useState('');
  const [origin, setOrigin] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('United States');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    toast.ai('Analyzing Product', 'Evaluating global export demand, tariffs, and compliance...');
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisDone(true);
      toast.success('Analysis Complete', 'Export readiness score & tariff guidance generated.');
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="AG-01: Product Intelligence Agent"
        subtitle="AI-powered insights about your product's export potential, global demand, and tariff classification."
        icon={Package}
        breadcrumb={['ExportEase', 'Agents', 'Product Intelligence']}
        badge={<Badge variant="primary" size="sm" dot pulse>Live Agent Active</Badge>}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Sparkles}
            loading={isAnalyzing}
            onClick={handleAnalyze}
          >
            {analysisDone ? 'Re-Analyze Product' : 'Analyze Product'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Upload & Spec Input Form */}
        <div className="lg:col-span-4 space-y-5">
          <Card className="p-5 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-primary">Product Specifications</h3>
              <p className="text-xs text-muted">Provide product details for automated extraction</p>
            </div>

            <div className="space-y-3 text-xs">
              <Input
                label="Product Title"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
              <Input
                label="Category / Industry"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <Input
                  label="Material Composition"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
              />
              <Input
                  label="Manufacturing Origin"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
              />
              <Select
                label="Target Destination"
                value={destinationCountry}
                onChange={(e) => setDestinationCountry(e.target.value)}
                options={[
                  { value: 'United States', label: '🇺🇸 United States' },
                  { value: 'Germany', label: '🇩🇪 Germany' },
                  { value: 'United Arab Emirates', label: '🇦🇪 United Arab Emirates' },
                  { value: 'Singapore', label: '🇸🇬 Singapore' },
                ]}
              />
              <Button
                variant="primary"
                size="sm"
                fullWidth
                icon={Sparkles}
                loading={isAnalyzing}
                onClick={handleAnalyze}
              >
                {analysisDone ? 'Update Analysis' : 'Run AI Analysis'}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: AI Analysis Results Dashboard */}
        <div className="lg:col-span-8 space-y-5">
          {!analysisDone && (
            <Card className="h-[400px] flex flex-col items-center justify-center p-8 text-center bg-slate-900/20 border-dashed border-2 border-slate-700/50">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="text-blue-400 w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Ready for AI Analysis</h3>
              <p className="text-sm text-slate-400 max-w-sm">
                Enter your product specifications on the left and click "Run AI Analysis" to generate export readiness scores, HS codes, and market insights.
              </p>
            </Card>
          )}

          {analysisDone && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* Score & Key Metrics Banner */}
              <Card variant="ai" className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <CircularProgress
                      value={PRODUCT_INTEL.kpis[0].value}
                      size={76}
                      strokeWidth={6}
                      variant="emerald"
                    />
                    <div>
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block">
                        Export Readiness Score
                      </span>
                      <h3 className="text-lg font-extrabold text-slate-100">{PRODUCT_INTEL.kpis[0].value} / 100 — Excellent Potential</h3>
                      <p className="text-xs text-slate-400 mt-0.5">High demand in target markets with favorable tariff conditions.</p>
                    </div>
                  </div>

                  <div className="p-3 bg-surface-card backdrop-blur-md rounded-xl border border-base text-center shrink-0 cursor-pointer hover:bg-surface-hover" onClick={() => navigate('/hs-finder')}>
                    <span className="text-[10px] text-muted block font-semibold">Suggested HS Code</span>
                    <span className="font-mono font-bold text-sm text-[#1746D2]">9405.50.00</span>
                    <Badge variant="success" size="xs" className="mt-1">Verify →</Badge>
                  </div>
                </div>
              </Card>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {PRODUCT_INTEL.kpis.map((kpi, idx) => (
                  <Card key={idx} className="p-3.5 space-y-1">
                    <span className="text-[10px] text-muted font-semibold block">{kpi.label}</span>
                    <span className="text-base font-extrabold block" style={{ color: kpi.color }}>
                      {kpi.value}{kpi.unit}
                    </span>
                    <span className="text-[10px] font-medium text-muted">{kpi.trend}</span>
                  </Card>
                ))}
              </div>

              {/* Synthetic Visualizations */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* Radar Chart */}
                <Card className="p-5">
                  <h4 className="text-sm font-bold text-slate-200 mb-1">Product Market Fit Index</h4>
                  <p className="text-xs text-slate-400 mb-4">Multi-dimensional viability across target regions.</p>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="65%" data={PRODUCT_INTEL.productFitRadar}>
                        <PolarGrid stroke="#E2E8F0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="UAE" dataKey="UAE" stroke="#10B981" fill="#10B981" fillOpacity={0.4} />
                        <Radar name="Germany" dataKey="Germany" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.4} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Bar Chart */}
                <Card className="p-5">
                  <h4 className="text-sm font-bold text-slate-200 mb-1">Competitor Pricing Density</h4>
                  <p className="text-xs text-slate-400 mb-4">Your product positioning vs market average.</p>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={PRODUCT_INTEL.pricingTiers} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="tier" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                        <RechartsTooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                        <Bar dataKey="yourProduct" name="Your Product" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={25} />
                        <Bar dataKey="marketAvg" name="Market Avg" fill="#94A3B8" radius={[4, 4, 0, 0]} barSize={25} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              {/* Material Breakdown Table */}
              <Card className="overflow-hidden">
                  <div className="border-b border-base bg-surface-subtle py-3 px-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-bold text-primary">Material Composition Analysis</h3>
                            <p className="text-xs text-muted">Bill of materials and associated certifications.</p>
                        </div>
                    </div>
                  </div>
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Material</TableHead>
                              <TableHead>Source</TableHead>
                              <TableHead>%</TableHead>
                              <TableHead>Certifications</TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {PRODUCT_INTEL.materialBreakdown.map((item, idx) => (
                              <TableRow key={idx}>
                                  <TableCell className="font-medium text-primary text-xs">{item.material}</TableCell>
                                  <TableCell className="text-xs text-muted">{item.source}</TableCell>
                                  <TableCell className="text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500" style={{ width: `${item.percentage}%` }} />
                                        </div>
                                        <span>{item.percentage}%</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                      <div className="flex gap-1">
                                          {item.certifications.map(c => (
                                              <Badge key={c} variant="outline" size="xs">{c}</Badge>
                                          ))}
                                      </div>
                                  </TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
              </Card>

            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
