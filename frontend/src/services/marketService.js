/**
 * ============================================================
 * ExportEase AI — Market Intelligence Service
 * Connects Frontend UI to /api/v1/market-analysis & /api/v1/ai/market
 * ============================================================
 */

import apiClient from './apiClient';

export const COUNTRIES_DATA = [
  {
    id: 'uae',
    name: 'United Arab Emirates',
    shortName: 'UAE',
    flag: '🇦🇪',
    region: 'Middle East',
    opportunityScore: 94,
    demand: 'High',
    demandScore: 94,
    competition: 'Medium',
    growth: '+18.4%',
    growthNumeric: 18.4,
    risk: 'Low',
    riskScore: 18,
    importVolume: '$2.4M',
    importVolumeNumeric: 2400000,
    tariff: '0% via India-UAE CEPA',
    tariffRate: 0,
    shippingDays: '4 Days (Chennai → Jebel Ali)',
    buyersCount: 8,
    strategy: 'Focus on 100% GOTS organic cotton shirts with breathable weaves. Target corporate uniform buyers and premium Dubai department stores.',
    nextSteps: [
      'Obtain Certificate of Origin Form AI from EPC/FIEO',
      'Register trade license profile on Dubai Trade EDI',
      'Connect with 8 pre-matched verified buyers in Dubai',
    ],
    coordinates: { x: 57, y: 44 }, // for map visualization
    demandTrend: [65, 70, 76, 82, 88, 94],
  },
  {
    id: 'germany',
    name: 'Germany',
    shortName: 'Germany',
    flag: '🇩🇪',
    region: 'European Union',
    opportunityScore: 89,
    demand: 'High',
    demandScore: 89,
    competition: 'High',
    growth: '+14.2%',
    growthNumeric: 14.2,
    risk: 'Medium',
    riskScore: 24,
    importVolume: '$4.1M',
    importVolumeNumeric: 4100000,
    tariff: '0% via EU GSP Scheme',
    tariffRate: 0,
    shippingDays: '18 Days (JNPT → Hamburg)',
    buyersCount: 11,
    strategy: 'Strict ESG and OEKO-TEX / GOTS certification compliance is required. Premium pricing power is highest in Frankfurt and Munich retail chains.',
    nextSteps: [
      'Verify REX (Registered Exporter System) registration',
      'Attach OEKO-TEX Standard 100 chemical test report',
      'Submit sample lookbook to EuroTex GmbH (Frankfurt)',
    ],
    coordinates: { x: 49, y: 28 },
    demandTrend: [58, 64, 71, 75, 83, 89],
  },
  {
    id: 'singapore',
    name: 'Singapore',
    shortName: 'Singapore',
    flag: '🇸🇬',
    region: 'Asia Pacific',
    opportunityScore: 86,
    demand: 'High',
    demandScore: 86,
    competition: 'Medium',
    growth: '+12.8%',
    growthNumeric: 12.8,
    risk: 'Low',
    riskScore: 16,
    importVolume: '$1.2M',
    importVolumeNumeric: 1200000,
    tariff: '8.5% Standard MFN',
    tariffRate: 8.5,
    shippingDays: '6 Days (Chennai → Singapore)',
    buyersCount: 5,
    strategy: 'Position as a luxury eco-conscious menswear brand. Fast turnaround on small-batch custom sizes enables high repeat re-orders.',
    nextSteps: [
      'Review Singapore Customs GST pre-clearance',
      'Partner with regional distributor in Orchard Road district',
      'Dispatch digital sample swatches to SilkRoad Apparel',
    ],
    coordinates: { x: 74, y: 55 },
    demandTrend: [60, 68, 72, 77, 81, 86],
  },
  {
    id: 'usa',
    name: 'United States',
    shortName: 'USA',
    flag: '🇺🇸',
    region: 'North America',
    opportunityScore: 83,
    demand: 'Very High',
    demandScore: 96,
    competition: 'Very High',
    growth: '+9.4%',
    growthNumeric: 9.4,
    risk: 'Medium',
    riskScore: 32,
    importVolume: '$9.8M',
    importVolumeNumeric: 9800000,
    tariff: '16.5% Standard Tariff',
    tariffRate: 16.5,
    shippingDays: '26 Days (JNPT → New York)',
    buyersCount: 16,
    strategy: 'High volume wholesale orders with strict US FTC care-labeling requirements. Margin pressure from Vietnam/Bangladesh competitors.',
    nextSteps: [
      'Comply with US CPSC textile flammability standards',
      'Secure Marine Cargo Insurance with warehouse coverage',
      'Review ocean freight FCL container pricing for Q4',
    ],
    coordinates: { x: 22, y: 35 },
    demandTrend: [72, 75, 78, 80, 82, 83],
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    shortName: 'UK',
    flag: '🇬🇧',
    region: 'Europe',
    opportunityScore: 81,
    demand: 'Medium',
    demandScore: 78,
    competition: 'High',
    growth: '+11.2%',
    growthNumeric: 11.2,
    risk: 'Medium',
    riskScore: 26,
    importVolume: '$2.1M',
    importVolumeNumeric: 2100000,
    tariff: '0% under Developing Countries Trading Scheme (DCTS)',
    tariffRate: 0,
    shippingDays: '20 Days (Chennai → Southampton)',
    buyersCount: 7,
    strategy: 'Leverage UK DCTS tariff preferences. Partner with mid-tier British high street fashion retailers seeking ethical suppliers.',
    nextSteps: [
      'Generate UK DCTS Origin Declaration',
      'Register for UK VAT / EORI number for direct DDP shipments',
      'Initiate outreach to 7 verified London buyers',
    ],
    coordinates: { x: 46, y: 25 },
    demandTrend: [55, 60, 66, 70, 76, 81],
  },
  {
    id: 'australia',
    name: 'Australia',
    shortName: 'Australia',
    flag: '🇦🇺',
    region: 'Oceania',
    opportunityScore: 84,
    demand: 'High',
    demandScore: 82,
    competition: 'Low',
    growth: '+16.5%',
    growthNumeric: 16.5,
    risk: 'Low',
    riskScore: 14,
    importVolume: '$1.6M',
    importVolumeNumeric: 1600000,
    tariff: '0% via India-Australia ECTA',
    tariffRate: 0,
    shippingDays: '14 Days (Chennai → Sydney)',
    buyersCount: 6,
    strategy: 'India-Australia ECTA gives 0% duty on 100% of textile tariff lines. Strong affinity for natural cotton fibers in summer season.',
    nextSteps: [
      'Apply for ECTA Certificate of Origin',
      'Align seasonal catalog with Southern Hemisphere calendar',
      'Contact Melbourne menswear buying collective',
    ],
    coordinates: { x: 84, y: 72 },
    demandTrend: [52, 60, 68, 74, 80, 84],
  },
];

