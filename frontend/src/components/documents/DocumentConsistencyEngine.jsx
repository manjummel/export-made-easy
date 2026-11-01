import React from 'react';
import {
  CheckCircle2, AlertTriangle, FileText, Check,
  AlertCircle, RefreshCw, ShieldCheck, Layers
} from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export const CONSISTENCY_MATRIX = [
  {
    field: 'Product Description',
    ci: 'Men\'s Organic Woven Cotton Shirts (100% Cotton)',
    pl: 'Men\'s Organic Woven Cotton Shirts (100% Cotton)',
    sb: 'Men\'s Organic Woven Cotton Shirts (100% Cotton)',
    coo: 'Men\'s Organic Woven Cotton Shirts (100% Cotton)',
    match: true,
  },
  {
    field: 'Consignment Quantity',
    ci: '3,500 Units (70 Master Cartons)',
    pl: '3,500 Units (70 Master Cartons @ 50 pcs)',
    sb: '3,500 Units / 70 CTN',
    coo: '3,500 Units (70 Cartons)',
    match: true,
  },
  {
    field: 'Total Invoice Value',
    ci: '$84,000.00 USD (FOB)',
    pl: 'Value N/A (Weight: 1,750 kg Net)',
    sb: '$84,000.00 USD (FOB ₹70,81,200)',
    coo: '$84,000.00 USD',
    match: true,
  },
  {
    field: 'Harmonized Tariff Code',
    ci: 'HS 6205.20.00',
    pl: 'HS 6205.20.00',
    sb: 'HS 6205.20.00 (RoDTEP Y)',
    coo: 'HS 6205.20.00',
    match: true,
  },
  {
    field: 'Country of Origin',
    ci: 'India',
    pl: 'India',
    sb: 'India (INMAA1)',
    coo: 'India (Form AI - CEPA)',
    match: true,
  },
  {
    field: 'Incoterms & Currency',
    ci: 'FOB Chennai Port (USD)',
    pl: 'FOB Chennai Port',
    sb: 'FOB Chennai Port (USD)',
    coo: 'FOB Chennai Port',
    match: true,
  },
];

export default function DocumentConsistencyEngine({
  items = CONSISTENCY_MATRIX,
  onResolveIssue = () => {},
}) {
  const allMatch = items.every((i) => i.match);

  return (
    <Card className="p-6 space-y-5 border-[var(--color-border-base)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[var(--color-primary)]">
                Automated Document Consistency Engine
              </h3>
              <Badge variant="success" size="xs">100% Cross-Matched</Badge>
            </div>
            <p className="text-xs text-[var(--color-muted)] mt-0.5">
              Reconciles Commercial Invoice, Packing List, Shipping Bill, and Certificate of Origin
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="xs"
          icon={RefreshCw}
          onClick={() => {}}
        >
          Re-Scan Documents
        </Button>
      </div>

      {/* Cross-Document Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--color-border-base)] bg-[var(--color-surface-subtle)]/80 text-[var(--color-muted)] font-semibold">
              <th className="p-3">Data Field</th>
              <th className="p-3">Commercial Invoice</th>
              <th className="p-3">Packing List</th>
              <th className="p-3">ICEGATE Shipping Bill</th>
              <th className="p-3">Certificate of Origin</th>
              <th className="p-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((row, idx) => (
              <tr key={idx} className="hover:bg-[var(--color-surface-subtle)]/60 transition-colors">
                <td className="p-3 font-bold text-[var(--color-primary)] whitespace-nowrap">
                  {row.field}
                </td>
                <td className="p-3 text-[var(--color-secondary)] font-medium">{row.ci}</td>
                <td className="p-3 text-[var(--color-secondary)]">{row.pl}</td>
                <td className="p-3 text-[var(--color-secondary)] font-mono">{row.sb}</td>
                <td className="p-3 text-[var(--color-secondary)]">{row.coo}</td>
                <td className="p-3 text-right whitespace-nowrap">
                  {row.match ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold text-[11px]">
                      <Check size={12} /> Verified Match
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded font-semibold text-[11px]">
                      <AlertCircle size={12} /> Review Required
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
