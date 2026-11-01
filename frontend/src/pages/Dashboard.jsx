import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FolderKanban, Plus, Sparkles, ShieldCheck, FileText,
  AlertTriangle, ArrowRight, Building2, Globe, CheckCircle2,
  Clock, Activity, Bot, ChevronRight, Scale, Search,
  TrendingUp, Users, DollarSign, Award, Calendar, Truck,
  BarChart3, CheckSquare, Compass, Shield, ArrowUpRight,
  ExternalLink, Layers, Radio, PackageCheck, FileCheck2, Leaf, Bell, Landmark
} from 'lucide-react';
import {
  Button, Card, CardHeader, Badge, Progress,
  ConfidenceBadge, RiskBadge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell
} from '../components/ui';
import { AgentTrace, NextBestAction } from '../components/intelligence';
import { PROJECTS_REGISTRY } from '../data/projectsData';
import { AI_AGENTS } from '../data/agentsData';
import { COMPANY } from '../data/dashboardData';
import { useEvidence } from '../context/EvidenceContext';
import { useAuth } from '../context/AuthContext';
import projectService from '../services/projectService';
import {
  fadeInUp,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  staggerContainer,
  staggerItem,
  tableRowVariant,
  viewportOnce,
  EASE_OUT_EXPO,
} from '../components/animations';

