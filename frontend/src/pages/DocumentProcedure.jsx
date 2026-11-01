import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Sparkles, CheckCircle2, AlertCircle, Clock,
  Download, Eye, Edit3, ArrowRight, ShieldCheck, ChevronRight, ChevronDown,
  Share2, Mail, Check, MessageSquare, MoreHorizontal, Info, List, Headphones,
  ExternalLink, Globe
} from 'lucide-react';
import {
  Button, Card, CardHeader, Badge, Input, Select, Progress, CircularProgress, useToast
} from '../components/ui';
import PageHeader from '../components/shared/PageHeader';

// ── Comprehensive Export Document Database ──────────────────────────────────
const EXPORT_DOCUMENTS = [
  {
    id: 1,
    name: 'Commercial Invoice',
    description: 'A bill for the goods from the seller to the buyer. It includes product description, quantity, price, terms of sale (Incoterms), and payment details. Required by customs to assess duties and taxes.',
    authority: 'Exporter / Seller',
    officialUrl: 'https://www.dgft.gov.in',
    officialLabel: 'DGFT India — Foreign Trade Policy',
    category: 'mandatory',
  },
  {
    id: 2,
    name: 'Packing List',
    description: 'Itemizes the contents, weight, dimensions, and markings of each package in the shipment. Used by customs, freight forwarders, and the buyer for cargo handling and verification.',
    authority: 'Exporter',
    officialUrl: 'https://www.cbic.gov.in',
    officialLabel: 'CBIC — Central Board of Indirect Taxes & Customs',
    category: 'mandatory',
  },
  {
    id: 3,
    name: 'Certificate of Origin (CoO)',
    description: 'Certifies the country where the goods were manufactured. Required to claim preferential duty rates under trade agreements like CEPA, GSP, or SAFTA. Issued by authorized chambers.',
    authority: 'Chamber of Commerce / FIEO',
    officialUrl: 'https://coo.fieo.org',
    officialLabel: 'FIEO — Certificate of Origin Portal',
    category: 'mandatory',
  },
  {
    id: 4,
    name: 'Export Declaration (Shipping Bill)',
    description: 'The principal customs document filed by the exporter (or CHA) for clearance of goods. It records product details, value, HS code, and export incentives like MEIS/RoDTEP.',
    authority: 'Indian Customs (ICEGATE)',
    officialUrl: 'https://www.icegate.gov.in',
    officialLabel: 'ICEGATE — Indian Customs EDI Gateway',
    category: 'mandatory',
  },
  {
    id: 5,
    name: 'Bill of Lading (B/L) / Airway Bill (AWB)',
    description: 'A transport document issued by the carrier that acts as a receipt for cargo, a contract of carriage, and a document of title. Needed by the buyer to take delivery at the destination port.',
    authority: 'Shipping Line / Airline',
    officialUrl: 'https://www.indianports.gov.in',
    officialLabel: 'Indian Ports Association',
    category: 'mandatory',
  },
  {
    id: 6,
    name: 'Letter of Credit (LC)',
    description: `A bank guarantee from the buyer's bank promising payment to the exporter upon presentation of compliant shipping documents. Commonly used in international trade for payment security.`,
    authority: `Buyer's Bank / RBI`,
    officialUrl: 'https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx',
    officialLabel: 'RBI — Foreign Exchange Management',
    category: 'financial',
  },
  {
    id: 7,
    name: 'Insurance Certificate',
    description: 'Protects the shipment against loss, damage, or theft during transit. Covers marine, air, and inland risks. Required under CIF/CIP Incoterms.',
    authority: 'Insurance Company (IRDAI Registered)',
    officialUrl: 'https://www.irdai.gov.in',
    officialLabel: 'IRDAI — Insurance Regulatory Authority',
    category: 'financial',
  },
  {
    id: 8,
    name: 'Phytosanitary Certificate',
    description: 'Certifies that plant and plant-based products (spices, grains, seeds, wood) are free from pests and diseases. Mandatory for agricultural and food exports.',
    authority: 'Plant Quarantine Authority / DPPQS',
    officialUrl: 'https://ppqs.gov.in/divisions/plant-quarantine',
    officialLabel: 'DPPQS — Plant Quarantine Division',
    category: 'product-specific',
  },
  {
    id: 9,
    name: 'Fumigation Certificate',
    description: 'Confirms that goods or packaging (especially wooden pallets) have been fumigated with methyl bromide or heat-treated as per ISPM-15 to prevent pest spread.',
    authority: 'Approved Pest Control Agency',
    officialUrl: 'https://ppqs.gov.in/divisions/plant-quarantine/ispm-15',
    officialLabel: 'DPPQS — ISPM-15 Standards',
    category: 'product-specific',
  },
  {
    id: 10,
    name: 'Quality / Inspection Certificate',
    description: `Issued by an authorized inspection body certifying that goods meet the buyer's quality specifications, destination country standards, or EIC (Export Inspection Council) norms.`,
    authority: 'Export Inspection Council (EIC)',
    officialUrl: 'https://www.eicindia.gov.in',
    officialLabel: 'EIC India — Export Inspection Council',
    category: 'mandatory',
  },
  {
    id: 11,
    name: 'GSP Certificate of Origin (Form A)',
    description: 'A special Certificate of Origin used to claim reduced or zero duties under the Generalized System of Preferences (GSP) scheme for exports to EU, UK, Japan, etc.',
    authority: 'Dept. of Commerce / DGFT',
    officialUrl: 'https://www.dgft.gov.in/CP/',
    officialLabel: 'DGFT — Certificates Portal',
    category: 'preferential',
  },
  {
    id: 12,
    name: 'REX Statement (EU)',
    description: 'For exports to the EU above €6,000, the exporter must self-certify the origin using a REX (Registered Exporter) number registered with EU customs.',
    authority: 'EU Customs / DG TAXUD',
    officialUrl: 'https://taxation-customs.ec.europa.eu/customs-4/international-affairs/origin-goods/general-aspects-preferential-origin/arrangements-registered-exporters_en',
    officialLabel: 'EU — REX System Registration',
    category: 'preferential',
  },
  {
    id: 13,
    name: 'Certificate of Free Sale',
    description: `Certifies that the product is legally sold and freely available in the exporter's domestic market. Often required for cosmetics, food, and medical devices.`,
    authority: 'CDSCO / FSSAI / State Drug Controller',
    officialUrl: 'https://www.cdsco.gov.in',
    officialLabel: 'CDSCO — Central Drugs Standard Control Organization',
    category: 'product-specific',
  },
  {
    id: 14,
    name: 'FSSAI Export Certificate (Food)',
    description: 'For food product exports, FSSAI issues health and hygiene certificates confirming that products comply with Indian food safety regulations and are fit for export.',
    authority: 'FSSAI',
    officialUrl: 'https://www.fssai.gov.in',
    officialLabel: 'FSSAI — Food Safety & Standards Authority',
    category: 'product-specific',
  },
  {
    id: 15,
    name: 'Spices Board Certificate',
    description: 'Mandatory for export of notified spices (cardamom, pepper, turmeric, etc.). Certifies quality standards and traceability. Issued by Spices Board India.',
    authority: 'Spices Board India',
    officialUrl: 'https://www.indianspices.com',
    officialLabel: 'Spices Board India — Official Portal',
    category: 'product-specific',
  },
  {
    id: 16,
    name: 'IEC (Import Export Code)',
    description: 'A 10-digit code mandatory for any person/entity engaged in import/export of goods. It is the primary business identification number for foreign trade in India.',
    authority: 'DGFT',
    officialUrl: 'https://www.dgft.gov.in/CP/?opt=iec-profile',
    officialLabel: 'DGFT — IEC Online Application',
    category: 'mandatory',
  },
  {
    id: 17,
    name: 'AD Code Registration',
    description: `Authorized Dealer Code from the exporter's bank, registered with the port/customs. Required for linking export receipts with the banking channel for forex realization.`,
    authority: 'Authorized Dealer Bank / Customs',
    officialUrl: 'https://www.icegate.gov.in',
    officialLabel: 'ICEGATE — AD Code Registration',
    category: 'financial',
  },
  {
    id: 18,
    name: 'RoDTEP / Duty Drawback Claim',
    description: 'Remission of Duties and Taxes on Exported Products. Exporters can claim refund of embedded central, state taxes, and duties not refunded under GST.',
    authority: 'DGFT / CBIC',
    officialUrl: 'https://www.icegate.gov.in/Guidelines/RoDTEP',
    officialLabel: 'ICEGATE — RoDTEP Guidelines',
    category: 'incentive',
  },
];

