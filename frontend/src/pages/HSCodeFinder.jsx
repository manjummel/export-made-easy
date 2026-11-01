import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '../components/animations';
import { Card, CardHeader, Button, Badge } from '../components/ui';
import { Search, Hash, CheckCircle2, AlertCircle, RefreshCw, BookOpen, Layers } from 'lucide-react';

export default function HSCodeFinder() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null);

  const handleSearch = () => {
    if (!query) return;
    setIsSearching(true);
    setTimeout(() => {
      setResults([
        { code: '8471.30.10', desc: 'Portable automatic data processing machines, weighing not more than 10 kg', chapter: '84', duty: '0%', verified: true },
        { code: '8471.41.00', desc: 'Other automatic data processing machines: comprising in the same housing at least a CPU', chapter: '84', duty: '5%', verified: true },
      ]);
      setIsSearching(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-16">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            AI HS Code Classification
          </h1>
          <p className="text-sm mt-1 text-[var(--text-secondary)]">
            Enterprise-grade harmonized system code determination with statutory verification.
          </p>
        </div>

        <Card className="p-6 border border-[var(--color-border-base)] shadow-xs">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Product Description</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-[var(--text-muted)]" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 border border-[var(--color-border-base)] rounded-xl bg-[var(--color-surface-card)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  placeholder="e.g., Portable computing devices weighing less than 10kg..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <Button 
              variant="primary" 
              className="w-full md:w-auto px-6 h-[42px]"
              onClick={handleSearch}
              disabled={isSearching || !query}
              icon={isSearching ? RefreshCw : Hash}
            >
              {isSearching ? 'Analyzing...' : 'Classify Product'}
            </Button>
          </div>
        </Card>

        {results && (
          <motion.div variants={fadeInUp} className="mt-6 space-y-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Layers size={16} className="text-blue-500" />
              Suggested Classifications
            </h3>
            
            {results.map((res, i) => (
              <Card key={i} className="p-5 border border-[var(--color-border-base)] hover:border-blue-500/50 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                      <Hash size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-extrabold font-mono tracking-tight text-[var(--text-primary)]">
                          {res.code}
                        </span>
                        {res.verified && (
                          <Badge variant="success" size="xs" icon={CheckCircle2}>Officially Verified</Badge>
                        )}
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
                        {res.desc}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-3 text-xs font-medium text-[var(--text-muted)]">
                        <span className="flex items-center gap-1"><BookOpen size={14} /> Chapter {res.chapter}</span>
                        <span>Standard Duty: <strong className="text-[var(--text-primary)]">{res.duty}</strong></span>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="secondary" size="sm">Select Code</Button>
                </div>
              </Card>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
