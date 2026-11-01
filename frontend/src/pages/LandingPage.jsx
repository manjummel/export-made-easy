import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass, ArrowRight, Sparkles, CheckCircle2,
  FileCheck, Globe, Scale,
} from 'lucide-react';
import { RollingWorldHero } from '../components/3d';
import { Button, Card, Badge } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { AgentTrace } from '../components/intelligence';
import { CinematicBackground } from '../components/layout';
import { fadeInDown } from '../components/animations';

// Easing curve defined locally so we don't need the extra import
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleStartAnalysis = () => {
    navigate(isAuthenticated ? '/dashboard' : '/login');
  };

  const handleExplorePlatform = () => {
    navigate(isAuthenticated ? '/dashboard' : '/login');
  };

  return (
    <div className="relative min-h-screen flex flex-col font-sans overflow-hidden"
      style={{ color: 'var(--text-primary, #f8fafc)' }}
    >
      {/* ── Cinematic Adaptive Background Layer ── */}
      <CinematicBackground />

      {/* Top Navbar — slides down on load */}
      <motion.header
        className="relative z-40 sticky top-0 backdrop-blur-md border-b"
        style={{
          background: 'var(--surface-overlay, rgba(2,6,23,0.85))',
          borderColor: 'var(--border-base, rgba(255,255,255,0.1))',
        }}
        variants={fadeInDown}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: EASE_OUT_EXPO, delay: 0.1 }}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1746D2] via-[#2563EB] to-[#60A5FA] flex items-center justify-center shadow-md text-white">
              <Compass size={18} />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight" style={{ color: 'var(--text-primary, #f8fafc)' }}>EXPORTease</span>
              <span className="text-[10px] font-mono font-bold bg-blue-900/40 text-blue-300 px-1.5 rounded border border-blue-700/50">
                AI
              </span>
            </div>
          </motion.div>

          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, ease: EASE_OUT_EXPO, delay: 0.18 }}
          >
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>Dashboard</Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/agents')}>AI Agents</Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/sources')}>Verified Sources</Button>
                <Button variant="ghost" size="sm" onClick={logout}>Sign Out</Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/dashboard')}>Launch Workspace</Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/agents')}>AI Agents</Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/sources')}>Verified Sources</Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/login')}>Sign In</Button>
              </>
            )}
          </motion.div>
        </div>
      </motion.header>

      {/* Signature Rolling World Hero */}
      <RollingWorldHero
        onStartAnalysis={handleStartAnalysis}
        onExplorePlatform={handleExplorePlatform}
      />

      {/* Core Enterprise Architecture Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-12 relative z-10">
        {/* Section heading */}
        <motion.div
          className="text-center max-w-3xl mx-auto space-y-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
        >
          <Badge variant="primary" size="sm" dot>Enterprise Trade Architecture</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary, #f8fafc)' }}>
            An Autonomous Export Operating System Built for Indian MSMEs
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary, #94a3b8)' }}>
            Eliminate cross-border uncertainty with end-to-end statutory validation, multi-agent AI orchestration, and auditable official evidence.
          </p>
        </motion.div>

        {/* 7-Agent Trace Demonstration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 10 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
        >
          <Card className="p-6 backdrop-blur-xl shadow-lg space-y-4"
            style={{ background: 'var(--surface-base, rgba(15,23,42,0.8))', border: '1px solid var(--border-base, rgba(255,255,255,0.1))' }}
          >
            <AgentTrace />
          </Card>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Scale size={22} />,
              iconBg: 'rgba(30,58,138,0.4)',
              iconColor: '#93c5fd',
              iconBorder: 'rgba(59,130,246,0.3)',
              hoverBorder: '#6366f1',
              title: 'Official Statutory Authority RAG',
              desc: 'Every HS recommendation and duty-free concession is backed by citations from DGFT notifications, CBIC tariff schedules, and bilateral FTAs like India-UAE CEPA.',
              delay: 0,
            },
            {
              icon: <FileCheck size={22} />,
              iconBg: 'rgba(6,78,59,0.4)',
              iconColor: '#6ee7b7',
              iconBorder: 'rgba(16,185,129,0.3)',
              hoverBorder: '#10b981',
              title: 'Zero-Error Document Consistency',
              desc: 'Cross-validate unit pricing, Incoterms, HS codes, and container weights across Commercial Invoices, Packing Lists, and Shipping Bills in milliseconds.',
              delay: 0.1,
            },
            {
              icon: <Globe size={22} />,
              iconBg: 'rgba(49,46,129,0.4)',
              iconColor: '#a5b4fc',
              iconBorder: 'rgba(99,102,241,0.3)',
              hoverBorder: '#818cf8',
              title: 'Destination Market Intelligence',
              desc: 'Real-time maritime transit days, destination import appetite benchmarks, and verified corporate buyer matching tailored to Indian manufacturing capacities.',
              delay: 0.2,
            },
          ].map((feat) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, ease: EASE_OUT_EXPO, delay: feat.delay }}
              whileHover={{ y: -4, transition: { duration: 0.2, ease: 'easeOut' } }}
              whileTap={{ scale: 0.985 }}
            >
              <Card
                className="p-6 space-y-3 h-full backdrop-blur-sm transition-all"
                style={{
                  background: 'var(--surface-subtle, rgba(15,23,42,0.6))',
                  border: `1px solid var(--border-base, rgba(255,255,255,0.08))`,
                }}
              >
                <div
                  className="p-3 rounded-xl w-fit border"
                  style={{ background: feat.iconBg, color: feat.iconColor, borderColor: feat.iconBorder }}
                >
                  {feat.icon}
                </div>
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary, #f8fafc)' }}>{feat.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted, #64748b)' }}>{feat.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom Call to Action */}
        <motion.div
          className="text-center py-8"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-30px' }}
          transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
        >
          <Button variant="primary" size="lg" className="w-full sm:w-auto" onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}>
            Start Your Export Journey Today
            <ArrowRight size={16} />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="backdrop-blur-md border-t mt-auto py-8 relative z-10"
        style={{
          background: 'var(--surface-overlay, rgba(2,6,23,0.8))',
          borderColor: 'var(--border-base, rgba(255,255,255,0.08))',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between text-xs"
          style={{ color: 'var(--text-muted, #64748b)' }}
        >
          <p>© 2026 EXPORTease AI. All rights reserved.</p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:opacity-80 transition-opacity">Privacy</a>
            <a href="#" className="hover:opacity-80 transition-opacity">Terms</a>
            <a href="#" className="hover:opacity-80 transition-opacity">Enterprise API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
