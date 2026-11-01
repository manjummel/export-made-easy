import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Sparkles, Globe, TrendingUp, ShieldCheck, Users,
  DollarSign, Package, ArrowRight, X, FastForward,
  CheckCircle2, FileText, Award
} from 'lucide-react';

import { Button, Badge } from '../ui';
import { AIOrb } from '../ai';
import { COMPANY } from '../../data/dashboardData';

const STAGES = [
  {
    id: 1,
    title: 'Analyzing your product...',
    subtitle: 'Extracting HS 6205.20 classification & Tamil Nadu manufacturing capacity',
    icon: Package,
    color: '#3b82f6',
    progress: 16,
  },
  {
    id: 2,
    title: 'Scanning global markets...',
    subtitle: 'Benchmarking 47 destination trade lanes across import appetite & tariffs',
    icon: Globe,
    color: '#06b6d4',
    progress: 33,
  },
  {
    id: 3,
    title: 'Evaluating demand & growth...',
    subtitle: 'Analyzing multi-year import volumes, seasonality & consumer trends',
    icon: TrendingUp,
    color: '#10b981',
    progress: 50,
  },
  {
    id: 4,
    title: 'Checking export requirements...',
    subtitle: 'Verifying India-UAE CEPA 0% tariff rules & DGFT Form AI eligibility',
    icon: ShieldCheck,
    color: '#6366f1',
    progress: 67,
  },
  {
    id: 5,
    title: 'Finding potential buyers...',
    subtitle: 'Filtering 128 verified B2B importers by MOQ, credit rating & price point',
    icon: Users,
    color: '#8b5cf6',
    progress: 84,
  },
  {
    id: 6,
    title: 'Evaluating currency exposure...',
    subtitle: 'Calculating USD/AED exchange rate volatility & forward hedging yield',
    icon: DollarSign,
    color: '#f59e0b',
    progress: 100,
  },
];

