import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCheck2, AlertTriangle, CheckCircle2, AlertCircle, Sparkles,
  Download, ArrowRight, RefreshCw, ShieldAlert, FileText, Scale, Eye,
  Layers, UploadCloud, Check, HelpCircle
} from 'lucide-react';
import {
  Card, CardHeader, Button, Badge, Input, Table, TableHeader,
  TableBody, TableRow, TableHead, TableCell, Progress, useToast
} from '../components/ui';
import PageHeader from '../components/shared/PageHeader';
import enterpriseFeaturesService from '../services/enterpriseFeaturesService';
import DocumentUploadZone from '../components/documents/DocumentUploadZone';
import ExtractedDocumentsReview from '../components/documents/ExtractedDocumentsReview';

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

const SAMPLE_MULTI_DOCS_TEXTILES = [
  {
    filename: 'Commercial_Invoice_INV-2026-9042.pdf',
    document_type: 'commercial_invoice',
    document_label: 'Commercial Invoice (CI)',
    confidence: 98,
    fields: {
      exporter_name: 'Apex Silk Mills Pvt. Ltd., Surat, Gujarat, India',
      importer_name: 'Zalando Logistics SE, Berlin, Germany',
      invoice_number: 'INV-2026-9042',
      invoice_date: '2026-10-24',
      product_description: '100% Dyed Woven Cotton Fabrics (Finish 140 GSM)',
      hs_code: '5208.32.00',
      quantity: 12450.0,
      unit: 'MTR',
      gross_weight: 13100.0,
      net_weight: 12450.0,
      total_amount: 84500.0,
      currency: 'USD',
      port_of_loading: 'INNSA (JNPT, Nhava Sheva)',
      port_of_discharge: 'DEHAM (Hamburg, Germany)',
    }
  },
  {
    filename: 'Packing_List_PL-9042.pdf',
    document_type: 'packing_list',
    document_label: 'Packing List (PL)',
    confidence: 96,
    fields: {
      exporter_name: 'Apex Silk Mills Pvt. Ltd., Surat',
      importer_name: 'Zalando Logistics SE, Berlin',
      invoice_number: 'INV-2026-9042',
      invoice_date: '2026-10-24',
      product_description: '100% Dyed Woven Cotton Fabrics in 250 Cartons',
      hs_code: '5208.32.00',
      quantity: 12450.0,
      unit: 'MTR',
      gross_weight: 13100.0,
      net_weight: 12450.0,
      total_amount: 84500.0,
      currency: 'USD',
      port_of_loading: 'INNSA (JNPT, Nhava Sheva)',
      port_of_discharge: 'DEHAM (Hamburg, Germany)',
    }
  },
  {
    filename: 'Bill_of_Lading_MAEU94827104.pdf',
    document_type: 'bill_of_lading',
    document_label: 'Bill of Lading (B/L)',
    confidence: 94,
    fields: {
      exporter_name: 'Apex Silk Mills Pvt. Ltd.',
      importer_name: 'Zalando Logistics SE',
      invoice_number: 'INV-2026-9042',
      invoice_date: '2026-10-26',
      product_description: 'Woven Cotton Piece Goods',
      hs_code: '5208.11.00', // Intentional Mismatch!
      quantity: 12450.0,
      unit: 'MTR',
      gross_weight: 13500.0, // Weight Variance!
      net_weight: 12450.0,
      total_amount: 84500.0,
      currency: 'USD',
      port_of_loading: 'INNSA (JNPT, Nhava Sheva)',
      port_of_discharge: 'DEHAM (Hamburg, Germany)',
    }
  },
  {
    filename: 'Certificate_of_Origin_COO-771.pdf',
    document_type: 'certificate_of_origin',
    document_label: 'Certificate of Origin (COO)',
    confidence: 95,
    fields: {
      exporter_name: 'Apex Silk Mills Pvt. Ltd., Surat, India',
      importer_name: 'Zalando Logistics SE, Germany',
      invoice_number: 'INV-2026-9042',
      invoice_date: '2026-10-25',
      product_description: 'Dyed Cotton Fabrics Originating from India',
      hs_code: '5208.32.00',
      quantity: 12450.0,
      unit: 'MTR',
      gross_weight: 13100.0,
      net_weight: 12450.0,
      total_amount: 84500.0,
      currency: 'USD',
      port_of_loading: 'INNSA (Nhava Sheva)',
      port_of_discharge: 'DEHAM (Hamburg)',
    }
  }
];

