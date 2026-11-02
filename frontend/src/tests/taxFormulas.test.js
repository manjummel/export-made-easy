import { calculateCBAMLiability, calculateCustomsDuty, calculateRoDTEPRebate } from '../utils/taxFormulas.js';

export function runTaxTests(assert) {
  const cbam = calculateCBAMLiability({ tonnage: 100, specificEmissions: 1.8, euEtsPrice: 75 });
  assert(cbam.totalEmissionsTCO2e === 180, 'CBAM total emissions equals 180 tCO2e');
  assert(cbam.grossLiabilityEUR === 13500, 'CBAM gross liability equals €13,500');

  const duty = calculateCustomsDuty({ assessableValueINR: 1000000, bcdRate: 0.10, ftaConcessionRate: 0.10 });
  assert(duty.isDutyFree === true, 'CEPA 0% duty flag evaluates to true');
  assert(duty.bcdAmount === 0, 'Effective Basic Customs Duty is 0 INR');

  const rodtep = calculateRoDTEPRebate({ fobValueINR: 500000, rodtepRatePercent: 2.0 });
  assert(rodtep.rebateINR === 10000, 'RoDTEP rebate correctly equals 10,000 INR');
}
