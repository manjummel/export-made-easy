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
