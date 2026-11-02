/**
 * Trade Tax, CBAM and Duty Calculation Engine
 * Computes statutory liabilities, Free Trade Agreement preferential duty,
 * and EU Carbon Border Adjustment Mechanism (CBAM) embedded tax.
 */

export function calculateCBAMLiability({ tonnage, specificEmissions, euEtsPrice = 75.0, domesticCarbonPricePaid = 0.0 }) {
  const safeTonnage = Math.max(0, Number(tonnage) || 0);
  const safeEmissions = Math.max(0, Number(specificEmissions) || 0);
  const totalEmissionsTCO2e = safeTonnage * safeEmissions;
  const grossLiabilityEUR = totalEmissionsTCO2e * euEtsPrice;
  const netPricePerTon = Math.max(0, euEtsPrice - domesticCarbonPricePaid);
  const netLiabilityEUR = totalEmissionsTCO2e * netPricePerTon;

  return {
    tonnage: safeTonnage,
    totalEmissionsTCO2e: Number(totalEmissionsTCO2e.toFixed(2)),
    grossLiabilityEUR: Number(grossLiabilityEUR.toFixed(2)),
    netLiabilityEUR: Number(netLiabilityEUR.toFixed(2)),
    netLiabilityINR: Number((netLiabilityEUR * 92.5).toFixed(2)),
    effectiveCarbonTaxRatePercent: safeTonnage > 0 ? Number(((netLiabilityEUR / (safeTonnage * 1000)) * 100).toFixed(2)) : 0
  };
}

export function calculateCustomsDuty({
  assessableValueINR,
  bcdRate = 0.075,
  swsRate = 0.10,
  igstRate = 0.18,
  ftaConcessionRate = 0.0
}) {
  const val = Math.max(0, Number(assessableValueINR) || 0);
  const effectiveBcdRate = Math.max(0, bcdRate - ftaConcessionRate);
  const bcdAmount = val * effectiveBcdRate;
  const swsAmount = bcdAmount * swsRate;
  const taxableForIGST = val + bcdAmount + swsAmount;
  const igstAmount = taxableForIGST * igstRate;
  const totalDuty = bcdAmount + swsAmount + igstAmount;
  const standardDutyWithoutFTA = (val * bcdRate) + (val * bcdRate * swsRate) + ((val + (val * bcdRate) + (val * bcdRate * swsRate)) * igstRate);
  const ftaSavings = Math.max(0, standardDutyWithoutFTA - totalDuty);

  return {
    assessableValueINR: val,
    effectiveBcdRate,
    bcdAmount: Number(bcdAmount.toFixed(2)),
    swsAmount: Number(swsAmount.toFixed(2)),
    igstAmount: Number(igstAmount.toFixed(2)),
    totalDutyINR: Number(totalDuty.toFixed(2)),
    ftaSavingsINR: Number(ftaSavings.toFixed(2)),
    isDutyFree: effectiveBcdRate === 0
  };
}

export function calculateRoDTEPRebate({ fobValueINR, rodtepRatePercent = 1.5, capPerKgINR = null, weightKg = null }) {
  const fob = Math.max(0, Number(fobValueINR) || 0);
  let rebate = fob * (rodtepRatePercent / 100);
  if (capPerKgINR && weightKg) {
    const maxCap = weightKg * capPerKgINR;
    rebate = Math.min(rebate, maxCap);
  }
  return {
    fobValueINR: fob,
    rodtepRatePercent,
    rebateINR: Number(rebate.toFixed(2))
  };
}

export function calculateLandedCost({
  exWorksINR,
  freightINR = 0,
  insuranceINR = 0,
  dutyAmountINR = 0,
  clearingChargesINR = 15000
}) {
  const cif = exWorksINR + freightINR + insuranceINR;
  const landedCost = cif + dutyAmountINR + clearingChargesINR;
  return {
    cifINR: Number(cif.toFixed(2)),
    landedCostINR: Number(landedCost.toFixed(2)),
    overheadRatioPercent: exWorksINR > 0 ? Number(((landedCost - exWorksINR) / exWorksINR * 100).toFixed(1)) : 0
  };
}
