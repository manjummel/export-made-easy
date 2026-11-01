import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

export default function CinematicBackground() {
  const { theme } = useTheme();

  // Floating ambient particles configured dynamically for each theme
  const particles = useMemo(() => {
    const particleColors = {
      'cinematic-dark': ['rgba(251, 191, 36, 0.65)', 'rgba(96, 165, 250, 0.6)', 'rgba(168, 85, 247, 0.45)', 'rgba(255, 255, 255, 0.4)'],
      'ocean-blue': ['rgba(56, 189, 248, 0.7)', 'rgba(96, 165, 250, 0.6)', 'rgba(147, 197, 253, 0.5)', 'rgba(255, 255, 255, 0.35)'],
      'emerald-forest': ['rgba(52, 211, 153, 0.7)', 'rgba(110, 231, 183, 0.6)', 'rgba(251, 191, 36, 0.5)', 'rgba(255, 255, 255, 0.35)'],
      'executive-slate': ['rgba(148, 163, 184, 0.6)', 'rgba(191, 219, 254, 0.55)', 'rgba(203, 213, 225, 0.45)', 'rgba(255, 255, 255, 0.3)'],
      'enterprise-light': ['rgba(37, 99, 235, 0.25)', 'rgba(96, 165, 250, 0.3)', 'rgba(148, 163, 184, 0.25)', 'rgba(59, 130, 246, 0.2)'],
      'corporate-light': ['rgba(30, 58, 138, 0.22)', 'rgba(59, 130, 246, 0.25)', 'rgba(100, 116, 139, 0.2)', 'rgba(14, 165, 233, 0.2)'],
    };

    const colors = particleColors[theme] || particleColors['cinematic-dark'];

    return Array.from({ length: 22 }, (_, i) => ({
      id: i,
      size: 3 + (i % 5) * 1.5,
      left: `${(i * 4.7 + 3) % 100}%`,
      top: `${(i * 7.3 + 5) % 100}%`,
      dur: 4 + (i % 6) * 1.5,
      del: (i % 5) * 0.8,
      color: colors[i % colors.length],
      blur: i % 2 === 0 ? 'blur-[1px]' : 'blur-[0.5px]',
    }));
  }, [theme]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
      {/* ── 1. THEME-SPECIFIC BACKDROP BASE ── */}
      {theme === 'cinematic-dark' && (
        <>
          <img
            src="/login_bg.jpg"
            alt=""
            className="w-full h-full object-cover scale-105"
            style={{ filter: 'brightness(0.28) contrast(1.15) saturate(1.2)' }}
          />
          {/* Deep atmospheric gradients */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#020617]/95 via-[#060e28]/85 to-[#0b1b4f]/70" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.25),rgba(255,255,255,0))]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_80%_80%,rgba(245,158,11,0.12),rgba(0,0,0,0))]" />
        </>
      )}

      {theme === 'ocean-blue' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-[#020d1e] via-[#041a38] to-[#082855]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.22),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_75%,rgba(37,99,235,0.25),transparent_65%)]" />
        </>
      )}

      {theme === 'emerald-forest' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-[#01140e] via-[#022318] to-[#053826]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(52,211,153,0.2),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_80%,rgba(16,185,129,0.22),transparent_65%)]" />
        </>
      )}

      {theme === 'executive-slate' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-[#090d16] via-[#0f172a] to-[#1e293b]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(148,163,184,0.18),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_85%,rgba(59,130,246,0.15),transparent_60%)]" />
        </>
      )}

      {theme === 'enterprise-light' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(37,99,235,0.08),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_90%,rgba(96,165,250,0.1),transparent_60%)]" />
        </>
      )}

      {theme === 'corporate-light' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-[#f0f4f8] via-[#e6edf5] to-[#d8e2ee]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(30,58,138,0.07),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(37,99,235,0.08),transparent_60%)]" />
        </>
      )}

      {/* ── 2. PULSING AMBIENT LIGHTING ORBS ── */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none opacity-40"
        style={{
          background:
            theme === 'emerald-forest'
              ? 'radial-gradient(circle, rgba(52,211,153,0.3) 0%, transparent 70%)'
              : theme === 'ocean-blue'
              ? 'radial-gradient(circle, rgba(56,189,248,0.35) 0%, transparent 70%)'
              : theme?.includes('light')
              ? 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(37,99,235,0.35) 0%, transparent 70%)',
          top: '-10%',
          left: '15%',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.5, 0.3],
          x: [0, 30, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-[130px] pointer-events-none opacity-30"
        style={{
          background:
            theme === 'emerald-forest'
              ? 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)'
              : theme === 'ocean-blue'
              ? 'radial-gradient(circle, rgba(37,99,235,0.3) 0%, transparent 70%)'
              : theme?.includes('light')
              ? 'radial-gradient(circle, rgba(96,165,250,0.1) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)',
          bottom: '5%',
          right: '10%',
        }}
        animate={{
          scale: [1.1, 0.95, 1.1],
          opacity: [0.25, 0.45, 0.25],
          x: [0, -25, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* ── 3. CINEMATIC GRID OVERLAY (SUBTLE) ── */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* ── 4. FLOATING GLOWING PARTICLES ── */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full pointer-events-none ${p.blur}`}
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: p.left,
            top: p.top,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }}
          animate={{
            y: [0, -45, 0],
            x: [0, (p.id % 2 === 0 ? 15 : -15), 0],
            opacity: [0.2, 0.75, 0.2],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            delay: p.del,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
