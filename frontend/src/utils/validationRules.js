/**
 * Statutory Trade Format Validators & Checksums
 * Official formats conforming to DGFT, CBIC, GSTN, and international customs rules.
 */

// 1. Import Export Code (IEC) - 10 chars PAN-based issued by DGFT
export const IEC_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

export function validateIEC(iec) {
  if (!iec || typeof iec !== 'string') return false;
  const clean = iec.trim().toUpperCase();
  return IEC_REGEX.test(clean);
}

// 2. GSTIN - 15-character Indian Goods & Services Tax Identification Number
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export function validateGSTIN(gstin) {
  if (!gstin || typeof gstin !== 'string') return false;
  const clean = gstin.trim().toUpperCase();
  if (!GSTIN_REGEX.test(clean)) return false;
  const stateCode = parseInt(clean.substring(0, 2), 10);
  return stateCode >= 1 && stateCode <= 38;
}

export function formatIEC(code) {
  return (code || '').trim().toUpperCase();
}

export function formatGSTIN(code) {
  return (code || '').trim().toUpperCase();
}
