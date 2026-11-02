/**
 * Comprehensive 8-Digit ITC-HS Master Database
 * Curated for India's high-growth export commodities with customs duty & statutory requirements.
 */

export const HS_CODE_CATALOG = [
  {
    hsCode: '5208.32.00',
    title: 'Woven Fabrics of Cotton, Dyed (Weight > 100g/m² but <= 200g/m²)',
    chapter: 52,
    chapterTitle: 'Cotton & Cotton Textiles',
    heading: '5208',
    mfnDuty: 10.0,
    cepaDuty: 0.0,
    ectaDuty: 0.0,
    exportPolicy: 'Free',
    rodtepRate: 2.5,
    cbamCategory: null,
    certifications: ['OEKO-TEX Standard 100', 'GOTS (Global Organic Textile Standard)', 'Certificate of Origin'],
    topDestinations: ['United States', 'Germany', 'United Arab Emirates', 'Bangladesh'],
    exportFeasibilityScore: 98
  },
  {
    hsCode: '3004.90.99',
    title: 'Medicaments Consisting of Mixed or Unmixed Products for Therapeutic Uses (Formulations)',
    chapter: 30,
    chapterTitle: 'Pharmaceutical Products',
    heading: '3004',
    mfnDuty: 5.0,
    cepaDuty: 0.0,
    ectaDuty: 0.0,
    exportPolicy: 'Free',
    rodtepRate: 1.0,
    cbamCategory: null,
    certifications: ['WHO-GMP Certification', 'US FDA Establishment Inspection', 'Certificate of Pharmaceutical Product (COPP)'],
    topDestinations: ['United States', 'United Kingdom', 'South Africa', 'Nigeria'],
    exportFeasibilityScore: 94
  },
  {
    hsCode: '7113.19.30',
    title: 'Jewelry of Gold Set with Diamonds (Plain and Studded)',
    chapter: 71,
    chapterTitle: 'Natural Pearls, Precious Stones and Jewelry',
    heading: '7113',
    mfnDuty: 15.0,
    cepaDuty: 0.0,
    ectaDuty: 0.0,
    exportPolicy: 'Free',
    rodtepRate: 0.8,
    cbamCategory: null,
    certifications: ['BIS Hallmarking', 'Kimberley Process Certificate', 'Gemmological Institute Certification'],
    topDestinations: ['United Arab Emirates', 'United States', 'Hong Kong', 'Singapore'],
    exportFeasibilityScore: 96
  },
  {
    hsCode: '0306.17.20',
    title: 'Frozen Vannamei Shrimps (Litopenaeus Vannamei)',
    chapter: 3,
    chapterTitle: 'Fish and Crustaceans',
    heading: '0306',
    mfnDuty: 12.0,
    cepaDuty: 0.0,
    ectaDuty: 0.0,
    exportPolicy: 'Free',
    rodtepRate: 3.1,
    cbamCategory: null,
    certifications: ['EIA (Export Inspection Council) Approval', 'EU Health Certificate', 'HACCP', 'BAP 4-Star'],
    topDestinations: ['United States', 'China', 'European Union', 'Japan'],
    exportFeasibilityScore: 91
  },
  {
    hsCode: '7208.39.40',
    title: 'Hot-Rolled Flat Products of Iron or Non-Alloy Steel (Coils)',
    chapter: 72,
    chapterTitle: 'Iron and Steel',
    heading: '7208',
    mfnDuty: 7.5,
    cepaDuty: 0.0,
    ectaDuty: 0.0,
    exportPolicy: 'Free',
    rodtepRate: 0.5,
    cbamCategory: 'Iron & Steel (Direct EU CBAM Covered)',
    certifications: ['CE Marking (EN 10025)', 'ISO 9001 / ISO 14001', 'Mill Test Certificate (EN 10204 3.1)'],
    topDestinations: ['Italy', 'Belgium', 'United Arab Emirates', 'Spain'],
    exportFeasibilityScore: 82
  },
  {
    hsCode: '0901.21.90',
    title: 'Roasted Coffee, Not Decaffeinated (Specialty Arabica & Robusta)',
    chapter: 9,
    chapterTitle: 'Coffee, Tea, Mate and Spices',
    heading: '0901',
    mfnDuty: 7.5,
    cepaDuty: 0.0,
    ectaDuty: 0.0,
    exportPolicy: 'Free',
    rodtepRate: 1.8,
    cbamCategory: null,
    certifications: ['Coffee Board of India Export Permit', 'Phytosanitary Certificate', 'Rainforest Alliance'],
    topDestinations: ['Germany', 'Italy', 'Russian Federation', 'Jordan'],
    exportFeasibilityScore: 93
  },
  {
    hsCode: '8479.89.99',
    title: 'Industrial Automated Machinery and Mechanical Appliances for Manufacturing',
    chapter: 84,
    chapterTitle: 'Nuclear Reactors, Boilers, Machinery and Mechanical Appliances',
    heading: '8479',
    mfnDuty: 7.5,
    cepaDuty: 0.0,
    ectaDuty: 0.0,
    exportPolicy: 'Free',
    rodtepRate: 1.4,
    cbamCategory: null,
    certifications: ['CE Machinery Directive (2006/42/EC)', 'RoHS Compliance', 'IEC/UL Safety Standards'],
    topDestinations: ['United States', 'Germany', 'Saudi Arabia', 'Thailand'],
    exportFeasibilityScore: 89
  },
  {
    hsCode: '1006.30.20',
    title: 'Semi-Milled or Wholly Milled Basmati Rice (Pusa-1121 & Traditional)',
    chapter: 10,
    chapterTitle: 'Cereals',
    heading: '1006',
    mfnDuty: 0.0,
    cepaDuty: 0.0,
    ectaDuty: 0.0,
    exportPolicy: 'Free',
    rodtepRate: 2.0,
    cbamCategory: null,
    certifications: ['APEDA Registration', 'Agmark Inspection Certificate', 'DNA Purity Testing Certificate'],
    topDestinations: ['Saudi Arabia', 'Iran', 'Iraq', 'United Arab Emirates', 'United Kingdom'],
    exportFeasibilityScore: 95
  }
];

export function findHSCode(code) {
  if (!code) return null;
  const clean = code.trim().replace(/\s+/g, '');
  return HS_CODE_CATALOG.find(item => item.hsCode.replace(/\./g, '').startsWith(clean.replace(/\./g, ''))) || null;
}

export function searchHSCatalog(query) {
  if (!query) return HS_CODE_CATALOG;
  const q = query.toLowerCase();
  return HS_CODE_CATALOG.filter(item =>
    item.hsCode.includes(q) ||
    item.title.toLowerCase().includes(q) ||
    item.chapterTitle.toLowerCase().includes(q) ||
    item.topDestinations.some(d => d.toLowerCase().includes(q))
  );
}
