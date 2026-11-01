import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Globe, Activity, AlertCircle } from 'lucide-react';

/* ─────────────────────────────────────────────────
   All coordinates are % of a 2:1 equirectangular map
   x = 0-100 left→right, y = 0-100 top→bottom
───────────────────────────────────────────────── */
const COUNTRIES = {
  India:       { x: 68.8, y: 50.5, label: 'INDIA',         color: '#60a5fa', size: 9, origin: true },
  UAE:         { x: 61.0, y: 47.0, label: 'UAE',           color: '#86efac', size: 6 },
  Saudi:       { x: 58.5, y: 49.5, label: 'SAUDI',         color: '#86efac', size: 5 },
  USA:         { x: 21.5, y: 38.0, label: 'USA',           color: '#fcd34d', size: 7 },
  Canada:      { x: 22.0, y: 28.5, label: 'CANADA',        color: '#fcd34d', size: 5 },
  UK:          { x: 47.2, y: 28.8, label: 'UK',            color: '#86efac', size: 5 },
  Germany:     { x: 50.8, y: 27.5, label: 'GERMANY',       color: '#86efac', size: 5 },
  Netherlands: { x: 49.5, y: 26.8, label: 'NETHERLANDS',   color: '#86efac', size: 5 },
  Belgium:     { x: 48.8, y: 27.8, label: 'BELGIUM',       color: '#86efac', size: 4 },
  France:      { x: 48.0, y: 30.0, label: 'FRANCE',        color: '#86efac', size: 5 },
  Italy:       { x: 51.5, y: 31.5, label: 'ITALY',         color: '#86efac', size: 5 },
  Spain:       { x: 46.0, y: 32.0, label: 'SPAIN',         color: '#86efac', size: 5 },
  Brazil:      { x: 33.0, y: 67.5, label: 'BRAZIL',        color: '#fda4af', size: 7 },
  Mexico:      { x: 19.5, y: 43.5, label: 'MEXICO',        color: '#fcd34d', size: 5 },
  China:       { x: 76.5, y: 38.5, label: 'CHINA',         color: '#c4b5fd', size: 7 },
  Japan:       { x: 84.8, y: 36.0, label: 'JAPAN',         color: '#c4b5fd', size: 5 },
  SouthKorea:  { x: 82.5, y: 37.2, label: 'S. KOREA',      color: '#c4b5fd', size: 5 },
  Singapore:   { x: 76.2, y: 61.5, label: 'SINGAPORE',     color: '#60a5fa', size: 5 },
  Malaysia:    { x: 75.0, y: 59.8, label: 'MALAYSIA',      color: '#c4b5fd', size: 5 },
  Indonesia:   { x: 79.0, y: 64.5, label: 'INDONESIA',     color: '#c4b5fd', size: 5 },
  Vietnam:     { x: 78.0, y: 54.0, label: 'VIETNAM',       color: '#c4b5fd', size: 4 },
  HongKong:    { x: 79.8, y: 43.5, label: 'HK',            color: '#c4b5fd', size: 4 },
  Australia:   { x: 86.0, y: 74.0, label: 'AUSTRALIA',     color: '#fcd34d', size: 6 },
  Egypt:       { x: 55.0, y: 42.5, label: 'EGYPT',         color: '#d8b4fe', size: 5 },
  Nigeria:     { x: 49.5, y: 56.5, label: 'NIGERIA',       color: '#d8b4fe', size: 5 },
  Kenya:       { x: 57.8, y: 61.5, label: 'KENYA',         color: '#d8b4fe', size: 5 },
  SouthAfrica: { x: 54.0, y: 77.0, label: 'S. AFRICA',     color: '#d8b4fe', size: 5 },
  Bangladesh:  { x: 73.0, y: 48.5, label: 'BANGLADESH',    color: '#86efac', size: 4 },
  SriLanka:    { x: 70.5, y: 58.0, label: 'SRI LANKA',     color: '#86efac', size: 4 },
};

/* Arc path from India to each destination */
function makeArc(from, to, dip = -0.28) {
  const x1 = from.x, y1 = from.y;
  const x2 = to.x,   y2 = to.y;
  const mx = (x1 + x2) / 2;
  const dy = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
  const cy = (y1+y2)/2 + dy * dip;
  return `M${x1},${y1} Q${mx},${cy} ${x2},${y2}`;
}

