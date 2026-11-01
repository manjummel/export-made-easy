import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, CheckCircle2, AlertTriangle, Sparkles, FileText, Check } from 'lucide-react';
import { Button, Card, Badge, useToast } from '../components/ui';
import PageHeader from '../components/shared/PageHeader';

export default function Notifications() {
  const navigate = useNavigate();
  const toast = useToast();
  const [filter, setFilter] = useState('all');

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'buyers', title: 'Buyer Replied', desc: 'ABC Global Imports replied to your inquiry message.', time: '10 mins ago', category: 'buyers' },
    { id: 2, type: 'compliance', title: 'Compliance Alert', desc: 'EU GSP documentation requirement updated.', time: '1 hour ago', category: 'compliance' },
    { id: 3, type: 'ai', title: 'AI Opportunity', desc: 'High demand detected for your products in Germany.', time: 'Yesterday', category: 'ai' },
    { id: 4, type: 'documents', title: 'Document Approved', desc: 'Commercial Invoice EXP-2026-0842 validated.', time: 'Yesterday', category: 'documents' },
  ]);

  const handleMarkAllRead = () => {
    toast.success('Marked Read', 'All notifications marked as read.');
  };

  const filtered = filter === 'all' ? notifications : notifications.filter((n) => n.category === filter);

  return (
    <div className="space-y-6 pb-16">
      <PageHeader
        title="Notifications"
        subtitle="All your export updates, compliance alerts, and buyer messages in one place."
        icon={Bell}
        breadcrumb={['ExportEase', 'Notifications']}
        actions={
          <Button variant="outline" size="sm" icon={Check} onClick={handleMarkAllRead}>
            Mark all as read
          </Button>
        }
      />

      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          {['all', 'exports', 'buyers', 'compliance', 'ai'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                filter === cat ? 'bg-[#1746D2] text-primary' : 'bg-surface-base text-muted hover:bg-[var(--color-border-base)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.map((n) => (
            <div key={n.id} className="p-3.5 rounded-xl bg-surface-subtle border border-base flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-950/50 text-[#1746D2] border border-blue-100">
                  <Sparkles size={16} />
                </div>
                <div>
                  <span className="font-bold text-primary block">{n.title}</span>
                  <span className="text-muted">{n.desc}</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-muted">{n.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