export default function Dashboard() {
  const navigate = useNavigate();
  const { openEvidence } = useEvidence();
  const { user } = useAuth();

  const [greeting, setGreeting] = useState('Good morning');
  const [projectsList, setProjectsList] = useState(PROJECTS_REGISTRY);

  useEffect(() => {
    const h = new Date().getHours();
    if (h >= 12 && h < 17) setGreeting('Good afternoon');
    else if (h >= 17) setGreeting('Good evening');

    // Fetch projects from backend if available
    projectService.getProjects().then((projs) => {
      if (Array.isArray(projs) && projs.length > 0) {
        const mapped = projs.map((p, idx) => {
          const matchExisting = PROJECTS_REGISTRY.find(r => String(r.id) === String(p.id)) || PROJECTS_REGISTRY[idx % PROJECTS_REGISTRY.length];
          return {
            ...matchExisting,
            id: p.id || matchExisting.id,
            title: p.project_name || matchExisting.title,
            destinationCountry: p.destination_country || matchExisting.destinationCountry,
            progress: p.completion_percentage ? Math.round(p.completion_percentage) : matchExisting.progress,
            status: p.status || matchExisting.status,
          };
        });
        setProjectsList(mapped);
      }
    });
  }, []);

  const companyName = user?.companyName || COMPANY.name;
  const companyOrigin = user?.origin || COMPANY.origin;

  const MODULE_CONTAINERS = [
    {
      id: 'hs-code',
      title: 'HS Code & Classification',
      category: 'Statutory Core',
      icon: Search,
      path: '/hs-finder',
      badge: 'ITC-HS 2026',
      badgeVariant: 'primary',
      description: 'AI-assisted tariff determination and 8-digit schedule classification with DGFT verification.',
      metric: '99.4% Accuracy',
      metricLabel: 'Classification Confidence',
      stats: [
        { label: 'Active Codes', val: 'Multi-Chapter' },
        { label: 'Avg Tariff', val: '0% – 4.2%' },
        { label: 'DGFT Match', val: 'Verified' }
      ],
      actionText: 'Search HS Codes',
      highlightColor: 'from-blue-500/10 to-indigo-500/10 border-blue-500/30'
    },
    {
      id: 'product-analysis',
      title: 'Product Export Feasibility',
      category: 'Market Readiness',
      icon: PackageCheck,
      path: '/product-analysis',
      badge: 'Analysis Ready',
      badgeVariant: 'success',
      description: 'Technical barrier validation, packaging norms, and destination lab compliance assessment.',
      metric: 'Multi-SKU Support',
      metricLabel: 'Export Verification',
      stats: [
        { label: 'Lab Reports', val: 'Auto-Validated' },
        { label: 'RoHS / REACH', val: 'Compliant' },
        { label: 'Shelf-Life', val: 'Tracked' }
      ],
      actionText: 'Analyze Product',
      highlightColor: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/30'
    },
    {
      id: 'market-intelligence',
      title: 'Global Market Intelligence',
      category: 'Trade Analytics',
      icon: Globe,
      path: '/market-intelligence',
      badge: 'Live Data',
      badgeVariant: 'warning',
      description: 'Real-time global demand benchmarks, competitive pricing analytics, and import volume tracking.',
      metric: 'Global Coverage',
      metricLabel: 'Market Intelligence Pool',
      stats: [
        { label: 'Markets Tracked', val: '180+ Countries' },
        { label: 'Price Analytics', val: 'Real-time' },
        { label: 'Import Volumes', val: 'Live Feed' }
      ],
      actionText: 'Explore Markets',
      highlightColor: 'from-indigo-500/10 to-purple-500/10 border-indigo-500/30'
    },
    {
      id: 'buyer-discovery',
      title: 'Verified Buyer Intelligence',
      category: 'Commercial',
      icon: Users,
      path: '/buyer-discovery',
      badge: 'Verified Buyers',
      badgeVariant: 'success',
      description: 'Curated international importers with verified credit scores, compliance records, and direct RFQs.',
      metric: 'High Trust Score',
      metricLabel: 'Average Credit Rating',
      stats: [
        { label: 'Active RFQs', val: 'Dynamic' },
        { label: 'Avg Order', val: 'Enterprise Scale' },
        { label: 'Verification', val: 'Dual-Source' }
      ],
      actionText: 'Discover Buyers',
      highlightColor: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30'
    },
    {
      id: 'document-procedure',
      title: 'Documentation & Customs Filing',
      category: 'Customs & Port EDI',
      icon: FileText,
      path: '/documents',
      badge: 'ICEGATE Ready',
      badgeVariant: 'primary',
      description: 'Step-by-step statutory customs filing: Shipping Bills, Invoices, Bills of Lading, and Certificates of Origin.',
      metric: 'Full Coverage',
      metricLabel: 'Document Status',
      stats: [
        { label: 'Shipping Bill', val: 'ICEGATE EDI' },
        { label: 'COO Status', val: 'Certifiable' },
        { label: 'Errors', val: 'AI-Checked' }
      ],
      actionText: 'Manage Documents',
      highlightColor: 'from-blue-500/10 to-cyan-500/10 border-blue-500/30'
    },
    {
      id: 'compliance-center',
      title: 'Compliance & Certifications',
      category: 'Regulatory',
      icon: ShieldCheck,
      path: '/compliance',
      badge: 'Compliance Active',
      badgeVariant: 'success',
      description: 'DGFT, APEDA, FSSAI, CE Marking, and FDA official certificate verification and tracking.',
      metric: 'Zero Violations',
      metricLabel: 'Compliance Standing',
      stats: [
        { label: 'Certificates', val: 'Managed' },
        { label: 'Renewal', val: 'Auto-Alert' },
        { label: 'Audits', val: 'Immutable' }
      ],
      actionText: 'Open Compliance',
      highlightColor: 'from-teal-500/10 to-emerald-500/10 border-teal-500/30'
    },
    {
      id: 'export-roadmap',
      title: 'Export Roadmap & Milestones',
      category: 'Execution Pipeline',
      icon: Compass,
      path: '/roadmap',
      badge: 'Pipeline Active',
      badgeVariant: 'primary',
      description: 'End-to-end execution timeline from factory gate to port delivery and payment settlement.',
      metric: 'On Schedule',
      metricLabel: 'Timeline Progress',
      stats: [
        { label: 'Next Milestone', val: 'Port Clearance' },
        { label: 'ETA Delivery', val: 'Tracked' },
        { label: 'Stage Status', val: 'Active' }
      ],
      actionText: 'View Roadmap',
      highlightColor: 'from-amber-500/10 to-orange-500/10 border-amber-500/30'
    },
    {
      id: 'currency-risk',
      title: 'Currency & Forex Risk',
      category: 'Financial Protection',
      icon: DollarSign,
      path: '/currency-risk',
      badge: 'Hedging Advisor',
      badgeVariant: 'warning',
      description: 'Real-time FX rates, spot vs forward hedging analysis, and profit protection modeling.',
      metric: 'Live FX Rates',
      metricLabel: 'Exchange Intelligence',
      stats: [
        { label: 'Exposure', val: 'Monitored' },
        { label: 'Hedge Coverage', val: 'AI-Optimized' },
        { label: 'Margin', val: 'Protected' }
      ],
      actionText: 'Manage Forex Risk',
      highlightColor: 'from-amber-500/10 to-yellow-500/10 border-amber-500/30'
    },
    {
      id: 'trade-policies',
      title: 'Trade Policies & FTA Optimizer',
      category: 'Tariff Optimization',
      icon: Scale,
      path: '/trade-policies',
      badge: 'FTA Active',
      badgeVariant: 'success',
      description: 'India FTA portfolio optimization: duty reduction matrices across CEPA, ECTA, and GSP frameworks.',
      metric: 'Duty Savings',
      metricLabel: 'Treaty Optimization',
      stats: [
        { label: 'RoDTEP', val: 'Claimed' },
        { label: 'Treaty Lanes', val: 'Multi-Country' },
        { label: 'Duty Benefit', val: 'Maximized' }
      ],
      actionText: 'Review Treaties',
      highlightColor: 'from-purple-500/10 to-pink-500/10 border-purple-500/30'
    },
    {
      id: 'shipment-tracking',
      title: 'Live Logistics & Shipment Flow',
      category: 'Supply Chain',
      icon: Truck,
      path: '/global-metrics',
      badge: 'Live Tracking',
      badgeVariant: 'primary',
      description: 'Vessel AIS tracking, container statuses at major global ports, and real-time logistics intelligence.',
      metric: 'Global Ports',
      metricLabel: 'Logistics Coverage',
      stats: [
        { label: 'Carrier Intel', val: 'Top Liners' },
        { label: 'Sea Lanes', val: 'All Routes' },
        { label: 'Air Freight', val: 'Tracked' }
      ],
      actionText: 'Track Shipments',
      highlightColor: 'from-cyan-500/10 to-teal-500/10 border-cyan-500/30'
    },
    {
      id: 'demand-forecast',
      title: 'Demand Forecast & Revenue',
      category: 'Predictive Analytics',
      icon: TrendingUp,
      path: '/demand-forecast',
      badge: 'Predictive AI',
      badgeVariant: 'warning',
      description: 'Predictive seasonal volume models, quota planning, and export revenue forecasting.',
      metric: 'AI Forecast',
      metricLabel: 'Revenue Intelligence',
      stats: [
        { label: 'Models', val: 'ML-Powered' },
        { label: 'Surge Season', val: 'Auto-Detected' },
        { label: 'Accuracy', val: '±8% Range' }
      ],
      actionText: 'View Forecast',
      highlightColor: 'from-emerald-500/10 to-cyan-500/10 border-emerald-500/30'
    },
    {
      id: 'verified-sources',
      title: 'Verified Regulatory Sources',
      category: 'Audit & Intelligence',
      icon: Award,
      path: '/sources',
      badge: 'Official Sources',
      badgeVariant: 'primary',
      description: 'Auditable legal citations from DGFT, CBIC ICEGATE, RBI FEMA, WTO, and international trade portals.',
      metric: '14+ Sources',
      metricLabel: 'Official API Streams',
      stats: [
        { label: 'ICEGATE EDI', val: 'Live Sync' },
        { label: 'DGFT Alerts', val: 'Real-time' },
        { label: 'Audit Trail', val: 'Immutable' }
      ],
      actionText: 'Inspect Sources',
      highlightColor: 'from-blue-500/10 to-indigo-500/10 border-blue-500/30'
    },
    {
      id: 'document-audit',
      title: 'OCR Discrepancy Audit Studio',
      category: 'Zero-Error Customs EDI',
      icon: FileCheck2,
      path: '/document-audit',
      badge: 'ICEGATE 2.0',
      badgeVariant: 'danger',
      description: 'Cross-verifies Commercial Invoice, Bill of Lading, and LC to prevent ICEGATE rejections.',
      metric: '0% Variance',
      metricLabel: 'Tolerance Checking',
      stats: [
        { label: 'HS Sync', val: 'Automated' },
        { label: 'Weight Diff', val: '±1% Cap' },
        { label: 'LC Cap', val: 'UCP 600' }
      ],
      actionText: 'Audit Documents',
      highlightColor: 'from-rose-500/10 to-red-500/10 border-rose-500/30'
    },
    {
      id: 'cbam-calculator',
      title: 'EU CBAM Carbon Border Tax',
      category: 'ESG & Decarbonization',
      icon: Leaf,
      path: '/cbam-calculator',
      badge: 'EU ETS €78.5/t',
      badgeVariant: 'warning',
      description: 'Embedded emissions (tCO2e) calculator and carbon border adjustment tax liability estimator.',
      metric: 'Scope 1, 2, 3',
      metricLabel: 'Carbon Intensity',
      stats: [
        { label: 'Direct GHG', val: 'Process tCO2e' },
        { label: 'Indirect Grid', val: 'CEA Factor' },
        { label: 'Tax Savings', val: 'Up to 58%' }
      ],
      actionText: 'Calculate CBAM',
      highlightColor: 'from-emerald-500/10 to-green-500/10 border-emerald-500/30'
    },
    {
      id: 'regulatory-radar',
      title: 'DGFT Regulatory Change Radar',
      category: 'Customs & Trade Alerts',
      icon: Bell,
      path: '/regulatory-radar',
      badge: 'Live Radar',
      badgeVariant: 'primary',
      description: 'Instant alerts on DGFT Public Notices, MEP export floors, and CBIC Customs Circulars.',
      metric: 'Real-Time',
      metricLabel: 'Policy Tracking',
      stats: [
        { label: 'DGFT EDI', val: 'Live Sync' },
        { label: 'MEP Floors', val: 'Monitored' },
        { label: 'RoDTEP', val: 'Updated' }
      ],
      actionText: 'View Radar',
      highlightColor: 'from-blue-500/10 to-cyan-500/10 border-blue-500/30'
    },
    {
      id: 'trade-finance',
      title: 'TReDS Factoring & ECGC Cover',
      category: 'MSME Export Liquidity',
      icon: Landmark,
      path: '/trade-finance',
      badge: '85% Advance',
      badgeVariant: 'success',
      description: 'Day-1 MSME invoice discounting on RBI-regulated TReDS platforms with ECGC buyer default protection.',
      metric: '7.5% p.a.',
      metricLabel: 'Factoring Rate',
      stats: [
        { label: 'Cash Inflow', val: 'Day-1 Disbursal' },
        { label: 'ECGC Cover', val: '90% Risk' },
        { label: 'FX Lock', val: 'Forward Quote' }
      ],
      actionText: 'Estimate Advance',
      highlightColor: 'from-indigo-500/10 to-emerald-500/10 border-indigo-500/30'
    }
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* 1. Header & Quick Actions */}
      <motion.div
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        variants={staggerContainer(0.08, 0.05)}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={staggerItem}>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold text-xs border border-blue-200 dark:border-blue-800">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              AI Export Intelligence — System Active
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-highlight, var(--text-primary))' }}>
            {greeting}, {user?.name || 'Trade Manager'}.
          </h1>
          <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Enterprise Trade Command Center —{' '}
            <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{companyName}</strong>
            {companyOrigin && <span style={{ color: 'var(--text-muted)' }}> · {companyOrigin}</span>}
          </p>
        </motion.div>

        <motion.div className="flex items-center gap-2.5" variants={staggerItem}>
          <Button
            variant="secondary"
            size="sm"
            icon={Bot}
            onClick={() => navigate('/ai-consultant')}
          >
            AI Assistant
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => window.dispatchEvent(new CustomEvent('exportease:open-strategy'))}
          >
            New Analysis
          </Button>
        </motion.div>
      </motion.div>

      {/* 2. Top KPI Metric Summary Cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full"
        variants={staggerContainer(0.09, 0.1)}
        initial="hidden"
        animate="visible"
      >
        {[
          {
            label: 'Active Trade Projects',
            value: '3',
            badge: 'In Progress',
            badgeClass: 'text-blue-700 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
            sub: 'Multi-corridor export operations',
            icon: FolderKanban
          },
          {
            label: 'Compliance Readiness',
            value: '94%',
            valueClass: 'text-emerald-500 dark:text-emerald-400',
            badge: 'Verified',
            badgeClass: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
            sub: 'Regulatory checks passed',
            icon: ShieldCheck
          },
          {
            label: 'Pending Action Items',
            value: '1',
            badge: 'Attention Needed',
            badgeClass: 'text-amber-700 bg-amber-50 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
            sub: 'Document awaiting inspection',
            icon: FileText
          },
          {
            label: 'Forex Hedge Coverage',
            value: '65%',
            valueClass: 'text-blue-500 dark:text-blue-400',
            badge: 'Hedging Active',
            badgeClass: 'text-blue-700 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
            sub: 'Forward contract coverage',
            icon: DollarSign
          },
        ].map((kpi) => (
          <motion.div
            key={kpi.label}
            variants={staggerItem}
            whileHover={{ y: -3, transition: { duration: 0.2, ease: 'easeOut' } }}
            whileTap={{ scale: 0.985 }}
          >
            <Card className="p-5 flex flex-col justify-between h-full border border-[var(--color-border-base)] shadow-xs">
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  {kpi.label}
                </span>
                <div className="p-2 rounded-lg bg-[var(--color-surface-subtle)]" style={{ color: 'var(--text-accent)' }}>
                  <kpi.icon size={16} />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className={`text-3xl font-extrabold tabular-nums tracking-tight ${kpi.valueClass || ''}`}
                      style={!kpi.valueClass ? { color: 'var(--text-highlight, var(--text-primary))' } : {}}>
                  {kpi.value}
                </span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${kpi.badgeClass}`}>
                  {kpi.badge}
                </span>
              </div>

            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* 3. Next Best Action Callout */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: 0.25 }}
      >
        <NextBestAction
          title="Review destination certification requirement for active consignment"
          description="Customs clearance requires phytosanitary inspection slip and REX statement to activate preferential tariff at destination port. Estimated processing: 1–2 business days."
          urgency="High Priority"
          actionLabel="Review Requirement"
          onAction={() => navigate('/compliance')}
          evidence={{
            authority: 'Regulatory Authority & Trade Commission',
            document: 'Generalised Scheme of Preferences (GSP) & Phytosanitary Norms',
            section: 'Import Quality Criteria — Active Chapter',
            verificationStatus: 'Officially Verified Source',
            confidence: 98,
            excerpt: 'Exported products granted preferential duty rate upon submission of applicable registration and lab certification.',
          }}
        />
      </motion.div>

      {/* 4. Platform Module Grid */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2"
                style={{ color: 'var(--text-highlight, var(--text-primary))' }}>
              <Layers size={18} className="text-blue-500" />
              Platform Intelligence Modules
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Complete operational suite — statutory compliance, commercial intelligence, and freight logistics
            </p>
          </div>
          <Badge variant="primary" size="xs" dot>12 Active Modules</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {MODULE_CONTAINERS.map((mod) => {
            const ModIcon = mod.icon;
            return (
              <motion.div
                key={mod.id}
                whileHover={{ y: -4, transition: { duration: 0.18, ease: 'easeOut' } }}
                whileTap={{ scale: 0.99 }}
                className="group cursor-pointer"
                onClick={() => navigate(mod.path)}
              >
                <Card className={`p-5 flex flex-col justify-between h-full relative overflow-hidden transition-all duration-200 hover:shadow-lg border border-[var(--color-border-base)] bg-gradient-to-br ${mod.highlightColor}`}>
                  {/* Top Bar inside Card */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border-base)] text-blue-500 dark:text-blue-400 group-hover:scale-105 transition-transform">
                          <ModIcon size={20} />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest block mb-0.5"
                                style={{ color: 'var(--text-muted)' }}>
                            {mod.category}
                          </span>
                          <h3 className="text-sm font-bold leading-tight group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors"
                              style={{ color: 'var(--text-primary)' }}>
                            {mod.title}
                          </h3>
                        </div>
                      </div>

                      <Badge variant={mod.badgeVariant} size="xs">
                        {mod.badge}
                      </Badge>
                    </div>


                    {/* Key Metric Highlight */}
                    <div className="mt-4 p-3 rounded-xl bg-[var(--color-surface-card)]/80 backdrop-blur-xs border border-[var(--color-border-base)] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-semibold block mb-0.5"
                              style={{ color: 'var(--text-muted)' }}>
                          {mod.metricLabel}
                        </span>
                        <span className="text-sm font-extrabold" style={{ color: 'var(--text-primary)' }}>
                          {mod.metric}
                        </span>
                      </div>
                      <div className="h-8 w-px" style={{ background: 'var(--border-subtle)' }} />
                      <div className="text-right">
                        <span className="text-[10px] uppercase tracking-wider font-semibold block mb-0.5"
                              style={{ color: 'var(--text-muted)' }}>Status</span>
                        <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 size={12} /> Active
                        </span>
                      </div>
                    </div>


                  </div>

                  {/* Bottom Action Footer */}
                  <div className="mt-4 pt-3 border-t border-[var(--color-border-base)] flex items-center justify-between text-xs font-bold text-blue-500 dark:text-blue-400">
                    <span>{mod.actionText}</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>



      {/* 6. Live Multi-Agent Activity & Risk Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Agent Activity */}
        <motion.div
          className="lg:col-span-7 space-y-3"
          variants={fadeInLeft}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2"
                style={{ color: 'var(--text-primary)' }}>
              <Bot size={16} className="text-blue-500" />
              Autonomous AI Agent Network
            </h3>
            <Badge variant="primary" size="xs" dot pulse>Live</Badge>
          </div>

          <Card className="p-5 space-y-4 border border-[var(--color-border-base)]">
            <AgentTrace />
          </Card>
        </motion.div>

        {/* Right: Risk Overview */}
        <motion.div
          className="lg:col-span-5 space-y-3"
          variants={fadeInRight}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2"
                style={{ color: 'var(--text-primary)' }}>
              <Shield size={16} className="text-emerald-500" />
              Trade Risk Scorecard
            </h3>
            <Button variant="ghost" size="xs" onClick={() => navigate('/risk')}>
              Risk Center →
            </Button>
          </div>

          <Card className="p-5 space-y-3.5 border border-[var(--color-border-base)]">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border-base)]">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Overall Risk Index
              </span>
              <RiskBadge level="low" score={18} size="xs" />
            </div>

            <div className="space-y-3 text-xs">
              {[
                { label: 'Regulatory & Sanctions', value: 'Cleared', color: 'text-emerald-500 dark:text-emerald-400' },
                { label: 'Document Integrity', value: 'Validated', color: 'text-emerald-500 dark:text-emerald-400' },
                { label: 'Forex Exposure', value: 'Hedging Advised', color: 'text-amber-500 dark:text-amber-400' },
                { label: 'Destination Port Flow', value: 'Normal Transit', color: 'text-emerald-500 dark:text-emerald-400' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>{item.label}:</span>
                  <span className={`font-bold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[var(--color-border-base)]">
              <Button
                variant="outline"
                size="xs"
                fullWidth
                onClick={() => navigate('/risk')}
              >
                View Full Risk Report
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
