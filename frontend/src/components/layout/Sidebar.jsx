import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { EASE_OUT_EXPO } from '../animations';
import {
  LayoutDashboard, Package, Hash, FolderKanban, FileCheck2, ShieldCheck,
  Ship, FileText, Award, Globe, Users, Bot, Sparkles, AlertTriangle,
  BookOpen, Bell, Settings, User, ChevronLeft, ChevronRight, Compass, Palette,
  Cpu, Network, DollarSign, TrendingUp, Leaf, Landmark
} from 'lucide-react';
import { cn } from '../../lib/cn';
import Tooltip from '../ui/Tooltip';

const navCategories = [
  {
    title: 'OVERVIEW',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, badge: null },
      { label: 'Product Analysis', path: '/product-analysis', icon: Package, badge: null },
      { label: 'HS Classification', path: '/hs-finder', icon: Hash, badge: 'AI' },
      { label: 'Document Procedures', path: '/document-procedure', icon: FileCheck2, badge: null },
      { label: 'Compliance Center', path: '/compliance', icon: ShieldCheck, badge: null },
    ],
  },
  {
    title: 'DOCUMENTS & COMPLIANCE',
    items: [
      { label: 'Documentation Hub', path: '/documents', icon: FileText, badge: null },
      { label: 'OCR Audit Studio', path: '/document-audit', icon: FileCheck2, badge: 'New' },
      { label: 'Regulatory Radar', path: '/regulatory-radar', icon: Bell, badge: 'Live' },
      { label: 'Compliance & Certs', path: '/compliance', icon: ShieldCheck, badge: null },
      { label: 'Verified Sources', path: '/sources', icon: Award, badge: 'Official' },
    ],
  },
  {
    title: 'MARKET INTELLIGENCE',
    items: [
      { label: 'Global Market Intel', path: '/market-intelligence', icon: Globe, badge: null },
      { label: 'Buyer Discovery', path: '/buyer-discovery', icon: Users, badge: null },
      { label: 'Demand Forecast', path: '/demand-forecast', icon: TrendingUp, badge: 'AI' },
      { label: 'Shipment Tracking', path: '/global-metrics', icon: Ship, badge: 'Live' },
    ],
  },
  {
    title: 'AI & AGENTS',
    items: [
      { label: 'Agent Command Center', path: '/agents', icon: Cpu, badge: 'Live' },
      { label: 'AI Consultant', path: '/ai-consultant', icon: Bot, badge: 'AI' },
      { label: 'Smart Recommendations', path: '/smart-recommendations', icon: Sparkles, badge: null },
      { label: 'MCP Control Center', path: '/mcp-control', icon: Network, badge: 'New' },
    ],
  },
  {
    title: 'TRADE & FINANCE',
    items: [
      { label: 'TReDS Trade Finance', path: '/trade-finance', icon: Landmark, badge: 'MSME' },
      { label: 'EU CBAM Calculator', path: '/cbam-calculator', icon: Leaf, badge: 'ESG' },
      { label: 'Currency Risk', path: '/currency-risk', icon: DollarSign, badge: null },
      { label: 'Trade Policies & FTA', path: '/trade-policies', icon: BookOpen, badge: null },
      { label: 'Export Roadmap', path: '/roadmap', icon: Compass, badge: null },
      { label: 'Risk Center', path: '/risk', icon: AlertTriangle, badge: null },
    ],
  },
  {
    title: 'ACCOUNT',
    items: [
      { label: 'Settings', path: '/settings', icon: Settings, badge: null },
      { label: 'Profile', path: '/profile', icon: User, badge: null },
    ],
  },
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();

  return (
    <motion.aside
      className={cn(
        'fixed left-0 top-0 h-full z-40 flex flex-col',
        'bg-surface-overlay backdrop-blur-md border-r border-base select-none shadow-xs',
        'transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
        collapsed ? 'w-[68px]' : 'w-[256px]'
      )}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-base bg-transparent shrink-0">
        <NavLink to="/" className="flex items-center gap-3 overflow-hidden">
          <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-[#1746D2] via-[#2563EB] to-[#60A5FA] flex items-center justify-center shrink-0 shadow-md border border-blue-400/30">
            <Compass size={17} className="text-white" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[var(--surface-overlay)]" />
          </div>

          {!collapsed && (
            <div className="flex flex-col truncate">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-extrabold tracking-tight leading-none"
                      style={{ color: 'var(--text-primary)' }}>
                  ExportEase
                </span>
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/50">
                  AI
                </span>
              </div>
              <span className="text-[10px] tracking-wide font-medium mt-0.5"
                    style={{ color: 'var(--text-muted)' }}>
                Trade Intelligence Platform
              </span>
            </div>
          )}
        </NavLink>
      </div>

      {/* Primary Categorized Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 space-y-4 scrollbar-none">
        {navCategories.map((cat, catIndex) => (
          <motion.div
            key={cat.title}
            className="space-y-0.5"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT_EXPO, delay: 0.12 + catIndex * 0.04 }}
          >
            {!collapsed && (
              <span className="text-[9px] font-bold uppercase tracking-widest px-3 block mb-1.5"
                    style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
                {cat.title}
              </span>
            )}
            {cat.items.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              const Icon = item.icon;

              const linkContent = (
                <NavLink to={item.path}>
                  <div
                    className={cn(
                      'relative flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-150',
                      'group cursor-pointer select-none',
                      isActive
                        ? 'bg-[var(--color-surface-card)] text-primary shadow-xs'
                        : 'hover:bg-surface-hover'
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-indicator"
                        className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-indigo-500"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}

                    <Icon
                      size={16}
                      className={cn(
                        'shrink-0 transition-all duration-150 group-hover:scale-110',
                        isActive ? 'text-indigo-400' : 'group-hover:text-secondary'
                      )}
                      style={isActive ? {} : { color: 'var(--text-muted)' }}
                    />

                    {!collapsed && (
                      <span className="truncate flex-1 text-xs font-semibold leading-none"
                            style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {item.label}
                      </span>
                    )}

                    {!collapsed && item.badge && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md border"
                            style={{
                              background: 'var(--surface-subtle)',
                              borderColor: 'var(--border-subtle)',
                              color: 'var(--text-accent)',
                            }}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </NavLink>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.path} content={item.label} side="right">
                    {linkContent}
                  </Tooltip>
                );
              }

              return <div key={item.path}>{linkContent}</div>;
            })}
          </motion.div>
        ))}
      </nav>

      {/* User Footer */}
      <motion.div
        className="p-3 border-t border-base shrink-0"
        style={{ background: 'var(--surface-subtle)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_OUT_EXPO, delay: 0.5 }}
      >
        <NavLink to="/profile" className="flex items-center gap-2.5 overflow-hidden p-1.5 rounded-xl hover:bg-surface-hover transition-colors">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
            AU
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate text-left">
              <span className="text-xs font-bold truncate leading-tight" style={{ color: 'var(--text-primary)' }}>
                Admin User
              </span>
              <span className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                Trade Manager
              </span>
            </div>
          )}
        </NavLink>
      </motion.div>

      {/* Collapse Toggle */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'absolute -right-3 top-20 z-50',
          'w-6 h-6 rounded-full border shadow-sm',
          'flex items-center justify-center',
          'transition-all duration-150 hover:scale-110 cursor-pointer'
        )}
        style={{
          background: 'var(--surface-card)',
          borderColor: 'var(--border-medium)',
          color: 'var(--text-muted)',
        }}
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>
    </motion.aside>
  );
}
