import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, ShieldCheck, Download, Plus, Search, Filter, AlertTriangle, ArrowRight, Activity, Clock
} from 'lucide-react';
import {
  Button, Card, CardHeader, Badge, Input, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Progress, useToast
} from '../components/ui';
import PageHeader from '../components/shared/PageHeader';
import { DOCUMENT_AGENT } from '../data/agentSyntheticData';
import { useEvidence } from '../context/EvidenceContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';

export default function Documents() {
  const toast = useToast();
  const { openEvidence } = useEvidence();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    toast.ai('Document Agent Active', 'Auto-compiling Commercial Invoice and Packing List...');
    setTimeout(() => {
      setIsGenerating(false);
      toast.success('Generation Complete', 'Export documents ready for signature.');
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="AG-04: Document Agent"
        subtitle="Validates and auto-compiles Commercial Invoice, Packing List, Shipping Bill, and COO."
        icon={FileText}
        breadcrumb={['ExportEase', 'Agents', 'Document Agent']}
        badge={<Badge variant="primary" size="sm" dot pulse>Live Agent Active</Badge>}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" icon={Download}>Export All</Button>
            <Button variant="primary" size="sm" icon={Plus} onClick={handleGenerate} loading={isGenerating}>Generate Set</Button>
          </div>
        }
      />

      {/* Main KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {DOCUMENT_AGENT.kpis.map((kpi, idx) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Pipeline & Validation */}
        <div className="lg:col-span-5 space-y-5">
          <Card className="p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-base pb-2">
              <h3 className="text-sm font-bold text-primary">Document Validation Scores</h3>
              <Badge variant="primary" size="xs">AI Verified</Badge>
            </div>
            
            <div className="space-y-4 pt-2">
              {DOCUMENT_AGENT.fieldValidationScores.slice(0, 6).map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-secondary">{item.category}</span>
                    <span className="font-bold text-primary">{item.score}%</span>
                  </div>
                  <Progress value={item.score} variant={item.score === 100 ? 'success' : item.score > 85 ? 'primary' : 'warning'} />
                  <p className="text-[9px] text-muted text-right">{item.fields} fields validated</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-900">Missing Certificate of Origin</h4>
                <p className="text-xs text-amber-700 mt-1">Form AI is pending DGFT approval. Required for 0% UAE CEPA concession.</p>
                <Button variant="outline" size="xs" className="mt-3 bg-white border-amber-300 text-amber-700 hover:bg-amber-100">
                  Follow up on DGFT Portal
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Visualizations & Pipeline */}
        <div className="lg:col-span-7 space-y-5">
          
          <Card className="p-5">
              <h4 className="text-sm font-bold text-slate-800 mb-1">Document Generation Volume</h4>
              <p className="text-xs text-slate-500 mb-4">Monthly throughput across critical export documents.</p>
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={DOCUMENT_AGENT.documentVolumeTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line type="monotone" name="Invoices" dataKey="invoices" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" name="Shipping Bills" dataKey="shippingBills" stroke="#10B981" strokeWidth={2} />
                    <Line type="monotone" name="Certificates (COO)" dataKey="coo" stroke="#F59E0B" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
          </Card>

          <Card className="overflow-hidden">
             <CardHeader className="border-b border-base bg-surface-subtle py-3 px-4 flex justify-between items-center">
                <h3 className="text-sm font-bold text-primary">Live Document Pipeline</h3>
                <Button variant="outline" size="xs" icon={Activity} onClick={() => openEvidence({
                      title: 'ICEGATE Customs EDI',
                      type: 'documents',
                      confidence: 92,
                      content: 'Standard 8-digit HS Code, exporter IEC, and buyer VAT details conform to automated Green Channel clearance format.',
                      sourceUrl: 'https://www.icegate.gov.in'
                })}>EDI Schema</Button>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document Type</TableHead>
                    <TableHead>Ref Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Generated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DOCUMENT_AGENT.documentPipeline.map((doc, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium text-xs text-primary">
                        <div className="flex items-center gap-2">
                           <FileText size={14} className="text-muted" />
                           {doc.doc}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono">{doc.refNo}</TableCell>
                      <TableCell>
                        <Badge variant={doc.status === 'completed' ? 'success' : doc.status === 'in_progress' ? 'primary' : 'warning'} size="xs">
                          {doc.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted text-right">{doc.generatedAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
