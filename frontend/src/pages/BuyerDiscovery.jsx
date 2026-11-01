import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, staggerItem } from '../components/animations';
import { Card, CardHeader, Badge, Button, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';
import { Users, Filter, Star, Mail, ExternalLink, ShieldCheck, TrendingUp, Building } from 'lucide-react';

const BUYERS_DATA = [
  { name: 'Global Retail Enterprises LLC', country: 'United States', industry: 'General Retail', score: 98, verified: true, orders: '150+', volume: '$2.5M+', email: 'procurement@globalretail.com', website: 'https://www.globalretail.com' },
  { name: 'EuroTrade Import & Dist.', country: 'Germany', industry: 'Wholesale Distribution', score: 95, verified: true, orders: '85+', volume: '$1.2M+', email: 'import@eurotrade.de', website: 'https://www.eurotrade.de' },
  { name: 'Emirates Sourcing Group', country: 'United Arab Emirates', industry: 'Construction & Material', score: 91, verified: true, orders: '40+', volume: '$850K+', email: 'sourcing@emiratessourcing.ae', website: 'https://www.emiratessourcing.ae' },
  { name: 'Pacific Rim Importers', country: 'Singapore', industry: 'Electronics & Components', score: 88, verified: false, orders: '12+', volume: '$320K+', email: 'contact@pacificrim.sg', website: 'https://www.pacificrim.sg' },
  { name: 'Nordic General Suppliers', country: 'United Kingdom', industry: 'Consumer Goods', score: 94, verified: true, orders: '65+', volume: '$950K+', email: 'buyers@nordicgeneral.co.uk', website: 'https://www.nordicgeneral.co.uk' },
  { name: 'Al Maktoum Trading', country: 'United Arab Emirates', industry: 'Apparel & Textiles', score: 96, verified: true, orders: '120+', volume: '$1.8M+', email: 'purchasing@almaktoumtrading.ae', website: 'https://www.almaktoumtrading.ae' },
  { name: 'Oceana Seafood Imports', country: 'Australia', industry: 'Food & Beverage', score: 92, verified: true, orders: '55+', volume: '$750K+', email: 'supply@oceanaseafood.com.au', website: 'https://www.oceanaseafood.com.au' },
  { name: 'TechSphere GmbH', country: 'Germany', industry: 'Electronics & Components', score: 89, verified: false, orders: '25+', volume: '$410K+', email: 'vendor@techsphere.de', website: 'https://www.techsphere.de' },
  { name: 'Maple Leaf Distributors', country: 'Canada', industry: 'General Retail', score: 93, verified: true, orders: '70+', volume: '$1.1M+', email: 'sourcing@mapleleafdist.ca', website: 'https://www.mapleleafdist.ca' },
];

export default function BuyerDiscovery() {
  return (
    <div className="space-y-6 pb-16">
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <motion.div variants={staggerItem}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
                Verified Importer Discovery
              </h1>
              <p className="text-sm mt-1 text-[var(--text-secondary)]">
                Connect with pre-vetted international buyers backed by trade credit intelligence.
              </p>
            </div>
            <Button variant="primary" icon={Filter}>Filter Leads</Button>
          </div>
        </motion.div>

        <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6" variants={staggerContainer}>
          <Card className="p-5 border border-[var(--color-border-base)] shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Active Buyers</span>
              <Users size={16} className="text-blue-500" />
            </div>
            <div className="text-3xl font-extrabold text-[var(--text-primary)] mt-3">2,450+</div>
          </Card>
          <Card className="p-5 border border-[var(--color-border-base)] shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Verified Profiles</span>
              <ShieldCheck size={16} className="text-emerald-500" />
            </div>
            <div className="text-3xl font-extrabold text-[var(--text-primary)] mt-3">85%</div>
          </Card>
          <Card className="p-5 border border-[var(--color-border-base)] shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Avg Credit Rating</span>
              <Star size={16} className="text-amber-500" />
            </div>
            <div className="text-3xl font-extrabold text-[var(--text-primary)] mt-3">A-</div>
          </Card>
          <Card className="p-5 border border-[var(--color-border-base)] shadow-xs">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Market Growth</span>
              <TrendingUp size={16} className="text-indigo-500" />
            </div>
            <div className="text-3xl font-extrabold text-[var(--text-primary)] mt-3">+18%</div>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem} className="mt-8">
          <Card className="border border-[var(--color-border-base)]">
            <CardHeader title="Lead Intelligence Matches" subtitle="Buyers currently active in your product categories with strong credit scores." />
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>Company Profile</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Trust Score</TableHead>
                  <TableHead>Import Volume</TableHead>
                  <TableHead>Past Orders</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {BUYERS_DATA.map((buyer, idx) => (
                  <TableRow key={idx} className="hover:bg-[var(--color-surface-subtle)] transition-colors">
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-md bg-[var(--color-surface-hover)]">
                          <Building size={16} className="text-[var(--text-muted)]" />
                        </div>
                        <div>
                          <span className="font-bold text-[var(--text-primary)] block">{buyer.name}</span>
                          <span className="text-[11px] text-[var(--text-secondary)]">{buyer.industry}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold">{buyer.country}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={buyer.score > 90 ? 'success' : 'warning'} size="xs">{buyer.score}/100</Badge>
                        {buyer.verified && <ShieldCheck size={14} className="text-emerald-500" />}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs">{buyer.volume}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{buyer.orders}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="secondary" size="xs" icon={Mail} onClick={() => window.open(`mailto:${buyer.email}`)}>Contact</Button>
                        <Button variant="ghost" size="xs" icon={ExternalLink} onClick={() => window.open(buyer.website, '_blank')} title="Visit Buyer Portal" />
                      </div>
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
