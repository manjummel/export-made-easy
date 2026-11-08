/**
 * ============================================================
 * ExportEase AI — ICEGATE Audit Report Generator
 * Formats and downloads standardized customs cross-verification dossiers.
 * ============================================================
 */

export function generateAuditTextReport(auditResult) {
  if (!auditResult) return 'No audit result data available.';

  const timestamp = auditResult.timestamp || new Date().toISOString();
  const auditId = auditResult.audit_id || 'AUDIT-' + Date.now();
  const score = auditResult.icegate_readiness_score ?? 0;
  const verdict = auditResult.compliance_verdict || 'PENDING';
  const docsCount = auditResult.documents_analyzed ?? 0;
  const critical = auditResult.critical_issues ?? 0;
  const warnings = auditResult.warnings ?? 0;
  const passed = auditResult.passed_checks ?? 0;

  const header = [
    '========================================================================',
    '       EXPORTEASE AI — ICEGATE 2.0 EXPORT COMPLIANCE DOSSIER            ',
    '========================================================================',
    `Audit ID          : ${auditId}`,
    `Generated At      : ${timestamp}`,
    `Compliance Verdict: ${verdict}`,
    `ICEGATE Readiness : ${score}% (${verdict === 'READY_FOR_ICEGATE' ? 'APPROVED FOR EDI FILING' : 'CUSTOMS HOLD / REJECTION RISK'})`,
    `Documents Audited : ${docsCount} shipping documents`,
    `Discrepancy Breakdown: ${critical} Critical | ${warnings} Warnings | ${passed} Passed`,
    '------------------------------------------------------------------------',
    '',
    '1. STATUTORY VERIFICATION AUDIT LOG:',
    '------------------------------------------------------------------------',
  ];

  const body = (auditResult.discrepancies || []).map((d, idx) => {
    return [
      `[#${idx + 1}] SEVERITY: ${d.severity ? d.severity.toUpperCase() : 'INFO'}`,
      `  Category   : ${d.category || 'General'}`,
      `  Field      : ${d.field || 'N/A'}`,
      `  Document A : ${d.document_a || 'Primary'} -> ${d.value_a || d.invoice_value || '—'}`,
      `  Document B : ${d.document_b || 'Supporting'} -> ${d.value_b || d.bl_value || '—'}`,
      `  Detail     : ${d.detail || 'None'}`,
      d.auto_fix ? `  Auto-Fix   : ${d.auto_fix}` : null,
      '',
    ].filter(Boolean).join('\n');
  });

  const footer = [
    '------------------------------------------------------------------------',
    '2. CUSTOMS BROKER & EDI FILING INSTRUCTIONS:',
    '------------------------------------------------------------------------',
    score >= 90
      ? '✓ All statutory parameters meet DGFT / ICEGATE zero-discrepancy tolerances.\n✓ Safe to file Shipping Bill (SB) via ICEGATE 2.0 portal.'
      : '⚠ CRITICAL DISCREPANCIES DETECTED.\n⚠ Resolve flagged items before submitting EDI manifest to avoid gate-in delays at port ICD/Port.',
    '',
    'Digital Stamp: Verified by ExportEase Autonomous Document Validator Engine',
    '========================================================================',
  ];

  return [...header, ...body, ...footer].join('\n');
}

export function downloadAuditReport(auditResult, filename = 'ICEGATE_Audit_Dossier') {
  if (!auditResult) return;
  const content = generateAuditTextReport(auditResult);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${auditResult.audit_id || Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
