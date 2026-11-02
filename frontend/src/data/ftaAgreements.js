/**
 * Bilateral Free Trade Agreements (FTAs) & Rules of Origin
 * Concession schedules, value addition thresholds, and issuing authority registry.
 */

export const FTA_REGISTRY = [
  {
    id: 'INDIA_UAE_CEPA',
    name: 'India-UAE Comprehensive Economic Partnership Agreement (CEPA)',
    partnerCountry: 'United Arab Emirates',
    effectiveDate: '2022-05-01',
    coverage: 'Zero duty on 90% of Indian tariff lines covering textiles, engineering, gems & jewelry, agro-commodities.',
    valueAdditionRequirement: 40,
    originRule: 'Change in Tariff Subheading (CTSH) + Minimum 40% Value Addition or Wholly Produced',
    certificateIssuingAuthority: 'DGFT, Export Inspection Council (EIC), FIEO',
    preferentialDutyRate: 0.0,
    status: 'Active'
  },
  {
    id: 'INDIA_AUS_ECTA',
    name: 'India-Australia Economic Cooperation and Trade Agreement (ECTA)',
    partnerCountry: 'Australia',
    effectiveDate: '2022-12-29',
    coverage: 'Immediate 0% duty on 96.4% of Indian export value including leather, footwear, gems, machinery, cotton.',
    valueAdditionRequirement: 35,
    originRule: 'Change in Tariff Subheading (CTSH) + 35% Qualifying Value Content (QVC)',
    certificateIssuingAuthority: 'Export Inspection Council (EIC), Spices Board, Textiles Committee',
    preferentialDutyRate: 0.0,
    status: 'Active'
  },
  {
    id: 'UK_DCTS',
    name: 'UK Developing Countries Trading Scheme (DCTS)',
    partnerCountry: 'United Kingdom',
    effectiveDate: '2023-06-19',
    coverage: 'Reduced and zero tariffs on over 3,000 labor-intensive product lines with simplified cumulation rules.',
    valueAdditionRequirement: 30,
    originRule: 'Regional Cumulation allowed across eligible South Asian trade partners',
    certificateIssuingAuthority: 'EIC (REX Registered Exporter System self-certification)',
    preferentialDutyRate: 0.0,
    status: 'Active'
  },
  {
    id: 'INDIA_MERCOSUR_PTA',
    name: 'India-Mercosur Preferential Trade Agreement',
    partnerCountry: 'Mercosur (Brazil, Argentina, Uruguay, Paraguay)',
    effectiveDate: '2009-06-01',
    coverage: 'Preferential tariff margin concession of 10% to 100% on 450 key industrial and agricultural items.',
    valueAdditionRequirement: 35,
    originRule: 'Change in Tariff Heading (CTH) + 35% Value Addition',
    certificateIssuingAuthority: 'Export Inspection Council (EIC)',
    preferentialDutyRate: 2.5,
    status: 'Active'
  }
];

export function getApplicableFTA(countryName) {
  if (!countryName) return null;
  const q = countryName.toLowerCase();
  return FTA_REGISTRY.find(fta =>
    fta.partnerCountry.toLowerCase().includes(q) ||
    (q.includes('emirates') && fta.id === 'INDIA_UAE_CEPA') ||
    (q.includes('australia') && fta.id === 'INDIA_AUS_ECTA') ||
    (q.includes('united kingdom') && fta.id === 'UK_DCTS') ||
    (q.includes('germany') && fta.id === 'UK_DCTS')
  ) || null;
}
