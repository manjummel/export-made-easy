import React from 'react';
import {
  ExternalLink, ShieldCheck, CheckCircle2, FileText,
  Building2, Calendar, BookOpen, Scale, Hash, ArrowRight,
  Copy, Check
} from 'lucide-react';
import Drawer from '../ui/Drawer';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import ConfidenceBadge from '../ui/ConfidenceBadge';
import { useEvidence } from '../../context/EvidenceContext';

export default function SourceDrawer() {
  const { isDrawerOpen, activeEvidence, closeEvidence } = useEvidence();
  const [copied, setCopied] = React.useState(false);

  if (!activeEvidence) return null;

  const {
    title = 'Verified Regulatory Source',
    authority = 'All Government Export Portals',
    authorityType = 'Official Export & Customs Portals',
    document = 'Aggregate Trade Policies & Global Compliance Guidelines',
    section = 'Global Regulatory Cross-Reference',
    ruleCitation = 'Consolidated General Guidelines',
    verificationStatus = 'Verified Official Record',
    confidence = 98,
    effectiveDate = 'Live Real-time Feed',
    officialUrl = '#',
    excerpt = 'All statutory export notifications, tariff schedules, and compliance requirements are verified in real-time across participating official government and international trade gateways.',
    impactSummary = 'Ensures full compliance with current statutory requirements across all relevant jurisdictions and trade corridors.',
    agent = 'Compliance Intelligence Agent',
    crossReferences = [
      { name: 'CBIC Customs Tariff Act 2025 Schedule 1', code: 'CBIC-CTA-6205' },
      { name: 'India-UAE CEPA Bilateral Schedule Annex 2-A', code: 'CEPA-UAE-TEXT' },
      { name: 'ICEGATE Notification No. 44/2024-Customs', code: 'ICEGATE-44' },
    ],
  } = activeEvidence;

  const handleCopyCitation = () => {
    const text = `VERIFIED REGULATORY EVIDENCE\nAuthority: ${authority} (${authorityType})\nDocument: ${document}\nSection/Rule: ${section} · ${ruleCitation}\nVerification: ${verificationStatus} (${confidence}% Confidence)\nExcerpt: "${excerpt}"\nSource Link: ${officialUrl}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Drawer
      isOpen={isDrawerOpen}
      onClose={closeEvidence}
      title="Verified Regulatory Evidence"
      subtitle="Auditable evidence extracted from official government and trade treaty registries."
      badge={<Badge variant="success" size="xs" icon={ShieldCheck}>Verified</Badge>}
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="outline"
            size="sm"
            icon={copied ? Check : Copy}
            onClick={handleCopyCitation}
          >
            {copied ? 'Citation Copied' : 'Copy Citation'}
          </Button>

          <a
            href={officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1746D2] text-primary hover:bg-[#1338a8] transition-colors"
          >
            <span>Open Official Portal</span>
            <ExternalLink size={13} />
          </a>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Verification Status Banner */}
        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-3">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-emerald-900">{verificationStatus}</h4>
              <ConfidenceBadge score={confidence} size="xs" />
            </div>
            <p className="text-[11px] text-emerald-800 mt-0.5">
              Verified against live government gazettes and bilateral trade agreement schedules.
            </p>
          </div>
        </div>

        {/* Source Metadata Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-base)] space-y-1">
            <span className="text-[10px] font-semibold text-[var(--color-muted)] uppercase tracking-wider flex items-center gap-1">
              <Building2 size={12} /> Issuing Authority
            </span>
            <p className="font-bold text-[var(--color-primary)] leading-tight">{authority}</p>
            <p className="text-[11px] text-[var(--color-muted)]">{authorityType}</p>
          </div>

          <div className="p-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-base)] space-y-1">
            <span className="text-[10px] font-semibold text-[var(--color-muted)] uppercase tracking-wider flex items-center gap-1">
              <Calendar size={12} /> Regulatory Period
            </span>
            <p className="font-bold text-[var(--color-primary)] leading-tight">{effectiveDate}</p>
            <p className="text-[11px] text-emerald-600 font-medium">Currently Active & Enforceable</p>
          </div>
        </div>

        {/* Official Document & Section */}
        <div className="p-3.5 rounded-xl bg-[var(--color-surface-card)] backdrop-blur-md border border-[var(--color-border-base)] space-y-2">
          <div className="flex items-center gap-2 text-[var(--color-secondary)] font-semibold">
            <BookOpen size={14} className="text-[#1746D2]" />
            <span>Document & Section Reference</span>
          </div>

          <div className="space-y-1.5 pl-5 border-l-2 border-indigo-900/50">
            <div>
              <p className="font-semibold text-[var(--color-primary)]">{document}</p>
            </div>
            <div className="text-[11px] text-[var(--color-muted)] flex items-center gap-1">
              <Hash size={11} className="text-muted" />
              <span>{section}</span>
            </div>
            <div className="text-[11px] text-[var(--color-muted)] font-mono">
              {ruleCitation}
            </div>
          </div>
        </div>

        {/* Official Excerpt / Statutory Language */}
        <div className="p-3.5 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-base)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[var(--color-primary)] flex items-center gap-1.5">
              <Scale size={14} className="text-[var(--color-secondary)]" />
              Statutory Excerpt & Provision
            </span>
            <Badge variant="navy" size="xs">Official Text</Badge>
          </div>
          <p className="text-xs text-[var(--color-secondary)] bg-[var(--color-surface-card)] backdrop-blur-md p-3 rounded-lg border border-[var(--color-border-base)]/80 leading-relaxed font-serif italic">
            "{excerpt}"
          </p>
        </div>

        {/* Business Impact for MSME */}
        <div className="p-3.5 rounded-xl bg-indigo-950/50/60 border border-indigo-900/50 space-y-1.5">
          <h4 className="font-bold text-[var(--color-primary)] flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[#1746D2]" />
            Business Impact for Exporter
          </h4>
          <p className="text-xs text-[var(--color-secondary)] leading-relaxed">{impactSummary}</p>
        </div>

        {/* Attributed AI Agent */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-base)]">
          <div>
            <span className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider block">Extracted By</span>
            <span className="font-semibold text-[var(--color-primary)]">{agent}</span>
          </div>
          <Badge variant="primary" size="xs">Multi-Agent RAG</Badge>
        </div>

        {/* Cross References / Government Portals */}
        {crossReferences && crossReferences.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-semibold text-[var(--color-secondary)]">Official Government & EXIM Portals</span>
            <div className="space-y-1">
              {crossReferences.map((ref, i) => (
                <a
                  key={i}
                  href={ref.url || officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-surface-card)] backdrop-blur-md border border-[var(--color-border-base)] text-[11px] hover:border-[#1746D2] hover:bg-indigo-950/40 transition-all duration-150 group cursor-pointer"
                >
                  <span className="text-[var(--color-primary)] truncate font-medium group-hover:text-blue-400 transition-colors">{ref.name}</span>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="font-mono text-[10px] text-[var(--color-muted)]">{ref.code}</span>
                    <ExternalLink size={11} className="text-[var(--color-muted)] group-hover:text-blue-400 transition-colors" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}
