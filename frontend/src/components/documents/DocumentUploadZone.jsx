import React, { useState, useRef } from 'react';
import {
  UploadCloud, FileText, Image as ImageIcon, Trash2, RefreshCw,
  CheckCircle2, AlertCircle, FileCheck, Sparkles, Plus, AlertTriangle
} from 'lucide-react';
import { Card, Button, Badge, Select, Progress, useToast } from '../ui';

const DOCUMENT_TYPES = [
  { value: 'commercial_invoice', label: 'Commercial Invoice (CI)' },
  { value: 'packing_list', label: 'Packing List (PL)' },
  { value: 'purchase_order', label: 'Purchase Order (PO)' },
  { value: 'bill_of_lading', label: 'Bill of Lading / AWB (B/L)' },
  { value: 'certificate_of_origin', label: 'Certificate of Origin (COO)' },
];

const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg'];
const MAX_FILE_SIZE_MB = 15;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function DocumentUploadZone({
  onFilesReady,
  isProcessing = false,
  onLoadPreset
}) {
  const toast = useToast();
  const fileInputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const [replaceTargetIndex, setReplaceTargetIndex] = useState(null);

  const [files, setFiles] = useState([]);
  const [docTypes, setDocTypes] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [isDragging, setIsDragging] = useState(false);

  // Validate single file
  const validateFile = (file) => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return { valid: false, error: `Invalid format (${ext}). Allowed: PDF, PNG, JPG, JPEG` };
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return { valid: false, error: `File too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max: 15MB` };
    }
    return { valid: true };
  };

  // Guess document type from file name
  const guessDocType = (filename) => {
    const lower = filename.toLowerCase();
    if (lower.includes('pack')) return 'packing_list';
    if (lower.includes('bl') || lower.includes('lading') || lower.includes('ocean') || lower.includes('airway')) return 'bill_of_lading';
    if (lower.includes('po') || lower.includes('purchase') || lower.includes('order')) return 'purchase_order';
    if (lower.includes('coo') || lower.includes('origin') || lower.includes('rex')) return 'certificate_of_origin';
    return 'commercial_invoice';
  };

  const addFiles = (newFileList) => {
    const validAdditions = [];
    const newTypes = { ...docTypes };
    const newProgress = { ...uploadProgress };

    Array.from(newFileList).forEach((file) => {
      // Check for duplicate names
      if (files.some((f) => f.name === file.name)) {
        toast.warning('Duplicate skipped', `${file.name} is already in the upload queue.`);
        return;
      }

      const val = validateFile(file);
      if (!val.valid) {
        toast.error('File Rejected', `${file.name}: ${val.error}`);
        return;
      }

      validAdditions.push(file);
      newTypes[file.name] = guessDocType(file.name);
      newProgress[file.name] = 100;
    });

    if (validAdditions.length > 0) {
      setFiles((prev) => [...prev, ...validAdditions]);
      setDocTypes(newTypes);
      setUploadProgress(newProgress);
      toast.success('Files Added', `${validAdditions.length} document(s) staged for cross-verification.`);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = '';
    }
  };

  const removeFile = (indexToRemove) => {
    const removedFile = files[indexToRemove];
    setFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (removedFile) {
      setDocTypes((prev) => {
        const copy = { ...prev };
        delete copy[removedFile.name];
        return copy;
      });
      setUploadProgress((prev) => {
        const copy = { ...prev };
        delete copy[removedFile.name];
        return copy;
      });
    }
  };

  const handleReplaceClick = (index) => {
    setReplaceTargetIndex(index);
    if (replaceInputRef.current) {
      replaceInputRef.current.click();
    }
  };

  const handleReplaceFile = (e) => {
    if (e.target.files && e.target.files.length > 0 && replaceTargetIndex !== null) {
      const newFile = e.target.files[0];
      const val = validateFile(newFile);
      if (!val.valid) {
        toast.error('Replace Failed', val.error);
        return;
      }

      setFiles((prev) => {
        const updated = [...prev];
        const oldFile = updated[replaceTargetIndex];
        updated[replaceTargetIndex] = newFile;

        setDocTypes((dt) => {
          const copy = { ...dt };
          if (oldFile) delete copy[oldFile.name];
          copy[newFile.name] = guessDocType(newFile.name);
          return copy;
        });

        return updated;
      });

      toast.success('File Replaced', `Replaced with ${newFile.name}`);
      setReplaceTargetIndex(null);
      e.target.value = '';
    }
  };

  const handleTypeChange = (fileName, newType) => {
    setDocTypes((prev) => ({
      ...prev,
      [fileName]: newType,
    }));
  };

  const triggerVerification = () => {
    if (files.length === 0) {
      toast.error('No Documents', 'Please upload at least one export document.');
      return;
    }
    if (onFilesReady) {
      onFilesReady(files, docTypes);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  return (
    <div className="space-y-4">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={handleReplaceFile}
        className="hidden"
      />

      {/* Dropzone Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10 scale-[1.008]'
            : 'border-base hover:border-blue-400/60 bg-surface/40 hover:bg-surface/80'
        }`}
      >
        <div className="flex flex-col items-center justify-center max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3 shadow-inner">
            <UploadCloud size={28} className={isDragging ? 'animate-bounce text-blue-500' : ''} />
          </div>
          <h3 className="text-base font-semibold text-text-primary mb-1">
            Drag & Drop Export Shipping Documents
          </h3>
          <p className="text-xs text-text-muted mb-4 leading-relaxed">
            Upload Commercial Invoices, Packing Lists, Purchase Orders, Bills of Lading, or Certificates of Origin for automated statutory OCR cross-verification.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-surface-alt border border-base font-mono text-text-muted">.PDF</span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-surface-alt border border-base font-mono text-text-muted">.PNG</span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-surface-alt border border-base font-mono text-text-muted">.JPG</span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-surface-alt border border-base font-mono text-text-muted">.JPEG</span>
            <span className="text-[11px] text-text-muted">| Max 15MB each</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Browse Local Files
          </Button>
        </div>
      </div>

      {/* Preset Fast Testing Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-blue-500/5 border border-blue-500/15">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-blue-400" />
          <span className="text-xs font-medium text-text-primary">Instant Testing Scenarios:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onLoadPreset && onLoadPreset('textiles_discrepancy')}
            className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
          >
            ⚡ Load Textiles Multi-Doc Set (With Mismatches)
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onLoadPreset && onLoadPreset('basmati_clean')}
            className="text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
          >
            ✓ Load Basmati Rice Clean Consignment (100% Pass)
          </Button>
        </div>
      </div>

      {/* Staged Files List */}
      {files.length > 0 && (
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-base">
            <div className="flex items-center gap-2">
              <FileCheck size={18} className="text-blue-400" />
              <span className="text-sm font-semibold text-text-primary">
                Uploaded Documents ({files.length})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="xs"
                icon={Plus}
                onClick={() => fileInputRef.current?.click()}
              >
                Add More
              </Button>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => {
                  setFiles([]);
                  setDocTypes({});
                  setUploadProgress({});
                }}
                className="text-rose-400 hover:text-rose-300"
              >
                Clear All
              </Button>
            </div>
          </div>

          <div className="divide-y divide-base">
            {files.map((file, idx) => {
              const isPdf = file.name.toLowerCase().endsWith('.pdf');
              const selectedType = docTypes[file.name] || 'commercial_invoice';

              return (
                <div key={`${file.name}-${idx}`} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* File meta */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-surface-alt border border-base flex items-center justify-center shrink-0 text-text-muted">
                      {isPdf ? <FileText size={20} className="text-rose-400" /> : <ImageIcon size={20} className="text-blue-400" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate max-w-xs md:max-w-md">
                        {file.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <Badge variant="success" size="xs">
                          Ready for OCR
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Type selector */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-48">
                      <select
                        value={selectedType}
                        onChange={(e) => handleTypeChange(file.name, e.target.value)}
                        className="w-full text-xs bg-surface border border-base rounded-lg px-2.5 py-1.5 text-text-primary focus:outline-none focus:border-blue-500"
                      >
                        {DOCUMENT_TYPES.map((dt) => (
                          <option key={dt.value} value={dt.value}>
                            {dt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Button
                      variant="outline"
                      size="xs"
                      icon={RefreshCw}
                      title="Replace file"
                      onClick={() => handleReplaceClick(idx)}
                    >
                      Replace
                    </Button>

                    <Button
                      variant="ghost"
                      size="xs"
                      icon={Trash2}
                      title="Remove file"
                      onClick={() => removeFile(idx)}
                      className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Trigger */}
          <div className="pt-3 border-t border-base flex items-center justify-between">
            <span className="text-xs text-text-muted">
              Select document roles above to optimize multi-way cross-verification algorithms.
            </span>
            <Button
              variant="primary"
              size="md"
              icon={Sparkles}
              loading={isProcessing}
              onClick={triggerVerification}
            >
              Extract & Cross-Verify Documents
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

