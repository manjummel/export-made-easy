import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import CommandPalette from './CommandPalette';
import CinematicBackground from './CinematicBackground';
import { AIStrategyExperience } from '../strategy';
import { SourceDrawer } from '../evidence';
import { EvidenceProvider } from '../../context/EvidenceContext';
import { useTheme } from '../../context/ThemeContext';
import { pageVariants } from '../../components/animations';

const SIDEBAR_EXPANDED = 250;
const SIDEBAR_COLLAPSED = 68;

export default function AppShell() {
  const location = useLocation();
  const { theme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [strategyModalOpen, setStrategyModalOpen] = useState(false);

  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED;

  // Global Ctrl + K / Cmd + K listener
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Global custom event listener to trigger the signature strategy experience
  useEffect(() => {
    function handleOpenStrategy() {
      setStrategyModalOpen(true);
    }
    window.addEventListener('exportease:open-strategy', handleOpenStrategy);
    return () => window.removeEventListener('exportease:open-strategy', handleOpenStrategy);
  }, []);

  return (
    <EvidenceProvider>
      <div className="relative min-h-screen text-[var(--text-primary)] flex flex-col font-sans selection:bg-[#1746D2] selection:text-primary overflow-hidden">
        
        {/* ── Cinematic Adaptive Background Layer ── */}
        <CinematicBackground />

        {/* ── Main App Content (Z-10 so it's above bg) ── */}
        <div className="relative z-10 flex w-full min-h-screen">
          {/* Collapsible Left Navigation */}
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
        />

        {/* Fixed Top Header */}
        <TopBar
          sidebarWidth={sidebarWidth}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />

        {/* Global Command Palette */}
        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
        />

        {/* Verified Regulatory Evidence Drawer (Global) */}
        <SourceDrawer />

        {/* AI Strategy Generation Experience Modal */}
        <AIStrategyExperience
          isOpen={strategyModalOpen}
          onClose={() => setStrategyModalOpen(false)}
        />

        {/* Main Workspace View */}
        <main
          style={{ marginLeft: sidebarWidth }}
          className="flex-1 min-h-screen pt-16 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
        >
          <div className="p-5 sm:p-7 max-w-[1600px] mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                variants={pageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Outlet context={{ openStrategyExperience: () => setStrategyModalOpen(true) }} />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
        </div>
      </div>
    </EvidenceProvider>
  );
}
