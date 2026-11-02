import { validateIEC, validateGSTIN, validateEORI, validateHSCode } from '../utils/validationRules.js';

export function runValidatorTests(assert) {
  assert(validateIEC('AABCA1234F') === true, 'Valid 10-char IEC passes');
  assert(validateIEC('12345') === false, 'Invalid short IEC rejected');

  assert(validateGSTIN('27AABCA1234F1Z5') === true, 'Valid 15-char Maharashtra GSTIN passes');
  assert(validateGSTIN('99AABCA1234F1Z5') === false, 'Invalid state code GSTIN rejected');

  assert(validateEORI('DE123456789') === true, 'Valid German EORI passes');
  assert(validateHSCode('5208.32.00') === true, 'Standard 8-digit HS code passes');
}
