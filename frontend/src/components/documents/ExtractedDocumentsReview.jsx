import React, { useState } from 'react';
import {
  FileText, CheckCircle2, Edit3, Save, ChevronDown, ChevronUp,
  Hash, Calendar, User, Building, Package, Scale, DollarSign, Anchor
} from 'lucide-react';
import { Card, Button, Badge, Input } from '../ui';
import HSCodeChip from '../ui/HSCodeChip';

export default function ExtractedDocumentsReview({
  documents = [],
  onUpdateDocument,
  onReverify
}) {
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedFields, setEditedFields] = useState({});

  if (!documents || documents.length === 0) {
    return null;
  }

  const handleStartEdit = (idx, doc) => {
    setEditingIndex(idx);
    setEditedFields({ ...doc.fields });
  };

  const handleFieldChange = (field, val) => {
    setEditedFields((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const handleSaveEdit = (idx) => {
    if (onUpdateDocument) {
      onUpdateDocument(idx, editedFields);
    }
    setEditingIndex(null);
    if (onReverify) {
      onReverify();
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditedFields({});
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-text-primary">
            Parsed Document Intelligence ({documents.length})
          </h3>
          <p className="text-xs text-text-muted">
            Structured customs entities extracted via OCR & document parser. Review or modify values before ICEGATE submission.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {documents.map((doc, idx) => {
          const isExpanded = expandedIndex === idx;
          const isEditing = editingIndex === idx;
          const fields = isEditing ? editedFields : (doc.fields || {});

          return (
            <Card key={`${doc.filename}-${idx}`} className="overflow-hidden border border-base">
              {/* Header */}
              <div
                className="p-4 bg-surface-alt/50 flex flex-wrap items-center justify-between gap-3 cursor-pointer select-none"
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <FileText size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary">
                        {doc.document_label || doc.document_type}
                      </span>
                      <span className="text-xs text-text-muted">({doc.filename})</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="primary" size="xs">
                        {doc.document_type}
                      </Badge>
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={12} /> {doc.confidence || 95}% OCR Confidence
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="xs"
                      icon={Edit3}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(idx, doc);
                        setExpandedIndex(idx);
                      }}
                    >
                      Edit Fields
                    </Button>
                  ) : (
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="primary"
                        size="xs"
                        icon={Save}
                        onClick={() => handleSaveEdit(idx)}
                      >
                        Save & Sync
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}

                  <div className="text-text-muted p-1">
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
              </div>

              {/* Body */}
              {isExpanded && (
                <div className="p-4 bg-surface space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Exporter */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-text-muted flex items-center gap-1.5">
                        <Building size={12} className="text-blue-400" /> Exporter Name & Origin
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={fields.exporter_name || ''}
                          onChange={(e) => handleFieldChange('exporter_name', e.target.value)}
                          className="w-full text-xs bg-surface-alt border border-base rounded-md px-2.5 py-1.5 text-text-primary focus:outline-none focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-xs font-medium text-text-primary truncate">
                          {fields.exporter_name || '—'}
                        </p>
                      )}
                    </div>

                    {/* Consignee */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-text-muted flex items-center gap-1.5">
                        <User size={12} className="text-emerald-400" /> Importer / Consignee
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={fields.importer_name || ''}
                          onChange={(e) => handleFieldChange('importer_name', e.target.value)}
                          className="w-full text-xs bg-surface-alt border border-base rounded-md px-2.5 py-1.5 text-text-primary focus:outline-none focus:border-blue-500"
                        />
                      ) : (
                        <p className="text-xs font-medium text-text-primary truncate">
                          {fields.importer_name || '—'}
                        </p>
                      )}
                    </div>

                    {/* Invoice Reference & Date */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-text-muted flex items-center gap-1.5">
                        <Hash size={12} className="text-purple-400" /> Invoice Ref & Date
                      </label>
                      {isEditing ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Invoice No"
                            value={fields.invoice_number || ''}
                            onChange={(e) => handleFieldChange('invoice_number', e.target.value)}
                            className="w-1/2 text-xs bg-surface-alt border border-base rounded-md px-2 py-1.5 text-text-primary"
                          />
                          <input
                            type="text"
                            placeholder="Date"
                            value={fields.invoice_date || ''}
                            onChange={(e) => handleFieldChange('invoice_date', e.target.value)}
                            className="w-1/2 text-xs bg-surface-alt border border-base rounded-md px-2 py-1.5 text-text-primary"
                          />
                        </div>
                      ) : (
                        <p className="text-xs font-medium text-text-primary">
                          {fields.invoice_number || '—'} <span className="text-text-muted">({fields.invoice_date || '—'})</span>
                        </p>
                      )}
                    </div>

                    {/* Product Description */}
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[11px] font-medium text-text-muted flex items-center gap-1.5">
                        <Package size={12} className="text-amber-400" /> Product Description
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={fields.product_description || ''}
                          onChange={(e) => handleFieldChange('product_description', e.target.value)}
                          className="w-full text-xs bg-surface-alt border border-base rounded-md px-2.5 py-1.5 text-text-primary"
                        />
                      ) : (
                        <p className="text-xs text-text-primary">
                          {fields.product_description || '—'}
                        </p>
                      )}
                    </div>

                    {/* HS Code */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-text-muted flex items-center gap-1.5">
                        <Hash size={12} className="text-blue-400" /> HS Code (ITC-HS)
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={fields.hs_code || ''}
                          onChange={(e) => handleFieldChange('hs_code', e.target.value)}
                          className="w-full text-xs font-mono bg-surface-alt border border-base rounded-md px-2.5 py-1.5 text-text-primary"
                        />
                      ) : fields.hs_code ? (
                        <HSCodeChip code={fields.hs_code} size="sm" />
                      ) : (
                        <span className="text-xs text-text-muted">—</span>
                      )}
                    </div>

                    {/* Quantity & Unit */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-text-muted flex items-center gap-1.5">
                        <Package size={12} className="text-cyan-400" /> Quantity
                      </label>
                      {isEditing ? (
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={fields.quantity || ''}
                            onChange={(e) => handleFieldChange('quantity', parseFloat(e.target.value) || 0)}
                            className="w-2/3 text-xs bg-surface-alt border border-base rounded-md px-2 py-1.5 text-text-primary"
                          />
                          <input
                            type="text"
                            value={fields.unit || ''}
                            onChange={(e) => handleFieldChange('unit', e.target.value)}
                            className="w-1/3 text-xs bg-surface-alt border border-base rounded-md px-2 py-1.5 text-text-primary uppercase"
                          />
                        </div>
                      ) : (
                        <p className="text-xs font-medium text-text-primary">
                          {fields.quantity ? fields.quantity.toLocaleString() : '—'} {fields.unit || ''}
                        </p>
                      )}
                    </div>

                    {/* Gross & Net Weights */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-text-muted flex items-center gap-1.5">
                        <Scale size={12} className="text-rose-400" /> Weights (Gross / Net)
                      </label>
                      {isEditing ? (
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Gross kg"
                            value={fields.gross_weight || ''}
                            onChange={(e) => handleFieldChange('gross_weight', parseFloat(e.target.value) || 0)}
                            className="w-1/2 text-xs bg-surface-alt border border-base rounded-md px-2 py-1.5 text-text-primary"
                          />
                          <input
                            type="number"
                            placeholder="Net kg"
                            value={fields.net_weight || ''}
                            onChange={(e) => handleFieldChange('net_weight', parseFloat(e.target.value) || 0)}
                            className="w-1/2 text-xs bg-surface-alt border border-base rounded-md px-2 py-1.5 text-text-primary"
                          />
                        </div>
                      ) : (
                        <p className="text-xs font-medium text-text-primary">
                          {fields.gross_weight ? `${fields.gross_weight.toLocaleString()} kg G.W.` : '—'}
                          {fields.net_weight ? ` / ${fields.net_weight.toLocaleString()} kg N.W.` : ''}
                        </p>
                      )}
                    </div>

                    {/* Total Amount & Currency */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-text-muted flex items-center gap-1.5">
                        <DollarSign size={12} className="text-emerald-400" /> Declared Value
                      </label>
                      {isEditing ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={fields.currency || 'USD'}
                            onChange={(e) => handleFieldChange('currency', e.target.value)}
                            className="w-1/3 text-xs bg-surface-alt border border-base rounded-md px-2 py-1.5 text-text-primary uppercase"
                          />
                          <input
                            type="number"
                            value={fields.total_amount || ''}
                            onChange={(e) => handleFieldChange('total_amount', parseFloat(e.target.value) || 0)}
                            className="w-2/3 text-xs bg-surface-alt border border-base rounded-md px-2 py-1.5 text-text-primary"
                          />
                        </div>
                      ) : (
                        <p className="text-xs font-semibold text-emerald-400">
                          {fields.currency || '$'}{fields.total_amount ? fields.total_amount.toLocaleString() : '—'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Ports info */}
                  {(fields.port_of_loading || fields.port_of_discharge) && (
                    <div className="p-2.5 rounded-lg bg-surface-alt/70 border border-base flex items-center gap-2 text-xs text-text-muted">
                      <Anchor size={14} className="text-blue-400 shrink-0" />
                      <span>
                        <strong className="text-text-primary">POL:</strong> {fields.port_of_loading || 'N/A'} → <strong className="text-text-primary">POD:</strong> {fields.port_of_discharge || 'N/A'}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