const SAMPLE_MULTI_DOCS_RICE = [
  {
    filename: 'Commercial_Invoice_INV-2026-1044.pdf',
    document_type: 'commercial_invoice',
    document_label: 'Commercial Invoice (CI)',
    confidence: 99,
    fields: {
      exporter_name: 'Heritage Agrifoods Exports Ltd., Karnal, Haryana, India',
      importer_name: 'Al Maya Group LLC, Dubai, UAE',
      invoice_number: 'INV-2026-1044',
      invoice_date: '2026-10-28',
      product_description: 'Premium Indian Traditional Basmati Rice (1121 Steam)',
      hs_code: '1006.30.10',
      quantity: 24000.0,
      unit: 'KG',
      gross_weight: 24800.0,
      net_weight: 24000.0,
      total_amount: 38200.0,
      currency: 'USD',
      port_of_loading: 'INMUN (Mundra Port)',
      port_of_discharge: 'AEJEA (Jebel Ali, Dubai)',
    }
  },
  {
    filename: 'Packing_List_PL-1044.pdf',
    document_type: 'packing_list',
    document_label: 'Packing List (PL)',
    confidence: 97,
    fields: {
      exporter_name: 'Heritage Agrifoods Exports Ltd., Karnal',
      importer_name: 'Al Maya Group LLC, Dubai, UAE',
      invoice_number: 'INV-2026-1044',
      invoice_date: '2026-10-28',
      product_description: 'Basmati Rice in 960 Jute Bags @ 25kg net',
      hs_code: '1006.30.10',
      quantity: 24000.0,
      unit: 'KG',
      gross_weight: 24800.0,
      net_weight: 24000.0,
      total_amount: 38200.0,
      currency: 'USD',
      port_of_loading: 'INMUN (Mundra Port)',
      port_of_discharge: 'AEJEA (Jebel Ali, Dubai)',
    }
  },
  {
    filename: 'Bill_of_Lading_HLCU89211029.pdf',
    document_type: 'bill_of_lading',
    document_label: 'Bill of Lading (B/L)',
    confidence: 98,
    fields: {
      exporter_name: 'Heritage Agrifoods Exports Ltd.',
      importer_name: 'Al Maya Group LLC',
      invoice_number: 'INV-2026-1044',
      invoice_date: '2026-10-29',
      product_description: 'Indian Basmati Rice (1121)',
      hs_code: '1006.30.10',
      quantity: 24000.0,
      unit: 'KG',
      gross_weight: 24800.0,
      net_weight: 24000.0,
      total_amount: 38200.0,
      currency: 'USD',
      port_of_loading: 'INMUN (Mundra Port)',
      port_of_discharge: 'AEJEA (Jebel Ali, Dubai)',
    }
  }
];

