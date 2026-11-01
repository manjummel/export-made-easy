import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Ship, Globe, Compass, CheckCircle2, Clock, MapPin,
  Anchor, ArrowRight, ShieldCheck, FileText, AlertTriangle
} from 'lucide-react';
import { Button, Card, Badge, Progress, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui';
import PageHeader from '../components/shared/PageHeader';

export default function ShipmentTracking() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Shipment Tracking"
        subtitle="Track live port vessel locations, bill of lading milestones, and customs clearance events."
        icon={Ship}
        breadcrumb={['ExportEase', 'Shipment Tracking']}
        badge={<Badge variant="primary" size="sm" dot>Maersk EDI Live</Badge>}
      />

      {/* Primary In-Transit Shipment Card */}
      <Card className="p-6 bg-gradient-to-r from-blue-50/70 via-white to-slate-50 border-indigo-900/50 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="xs">In Transit</Badge>
              <span className="text-xs font-mono font-bold text-muted">Ref: EXP-1245</span>
            </div>
            <h2 className="text-lg font-extrabold text-primary mt-1">Handcrafted Brass Lamp Consignment</h2>
            <p className="text-xs text-muted">
              Chennai Port, India (INMAA) → Port of New York, USA (USNYC) &nbsp;|&nbsp; Carrier: <strong>Maersk Line</strong>
            </p>
          </div>

          <div className="p-3 bg-surface-card backdrop-blur-md rounded-xl border border-base text-center shrink-0">
            <span className="text-[10px] text-muted block font-semibold">Est. Arrival Date</span>
            <span className="font-mono font-bold text-sm text-emerald-700">12 Sept 2025</span>
            <span className="text-[10px] text-muted block">On Schedule</span>
          </div>
        </div>

        {/* Shipment Timeline Stepper */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-primary block">Vessel Progress Milestones</span>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs">
            {[
              { stage: 'Order Confirmed', date: '18 Aug', done: true },
              { stage: 'Docs Completed', date: '21 Aug', done: true },
              { stage: 'On Vessel', date: '24 Aug (Active)', active: true },
              { stage: 'Arrived Port', date: '08 Sept', pending: true },
              { stage: 'Out for Delivery', date: '12 Sept', pending: true },
            ].map((s) => (
              <div
                key={s.stage}
                className={`p-3 rounded-xl border text-left ${
                  s.done
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : s.active
                    ? 'bg-indigo-950/50 border-[#1746D2] text-[#1746D2] font-bold shadow-md'
                    : 'bg-surface-subtle border-base text-muted'
                }`}
              >
                <span className="text-[10px] block opacity-80">{s.date}</span>
                <span className="text-xs font-bold block mt-0.5">{s.stage}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
