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

// 3. EORI - Economic Operators Registration and Identification (EU / UK)
export const EORI_REGEX = /^[A-Z]{2}[A-Za-z0-9]{1,15}$/;

export function validateEORI(eori) {
  if (!eori || typeof eori !== 'string') return false;
  return EORI_REGEX.test(eori.trim().toUpperCase());
}

// 4. Authorized Dealer (AD) Code - 14-digit bank routing code registered with Indian Customs
export const AD_CODE_REGEX = /^\d{14}$/;

export function validateADCode(adCode) {
  if (!adCode || typeof adCode !== 'string') return false;
  return AD_CODE_REGEX.test(adCode.trim());
}

// 5. Harmonized System (HS) Code - 6 to 8 digits
export const HS_CODE_REGEX = /^(\d{4}\.\d{2}(\.\d{2})?|\d{6}|\d{8})$/;

export function validateHSCode(hsCode) {
  if (!hsCode || typeof hsCode !== 'string') return false;
  const clean = hsCode.trim().replace(/\s+/g, '');
  return HS_CODE_REGEX.test(clean);
}

// 6. Formatters
export function formatHSCode(code) {
  if (!code) return '';
  const digits = code.replace(/\D/g, '');
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}.${digits.slice(4)}`;
  return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}`;
}

export function formatIEC(code) {
  return (code || '').trim().toUpperCase();
}

export function formatGSTIN(code) {
  return (code || '').trim().toUpperCase();
}

export function validateConsignmentDoc(doc) {
  const errors = {};
  if (!doc.iecNumber || !validateIEC(doc.iecNumber)) {
    errors.iecNumber = 'Valid 10-character DGFT IEC is required.';
  }
  if (!doc.hsCode || !validateHSCode(doc.hsCode)) {
    errors.hsCode = 'Valid 8-digit ITC-HS tariff classification is required.';
  }
  if (doc.gstin && !validateGSTIN(doc.gstin)) {
    errors.gstin = 'Invalid 15-digit GSTIN checksum.';
  }
  if (doc.eoriNumber && !validateEORI(doc.eoriNumber)) {
    errors.eoriNumber = 'Invalid European EORI format (e.g. DE123456789).';
  }
  if (doc.invoiceAmount && Number(doc.invoiceAmount) <= 0) {
    errors.invoiceAmount = 'Invoice value must be greater than zero.';
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