export default function DocumentAuditStudio() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('upload_mode'); // 'upload_mode' | 'form_mode'
  
  // Multi-Document state
  const [extractedDocs, setExtractedDocs] = useState([]);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);

  // Form mode state (legacy preset compatibility)
  const [formData, setFormData] = useState(PRESETS.textiles);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState(null);

  // Initialize with the sample multi-doc set
  useEffect(() => {
    loadMultiDocScenario('textiles_discrepancy');
  }, []);

  const loadMultiDocScenario = async (type) => {
    const docs = type === 'basmati_clean' ? SAMPLE_MULTI_DOCS_RICE : SAMPLE_MULTI_DOCS_TEXTILES;
    setExtractedDocs(docs);
    setIsProcessingUpload(true);
    try {
      const res = await enterpriseFeaturesService.crossVerifyDocuments(docs);
      setAuditResult(res);
      if (res.critical_issues > 0) {
        toast.warning('Cross-Verification Run', `Detected ${res.critical_issues} discrepancy blocking ICEGATE clearance.`);
      } else {
        toast.success('Clean Export Dossier', 'All 10+ statutory fields are synchronized across documents.');
      }
    } catch {
      toast.error('Verification Error', 'Failed to execute cross-verification.');
    } finally {
      setIsProcessingUpload(false);
    }
  };

  const handleFilesReady = async (files, docTypeMap) => {
    setIsProcessingUpload(true);
    try {
      toast.info('Extracting Documents', `Running OCR and entity parsing on ${files.length} document(s)...`);
      const extractRes = await enterpriseFeaturesService.extractDocuments(files, docTypeMap);
      
      if (extractRes && extractRes.documents) {
        setExtractedDocs(extractRes.documents);
        toast.info('Cross-Verifying', 'Comparing extracted fields against ICEGATE & DGFT rules...');
        const verifyRes = await enterpriseFeaturesService.crossVerifyDocuments(extractRes.documents);
        setAuditResult(verifyRes);

        if (verifyRes.critical_issues > 0) {
          toast.error('Audit Flagged Mismatches', `Found ${verifyRes.critical_issues} critical discrepancy across uploaded files.`);
        } else {
          toast.success('Audit Passed', 'Documents are verified and compliant with ICEGATE tolerances.');
        }
      }
    } catch (err) {
      toast.error('Processing Failed', err.message || 'Unable to parse files.');
    } finally {
      setIsProcessingUpload(false);
    }
  };

  const handleUpdateDocumentFields = (docIndex, updatedFields) => {
    const updated = [...extractedDocs];
    updated[docIndex] = {
      ...updated[docIndex],
      fields: updatedFields
    };
    setExtractedDocs(updated);
    toast.success('Document Updated', 'Re-evaluating cross-verification matrix...');
  };

  const runReverification = async () => {
    if (extractedDocs.length === 0) return;
    setIsProcessingUpload(true);
    try {
      const res = await enterpriseFeaturesService.crossVerifyDocuments(extractedDocs);
      setAuditResult(res);
      if (res.critical_issues === 0) {
        toast.success('All Discrepancies Resolved', 'Readiness score updated to 100%.');
      }
    } finally {
      setIsProcessingUpload(false);
    }
  };

  // One-click auto-resolve all discrepancies across documents
  const autoFixAllDocuments = () => {
    if (!extractedDocs || extractedDocs.length === 0) return;
    const masterDoc = extractedDocs.find(d => d.document_type === 'commercial_invoice') || extractedDocs[0];
    const mFields = masterDoc.fields;

    const harmonized = extractedDocs.map(doc => {
      return {
        ...doc,
        fields: {
          ...doc.fields,
          hs_code: mFields.hs_code,
          gross_weight: mFields.gross_weight,
          quantity: mFields.quantity,
          unit: mFields.unit,
          importer_name: mFields.importer_name,
          invoice_number: mFields.invoice_number,
        }
      };
    });

    setExtractedDocs(harmonized);
    enterpriseFeaturesService.crossVerifyDocuments(harmonized).then(res => {
      setAuditResult(res);
      toast.success('Auto-Resolved All Documents', 'Synchronized HS Codes, Gross Weights, Quantities, and Buyer Details.');
    });
  };

  // Legacy single fix
  const applySingleFix = (id) => {
    // Check if ID belongs to multi-doc verification
    if (id.startsWith('DISC-HS-')) {
      const targetType = id.replace('DISC-HS-', '');
      const masterDoc = extractedDocs.find(d => d.document_type === 'commercial_invoice') || extractedDocs[0];
      const updated = extractedDocs.map(d => d.document_type === targetType ? {
        ...d,
        fields: { ...d.fields, hs_code: masterDoc.fields.hs_code }
      } : d);
      setExtractedDocs(updated);
      enterpriseFeaturesService.crossVerifyDocuments(updated).then(setAuditResult);
      toast.success('HS Code Synchronized', `Updated ${targetType} to ${masterDoc.fields.hs_code}`);
      return;
    }

    if (id.startsWith('DISC-WEIGHT-')) {
      const targetType = id.replace('DISC-WEIGHT-', '');
      const masterDoc = extractedDocs.find(d => d.document_type === 'commercial_invoice') || extractedDocs[0];
      const updated = extractedDocs.map(d => d.document_type === targetType ? {
        ...d,
        fields: { ...d.fields, gross_weight: masterDoc.fields.gross_weight }
      } : d);
      setExtractedDocs(updated);
      enterpriseFeaturesService.crossVerifyDocuments(updated).then(setAuditResult);
      toast.success('Gross Weight Synchronized', `Updated tare to ${masterDoc.fields.gross_weight} kg`);
      return;
    }

    // Default form fix fallback
    let corrected = { ...formData };
    if (id === 'DISC-01') corrected.bl_hs_code = formData.invoice_hs_code;
    else if (id === 'DISC-02') corrected.bl_gross_weight = formData.invoice_gross_weight;
    else if (id === 'DISC-03') corrected.lc_amount = formData.invoice_amount;
    else if (id === 'DISC-04') corrected.invoice_consignee = `${formData.invoice_consignee} (EORI: DE11892014)`;
    
    setFormData(corrected);
    runFormAudit(corrected);
    toast.success('Field Corrected', `Applied resolution for ${id}`);
  };

  const runFormAudit = async (dataToAudit = formData) => {
    setIsAuditing(true);
    try {
      const res = await enterpriseFeaturesService.auditExportDocuments(dataToAudit);
      setAuditResult(res);
    } finally {
      setIsAuditing(false);
    }
  };

  const score = auditResult?.icegate_readiness_score || 0;
  const isReady = auditResult?.compliance_verdict === 'READY_FOR_ICEGATE';

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="AI Export Document Cross-Verification & OCR Studio"
        subtitle="Upload multiple shipping documents (Invoice, Packing List, PO, B/L, COO) and automatically cross-verify consistency before ICEGATE & customs filing."
        icon={FileCheck2}
        breadcrumb={['ExportEase', 'Documents', 'Cross-Verification Studio']}
        badge={<Badge variant="primary" size="sm" dot pulse>ICEGATE 2.0 & DGFT EDI</Badge>}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => {
                if (activeTab === 'upload_mode') runReverification();
                else runFormAudit();
              }}
              loading={isProcessingUpload || isAuditing}
            >
              Re-Audit
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Sparkles}
              onClick={autoFixAllDocuments}
              disabled={isReady}
            >
              Auto-Resolve Discrepancies
            </Button>
          </div>
        }
      />

      {/* Navigation Mode Tabs */}
      <div className="flex border-b border-base gap-6">
        <button
          onClick={() => setActiveTab('upload_mode')}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'upload_mode'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <UploadCloud size={16} />
          <span>Upload & Cross-Verify Documents</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-400 font-mono">
            {extractedDocs.length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('form_mode');
            runFormAudit();
          }}
          className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'form_mode'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-text-muted hover:text-text-primary'
          }`}
        >
          <Layers size={16} />
          <span>Manual Discrepancy Simulator</span>
        </button>
      </div>

      {/* Top Telemetry KPI Row */}
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

      {/* Main Tab Content */}
      {activeTab === 'upload_mode' ? (
        <div className="space-y-6">
          {/* Step 1: Upload Interface */}
          <DocumentUploadZone
            onFilesReady={handleFilesReady}
            isProcessing={isProcessingUpload}
            onLoadPreset={loadMultiDocScenario}
          />

          {/* Step 2: Extracted Document Entities */}
          <ExtractedDocumentsReview
            documents={extractedDocs}
            onUpdateDocument={handleUpdateDocumentFields}
            onReverify={runReverification}
          />
        </div>
      ) : (
        /* Manual Form Simulator Tab */
        <div className="space-y-6">
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
                onClick={() => {
                  setFormData(PRESETS.textiles);
                  runFormAudit(PRESETS.textiles);
                }}
              >
                Scenario A: Textiles to Germany (Discrepancy Demo)
              </Button>
              <Button
                variant={formData.invoice_hs_code === PRESETS.rice.invoice_hs_code ? 'primary' : 'outline'}
                size="xs"
                onClick={() => {
                  setFormData(PRESETS.rice);
                  runFormAudit(PRESETS.rice);
                }}
              >
                Scenario B: Basmati Rice to UAE (Clean Pass)
              </Button>
            </div>
          </div>

          {/* Form fields */}
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
      )}

      {/* Step 3: Discrepancies Action Table */}
      <Card>
        <CardHeader
          title="Cross-Document Discrepancy Matrix & Statutory Audit Log"
          subtitle="Multi-way consistency check across Commercial Invoice, Packing List, Purchase Order, Bill of Lading, and Certificate of Origin"
        />
        <div className="p-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Severity</TableHead>
                <TableHead>Check Category</TableHead>
                <TableHead>Field</TableHead>
                <TableHead>Document A</TableHead>
                <TableHead>Document B / Comparison</TableHead>
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
                    <TableCell className="text-xs">
                      <div className="font-semibold text-text-primary">{d.document_a || 'Invoice'}</div>
                      <div className="font-mono text-text-muted">{d.value_a || d.invoice_value}</div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="font-semibold text-text-primary">{d.document_b || 'Carrier Doc'}</div>
                      <div className={`font-mono ${d.severity === 'critical' ? 'text-rose-400 font-semibold' : 'text-text-muted'}`}>
                        {d.value_b || d.bl_value || d.lc_value}
                      </div>
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
                          Auto-Fix
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
    </div>
  );
}
