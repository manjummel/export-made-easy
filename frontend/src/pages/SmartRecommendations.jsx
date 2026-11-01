import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, ShieldCheck, DollarSign, Globe, ArrowRight } from 'lucide-react';
import { Button, Card, Badge } from '../components/ui';
import PageHeader from '../components/shared/PageHeader';

export default function SmartRecommendations() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Smart Recommendations"
        subtitle="AI-synthesized trade recommendations to optimize margins, claim 0% tariffs, and find high-intent buyers."
        icon={Sparkles}
        breadcrumb={['ExportEase', 'Smart Recommendations']}
        badge={<Badge variant="primary" size="sm" dot>DeepSeek Neural Advisor</Badge>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: 'Claim 0% Preferential Duty in UAE', desc: 'File Form AI Certificate of Origin before consignment departure to save 5% import duty at Jebel Ali Port.', impact: 'High Impact · ₹42,000 Savings', path: '/documents' },
          { title: 'Lock USD/INR 60-Day Forward Rate', desc: 'Secure ₹84.85 forward exchange rate to hedge open $84,000 receivable against currency swings.', impact: 'Risk Reduction', path: '/currency-risk' },
          { title: 'Target High-Demand Buyers in Germany', desc: '3 Dun & Bradstreet accredited buyers in Hamburg are actively searching for organic cotton textiles.', impact: 'Growth Corridor', path: '/buyer-discovery' },
          { title: 'Submit RoDTEP Cash Incentive Claim', desc: 'File 2.5% RoDTEP cash rebate claim on ICEGATE Shipping Bill #EXP-2026-0842.', impact: 'Cash Incentive', path: '/compliance' },
        ].map((rec) => (
          <Card key={rec.title} className="p-5 space-y-3 bg-gradient-to-r from-blue-50/50 via-white to-slate-50 border-indigo-900/50">
            <div className="flex items-center justify-between">
              <Badge variant="primary" size="xs">{rec.impact}</Badge>
              <Sparkles size={16} className="text-[#1746D2]" />
            </div>
            <h3 className="text-sm font-bold text-primary">{rec.title}</h3>
            <p className="text-xs text-muted leading-relaxed">{rec.desc}</p>
            <div className="pt-2">
              <Button variant="primary" size="xs" icon={ArrowRight} onClick={() => navigate(rec.path)}>
                Take Action
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
