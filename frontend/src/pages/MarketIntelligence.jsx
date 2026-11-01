import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem } from '../components/animations';
import { Card, CardHeader, Badge, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';
import { Search, Globe, TrendingUp, BarChart3, AlertTriangle, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';

const MARKET_DATA = [
  { country: 'United States', code: 'US', demand: 'High', tariff: '2.5%', compliance: 'FDA, CBP', score: 92, trend: '+4.2%' },
  { country: 'United Arab Emirates', code: 'AE', demand: 'Very High', tariff: '5.0%', compliance: 'Dubai Customs, ESMA', score: 88, trend: '+6.1%' },
  { country: 'Germany', code: 'DE', demand: 'Medium', tariff: '0.0%', compliance: 'CE, REACH', score: 85, trend: '+2.8%' },
  { country: 'Singapore', code: 'SG', demand: 'High', tariff: '0.0%', compliance: 'SFA, Customs', score: 94, trend: '+5.5%' },
  { country: 'United Kingdom', code: 'UK', demand: 'High', tariff: '2.0%', compliance: 'UKCA, DEFRA', score: 87, trend: '+3.1%' },
];

export default function MarketIntelligence() {
  return (
    <div className="space-y-6 pb-16">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div variants={staggerItem}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
                Global Market Intelligence
              </h1>
              <p className="text-sm mt-1 text-[var(--text-secondary)]">
                AI-driven analysis of export demand, target tariffs, and compliance barriers.
              </p>
            </div>
            <Button variant="primary" icon={Search}>New Market Report</Button>
          </div>
        </motion.div>

        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6" variants={staggerContainer}>
          <Card className="p-5 border border-[var(--color-border-base)] shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Global Demand Index</span>
              <Globe size={16} className="text-blue-500" />
            </div>
            <div className="text-3xl font-extrabold text-[var(--text-primary)] mt-3">8.4<span className="text-sm text-[var(--text-muted)]">/10</span></div>
            <div className="text-xs text-emerald-500 font-semibold mt-2 flex items-center gap-1">
              <TrendingUp size={12} /> +12% vs last quarter
            </div>
          </Card>
          <Card className="p-5 border border-[var(--color-border-base)] shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Avg Dest. Tariff</span>
              <BarChart3 size={16} className="text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-[var(--text-primary)] mt-3">3.2%</div>
            <div className="text-xs text-blue-500 font-semibold mt-2">FTA optimization available</div>
          </Card>
          <Card className="p-5 border border-[var(--color-border-base)] shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Compliance Complexity</span>
              <AlertTriangle size={16} className="text-rose-500" />
            </div>
            <div className="text-3xl font-extrabold text-[var(--text-primary)] mt-3">Medium</div>
            <div className="text-xs text-[var(--text-secondary)] mt-2">Certifications required for top 3 markets</div>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem} className="mt-8">
          <Card className="border border-[var(--color-border-base)]">
            <CardHeader title="Top Verified Markets" subtitle="Ranked by AI based on duty rates, demand, and ease of doing business." />
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>Destination</TableHead>
                  <TableHead>Demand Level</TableHead>
                  <TableHead>Import Tariff</TableHead>
                  <TableHead>Compliance Reqs</TableHead>
                  <TableHead>AI Score</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {MARKET_DATA.map((market, idx) => (
                  <TableRow key={idx} className="hover:bg-[var(--color-surface-subtle)] cursor-pointer">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-[var(--text-muted)]" />
                        <span className="font-semibold text-[var(--text-primary)]">{market.country}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={market.demand.includes('High') ? 'success' : 'warning'} size="xs">{market.demand}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{market.tariff}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-[var(--text-secondary)]">{market.compliance}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${market.score}%` }} />
                        </div>
                        <span className="text-xs font-bold text-[var(--text-primary)]">{market.score}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="xs" iconRight={ArrowRight}>Analyze</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
