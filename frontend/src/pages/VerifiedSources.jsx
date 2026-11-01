import React, { useState } from 'react';
import {
  BookOpen, Search, Filter, ShieldCheck, ExternalLink,
  Building2, Scale, Hash, CheckCircle2, Calendar, Download
} from 'lucide-react';
import {
  Button, Card, Badge, Input, Select, ConfidenceBadge
} from '../components/ui';
import PageHeader from '../components/shared/PageHeader';
import { useEvidence } from '../context/EvidenceContext';

const KNOWLEDGE_SOURCES = [
  {
    id: 'src-01',
    title: 'Foreign Trade Policy 2023-28 (Updated Chapter 62)',
    authority: 'Directorate General of Foreign Trade (DGFT)',
    country: 'India',
    docType: 'Official Policy Gazette',
    product: 'Textiles, Spices, Engineering Goods',
    verificationStatus: 'Verified Official Record',
    confidence: 99,
    effectiveDate: 'April 2025 – Present',
    url: 'https://www.dgft.gov.in',
    excerpt: 'Detailed statutory provisions governing Indian export eligibility, advance authorizations, Duty Drawback (DBK), and RoDTEP incentive disbursements.',
    section: 'FTP Chapter 4 & 62',
  },
  {
    id: 'src-02',
    title: 'India-UAE Comprehensive Economic Partnership Agreement (CEPA)',
    authority: 'Ministry of Commerce and Industry',
    country: 'UAE / India',
    docType: 'Bilateral Free Trade Agreement',
    product: 'Apparel, Gems & Jewellery, Agriculture',
    verificationStatus: 'Verified Treaty Schedule',
    confidence: 98,
    effectiveDate: 'May 2022 – Active',
    url: 'https://commerce.gov.in',
    excerpt: 'Immediate 0% customs duty elimination on 90% of Indian tariff lines exported to UAE ports with 35% domestic value addition.',
    section: 'Annexure 2B — Tariff Schedule',
  },
  {
    id: 'src-03',
    title: 'Indian Customs Tariff Act ITC-HS 2025-26 Classification Book',
    authority: 'Central Board of Indirect Taxes and Customs (CBIC)',
    country: 'India',
    docType: 'Customs Tariff Schedule',
    product: 'All 8-Digit HS Headings',
    verificationStatus: 'Standard Statutory Reference',
    confidence: 99,
    effectiveDate: 'January 2025 – Active',
    url: 'https://www.cbic.gov.in',
    excerpt: 'Comprehensive 8-digit Harmonized System classification schedule with statutory chapter notes, export duty flags, and GST cross-references.',
    section: 'Chapter 09 (Spices) & Chapter 62 (Apparel)',
  },
  {
    id: 'src-04',
    title: 'European Union GSP Scheme & REX System Handbook',
    authority: 'European Commission (Directorate-General for Trade)',
    country: 'Germany / European Union',
    docType: 'Preferential Trade Regulation',
    product: 'Organic Cotton, Agriculture, Spices',
    verificationStatus: 'Verified EU Standard',
    confidence: 96,
    effectiveDate: 'Current Framework',
    url: 'https://trade.ec.europa.eu',
    excerpt: 'Preferential tariff treatment under EU GSP scheme for developing countries; mandates Registered Exporter System (REX) statement on invoice.',
    section: 'Regulation (EU) No 978/2012',
  },
  {
    id: 'src-05',
    title: 'UN Comtrade Harmonized Trade Flow Statistics 2025-26',
    authority: 'United Nations Statistics Division',
    country: 'Global (195 Countries)',
    docType: 'Multilateral Trade Data',
    product: 'Global Import/Export Statistics',
    verificationStatus: 'Verified Global Data',
    confidence: 95,
    effectiveDate: '2025 Annual Series',
    url: 'https://comtradeplus.un.org',
    excerpt: 'Standardized bilateral commodity trade statistics covering 6,000+ tariff lines across 47 major maritime and air trade corridors.',
    section: 'Comtrade Plus Database HS 6205 & 0910',
  },
  {
    id: 'src-06',
    title: 'Reserve Bank of India Master Direction — Hedging of Forex Risk',
    authority: 'Reserve Bank of India (RBI)',
    country: 'India',
    docType: 'Central Bank Statutory Directive',
    product: 'USD, EUR, AED, GBP Currency Hedging',
    verificationStatus: 'Official Banking Directive',
    confidence: 98,
    effectiveDate: 'RBI Master Direction No. 18/2024-25',
    url: 'https://www.rbi.org.in',
    excerpt: 'Guidelines enabling Indian MSME exporters to contract forward sales, currency swaps, and options up to 100% of past export turnover.',
    section: 'Section II — Risk Management in Inter-Bank Dealings',
  },
];