export default function AIStrategyExperience({ isOpen, onClose }) {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  // Sequence controller: each stage runs ~800ms
  useEffect(() => {
    if (!isOpen) {
      setCurrentStageIdx(0);
      setIsRevealed(false);
      return;
    }

    if (shouldReduceMotion) {
      setIsRevealed(true);
      return;
    }

    let timer;
    if (currentStageIdx < STAGES.length - 1) {
      timer = setTimeout(() => {
        setCurrentStageIdx((prev) => prev + 1);
      }, 750);
    } else {
      timer = setTimeout(() => {
        setIsRevealed(true);
      }, 900);
    }

    return () => clearTimeout(timer);
  }, [isOpen, currentStageIdx, shouldReduceMotion]);

  if (!isOpen) return null;

  const currentStage = STAGES[currentStageIdx];
  const StageIcon = currentStage?.icon || Sparkles;

  const handleSkip = () => {
    setIsRevealed(true);
  };

  const handleAction = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Deep cinematic backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#040711]/95 backdrop-blur-2xl"
          onClick={onClose}
        />

        {/* Ambient background glows */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
        </div>

        {/* Content Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-3xl rounded-3xl border border-[#1e2f54] bg-[#070c1a] shadow-2xl overflow-hidden my-auto"
        >
          {/* Top Bar with Close & Skip */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#142038] bg-[#080d1e]/80">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-primary shadow-md">
                <Sparkles size={14} />
              </div>
              <div>
                <span className="text-xs font-bold text-primary tracking-tight">ExportEase AI Strategy Engine</span>
                <span className="text-[10px] text-muted block font-mono">Profile: {COMPANY.name}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isRevealed && (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="flex items-center gap-1 text-[11px] font-medium text-muted hover:text-primary px-2.5 py-1 rounded-lg bg-[#101b33] border border-[#1b2b4e] transition-colors"
                >
                  <FastForward size={12} />
                  <span>Skip analysis</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-[#121c33] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              STAGE VIEW: 6-STEP ANIMATED ANALYSIS (4-5 SECONDS)
          ══════════════════════════════════════════════════════════ */}
          {!isRevealed ? (
            <div className="p-8 sm:p-14 flex flex-col items-center justify-center text-center space-y-8 min-h-[460px]">
              {/* Dynamic AI Orb with animated pulse */}
              <div className="relative">
                <AIOrb status="thinking" size="lg" />

                {/* Floating stage icon badge */}
                <motion.div
                  key={currentStage.id}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-[#0b1328] border border-blue-400/40 text-blue-400 shadow-lg"
                >
                  <StageIcon size={18} />
                </motion.div>
              </div>

              {/* Dynamic Stage Text */}
              <div className="space-y-2 max-w-md">
                <div className="flex items-center justify-center gap-2">
                  <Badge variant="ai" size="xs">Stage {currentStage.id} of 6</Badge>
                  <span className="text-[10px] font-mono text-[var(--color-muted)]">Neural Trade Synthesis</span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.h3
                    key={currentStage.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="text-xl sm:text-2xl font-bold text-primary tracking-tight"
                  >
                    {currentStage.title}
                  </motion.h3>
                </AnimatePresence>

                <p className="text-xs text-muted leading-relaxed font-mono">
                  {currentStage.subtitle}
                </p>
              </div>

              {/* Progress Bar & Stage Nodes */}
              <div className="w-full max-w-md space-y-3">
                <div className="w-full h-1.5 rounded-full bg-[#121c33] overflow-hidden">
                  <motion.div
                    animate={{ width: `${currentStage.progress}%` }}
                    transition={{ duration: 0.4 }}
                    className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400"
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] text-[var(--color-muted)] font-mono">
                  {STAGES.map((s) => (
                    <span
                      key={s.id}
                      className={currentStage.id >= s.id ? 'text-blue-400 font-bold' : 'text-[var(--color-muted)]'}
                    >
                      {s.id <= currentStage.id ? '✓' : `0${s.id}`}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ══════════════════════════════════════════════════════════
                FINAL REVEAL SCREEN: "YOUR AI EXPORT STRATEGY"
            ══════════════════════════════════════════════════════════ */
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto scrollbar-none"
            >
              {/* Reveal Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#16233d] pb-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="success" size="xs" dot pulse>AI Analysis Complete</Badge>
                    <span className="text-xs font-mono text-muted">Validated: {COMPANY.product}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
                    Your AI Export Strategy
                  </h2>
                  <p className="text-xs text-muted">
                    Comprehensive market entry blueprint generated from 47 global trade data feeds
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 p-3 rounded-2xl bg-[#09142b] border border-blue-500/30">
                  <span className="text-3xl">🇦🇪</span>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted block">Top Target Market</span>
                    <span className="text-sm font-bold text-primary">United Arab Emirates</span>
                  </div>
                  <span className="text-xl font-bold font-mono text-emerald-400 ml-2">94%</span>
                </div>
              </div>

              {/* 6 Key Metric Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3.5 rounded-xl bg-[#080d19] border border-[#16223b] text-center space-y-1">
                  <span className="text-[9px] uppercase font-bold text-[var(--color-muted)] block">Opp. Score</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">94%</span>
                  <span className="text-[9px] text-muted block">Top Tier</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#080d19] border border-[#16223b] text-center space-y-1">
                  <span className="text-[9px] uppercase font-bold text-[var(--color-muted)] block">Buyer Matches</span>
                  <span className="text-xl font-bold font-mono text-blue-400">128</span>
                  <span className="text-[9px] text-muted block">Verified B2B</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#080d19] border border-[#16223b] text-center space-y-1">
                  <span className="text-[9px] uppercase font-bold text-[var(--color-muted)] block">Demand Growth</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">+18.4%</span>
                  <span className="text-[9px] text-muted block">YoY Surge</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#080d19] border border-[#16223b] text-center space-y-1">
                  <span className="text-[9px] uppercase font-bold text-[var(--color-muted)] block">Tariff & Risk</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">0%</span>
                  <span className="text-[9px] text-muted block">CEPA Treaty</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#080d19] border border-[#16223b] text-center space-y-1">
                  <span className="text-[9px] uppercase font-bold text-[var(--color-muted)] block">Readiness</span>
                  <span className="text-xl font-bold font-mono text-blue-400">87%</span>
                  <span className="text-[9px] text-muted block">Green Channel</span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#080d19] border border-[#16223b] text-center space-y-1">
                  <span className="text-[9px] uppercase font-bold text-[var(--color-muted)] block">TAM Opportunity</span>
                  <span className="text-xl font-bold font-mono text-indigo-300">₹20.4 Cr</span>
                  <span className="text-[9px] text-muted block">$2.4M USD</span>
                </div>
              </div>

              {/* "Why UAE?" 5 Core Strategic Pillars */}
              <div className="p-5 rounded-2xl bg-[#080e21] border border-[#182645] space-y-3">
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
                    Why UAE is Your #1 Global Market
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {[
                    { num: 1, title: 'Surging Import Demand', desc: 'Dubai retail apparel import volume for cotton garments grew +18.4% year-over-year.' },
                    { num: 2, title: '0% CEPA Duty Exemption', desc: 'India-UAE CEPA eliminates 5% standard customs duty, providing instant price advantage.' },
                    { num: 3, title: 'Manageable Competition', desc: 'Limited certified organic cotton suppliers compared to saturated standard polyester segments.' },
                    { num: 4, title: 'Rapid 4-Day Transit', desc: 'Direct maritime connection from Chennai/Tuticorin Port to Jebel Ali minimizes inventory holding costs.' },
                    { num: 5, title: 'High-Value Buyer Ecosystem', desc: '128 verified department stores and corporate uniform buyers procuring in the $20–$28 FOB band.' },
                  ].map((pillar) => (
                    <div key={pillar.num} className="p-3 rounded-xl bg-[#060a14] border border-[#142038] flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {pillar.num}
                      </div>
                      <div>
                        <span className="font-semibold text-secondary block">{pillar.title}</span>
                        <span className="text-[11px] text-muted mt-0.5 leading-relaxed block">{pillar.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action CTAs */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Button
                    variant="primary"
                    size="md"
                    icon={Globe}
                    onClick={() => handleAction('/market-intelligence')}
                  >
                    Explore UAE Market
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    icon={Users}
                    onClick={() => handleAction('/buyer-discovery')}
                  >
                    Find Buyers (128)
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    icon={FileText}
                    onClick={() => handleAction('/documents')}
                  >
                    Generate Documents
                  </Button>
                </div>

                <Button
                  variant="ai"
                  size="md"
                  icon={Sparkles}
                  onClick={() => handleAction('/ai-consultant')}
                >
                  View Full AI Strategy Dossier
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