export async function getMarketRankings(query = 'Premium Organic Cotton Shirts') {
  try {
    const data = await apiClient.post('/market-analysis/analyze', {
      product: query,
      country: 'Global',
    });
    if (data?.rankings && Array.isArray(data.rankings)) return data.rankings;
  } catch (err) {
    console.log('[MarketService] Rankings fallback:', err.message);
  }

  await new Promise((r) => setTimeout(r, 400));
  return COUNTRIES_DATA;
}

export async function getCountryDetail(countryId) {
  await new Promise((r) => setTimeout(r, 200));
  return COUNTRIES_DATA.find((c) => c.id === countryId) || COUNTRIES_DATA[0];
}

export async function getDemandForecast(hsCode = '6205.20.00') {
  await new Promise((r) => setTimeout(r, 300));
  return {
    hsCode,
    confidence: 88,
    projectedGrowth: '+18.4%',
    forecasts: [
      { month: 'Apr', historical: 4200, forecast: 4200 },
      { month: 'May', historical: 4800, forecast: 4800 },
      { month: 'Jun', historical: 5400, forecast: 5400 },
      { month: 'Jul', historical: null, forecast: 6100 },
      { month: 'Aug', historical: null, forecast: 6800 },
      { month: 'Sep', historical: null, forecast: 7600 },
      { month: 'Oct', historical: null, forecast: 8200 },
    ],
    drivers: [
      { factor: 'India-UAE CEPA zero duty effect', impact: '+8.2%' },
      { factor: 'EU GOTS organic demand shift', impact: '+6.1%' },
      { factor: 'Cotton price stabilization in TN', impact: '+4.1%' },
    ],
  };
}

export async function getTopMarkets() {
  await new Promise((r) => setTimeout(r, 200));
  return COUNTRIES_DATA;
}

export async function getAnalyticsData() {
  await new Promise((r) => setTimeout(r, 300));
  return {
    monthlyExports: [
      { month: 'Oct', value: 180000 },
      { month: 'Nov', value: 240000 },
      { month: 'Dec', value: 310000 },
      { month: 'Jan', value: 280000 },
      { month: 'Feb', value: 390000 },
      { month: 'Mar', value: 450000 },
    ],
    revenueByMarket: [
      { name: 'UAE', value: 195000, fill: '#10b981' },
      { name: 'Germany', value: 165000, fill: '#3b82f6' },
      { name: 'Singapore', value: 65000, fill: '#8b5cf6' },
      { name: 'Other', value: 25000, fill: '#64748b' },
    ],
    productCategories: [
      { category: 'Organic Cotton Shirts', exports: 68, growth: 22 },
      { category: 'Linen Trousers', exports: 18, growth: 14 },
      { category: 'Handloom Scarves', exports: 14, growth: 9 },
    ],
  };
}

export default {
  COUNTRIES_DATA,
  getMarketRankings,
  getCountryDetail,
  getDemandForecast,
  getTopMarkets,
  getAnalyticsData,
};