export default function VerifiedSources() {
  const { openEvidence } = useEvidence();
  const [searchQuery, setSearchQuery] = useState('');
  const [authorityFilter, setAuthorityFilter] = useState('all');

  const filteredSources = KNOWLEDGE_SOURCES.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.authority.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.product.toLowerCase().includes(searchQuery.toLowerCase());

    if (authorityFilter === 'all') return matchesSearch;
    if (authorityFilter === 'dgft') return matchesSearch && s.authority.includes('DGFT');
    if (authorityFilter === 'cbic') return matchesSearch && s.authority.includes('CBIC');
    if (authorityFilter === 'treaty') return matchesSearch && s.docType.includes('Treaty');
    return matchesSearch;
  });

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Verified Knowledge Base & Statutory Sources"
        subtitle="Auditable repository of official government gazettes, bilateral trade treaties, and customs tariff schedules."
        icon={BookOpen}
        breadcrumb={['ExportEase', 'Verified Sources']}
        badge={<Badge variant="success" size="sm" dot>{KNOWLEDGE_SOURCES.length} Audited Official Portals</Badge>}
      />

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-card backdrop-blur-md p-3.5 rounded-xl border border-base shadow-md">
        <div className="w-full sm:w-80">
          <Input
            icon={Search}
            placeholder="Search verified sources, acts, regulations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-muted whitespace-nowrap">Filter:</span>
          <select
            value={authorityFilter}
            onChange={(e) => setAuthorityFilter(e.target.value)}
            className="h-9 px-3 text-xs rounded-lg border border-medium bg-surface-card backdrop-blur-md text-secondary font-medium focus:outline-none focus:border-[#1746D2]"
          >
            <option value="all">All Authorities ({KNOWLEDGE_SOURCES.length})</option>
            <option value="dgft">DGFT Portals</option>
            <option value="cbic">CBIC Customs Portals</option>
            <option value="treaty">Trade Treaties (CEPA/GSP)</option>
          </select>
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSources.map((source) => (
          <Card key={source.id} className="p-5 flex flex-col justify-between space-y-4 hover:border-[#1746D2] transition-all">
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge variant="navy" size="xs">{source.docType}</Badge>
                  <h3 className="text-sm font-bold text-primary mt-1 leading-snug">{source.title}</h3>
                </div>
                <ConfidenceBadge score={source.confidence} size="xs" />
              </div>

              <div className="text-xs text-muted space-y-1">
                <p className="flex items-center gap-1.5 font-medium">
                  <Building2 size={13} className="text-muted" />
                  Authority: <strong className="text-secondary">{source.authority}</strong>
                </p>
                <p className="text-muted">
                  Section: <strong className="text-secondary font-mono">{source.section}</strong> · Scope: {source.country}
                </p>
              </div>

              <p className="text-xs text-muted leading-relaxed bg-surface-subtle p-3 rounded-lg border border-base/80">
                "{source.excerpt}"
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-muted font-mono">{source.effectiveDate}</span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="xs"
                  icon={ShieldCheck}
                  onClick={() => openEvidence({
                    authority: source.authority,
                    document: source.title,
                    section: source.section,
                    verificationStatus: source.verificationStatus,
                    confidence: source.confidence,
                    excerpt: source.excerpt,
                    officialUrl: source.url,
                  })}
                >
                  View Evidence Drawer
                </Button>

                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg text-muted hover:text-[#1746D2] hover:bg-indigo-950/50 transition-colors"
                >
                  <ExternalLink size={15} />
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
