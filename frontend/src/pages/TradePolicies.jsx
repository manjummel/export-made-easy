import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Search, Sparkles, ShieldCheck, CheckCircle2,
  AlertCircle, Clock, FileText, ChevronRight, ArrowRight,
  ExternalLink, Copy, Check, Send, AlertTriangle, Layers,
  HelpCircle, Info, RefreshCw, Bookmark
} from 'lucide-react';

import {
  Button, Card, CardHeader, CardFooter, Badge, Progress,
  CircularProgress, useToast, ConfidenceBadge, RiskBadge, Alert
} from '../components/ui';
import PageHeader from '../components/shared/PageHeader';
import { useEvidence } from '../context/EvidenceContext';
import {
  POLICY_PROMPTS,
  POLICY_COMPLIANCE_SCORE,
  POLICY_TIMELINE_STEPS,
  MOCK_POLICY_RESPONSES,
  queryPolicyAssistant
} from '../services/policyService';
import { COMPANY } from '../data/dashboardData';

export default function TradePolicies() {
  const navigate = useNavigate();
  const toast = useToast();
  const { openEvidence } = useEvidence();

  const [searchQuery, setSearchQuery] = useState('Can I export this product to Germany?');
  const [isQuerying, setIsQuerying] = useState(false);
  const [activeResponse, setActiveResponse] = useState(MOCK_POLICY_RESPONSES.germany);
  const [copied, setCopied] = useState(false);

  const handleQuery = async (queryText) => {
    const q = queryText || searchQuery;
    if (!q.trim()) return;

    setIsQuerying(true);
    setSearchQuery(q);
    toast.ai('Consulting Policy Database', `Evaluating trade rules for "${q}"...`);

    const result = await queryPolicyAssistant(q);
    setActiveResponse(result);
    setIsQuerying(false);
    toast.success('Policy Assessment Ready', 'Compliance conditions verified against Foreign Trade Policy.');
  };

  const handleCopyPolicy = () => {
    const textToCopy = `TRADE POLICY ASSESSMENT\n\nStatus: ${activeResponse.complianceStatus}\nRelevant Policy: ${activeResponse.relevantPolicy}\n\nSummary:\n${activeResponse.answer}\n\nRequired Documents:\n${activeResponse.requiredDocuments.map((d) => `• ${d}`).join('\n')}\n\nConditions:\n${activeResponse.importantConditions.map((c) => `• ${c}`).join('\n')}\n\nReference: ${activeResponse.reference}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success('Copied Policy Report', 'Summary copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const badgeMap = {
    verified: { variant: 'success', label: 'Verified Policy' },
    updated: { variant: 'primary', label: 'Recently Updated' },
    requires_review: { variant: 'warning', label: 'Requires Review' },
    important: { variant: 'danger', label: 'Important Notice' },
  };

  return (
    <div className="space-y-8 pb-16">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <PageHeader
        title="Trade Policy Intelligence"
        subtitle="Understand export regulations, FTAs, and customs requirements without complexity."
        icon={BookOpen}
        breadcrumb={['ExportEase', 'Trade Policies']}
        badge={<Badge variant="primary" size="sm" dot>FTP 2023-28 Database</Badge>}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Sparkles}
            onClick={() => navigate('/ai-consultant')}
          >
            Ask AI Policy Advisor
          </Button>
        }
      />

      {/* ── Interactive Search & Prompt Carousel ─────────────────── */}
      <Card className="p-5 sm:p-6 bg-surface-card backdrop-blur-md border-base shadow-md">
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1746D2]">
                AI Export Regulation Query Terminal
              </span>
              <h2 className="text-sm font-bold text-primary mt-0.5">
                Ask any question about tariffs, FTAs, quotas, or documentation rules
              </h2>
            </div>
            <span className="text-[11px] text-muted font-mono">
              Active Context: {COMPANY.name} (HS {COMPANY.hsCode})
            </span>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleQuery();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Can I export to Germany under GSP? What documents are needed for UAE?"
                className="w-full bg-surface-card backdrop-blur-md border border-medium rounded-xl pl-10 pr-4 py-2 text-xs text-primary placeholder:text-muted focus:outline-none focus:border-[#1746D2] focus:ring-2 focus:ring-[#1746D2]/15 font-medium transition-all"
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isQuerying}
              icon={Send}
              className="shrink-0"
            >
              Analyze Policy
            </Button>
          </form>

          {/* Quick Prompts Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 scrollbar-none">
            <span className="text-[10px] font-bold uppercase text-muted shrink-0 mr-1">Examples:</span>
            {POLICY_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleQuery(prompt)}
                disabled={isQuerying}
                className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-lg bg-surface-base border border-base text-secondary hover:bg-indigo-950/50 hover:border-indigo-900/50 hover:text-[#1746D2] transition-colors shrink-0 disabled:opacity-40 cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Main Two-Column Layout ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        {/* ── Left Column: Structured Policy Intelligence Dossier ── */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeResponse.relevantPolicy}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border border-base bg-surface-card backdrop-blur-md p-5 sm:p-7 shadow-md space-y-6"
            >
              {/* Header: Compliance Status & Reference */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="success" size="sm" dot pulse>
                      {activeResponse.complianceStatus}
                    </Badge>
                    <Badge variant={badgeMap[activeResponse.complianceBadge]?.variant || 'primary'} size="xs">
                      {badgeMap[activeResponse.complianceBadge]?.label || 'Verified'}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-primary tracking-tight mt-1">
                    {activeResponse.relevantPolicy}
                  </h3>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Button
                    variant="outline"
                    size="xs"
                    icon={copied ? Check : Copy}
                    onClick={handleCopyPolicy}
                  >
                    {copied ? 'Copied' : 'Copy Policy Report'}
                  </Button>
                </div>
              </div>

              {/* 1. Answer & Overview */}
              <div className="p-4 rounded-xl bg-indigo-950/50/60 border border-indigo-900/50 space-y-2">
                <div className="flex items-center gap-2 text-[#1746D2]">
                  <Sparkles size={15} />
                  <h4 className="text-xs font-bold uppercase tracking-wider">AI Executive Answer</h4>
                </div>
                <p className="text-xs text-secondary leading-relaxed font-medium">
                  {activeResponse.answer}
                </p>
              </div>

              {/* 2. Required Documents Checklist */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <FileText size={15} className="text-[#1746D2]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                    Mandatory Compliance Documentation ({activeResponse.requiredDocuments.length} Required)
                  </h4>
                </div>

                <div className="space-y-2">
                  {activeResponse.requiredDocuments.map((doc, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-surface-subtle border border-base flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                        <span className="text-xs font-medium text-secondary">{doc}</span>
                      </div>
                      <Badge variant="default" size="xs">Mandatory</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Important Conditions & Rules of Origin */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-amber-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                    Crucial Regulatory Conditions & Value-Addition Rules
                  </h4>
                </div>

                <div className="space-y-2">
                  {activeResponse.importantConditions.map((cond, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-surface-subtle border border-base flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-secondary leading-relaxed">{cond}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Official Reference & Last Updated Metadata */}
              <div className="p-3.5 rounded-xl bg-surface-subtle border border-base flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-muted">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-secondary">Official Reference:</span>
                  <span className="font-mono text-muted truncate max-w-sm">{activeResponse.reference}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-muted font-mono text-[10px]">
                  <Clock size={11} />
                  <span>Verified {activeResponse.lastUpdated}</span>
                </div>
              </div>

              {/* Bottom CTAs */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <Button
                  variant="primary"
                  size="sm"
                  icon={FileText}
                  onClick={() => navigate('/documents')}
                >
                  Generate Required Documents
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  icon={ShieldCheck}
                  onClick={() => openEvidence({
                    authority: activeResponse.relevantPolicy,
                    document: activeResponse.reference,
                    section: activeResponse.complianceStatus,
                    verificationStatus: 'Verified Official Gazette',
                    confidence: 96,
                    excerpt: activeResponse.answer,
                  })}
                >
                  Inspect Evidence
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Right Column: Compliance Score, Timeline, & Disclaimer ── */}
        <div className="space-y-5">
          {/* Export Compliance Score Card */}
          <Card className="p-5">
            <CardHeader
              title="Export Compliance Score"
              subtitle="Composite regulatory readiness"
              icon={ShieldCheck}
              action={<Badge variant="success" size="xs">92 / 100</Badge>}
            />

            <div className="flex items-center justify-center py-2 mb-4">
              <CircularProgress
                value={POLICY_COMPLIANCE_SCORE.overall}
                size={88}
                strokeWidth={7}
                variant="emerald"
              />
            </div>

            <div className="space-y-2.5">
              {POLICY_COMPLIANCE_SCORE.breakdown.map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-secondary">{item.name}</span>
                    <span className="font-mono font-bold text-primary">{item.score}%</span>
                  </div>
                  <Progress
                    value={item.score}
                    variant={item.status === 'verified' ? 'emerald' : 'amber'}
                    size="xs"
                  />
                  <span className="text-[10px] text-muted block">{item.note}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-muted">Clearance Status:</span>
              <span className="font-mono font-bold text-emerald-600">Green Channel Ready</span>
            </div>
          </Card>

          {/* Policy Evaluation Timeline */}
          <Card className="p-5">
            <CardHeader
              title="Policy Evaluation Timeline"
              subtitle="Verification sequence"
              icon={Clock}
            />

            <div className="space-y-3 relative pl-2">
              {POLICY_TIMELINE_STEPS.map((step, idx) => (
                <div key={step.id} className="relative flex items-start gap-3">
                  {idx < POLICY_TIMELINE_STEPS.length - 1 && (
                    <div className="absolute left-2.5 top-5 bottom-0 w-0.5 bg-[var(--color-border-base)]" />
                  )}

                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 z-10">
                    <Check size={11} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-primary">{step.title}</p>
                      <span className="text-[9px] font-mono text-muted">{step.time}</span>
                    </div>
                    <p className="text-[11px] text-muted mt-0.5 leading-tight">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
