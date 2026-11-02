import { runTaxTests } from './taxFormulas.test.js';
import { runValidatorTests } from './validationRules.test.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('\n🚀 Running ExportEase AI Frontend Unit Tests...\n');
console.log('--- Tax & CBAM Engine ---');
runTaxTests(assert);

console.log('\n--- Statutory Format Validators ---');
runValidatorTests(assert);

console.log(`\n========================================`);
console.log(`Results: ${passed} passed, ${failed} failed.`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
}