const CATEGORY_LABELS = {
  mandatory: { label: 'Mandatory', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  financial: { label: 'Financial', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  'product-specific': { label: 'Product-Specific', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  preferential: { label: 'Preferential Trade', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  incentive: { label: 'Export Incentive', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
};

export default function DocumentProcedure() {
  const navigate = useNavigate();
  const toast = useToast();

  // Interactive form state
  const [productName, setProductName] = useState('');
  const [hsCode, setHsCode] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('United Arab Emirates');
  const [isGenerating, setIsGenerating] = useState(false);
  const [docGenDone, setDocGenDone] = useState(false);
  const [expandedDocId, setExpandedDocId] = useState(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    toast.ai('Generating Document Checklist', 'Analyzing product type, destination, and FTA requirements...');
    setTimeout(() => {
      setIsGenerating(false);
      setDocGenDone(true);
      toast.success('Checklist Generated', '18 export documents identified with official references.');
    }, 1500);
  };

  const toggleExpand = (id) => {
    setExpandedDocId(expandedDocId === id ? null : id);
  };

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="AG-04: Document Agent"
        subtitle="Identifies all required export documents, provides descriptions, and links to official government portals."
        icon={FileText}
        breadcrumb={['ExportEase', 'Agents', 'Document Agent']}
        badge={<Badge variant="primary" size="sm" dot pulse>Live Agent Active</Badge>}
        actions={
          <Button variant="primary" size="sm" icon={FileText} onClick={handleGenerate} loading={isGenerating}>
            {docGenDone ? 'Regenerate Checklist' : 'Generate Checklist'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Column: Input Form */}
        <div className="lg:col-span-4 space-y-5">
          <Card className="p-5 space-y-4">
            <div className="border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Export Details</h3>
              <p className="text-xs text-[var(--text-muted)]">Enter shipment details to generate your document checklist</p>
            </div>

            <div className="space-y-3 text-xs">
              <Input
                label="Product Name"
                placeholder="e.g., Turmeric Powder"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
              <Input
                label="HS Code"
                placeholder="e.g., 0910.30"
                value={hsCode}
                onChange={(e) => setHsCode(e.target.value)}
              />
              <Input
                label="Buyer / Consignee"
                placeholder="e.g., ABC Global Imports LLC"
                value={buyerName}
                onChange={(e) => setBuyerName(e.target.value)}
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
              <Button
                variant="primary"
                size="sm"
                fullWidth
                icon={FileText}
                loading={isGenerating}
                onClick={handleGenerate}
              >
                {docGenDone ? 'Update Document Checklist' : 'Generate Document Checklist'}
              </Button>
            </div>
          </Card>

          {/* Quick Stats (shown after generation) */}
          {docGenDone && (
            <Card className="p-5 space-y-4 text-center">
              <h4 className="text-xs font-bold text-[var(--text-primary)]">Document Summary</h4>
              <div className="flex justify-center py-1">
                <CircularProgress value={100} size={84} strokeWidth={7} variant="emerald" />
              </div>
              <div className="space-y-1.5 text-xs text-left">
                {Object.entries(CATEGORY_LABELS).map(([key, cat]) => {
                  const count = EXPORT_DOCUMENTS.filter(d => d.category === key).length;
                  if (!count) return null;
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span className={`flex items-center gap-1 ${cat.color}`}>
                        <span className={`w-2 h-2 rounded-full ${cat.bg}`} /> {cat.label}
                      </span>
                      <span className="font-mono font-bold text-[var(--text-primary)]">{count}</span>
                    </div>
                  );
                })}
                <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between font-bold text-[var(--text-primary)]">
                  <span>Total Documents</span>
                  <span className="font-mono">{EXPORT_DOCUMENTS.length}</span>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-8 space-y-5">

          {!docGenDone && (
            <Card className="h-[400px] flex flex-col items-center justify-center p-8 text-center bg-slate-900/20 border-dashed border-2 border-slate-700/50">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
                <FileText className="text-indigo-400 w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-200 mb-2">Ready to Generate Document Checklist</h3>
              <p className="text-sm text-slate-400 max-w-sm">
                Enter your product name, HS code, buyer, and destination country on the left, then click "Generate Document Checklist" to see all required export documents with official references.
              </p>
            </Card>
          )}

          {docGenDone && (
            <>
              {/* Progress Banner */}
              <Card className="p-4 border border-[var(--border-subtle)]">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[var(--text-muted)] uppercase">Documents Identified</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-black text-[#1746D2]">{EXPORT_DOCUMENTS.length}</span>
                      <span className="text-xs text-[var(--text-muted)]">export documents required</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="xs" icon={Download}>Download All</Button>
                  </div>
                </div>
              </Card>

              {/* Document Cards — Each with description + official page link */}
              <div className="space-y-3">
                {EXPORT_DOCUMENTS.map((doc) => {
                  const isExpanded = expandedDocId === doc.id;
                  const cat = CATEGORY_LABELS[doc.category];
                  return (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: doc.id * 0.03, duration: 0.3 }}
                    >
                      <Card
                        className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'ring-1 ring-indigo-500/50' : ''}`}
                      >
                        {/* Header Row — always visible */}
                        <button
                          type="button"
                          onClick={() => toggleExpand(doc.id)}
                          className="w-full p-4 flex items-center justify-between text-left hover:bg-[var(--surface-card-hover)] transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 shrink-0">
                              {doc.id}
                            </span>
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">{doc.name}</h4>
                              <span className="text-[10px] text-[var(--text-muted)]">{doc.authority}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cat.bg} ${cat.color}`}>
                              {cat.label}
                            </span>
                            <ChevronDown
                              size={16}
                              className={`text-[var(--text-muted)] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </div>
                        </button>

                        {/* Expanded Content */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-4 space-y-3 border-t border-[var(--border-subtle)]">
                                {/* Description */}
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed pt-3">
                                  {doc.description}
                                </p>

                                {/* Official Page Link */}
                                <a
                                  href={doc.officialUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/15 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-colors group"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                                    <Globe size={16} className="text-indigo-400" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <span className="text-xs font-bold text-indigo-400 group-hover:text-indigo-300 block truncate">
                                      {doc.officialLabel}
                                    </span>
                                    <span className="text-[10px] text-[var(--text-muted)] block truncate">
                                      {doc.officialUrl}
                                    </span>
                                  </div>
                                  <ExternalLink size={14} className="text-indigo-400/50 group-hover:text-indigo-400 shrink-0" />
                                </a>

                                {/* Issuing Authority */}
                                <div className="flex items-center gap-2 text-xs">
                                  <ShieldCheck size={14} className="text-emerald-400" />
                                  <span className="text-[var(--text-muted)]">Issued by:</span>
                                  <span className="font-semibold text-[var(--text-primary)]">{doc.authority}</span>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              {/* Help Card */}
              <Card className="p-4 space-y-2 border border-indigo-500/20 text-center">
                <h4 className="text-xs font-bold text-[var(--text-primary)]">Need Help with Documents?</h4>
                <p className="text-[11px] text-[var(--text-muted)] leading-tight">Talk to our AI export consultant for document-specific guidance.</p>
                <Button variant="secondary" size="xs" icon={Headphones} onClick={() => navigate('/ai-consultant')}>
                  Chat with Export Expert
                </Button>
              </Card>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
