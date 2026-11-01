import React, { useState } from 'react';
import {
  Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Download,
  Send, Globe, DollarSign, Users, ShieldCheck, Layers, Eye,
  FileText, Shield, Scale, Hash
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip
} from 'recharts';

import {
  Button, Card, CardHeader, CardFooter, Badge, Input, Search,
  Dropdown, Tabs, Modal, Tooltip, Progress, CircularProgress,
  StatusIndicator, useToast, ConfidenceBadge, RiskBadge, Alert
} from '../components/ui';
import PageHeader from '../components/shared/PageHeader';

const mockChartData = [
  { month: 'Jan', val: 4200 },
  { month: 'Feb', val: 5100 },
  { month: 'Mar', val: 4800 },
  { month: 'Apr', val: 6200 },
  { month: 'May', val: 7800 },
  { month: 'Jun', val: 8400 },
];

export default function DesignSystem() {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [pillTab, setPillTab] = useState('overview');
  const [underlineTab, setUnderlineTab] = useState('live');
  const [cardTab, setCardTab] = useState('eu');
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="space-y-10 pb-16">
      <PageHeader
        title="Enterprise Design System & Component Primitives"
        subtitle="Refactored light-mode design tokens and UI architecture engineered for Indian MSME export intelligence."
        icon={Layers}
        breadcrumb={['ExportEase', 'Design System']}
        badge={<Badge variant="primary" size="sm" dot>Enterprise v2.0</Badge>}
        actions={
          <Button
            variant="ai"
            size="sm"
            icon={Sparkles}
            onClick={() => toast.ai('TradeAI Copilot Active', 'Design system tokens and components ready.')}
          >
            Trigger AI Toast
          </Button>
        }
      />

      {/* 1. Typography & Colors */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-base pb-2">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider">1. Brand Colors & Status Tokens</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: 'Deep Navy', hex: '#0B1736', bg: 'bg-[#0B1736]' },
            { label: 'Primary Blue', hex: '#1746D2', bg: 'bg-[#1746D2]' },
            { label: 'Accent Blue', hex: '#3B82F6', bg: 'bg-[#3B82F6]' },
            { label: 'Canvas App', hex: '#FAFAFA', bg: 'bg-transparent' },
            { label: 'Surface White', hex: '#FFFFFF', bg: 'bg-surface-card backdrop-blur-md' },
            { label: 'Border Subtle', hex: '#E2E8F0', bg: 'bg-[#E2E8F0]' },
            { label: 'Trade Success', hex: '#16A34A', bg: 'bg-[#16A34A]' },
            { label: 'Forex Warning', hex: '#F59E0B', bg: 'bg-[#F59E0B]' },
            { label: 'Risk Error', hex: '#DC2626', bg: 'bg-[#DC2626]' },
          ].map((c) => (
            <Card key={c.label} padding="p-3" className="flex flex-col gap-2">
              <div className={`w-full h-10 rounded-lg ${c.bg} border border-base`} />
              <div>
                <p className="text-xs font-semibold text-primary truncate">{c.label}</p>
                <p className="text-[10px] font-mono text-muted">{c.hex}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 2. Buttons */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-base pb-2">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider">2. Button Variants & Sizes</h2>
        </div>
        <Card className="space-y-5 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" icon={Send}>Primary Action</Button>
            <Button variant="navy" icon={ShieldCheck}>Navy Brand</Button>
            <Button variant="secondary" icon={Globe}>Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="ai" icon={Sparkles}>AI Copilot</Button>
            <Button variant="success" icon={CheckCircle2}>Duty Free</Button>
            <Button variant="danger" icon={AlertTriangle}>High Risk</Button>
            <Button variant="primary" loading>Processing</Button>
            <Button variant="secondary" kbd="⌘K">Quick Search</Button>
          </div>
        </Card>
      </section>

      {/* 3. Badges & Indicators */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-base pb-2">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider">3. Badges & Confidence Metrics</h2>
        </div>
        <Card className="space-y-5 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="primary" dot pulse>Live Trade</Badge>
            <Badge variant="navy">DGFT Gazette</Badge>
            <Badge variant="success" dot>0% CEPA Concession</Badge>
            <Badge variant="warning" dot>Forex Volatility</Badge>
            <Badge variant="danger" dot>Sanction Watch</Badge>
            <ConfidenceBadge score={98} size="sm" />
            <ConfidenceBadge score={84} size="sm" />
            <ConfidenceBadge score={62} size="sm" />
            <RiskBadge level="low" score={14} size="sm" />
            <RiskBadge level="medium" score={48} size="sm" />
            <RiskBadge level="high" score={78} size="sm" />
          </div>
        </Card>
      </section>

      {/* 4. Alert Callouts */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-base pb-2">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider">4. Enterprise Callouts</h2>
        </div>
        <div className="space-y-3">
          <Alert variant="info" title="Tariff Notification (CEPA 2025)">
            Woven cotton apparel exported to Jebel Ali Port qualifies for immediate 0% customs duty under India-UAE CEPA Annex 2B.
          </Alert>
          <Alert variant="success" title="Document Consistency Verified">
            100% data reconciliation between Commercial Invoice #EXP-2026-0842 and ICEGATE Shipping Bill.
          </Alert>
          <Alert variant="warning" title="Forex Exposure Advisory">
            USD/INR volatility observed over last 48h. Booking 60% forward contract recommended.
          </Alert>
        </div>
      </section>
    </div>
  );
}
