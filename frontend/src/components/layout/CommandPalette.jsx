import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, LayoutDashboard, Bot, Globe, TrendingUp, FileText,
  BookOpen, Users, DollarSign, BarChart3, Settings,
  Sparkles, ArrowRight, ShieldCheck, Zap, X
} from 'lucide-react';
import { cn } from '../../lib/cn';

const commandItems = [
  { id: 'dash', title: 'Dashboard', group: 'Navigation', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'ai', title: 'AI Export Consultant', group: 'Navigation', icon: Bot, path: '/ai-consultant' },
  { id: 'market', title: 'Market Intelligence', group: 'Navigation', icon: Globe, path: '/market-intelligence' },
  { id: 'forecast', title: 'Demand Forecasting', group: 'Navigation', icon: TrendingUp, path: '/demand-forecast' },
  { id: 'docs', title: 'Document Generator', group: 'Navigation', icon: FileText, path: '/documents' },
  { id: 'policy', title: 'Trade Policies & FTAs', group: 'Navigation', icon: BookOpen, path: '/trade-policies' },
  { id: 'buyers', title: 'Buyer Discovery', group: 'Navigation', icon: Users, path: '/buyer-discovery' },
  { id: 'forex', title: 'Currency Risk Analysis', group: 'Navigation', icon: DollarSign, path: '/currency-risk' },
  { id: 'analytics', title: 'Export Analytics', group: 'Navigation', icon: BarChart3, path: '/analytics' },
  { id: 'settings', title: 'Settings & Integrations', group: 'Navigation', icon: Settings, path: '/settings' },
  { id: 'design-sys', title: 'Design System & Component Library', group: 'System', icon: Zap, path: '/design-system' },
  // AI Actions
  { id: 'act-score', title: 'Run Export Readiness Assessment', group: 'AI Actions', icon: Sparkles, path: '/ai-consultant' },
  { id: 'act-strategy', title: 'Generate AI Export Strategy ✨', group: 'AI Actions', icon: Zap, action: 'open-strategy' },
  { id: 'act-doc', title: 'Generate Certificate of Origin', group: 'AI Actions', icon: FileText, path: '/documents' },
  { id: 'act-buyer', title: 'Search High-Match EU Buyers', group: 'AI Actions', icon: Users, path: '/buyer-discovery' },
  { id: 'act-forex', title: 'Check USD/INR Hedging Strategy', group: 'AI Actions', icon: DollarSign, path: '/currency-risk' },
];

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const filtered = commandItems.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.group.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        const item = filtered[selectedIndex];
        if (item.action === 'open-strategy') {
          window.dispatchEvent(new CustomEvent('exportease:open-strategy'));
        } else {
          navigate(item.path);
        }
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 sm:px-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#03060c]/80 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Palette Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="relative w-full max-w-xl rounded-2xl border border-[#1e2e4f] bg-[#0a1122] shadow-2xl shadow-black/90 z-10 overflow-hidden"
        >
          {/* Search Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#16233d]">
            <Search size={18} className="text-muted shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Type a command, route, or search global trade..."
              className="w-full bg-transparent border-none text-slate-100 placeholder:text-[var(--color-muted)] text-sm focus:outline-none"
            />
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#142038] text-muted border border-[#223354] shrink-0">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {filtered.length === 0 ? (
              <div className="py-10 text-center text-xs text-[var(--color-muted)]">
                No matching results found for "{query}"
              </div>
            ) : (
              filtered.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.action === 'open-strategy') {
                        window.dispatchEvent(new CustomEvent('exportease:open-strategy'));
                      } else {
                        navigate(item.path);
                      }
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      'flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-medium transition-colors text-left',
                      isSelected
                        ? 'bg-blue-600/20 text-primary border border-blue-500/30'
                        : 'text-secondary hover:bg-[#121c33]'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'p-1.5 rounded-lg border shrink-0',
                          isSelected
                            ? 'bg-indigo-950/500/20 border-blue-500/40 text-blue-300'
                            : 'bg-[#101b33] border-[#1a2b4a] text-muted'
                        )}
                      >
                        <item.icon size={15} />
                      </div>
                      <div>
                        <p className="text-slate-100 font-semibold">{item.title}</p>
                        <p className="text-[10px] text-[var(--color-muted)] font-mono mt-0.5">{item.path || '⚡ AI Action'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-[var(--color-muted)] px-1.5 py-0.5 rounded bg-[var(--color-surface-card)] backdrop-blur-md/5">
                        {item.group}
                      </span>
                      {isSelected && <ArrowRight size={13} className="text-blue-400" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Navigation Hints */}
          <div className="px-4 py-2 bg-[#070c18] border-t border-[#16233d] flex items-center justify-between text-[11px] text-[var(--color-muted)]">
            <div className="flex items-center gap-3">
              <span><kbd className="text-[10px] font-mono bg-[var(--color-surface-card)] backdrop-blur-md/10 px-1 rounded">↑↓</kbd> Navigate</span>
              <span><kbd className="text-[10px] font-mono bg-[var(--color-surface-card)] backdrop-blur-md/10 px-1 rounded">↵</kbd> Select</span>
            </div>
            <span>ExportEase Command Palette</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
