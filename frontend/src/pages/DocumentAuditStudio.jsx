import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCheck2, AlertTriangle, CheckCircle2, AlertCircle, Sparkles,
  Download, ArrowRight, RefreshCw, ShieldAlert, FileText, Scale, Eye
} from 'lucide-react';
import {
  Card, CardHeader, Button, Badge, Input, Table, TableHeader,
  TableBody, TableRow, TableHead, TableCell, Progress, useToast
} from '../components/ui';
import PageHeader from '../components/shared/PageHeader';
import enterpriseFeaturesService from '../services/enterpriseFeaturesService';

const PRESETS = {
  textiles: {
    name: 'Textiles to Germany (Live Discrepancies)',
    invoice_number: 'INV-2026-9042',
    invoice_hs_code: '5208.32.00',
    invoice_consignee: 'Zalando Logistics SE, Berlin, Germany',
    invoice_net_weight: 12450.0,
    invoice_gross_weight: 13100.0,
    invoice_amount: 84500.0,
    currency: 'USD',
    bl_number: 'MAEU94827104',
    bl_hs_code: '5208.11.00', // mismatch!
    bl_consignee: 'Zalando Logistics SE, Berlin',
    bl_net_weight: 12450.0,
    bl_gross_weight: 13500.0, // weight discrepancy!
    lc_number: 'LC-DB-2026-7811',
    lc_amount: 80000.0,      // financial overdraw!
    port_of_loading: 'INNSA (JNPT, Nhava Sheva)',
    port_of_discharge: 'DEHAM (Hamburg, Germany)'
  },
  rice: {
    name: 'Basmati Rice to UAE (Compliant Clean Pass)',
    invoice_number: 'INV-2026-1044',
    invoice_hs_code: '1006.30.10',
    invoice_consignee: 'Al Maya Group LLC, Dubai, UAE',
    invoice_net_weight: 24000.0,
    invoice_gross_weight: 24800.0,
    invoice_amount: 38200.0,
    currency: 'USD',
    bl_number: 'HLCU89211029',
    bl_hs_code: '1006.30.10',
    bl_consignee: 'Al Maya Group LLC, Dubai, UAE',
    bl_net_weight: 24000.0,
    bl_gross_weight: 24800.0,
    lc_number: 'LC-ENBD-2026-901',
    lc_amount: 40000.0,
    port_of_loading: 'INMUN (Mundra Port)',
    port_of_discharge: 'AEJEA (Jebel Ali, Dubai)'
  }
};

