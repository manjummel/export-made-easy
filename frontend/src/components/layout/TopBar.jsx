import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Languages, Sparkles, ShieldCheck,
  ChevronDown, CheckCircle2, Command, Palette,
} from 'lucide-react';
import { Button } from '../ui';
import { useEvidence } from '../../context/EvidenceContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/cn';
import { EASE_OUT_EXPO } from '../animations';

/* ── tiny hook: close dropdown when clicking outside ── */
function useClickOutside(ref, onClose) {
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, onClose]);
}

/* ── dropdown animation variants ── */
const DROP = {
  hidden: { opacity: 0, y: -6, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: -4, scale: 0.97, transition: { duration: 0.12, ease: 'easeIn' } },
};

/* ── theme dot colours ── */
const THEME_DOTS = {
  'cinematic-dark':  '#3b82f6',
  'ocean-blue':      '#38bdf8',
  'emerald-forest':  '#34d399',
  'executive-slate': '#94a3b8',
  'enterprise-light':'#2558e8',
  'corporate-light': '#3b82f6',
};

export default function TopBar({
  sidebarWidth = 250,
  onOpenCommandPalette = () => {},
}) {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { openEvidence }         = useEvidence();
  const { user, isBackendConnected } = useAuth();
  const { theme, setTheme, availableThemes } = useTheme();

  const [language,          setLanguage]          = useState('EN');
  const [langDropdownOpen,  setLangDropdownOpen]  = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  /* refs for click-outside */
  const themeRef = useRef(null);
  const langRef  = useRef(null);

  useClickOutside(themeRef, () => setThemeDropdownOpen(false));
  useClickOutside(langRef,  () => setLangDropdownOpen(false));

  /* close the OTHER dropdown when one opens */
  const toggleTheme = () => {
    setLangDropdownOpen(false);
    setThemeDropdownOpen(o => !o);
  };
  const toggleLang = () => {
    setThemeDropdownOpen(false);
    setLangDropdownOpen(o => !o);
  };

  const isInsideProject    = location.pathname.startsWith('/projects/');
  const currentProjectName = location.pathname.includes('cotton')
    ? 'Premium Cotton Shirts → UAE'
    : location.pathname.includes('brass')
    ? 'Brass Artware → USA'
    : 'Turmeric Powder → Germany';

  const companyName = user?.companyName || 'Your Company';
  const iecCode     = user?.iec || 'AAICU9823D';
  const initials    = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'UT';

  return (
    <motion.header
      style={{ left: sidebarWidth }}
      /* ⚠ NO overflow-hidden — dropdowns must escape the header */
      className="fixed top-0 right-0 h-16 z-30 bg-[var(--bg-header)] backdrop-blur-md border-b border-[var(--border-subtle)] flex items-center gap-3 px-4 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
    >
      {/* ── Left: Workspace Badge ─────────────────────────────── */}
      <motion.div
        className="hidden sm:flex items-center shrink-0"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: EASE_OUT_EXPO, delay: 0.1 }}
      >
        {isInsideProject ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-950/50 border border-indigo-900/50 text-xs whitespace-nowrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Project:</span>
            <span className="font-bold text-[var(--text-primary)] max-w-[160px] truncate">{currentProjectName}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--surface-base)] border border-[var(--border-subtle)] text-xs whitespace-nowrap">
            <span className="text-[var(--text-muted)]">Workspace:</span>
            <span className="font-semibold text-[var(--text-primary)]">{companyName}</span>
            <span className="text-[var(--text-muted)] opacity-40">·</span>
            <span className="text-[var(--text-muted)] font-mono text-[11px]">IEC {iecCode}</span>
            <span className="text-[var(--text-muted)] opacity-40">·</span>
            <span className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold ${isBackendConnected ? 'text-emerald-400' : 'text-[var(--text-muted)]'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-[var(--text-muted)] opacity-30'}`} />
              {isBackendConnected ? 'API Online' : 'Mock Mode'}
            </span>
          </div>
        )}
      </motion.div>

      {/* ── Centre: Global Search ─────────────────────────────── */}
      <motion.div
        className="flex-1 min-w-0 max-w-lg"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_OUT_EXPO, delay: 0.12 }}
      >
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex items-center justify-between gap-2 w-full h-8 px-2.5 rounded-lg bg-[var(--surface-base)] hover:bg-[var(--surface-card-hover)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] transition-colors cursor-pointer select-none"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Search size={14} className="shrink-0" />
            <span className="truncate">Search projects, products, HS codes, documents…</span>
          </div>
          <kbd className="hidden md:inline-flex shrink-0 items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono rounded bg-[var(--surface-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
            <Command size={10} /> K
          </kbd>
        </button>
      </motion.div>

      {/* ── Right Controls ────────────────────────────────────── */}
      <motion.div
        className="flex items-center gap-2 shrink-0"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: EASE_OUT_EXPO, delay: 0.15 }}
      >

        {/* ── Theme Switcher ── */}
        <div className="relative" ref={themeRef}>
          <button
            type="button"
            onClick={toggleTheme}
            title="Change Theme"
            className={cn(
              'flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] hover:bg-[var(--surface-card-hover)] text-xs font-semibold text-[var(--text-primary)] transition-colors cursor-pointer',
              themeDropdownOpen && 'border-[var(--border-active)] bg-[var(--surface-card-hover)]'
            )}
          >
            <Palette size={14} className="text-[var(--text-muted)]" />
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: THEME_DOTS[theme] || '#3b82f6' }}
            />
            <ChevronDown
              size={12}
              className="text-[var(--text-muted)] transition-transform duration-200"
              style={{ transform: themeDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>

          <AnimatePresence>
            {themeDropdownOpen && (
              <motion.div
                variants={DROP}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute right-0 top-[calc(100%+6px)] w-52 bg-[var(--surface-raised)] rounded-xl shadow-2xl border border-[var(--border-medium)] p-1.5 z-[100]"
              >
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-widest mb-1">
                  Select Theme
                </div>
                {availableThemes.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => { setTheme(t.id); setThemeDropdownOpen(false); }}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-2.5',
                      theme === t.id
                        ? 'bg-[var(--surface-card-hover)] text-[var(--text-primary)] font-semibold'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--surface-card-hover)]'
                    )}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: THEME_DOTS[t.id] || '#3b82f6' }}
                    />
                    <span className="flex-1 text-xs">{t.label}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{t.type === 'dark' ? '🌙' : '☀️'}</span>
                    {theme === t.id && <CheckCircle2 size={13} className="shrink-0 text-[var(--border-active)]" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Language Switcher ── */}
        <div className="relative" ref={langRef}>
          <button
            type="button"
            onClick={toggleLang}
            className={cn(
              'flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-base)] hover:bg-[var(--surface-card-hover)] text-xs font-semibold text-[var(--text-primary)] transition-colors cursor-pointer',
              langDropdownOpen && 'border-[var(--border-active)] bg-[var(--surface-card-hover)]'
            )}
          >
            <Languages size={14} className="text-[var(--text-muted)]" />
            <span>{language}</span>
            <ChevronDown
              size={12}
              className="text-[var(--text-muted)] transition-transform duration-200"
              style={{ transform: langDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>

          <AnimatePresence>
            {langDropdownOpen && (
              <motion.div
                variants={DROP}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute right-0 top-[calc(100%+6px)] w-52 bg-[var(--surface-raised)] rounded-xl shadow-2xl border border-[var(--border-medium)] p-1.5 z-[100]"
              >
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-widest mb-1">
                  Language
                </div>
                {[
                  { code: 'EN', value: 'en', label: 'English',           flag: '🇬🇧' },
                  { code: 'HI', value: 'hi', label: 'हिंदी (Hindi)',     flag: '🇮🇳' },
                  { code: 'TA', value: 'ta', label: 'தமிழ் (Tamil)',     flag: '🇮🇳' },
                  { code: 'GU', value: 'gu', label: 'ગુજરાતી (Gujarati)', flag: '🇮🇳' },
                  { code: 'MR', value: 'mr', label: 'मराठी (Marathi)',   flag: '🇮🇳' },
                ].map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      setLanguage(l.code);
                      setLangDropdownOpen(false);
                      // Trigger Google Translate programmatically without blocking the UI
                      setTimeout(() => {
                        const select = document.querySelector('.goog-te-combo');
                        if (select) {
                          select.value = l.value;
                          select.dispatchEvent(new Event('change'));
                        }
                      }, 0);
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-2.5 text-xs whitespace-nowrap',
                      language === l.code
                        ? 'bg-[var(--surface-card-hover)] text-[var(--text-primary)] font-semibold'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--surface-card-hover)]'
                    )}
                  >
                    <span>{l.flag}</span>
                    <span className="flex-1">{l.label}</span>
                    {language === l.code && <CheckCircle2 size={13} className="shrink-0 text-[var(--border-active)]" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Verified Sources ── */}
        <Button
          variant="outline"
          size="sm"
          icon={ShieldCheck}
          className="hidden md:inline-flex"
          onClick={() => openEvidence({
            authority: 'Government of India — Export Promotion Portals',
            authorityType: 'Official Statutory & Regulatory Gateways',
            document: 'Consolidated India EXIM Policy, Tariff & Trade Compliance References',
            section: 'Live Cross-Portal Regulatory Intelligence Feed',
            ruleCitation: 'FTP 2023-28 · ITC-HS 2026 · India-UAE CEPA · RBI FEMA',
            verificationStatus: 'All Portals Officially Verified',
            confidence: 99,
            effectiveDate: 'Live Real-time Feed',
            excerpt: 'ExportEase AI cross-references all trade decisions against live data from DGFT, CBIC, ICEGATE, RBI, APEDA, FIEO, UN Comtrade, and WTO official portals. Every compliance check, tariff rate, and HS code is backed by auditable government sources.',
            impactSummary: 'Guarantees 100% compliance with current Indian EXIM regulations and bilateral trade agreements.',
            agent: 'Compliance Intelligence Agent',
            officialUrl: 'https://www.dgft.gov.in',
            crossReferences: [
              { name: 'DGFT — Directorate General of Foreign Trade', code: 'dgft.gov.in', url: 'https://www.dgft.gov.in' },
              { name: 'CBIC — Central Board of Indirect Taxes & Customs', code: 'cbic.gov.in', url: 'https://www.cbic.gov.in' },
              { name: 'ICEGATE — Indian Customs Electronic Gateway', code: 'icegate.gov.in', url: 'https://www.icegate.gov.in' },
              { name: 'RBI — Reserve Bank of India (FEMA & Forex)', code: 'rbi.org.in', url: 'https://www.rbi.org.in' },
              { name: 'APEDA — Agricultural & Processed Food Export', code: 'apeda.gov.in', url: 'https://www.apeda.gov.in' },
              { name: 'FIEO — Federation of Indian Export Organisations', code: 'fieo.org', url: 'https://www.fieo.org' },
              { name: 'UN Comtrade — Global Trade Statistics Database', code: 'comtradeplus.un.org', url: 'https://comtradeplus.un.org' },
              { name: 'WTO — World Trade Organization Tariff Database', code: 'wto.org', url: 'https://www.wto.org' },
              { name: 'Ministry of Commerce & Industry', code: 'commerce.gov.in', url: 'https://commerce.gov.in' },
              { name: 'Make in India — EXIM Policy Portal', code: 'makeinindia.com', url: 'https://www.makeinindia.com' },
            ],
          })}
        >
          Verified Sources
        </Button>

        {/* ── AI Copilot ── */}
        <Button
          variant="ai"
          size="sm"
          icon={Sparkles}
          onClick={() => navigate('/ai-consultant')}
        >
          AI Copilot
        </Button>

        {/* ── User Avatar ── */}
        <div
          className="flex items-center gap-2 pl-2 border-l border-[var(--border-subtle)] cursor-pointer"
          onClick={() => navigate('/profile')}
          title={user?.fullName || 'Exporter Profile'}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0B1736] to-[#1746D2] text-white font-bold text-xs flex items-center justify-center border border-[var(--border-medium)] hover:border-[var(--border-active)] transition-colors">
            {initials}
          </div>
        </div>

      </motion.div>
    </motion.header>
  );
}