// Build all routes from India
const IND = COUNTRIES.India;
const ROUTES = Object.entries(COUNTRIES)
  .filter(([k]) => k !== 'India')
  .map(([key, c]) => {
    // Routes going below India (south/east) get a downward arc
    const goesDown = c.y > IND.y + 5;
    // Long westward routes get a high arc
    const farWest  = c.x < 50;
    const dip = goesDown ? 0.25 : farWest ? -0.38 : -0.22;
    return { key, path: makeArc(IND, c, dip), color: c.color };
  });

export default function GlobalExportMap() {
  const [vesselOpen, setVesselOpen] = useState(true);
  const [hovered, setHovered] = useState(null);

  return (
    <div className="relative w-full text-white font-sans overflow-hidden bg-[#040911]"
      style={{ height: '100vh' }}>

      {/* ── Night World Map Background ── */}
      <img
        src="https://unpkg.com/three-globe/example/img/earth-night.jpg"
        alt="World Map"
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        style={{ objectFit: 'fill', filter: 'brightness(0.78) contrast(1.05) saturate(0.9)', zIndex: 0 }}
        draggable={false}
      />
      {/* Subtle dark overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% 40%, rgba(5,15,40,0.25) 0%, rgba(2,5,18,0.5) 100%)',
        zIndex: 1
      }} />

      {/* ── Header ── */}
      <div className="absolute top-0 left-0 right-0 z-30 pt-5 px-7 flex items-start justify-between pointer-events-none">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Globe size={20} className="text-blue-400" />
            <h1 className="text-[20px] font-bold text-white tracking-tight drop-shadow-xl">
              Global Supply Chain Map
            </h1>
          </div>
          <p className="text-[12px] text-slate-400 pl-8 drop-shadow">
            Real-time tracking of active shipments and export routes from India
          </p>
        </div>
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-700/50 rounded-lg text-[11px] text-slate-400">
          <Activity size={11} className="text-emerald-400" />
          Live
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </div>

      {/* ── SVG Trade Routes + Nodes ── */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ zIndex: 10 }}
      >
        <defs>
          <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="0.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-strong" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="0.9" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Hidden mpath refs */}
        {ROUTES.map((r, i) => (
          <path key={`mp${i}`} id={`mp${i}`} d={r.path} fill="none" stroke="none" />
        ))}

        {/* ── Route Arcs ── */}
        {ROUTES.map((r, i) => (
          <g key={r.key}>
            {/* Wide soft halo */}
            <path d={r.path} fill="none" stroke={r.color} strokeWidth="1.2" opacity="0.07" strokeLinecap="round" />
            {/* Core line */}
            <path d={r.path} fill="none" stroke={r.color} strokeWidth="0.55" opacity="0.55" strokeLinecap="round" filter="url(#glow)" />
            {/* Animated traveler dot */}
            <circle r="0.7" fill={r.color} opacity="0.95" filter="url(#glow)">
              <animateMotion dur={`${4 + (i * 0.31) % 3}s`} repeatCount="indefinite" begin={`${(i * 0.22) % 3}s`}>
                <mpath href={`#mp${i}`} />
              </animateMotion>
            </circle>
          </g>
        ))}

        {/* ── Country Nodes ── */}
        {Object.entries(COUNTRIES).map(([key, c]) => {
          const r = c.size / 10;
          return (
            <g key={key} style={{ cursor: 'pointer' }}>
              {/* Glow rings */}
              <circle cx={c.x} cy={c.y} r={r + 1.0} fill="none" stroke={c.color} strokeWidth="0.3" opacity="0.2" />
              <circle cx={c.x} cy={c.y} r={r + 0.4} fill="none" stroke={c.color} strokeWidth="0.4" opacity="0.45" />
              {/* Fill */}
              <circle cx={c.x} cy={c.y} r={r} fill="rgba(4,9,20,0.85)" stroke={c.color} strokeWidth="0.55" />
              {/* Center bright dot */}
              <circle cx={c.x} cy={c.y} r={r * 0.45} fill={c.color} filter={c.origin ? 'url(#glow-strong)' : 'url(#glow)'} />

              {/* Origin pulse */}
              {c.origin && (
                <>
                  <circle cx={c.x} cy={c.y} r={r} fill="none" stroke={c.color} strokeWidth="0.5" opacity="0">
                    <animate attributeName="r" from={r} to={r + 3.5} dur="2.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.7" to="0" dur="2.5s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={c.x} cy={c.y} r={r} fill="none" stroke={c.color} strokeWidth="0.4" opacity="0">
                    <animate attributeName="r" from={r} to={r + 2} dur="2.5s" begin="1s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.5" to="0" dur="2.5s" begin="1s" repeatCount="indefinite" />
                  </circle>
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* ── Country Labels HTML overlay ── */}
      {Object.entries(COUNTRIES).map(([key, c]) => (
        <div
          key={`lbl-${key}`}
          className="absolute pointer-events-none"
          style={{
            left: `${c.x}%`,
            top: `${c.y}%`,
            transform: c.origin ? 'translate(-50%, -260%)' : 'translate(-50%, -220%)',
            zIndex: 20,
          }}
          onMouseEnter={() => setHovered(key)}
          onMouseLeave={() => setHovered(null)}
        >
          <span
            className="text-[9px] font-bold tracking-widest uppercase whitespace-nowrap"
            style={{
              color: c.origin ? '#93c5fd' : '#e2e8f0',
              textShadow: '0 0 8px rgba(0,0,0,1), 0 1px 3px rgba(0,0,0,1)',
              fontSize: c.origin ? '10px' : '8.5px',
            }}
          >
            {c.label}
          </span>
        </div>
      ))}

      {/* ── RIGHT PANEL: Operational Status ── */}
      <div className="absolute right-5 top-20 z-30 w-[235px] bg-[#060d1c]/94 border border-slate-800/60 rounded-xl overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="px-4 py-3 border-b border-slate-800/50 flex items-center justify-between">
          <span className="text-[12px] font-semibold text-slate-300 tracking-wide">Operational Status</span>
          <ChevronDown size={13} className="text-slate-600" />
        </div>
        <div className="px-4 py-3 border-b border-slate-800/40 flex justify-between">
          <span className="text-[12px] text-slate-500">Total Active</span>
          <span className="text-[17px] font-bold text-slate-100">1,432</span>
        </div>
        <div className="p-4 space-y-3.5">
          {[
            { label: 'Total Active', val: '1,432', color: '#94a3b8', sym: '●' },
            { label: 'Disrupted',    val: '28',    color: '#f87171', sym: '✕' },
            { label: 'Optimal',      val: '1,200', color: '#6ee7b7', sym: '●' },
          ].map((row, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <span className="text-[12px] font-bold" style={{ color: row.color }}>{row.sym}</span>
                <span className="text-[11.5px] text-slate-400">{row.label}</span>
              </div>
              <span className="text-[12.5px] font-bold" style={{ color: row.color }}>{row.val}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-center py-2 border-t border-slate-800/40">
          <ChevronDown size={12} className="text-slate-700" />
        </div>
      </div>

      {/* ── LEFT BOTTOM: Vessel List ── */}
      <div className="absolute left-5 bottom-14 z-30 w-[205px] bg-[#060d1c]/94 border border-slate-800/60 rounded-xl overflow-hidden backdrop-blur-xl shadow-2xl">
        <div
          className="px-4 py-2.5 border-b border-slate-800/50 flex items-center justify-between cursor-pointer hover:bg-slate-800/20 transition-colors"
          onClick={() => setVesselOpen(v => !v)}
        >
          <span className="text-[12px] font-semibold text-slate-300 tracking-wide">Vessel List</span>
          {vesselOpen ? <ChevronUp size={13} className="text-slate-500" /> : <ChevronDown size={13} className="text-slate-500" />}
        </div>
        <AnimatePresence>
          {vesselOpen && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
              {[
                { name: '1. Ever Voyager', s: 'Alert',   c: '#f87171' },
                { name: '2. Sea Star',     s: 'Optimal', c: '#6ee7b7' },
                { name: '3. Slue Rorce',   s: 'Optimal', c: '#6ee7b7' },
                { name: '4. Sea Hoifers',  s: 'Optimal', c: '#6ee7b7' },
                { name: '5. Ever Voyager', s: 'Alert',   c: '#f87171' },
              ].map((v, i) => (
                <div key={i} className="flex justify-between items-center px-4 py-2.5 border-b border-slate-800/30 last:border-0 hover:bg-slate-800/20">
                  <span className="text-[11px] text-slate-400">{v.name}</span>
                  <span className="text-[10.5px] font-semibold" style={{ color: v.c }}>{v.s}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom Legend ── */}
      <div className="absolute left-5 bottom-5 z-30 flex items-center gap-5 text-[10.5px] font-medium text-slate-500">
        {[
          { color: '#6ee7b7', label: 'Optimal Route' },
          { color: '#94a3b8', label: 'Monitoring'    },
          { color: '#f87171', label: 'Disruption'    },
        ].map((it, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: it.color, opacity: 0.8 }} />
            {it.label}
          </div>
        ))}
      </div>
    </div>
  );
}