export default function DocumentAuditStudio() {
  const toast = useToast();
  const [formData, setFormData] = useState(PRESETS.textiles);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState(null);

  const runAudit = async (dataToAudit = formData) => {
    setIsAuditing(true);
    try {
      const res = await enterpriseFeaturesService.auditExportDocuments(dataToAudit);
      setAuditResult(res);
      if (res.critical_issues > 0) {
        toast.error('Audit Flagged Critical Errors', `${res.critical_issues} discrepancy found that would block ICEGATE clearance.`);
      } else {
        toast.success('Audit Passed', 'All statutory fields match zero-discrepancy tolerances.');
      }
    } catch {
      toast.error('Audit Error', 'Unable to execute audit.');
    } finally {
      setIsAuditing(false);
    }
  };

  useEffect(() => {
    runAudit(PRESETS.textiles);
  }, []);

  const handlePresetChange = (key) => {
    const selected = PRESETS[key];
    setFormData(selected);
    runAudit(selected);
  };

  const autoFixAll = () => {
    const corrected = {
      ...formData,
      bl_hs_code: formData.invoice_hs_code,
      bl_gross_weight: formData.invoice_gross_weight,
      lc_amount: Math.max(formData.lc_amount || 0, formData.invoice_amount),
      invoice_consignee: formData.invoice_consignee.includes('EORI:') ? formData.invoice_consignee : `${formData.invoice_consignee} (EORI: DE11892014)`
    };
    setFormData(corrected);
    runAudit(corrected);
    toast.success('Auto-Resolved', 'Synchronized Bill of Lading, gross weights, and LC limits.');
  };

  const applySingleFix = (id) => {
    let corrected = { ...formData };
    if (id === 'DISC-01') {
      corrected.bl_hs_code = formData.invoice_hs_code;
    } else if (id === 'DISC-02') {
      corrected.bl_gross_weight = formData.invoice_gross_weight;
    } else if (id === 'DISC-03') {
      corrected.lc_amount = formData.invoice_amount;
    } else if (id === 'DISC-04') {
      corrected.invoice_consignee = `${formData.invoice_consignee} (EORI: DE11892014)`;
    }
    setFormData(corrected);
    runAudit(corrected);
    toast.success('Field Corrected', `Applied resolution for ${id}`);
  };

  const score = auditResult?.icegate_readiness_score || 0;
  const isReady = auditResult?.compliance_verdict === 'READY_FOR_ICEGATE';

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Zero-Error Document Discrepancy & OCR Audit Studio"
        subtitle="Cross-verifies Commercial Invoice, Bill of Lading, and Letter of Credit against ICEGATE & DGFT customs tolerances."
        icon={FileCheck2}
        breadcrumb={['ExportEase', 'Documents', 'OCR Audit Studio']}
        badge={<Badge variant="primary" size="sm" dot pulse>ICEGATE 2.0 Ready</Badge>}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => runAudit()}
              loading={isAuditing}
            >
              Re-Audit
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Sparkles}
              onClick={autoFixAll}
              disabled={isReady}
            >
              Auto-Resolve Discrepancies
            </Button>
          </div>
        }
      />

      {/* Preset Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-blue-400" />
          <span className="text-sm font-semibold text-text-primary">Load Inspection Scenario:</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant={formData.invoice_hs_code === PRESETS.textiles.invoice_hs_code ? 'primary' : 'outline'}
            size="xs"
            onClick={() => handlePresetChange('textiles')}
          >
            Scenario A: Textiles to Germany (Discrepancy Demo)
          </Button>
          <Button
            variant={formData.invoice_hs_code === PRESETS.rice.invoice_hs_code ? 'primary' : 'outline'}
            size="xs"
            onClick={() => handlePresetChange('rice')}
          >
            Scenario B: Basmati Rice to UAE (Clean Pass)
          </Button>
        </div>
      </div>

      {/* Top Telemetry Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <span className="text-xs text-text-muted font-medium">ICEGATE Readiness Score</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-3xl font-extrabold ${score >= 90 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
              {score}%
            </span>
            <span className="text-xs text-text-muted">customs pass probability</span>
          </div>
          <Progress value={score} className="mt-3 h-1.5" />
        </Card>

        <Card className="p-4 border-l-4 border-l-rose-500">
          <span className="text-xs text-text-muted font-medium">Critical Blockers</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-rose-400">
              {auditResult?.critical_issues ?? 0}
            </span>
            <span className="text-xs text-rose-300/80">would reject at gate-in</span>
          </div>
          <span className="text-[11px] text-text-muted block mt-2">Zero-tolerance on EDI mismatches</span>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500">
          <span className="text-xs text-text-muted font-medium">Regulatory Warnings</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-amber-400">
              {auditResult?.warnings ?? 0}
            </span>
            <span className="text-xs text-amber-300/80">destination customs advice</span>
          </div>
          <span className="text-[11px] text-text-muted block mt-2">Non-blocking, clearance risk</span>
        </Card>

        <Card className="p-4 border-l-4 border-l-emerald-500">
          <span className="text-xs text-text-muted font-medium">Audit Verdict</span>
          <div className="flex items-center gap-2 mt-1.5">
            {isReady ? (
              <Badge variant="success" size="md">
                <CheckCircle2 size={13} className="mr-1 inline" /> READY FOR ICEGATE
              </Badge>
            ) : (
              <Badge variant="danger" size="md">
                <AlertCircle size={13} className="mr-1 inline" /> REJECTED AT CUSTOMS
              </Badge>
            )}
          </div>
          <span className="text-[11px] text-text-muted block mt-2">
            {isReady ? 'Shipping Bill manifest is synchronized' : 'Discrepancies require resolution'}
          </span>
        </Card>
      </div>

      {/* Discrepancies Action Table */}
      <Card>
        <CardHeader
          title="Detected Statutory Discrepancies & Audit Log"
          subtitle="Real-time multi-document diff across Invoice, B/L, and LC"
        />
        <div className="p-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Severity</TableHead>
                <TableHead>Check Category</TableHead>
                <TableHead>Field</TableHead>
                <TableHead>Invoice Value</TableHead>
                <TableHead>B/L or LC Value</TableHead>
                <TableHead>Statutory Discrepancy Detail</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {auditResult?.discrepancies?.map((d) => (
                  <motion.tr
                    key={d.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="border-b border-white/5 hover:bg-white/[0.02]"
                  >
                    <TableCell>
                      {d.severity === 'critical' ? (
                        <Badge variant="danger" size="xs">Critical</Badge>
                      ) : d.severity === 'warning' ? (
                        <Badge variant="warning" size="xs">Warning</Badge>
                      ) : (
                        <Badge variant="success" size="xs">Passed</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold text-text-primary text-xs whitespace-nowrap">
                      {d.category}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-blue-400">
                      {d.field}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {d.invoice_value}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-rose-300">
                      {d.bl_value || d.lc_value}
                    </TableCell>
                    <TableCell className="text-xs text-text-muted max-w-md">
                      {d.detail}
                    </TableCell>
                    <TableCell className="text-right">
                      {d.auto_fix && (
                        <Button
                          variant="outline"
                          size="xs"
                          icon={Sparkles}
                          onClick={() => applySingleFix(d.id)}
                        >
                          Apply Fix
                        </Button>
                      )}
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Dual Document Inspector Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="p-5">
          <CardHeader
            title="Commercial Invoice (Doc #1)"
            subtitle="Verified accounting document filed by exporter"
          />
          <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
            <div>
              <label className="text-text-muted block mb-1">Invoice Number</label>
              <Input
                value={formData.invoice_number}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
              />
            </div>
            <div>
              <label className="text-text-muted block mb-1">HS Code (ITC-HS 8-Digit)</label>
              <Input
                value={formData.invoice_hs_code}
                onChange={(e) => setFormData({ ...formData, invoice_hs_code: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="text-text-muted block mb-1">Consignee Name & Destination</label>
              <Input
                value={formData.invoice_consignee}
                onChange={(e) => setFormData({ ...formData, invoice_consignee: e.target.value })}
              />
            </div>
            <div>
              <label className="text-text-muted block mb-1">Gross Weight (kg)</label>
              <Input
                type="number"
                value={formData.invoice_gross_weight}
                onChange={(e) => setFormData({ ...formData, invoice_gross_weight: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="text-text-muted block mb-1">Invoice Amount ($)</label>
              <Input
                type="number"
                value={formData.invoice_amount}
                onChange={(e) => setFormData({ ...formData, invoice_amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        </Card>

        <Card padding="p-5">
          <CardHeader
            title="Bill of Lading & LC (Carrier Docs)"
            subtitle="Shipping carrier manifest & bank instrument"
          />
          <div className="grid grid-cols-2 gap-4 mt-4 text-xs">
            <div>
              <label className="text-text-muted block mb-1">B/L Number</label>
              <Input
                value={formData.bl_number}
                onChange={(e) => setFormData({ ...formData, bl_number: e.target.value })}
              />
            </div>
            <div>
              <label className="text-text-muted block mb-1">
                B/L HS Code {formData.bl_hs_code !== formData.invoice_hs_code && <span className="text-rose-400 font-bold">(Mismatch)</span>}
              </label>
              <Input
                value={formData.bl_hs_code}
                className={formData.bl_hs_code !== formData.invoice_hs_code ? 'border-rose-500/50 bg-rose-500/5' : ''}
                onChange={(e) => setFormData({ ...formData, bl_hs_code: e.target.value })}
              />
            </div>
            <div>
              <label className="text-text-muted block mb-1">
                B/L Gross Weight (kg) {formData.bl_gross_weight !== formData.invoice_gross_weight && <span className="text-rose-400 font-bold">(Variance)</span>}
              </label>
              <Input
                type="number"
                value={formData.bl_gross_weight}
                className={formData.bl_gross_weight !== formData.invoice_gross_weight ? 'border-rose-500/50 bg-rose-500/5' : ''}
                onChange={(e) => setFormData({ ...formData, bl_gross_weight: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="text-text-muted block mb-1">
                Letter of Credit Limit ($) {formData.invoice_amount > formData.lc_amount && <span className="text-rose-400 font-bold">(Exceeded)</span>}
              </label>
              <Input
                type="number"
                value={formData.lc_amount}
                className={formData.invoice_amount > formData.lc_amount ? 'border-rose-500/50 bg-rose-500/5' : ''}
                onChange={(e) => setFormData({ ...formData, lc_amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="col-span-2">
              <label className="text-text-muted block mb-1">Port Pair Corridor</label>
              <Input
                value={`${formData.port_of_loading} -> ${formData.port_of_discharge}`}
                disabled
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
