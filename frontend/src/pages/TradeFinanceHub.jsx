import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, ShieldCheck, TrendingUp, Landmark, Calculator,
  ArrowRight, CheckCircle2, Clock, Percent, FileText
} from 'lucide-react';
import {
  Card, CardHeader, Button, Badge, Input, Select, Progress, useToast
} from '../components/ui';
import PageHeader from '../components/shared/PageHeader';
import enterpriseFeaturesService from '../services/enterpriseFeaturesService';

const CURRENCIES = [
  { value: 'USD', label: 'USD ($) — US Dollar' },
  { value: 'EUR', label: 'EUR (€) — Euro' },
  { value: 'GBP', label: 'GBP (£) — British Pound' },
  { value: 'AED', label: 'AED (د.إ) — UAE Dirham' }
];

const RATINGS = [
  { value: 'AAA', label: 'AAA — Prime Global Conglomerate (90% Advance)' },
  { value: 'AA', label: 'AA — Established High-Grade Importer (88% Advance)' },
  { value: 'A', label: 'A — Standard Solvent Wholesale Buyer (85% Advance)' },
  { value: 'BBB', label: 'BBB — Moderate Credit Risk (80% Advance)' },
  { value: 'BB', label: 'BB — Speculative / Higher Risk (70% Advance)' }
];

