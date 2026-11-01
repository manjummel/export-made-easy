import React, { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Globe, ArrowRight, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
const GlobeScene = React.lazy(() => import('./GlobeScene'));

export default function RollingWorldHero({
  onStartAnalysis = () => {},
  onExplorePlatform = () => {},
}) {
  return (
    <div className="relative w-full overflow-hidden border-b border-[var(--color-border-base)]">


      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-0 flex flex-col items-center text-center z-10">
        {/* Product Positioning Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16,1,0.3,1] }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface-card,var(--color-surface-card))] backdrop-blur-md border border-[var(--border-base,var(--color-border-base))] shadow-xs mb-6"
        >
          <Badge variant="primary" size="xs" dot pulse>Enterprise AI</Badge>
          <span className="text-xs font-semibold text-[var(--text-secondary,var(--color-secondary))]">
            Export Intelligence Platform for Indian MSMEs
          </span>
        </motion.div>

        {/* Hero Headlines */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16,1,0.3,1], delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[var(--text-primary,var(--color-primary))] tracking-tight leading-[1.1] max-w-4xl"
        >
          Take Your Business <br />
          <span className="text-[#1746D2]">to the World.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16,1,0.3,1], delay: 0.2 }}
          className="mt-5 text-sm sm:text-base lg:text-lg text-[var(--text-muted,var(--color-muted))] max-w-2xl leading-relaxed font-normal"
        >
          From product classification to compliance, documentation and market readiness —{' '}
          <strong className="text-[var(--color-primary)] font-semibold">ExportEase AI</strong> guides your export journey
          with verified intelligence.
        </motion.p>

        {/* Hero CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16,1,0.3,1], delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3.5"
        >
          <Button
            variant="primary"
            size="lg"
            iconRight={ArrowRight}
            onClick={onStartAnalysis}
          >
            Start Export Analysis
          </Button>

          <Button
            variant="secondary"
            size="lg"
            icon={Sparkles}
            onClick={onExplorePlatform}
          >
            Explore AI Platform
          </Button>
        </motion.div>

        {/* Key Trust Pillars */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--text-muted,var(--color-muted))] font-medium"
        >
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-600" />
            DGFT &amp; CBIC Official Sources
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-600" />
            7-Agent Intelligence Engine
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-600" />
            Zero-Error Document Consistency
          </span>
        </motion.div>

        {/* Signature Interactive Rolling World Container (Minimized & compact) */}
        <div className="w-full h-[240px] sm:h-[300px] lg:h-[350px] mt-3 relative flex items-center justify-center">
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center h-full gap-2 text-muted">
                <Globe size={28} className="animate-spin text-[#1746D2]" />
                <span className="text-xs">Initializing Rolling World 3D Engine...</span>
              </div>
            }
          >
            <div className="w-full h-[420px] sm:h-[500px] lg:h-[580px] absolute top-[-5px] left-0">
              <GlobeScene />
            </div>
          </Suspense>

          {/* Soft Bottom Mask for seamless blend */}
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[var(--color-surface-base)] via-[var(--color-surface-base)]/60 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
