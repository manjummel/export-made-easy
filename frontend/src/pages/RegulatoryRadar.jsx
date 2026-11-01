import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, AlertTriangle, ShieldCheck, Filter, Search,
  Calendar, Building, ArrowUpRight, CheckCircle2, Bookmark, RefreshCw
} from 'lucide-react';
import {
  Card, CardHeader, Button, Badge, Input, Select, useToast
} from '../components/ui';
import PageHeader from '../components/shared/PageHeader';
import enterpriseFeaturesService from '../services/enterpriseFeaturesService';

const CHAPTER_FILTERS = [
  { value: '', label: 'All Chapters & Policies' },
  { value: 'Chapter 72', label: 'Chapter 72 & 73 (Iron & Steel)' },
  { value: 'Chapter 10', label: 'Chapter 10 (Cereals & Basmati Rice)' },
  { value: 'Chapter 61', label: 'Chapter 61-63 (Apparel & Textiles)' },
  { value: 'Chapter 41', label: 'Chapter 41 & 44 (Leather, Wood & EUDR)' }
];

export default function RegulatoryRadar() {
  const toast = useToast();
  const [selectedChapter, setSelectedChapter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [feed, setFeed] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedNotices, setSavedNotices] = useState(new Set());

  const fetchRadar = async (chapter = selectedChapter) => {
    setIsLoading(true);
    try {
      const res = await enterpriseFeaturesService.fetchRegulatoryRadar(chapter);
      setFeed(res.feed || []);
    } catch {
      toast.error('Radar Offline', 'Could not sync with DGFT feed.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRadar(selectedChapter);
  }, [selectedChapter]);

  const toggleBookmark = (id) => {
    const next = new Set(savedNotices);
    if (next.has(id)) {
      next.delete(id);
      toast.info('Removed', 'Notice unbookmarked.');
    } else {
      next.add(id);
      toast.success('Bookmarked', 'Notice saved to enterprise compliance watchlist.');
    }
    setSavedNotices(next);
  };

  const simulateAlert = () => {
    toast.warning(
      'DGFT Flash Alert: Basmati Rice MEP Lifted',
      'Commerce Ministry removed the $950/MT minimum export price. Immediate zero-duty clearance active across Nhava Sheva & Mundra.'
    );
  };

  const filteredFeed = feed.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.chapter.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="DGFT & Customs Regulatory Change Radar"
        subtitle="Automated intelligence tracking Directorate General of Foreign Trade (DGFT) Public Notices, CBIC Customs Circulars, and WTO notifications."
        icon={Bell}
        breadcrumb={['ExportEase', 'Compliance', 'Regulatory Radar']}
        badge={<Badge variant="primary" size="sm" dot pulse>Live Radar Active</Badge>}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => fetchRadar()}
              loading={isLoading}
            >
              Sync Notices
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Bell}
              onClick={simulateAlert}
            >
              Simulate Watchlist Alert
            </Button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-xl border border-white/10 bg-surface-card">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search notifications, HS chapters, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-64">
          <Select
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
            options={CHAPTER_FILTERS}
          />
        </div>
      </div>

      {/* Regulatory Notices Cards Feed */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredFeed.map((item) => {
            const isBookmarked = savedNotices.has(item.id);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card className="p-5 hover:border-blue-500/40 transition-all border-l-4 border-l-blue-500">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" size="xs">
                          {item.id}
                        </Badge>
                        <Badge
                          variant={
                            item.impact_level === 'Critical'
                              ? 'danger'
                              : item.impact_level === 'High'
                              ? 'warning'
                              : 'primary'
                          }
                          size="xs"
                        >
                          {item.impact_level} Impact
                        </Badge>
                        <Badge variant="secondary" size="xs">
                          {item.authority}
                        </Badge>
                        <span className="text-[11px] text-text-muted flex items-center gap-1">
                          <Calendar size={12} /> {item.date}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-text-primary leading-snug">
                        {item.title}
                      </h3>

                      <p className="text-xs text-text-muted leading-relaxed">
                        {item.summary}
                      </p>

                      <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 text-xs">
                        <strong className="text-blue-400">Mandatory Action for Exporter: </strong>
                        <span className="text-text-primary font-medium">{item.action_required}</span>
                      </div>
                    </div>

                    {/* Right column metadata & bookmark */}
                    <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0">
                      <Button
                        variant={isBookmarked ? 'primary' : 'outline'}
                        size="xs"
                        icon={Bookmark}
                        onClick={() => toggleBookmark(item.id)}
                      >
                        {isBookmarked ? 'Bookmarked' : 'Save Notice'}
                      </Button>
                      <span className="text-[11px] text-text-muted font-mono bg-white/5 px-2 py-1 rounded">
                        {item.chapter}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredFeed.length === 0 && (
          <div className="text-center py-12 text-text-muted text-sm">
            No regulatory notices match your active filter.
          </div>
        )}
      </div>
    </div>
  );
}