export default function TradeFinanceHub() {
  const toast = useToast();
  const [invoiceAmount, setInvoiceAmount] = useState(85000);
  const [currency, setCurrency] = useState('USD');
  const [terms, setTerms] = useState(90);
  const [buyerCountry, setBuyerCountry] = useState('United States');
  const [creditRating, setCreditRating] = useState('A');
  const [isEstimating, setIsEstimating] = useState(false);
  const [financeData, setFinanceData] = useState(null);

  const calculateFinance = async () => {
    setIsEstimating(true);
    try {
      const res = await enterpriseFeaturesService.estimateTradeFinance({
        invoice_amount: parseFloat(invoiceAmount) || 1000,
        currency,
        payment_terms_days: parseInt(terms) || 30,
        buyer_country: buyerCountry,
        buyer_credit_rating: creditRating
      });
      setFinanceData(res);
      toast.success('Finance Package Updated', 'TReDS factoring quotes and ECGC insurance calculated.');
    } catch {
      toast.error('Calculation Error', 'Failed to retrieve trade finance rates.');
    } finally {
      setIsEstimating(false);
    }
  };

  useEffect(() => {
    calculateFinance();
  }, [currency, creditRating]);

  const summary = financeData?.treds_factoring_summary;
  const hedging = financeData?.hedging_guidance;

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="TReDS Export Factoring & ECGC Credit Insurance Hub"
        subtitle="MSME working capital liquidity engine: unlock Day-1 invoice discounting on RBI-regulated TReDS platforms with ECGC buyer default protection."
        icon={Landmark}
        breadcrumb={['ExportEase', 'Trade & Finance', 'TReDS Factoring']}
        badge={<Badge variant="primary" size="sm" dot pulse>TReDS Platform Active</Badge>}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={Calculator}
            onClick={calculateFinance}
            loading={isEstimating}
          >
            Compute Advance Liquidity
          </Button>
        }
      />

      {/* Explanatory Banner */}
      <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 flex items-start gap-3">
        <Landmark className="text-indigo-400 shrink-0 mt-0.5" size={20} />
        <div className="text-xs text-text-muted space-y-1">
          <p className="font-semibold text-text-primary text-sm">Eliminate 90-Day MSME Payment Wait Times</p>
          <p>
            Under RBI guidelines, cross-border export factoring on <strong>RXIL, M1xchange, and Invoicemart</strong> enables non-recourse invoice discounting without tying up collateral credit limits.
          </p>
        </div>
      </div>

      {/* Form and Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-5 space-y-4">
          <Card padding="p-5">
            <CardHeader
              title="Export Bill Factoring Parameters"
              subtitle="Invoice particulars and buyer terms"
            />
            <div className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-text-muted block mb-1 font-medium">Invoice Face Value</label>
                  <Input
                    type="number"
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-text-muted block mb-1 font-medium">Currency</label>
                  <Select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    options={CURRENCIES}
                  />
                </div>
              </div>

              <div>
                <label className="text-text-muted block mb-1 font-medium">Overseas Buyer Solvency / Credit Rating</label>
                <Select
                  value={creditRating}
                  onChange={(e) => setCreditRating(e.target.value)}
                  options={RATINGS}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-text-muted block mb-1 font-medium">Credit Period (Days)</label>
                  <Input
                    type="number"
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-text-muted block mb-1 font-medium">Buyer Destination Country</label>
                  <Input
                    value={buyerCountry}
                    onChange={(e) => setBuyerCountry(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  className="w-full"
                  icon={Calculator}
                  onClick={calculateFinance}
                  loading={isEstimating}
                >
                  Generate Factoring Offer
                </Button>
              </div>
            </div>
          </Card>

          {/* Currency Hedging Strategy Card */}
          {hedging && (
            <Card padding="p-5" className="border-l-4 border-l-blue-500 bg-blue-950/10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-blue-400" size={18} />
                <h4 className="text-sm font-bold text-text-primary">FX Hedging Recommendation</h4>
              </div>
              <p className="text-xs text-text-muted mb-2">
                Strategy: <strong>{hedging.recommended_strategy}</strong> at guaranteed rate of <strong>₹{hedging.forward_rate_inr} / {currency}</strong>.
              </p>
              <p className="text-[11px] text-text-muted">
                {hedging.risk_hedged}
              </p>
            </Card>
          )}
        </div>

        {/* Right Column: Cash Liquidity & Waterfall */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="p-4 border-l-4 border-l-emerald-500">
              <span className="text-xs text-text-muted font-medium">Day-1 Net Cash Inflow</span>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                ${summary?.net_day1_liquidity_usd?.toLocaleString()}
              </div>
              <span className="text-[11px] text-emerald-300/80 block mt-1">
                ₹{((summary?.net_day1_liquidity_inr || 0) / 100000)?.toFixed(2)} Lakhs INR
              </span>
            </Card>

            <Card className="p-4 border-l-4 border-l-blue-500">
              <span className="text-xs text-text-muted font-medium">Advance Disbursal Rate</span>
              <div className="text-2xl font-extrabold text-blue-400 mt-1">
                {summary?.disbursal_percentage}%
              </div>
              <span className="text-[11px] text-text-muted block mt-1">
                Advance: ${summary?.upfront_advance_usd?.toLocaleString()}
              </span>
            </Card>

            <Card className="p-4 border-l-4 border-l-amber-500">
              <span className="text-xs text-text-muted font-medium">Total Discount + ECGC</span>
              <div className="text-2xl font-extrabold text-amber-400 mt-1">
                ${((summary?.factoring_cost_usd || 0) + (summary?.ecgc_insurance_premium_usd || 0))?.toLocaleString()}
              </div>
              <span className="text-[11px] text-text-muted block mt-1">
                7.5% p.a. + 0.48% insurance
              </span>
            </Card>
          </div>

          {/* Cash Waterfall Card */}
          <Card padding="p-5">
            <CardHeader
              title="Disbursement & Retention Waterfall"
              subtitle="Transparent breakdown of upfront cash, fees, and final settlement"
            />
            <div className="space-y-3 mt-4 text-xs">
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-text-primary font-medium">Gross Export Invoice Value</span>
                <span className="font-mono font-bold text-text-primary text-sm">
                  ${financeData?.gross_invoice?.amount_foreign?.toLocaleString()} (₹{((financeData?.gross_invoice?.amount_inr || 0) / 100000)?.toFixed(2)} L)
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span className="text-emerald-300 font-medium">Immediate Bank Transfer (Day 1)</span>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  +${summary?.net_day1_liquidity_usd?.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-text-muted">TReDS Platform Factoring Discount Fee (90 days @ 7.5% p.a.)</span>
                <span className="font-mono text-rose-400">
                  -${summary?.factoring_cost_usd?.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-text-muted">ECGC Comprehensive Buyer Default Insurance Premium (0.48%)</span>
                <span className="font-mono text-rose-400">
                  -${summary?.ecgc_insurance_premium_usd?.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-blue-400" />
                  <span className="text-blue-300 font-medium">Escrow Retention Released at Buyer Maturity (Day 90)</span>
                </div>
                <span className="font-mono font-bold text-blue-400 text-sm">
                  +${summary?.retention_reserve_due_at_maturity_usd?.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
