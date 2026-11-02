import { useState, useCallback } from 'react';

export function useDocumentAudit() {
  const [discrepancies, setDiscrepancies] = useState([]);
  const [isAuditing, setIsAuditing] = useState(false);

  const runAudit = useCallback((invoice, bl, lc) => {
    setIsAuditing(true);
    const issues = [];

    if (invoice.hsCode && bl.hsCode && invoice.hsCode !== bl.hsCode) {
      issues.push({
        id: 'DISC-01',
        title: 'HS Tariff Code Mismatch',
        severity: 'critical',
        detail: `Commercial invoice specifies ${invoice.hsCode} while Bill of Lading specifies ${bl.hsCode}. Customs will reject declaration.`,
        resolution: `Align Bill of Lading item classification to certified invoice HS Code ${invoice.hsCode}.`
      });
    }

    if (invoice.grossWeight && bl.grossWeight) {
      const invW = Number(invoice.grossWeight);
      const blW = Number(bl.grossWeight);
      const diff = Math.abs(invW - blW);
      if (diff > (invW * 0.01)) {
        issues.push({
          id: 'DISC-02',
          title: 'Weight Variance Exceeds 1% Threshold',
          severity: 'critical',
          detail: `Invoice gross weight (${invW} kg) differs from BL gross weight (${blW} kg) by ${diff.toFixed(1)} kg.`,
          resolution: 'Re-weigh consignment at port terminal and obtain certified Tare Weight slip.'
        });
      }
    }

    if (lc.maxAmount && invoice.amount) {
      if (Number(invoice.amount) > Number(lc.maxAmount)) {
        issues.push({
          id: 'DISC-03',
          title: 'Invoice Exceeds Letter of Credit Cap',
          severity: 'high',
          detail: `Invoice total ($${Number(invoice.amount).toLocaleString()}) exceeds LC limit ($${Number(lc.maxAmount).toLocaleString()}). Issuing bank will dishonor presentation under UCP 600.`,
          resolution: 'Request buyer bank for LC amendment or split bill of entry.'
        });
      }
    }

    setDiscrepancies(issues);
    setIsAuditing(false);
    return issues;
  }, []);

  return {
    discrepancies,
    isAuditing,
    runAudit,
    clearAudit: () => setDiscrepancies([])
  };
}
