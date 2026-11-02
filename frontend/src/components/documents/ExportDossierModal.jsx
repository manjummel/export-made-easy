import React from 'react';
import { Printer, Download, X, FileText } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { generateExportDossierHTML } from '../../utils/exportDossierGenerator';

export default function ExportDossierModal({ isOpen, onClose, consignment = {} }) {
  const htmlContent = generateExportDossierHTML(consignment);

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>Export Dossier — ${consignment.iecNumber || 'Apex'}</title>
          </head>
          <body style="margin: 20px;">
            ${htmlContent}
            <script>window.onload = function() { window.print(); };</script>
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Statutory Export Dossier Preview"
      size="lg"
    >
      <div className="space-y-4">
        <div
          className="bg-white rounded-lg p-2 max-h-[60vh] overflow-y-auto"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-700">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" icon={Printer} onClick={handlePrint}>
            Print / Save as PDF
          </Button>
        </div>
      </div>
    </Modal>
  );
}
