/**
 * Centralized Mock Data Store for ExportEase AI
 */

export const COMPANY_PROFILE = {
  name: 'Your Company',
  legalName: 'Your Company Legal Name',
  product: 'Your Core Product',
  hsCode: '6205.20.00',
  iec: 'AAICU9823D',
  gstin: '33AAICU9823D1Z4',
  origin: 'Tamil Nadu, India',
  portOfLoading: 'Chennai / Tuticorin Sea Port',
  currency: 'USD',
};

// ─── Demand Forecast Data ───────────────────────────────────────────────────
export const DEMAND_FORECAST_KPIS = [
  { id: 'demand', label: 'Market Demand', value: '+18.4%', subtext: 'YoY surge across UAE & EU', change: '+3.2%', changeType: 'increase', icon: 'TrendingUp', color: 'emerald' },
  { id: 'confidence', label: 'Forecast Confidence', value: '91%', subtext: 'Based on 47 trade data feeds', change: 'High Trust', changeType: 'increase', icon: 'Sparkles', color: 'indigo' },
  { id: 'growth', label: 'Growth Potential', value: 'High', subtext: 'Q3 peak retail season ahead', change: 'Tier 1', changeType: 'increase', icon: 'Globe', color: 'blue' },
  { id: 'risk', label: 'Market Risk', value: 'Low', subtext: 'Stable CEPA & GSP tariffs', change: '18 / 100', changeType: 'neutral', icon: 'ShieldCheck', color: 'cyan' },
];

export const DEMAND_FORECAST_SERIES = {
  '7D': [
    { label: 'Mon', historical: 720, forecast: null, upper: null, lower: null },
    { label: 'Tue', historical: 760, forecast: null, upper: null, lower: null },
    { label: 'Wed', historical: 740, forecast: null, upper: null, lower: null },
    { label: 'Thu', historical: 790, forecast: 790, upper: 810, lower: 770 },
    { label: 'Fri', historical: null, forecast: 830, upper: 860, lower: 800 },
    { label: 'Sat', historical: null, forecast: 870, upper: 910, lower: 830 },
    { label: 'Sun', historical: null, forecast: 910, upper: 960, lower: 860 },
  ],
  '30D': [
    { label: 'Week 1', historical: 3100, forecast: null, upper: null, lower: null },
    { label: 'Week 2', historical: 3450, forecast: null, upper: null, lower: null },
    { label: 'Week 3', historical: 3800, forecast: 3800, upper: 3950, lower: 3650 },
    { label: 'Week 4', historical: null, forecast: 4250, upper: 4480, lower: 4020 },
    { label: 'Week 5', historical: null, forecast: 4600, upper: 4900, lower: 4300 },
  ],
  '90D': [
    { label: 'Jun', historical: 4200, forecast: null, upper: null, lower: null },
    { label: 'Jul', historical: 4900, forecast: null, upper: null, lower: null },
    { label: 'Aug', historical: 5400, forecast: 5400, upper: 5650, lower: 5150 },
    { label: 'Sep', historical: null, forecast: 6200, upper: 6600, lower: 5800 },
    { label: 'Oct', historical: null, forecast: 7100, upper: 7650, lower: 6550 },
    { label: 'Nov', historical: null, forecast: 7900, upper: 8600, lower: 7200 },
  ],
  '6M': [
    { label: 'Apr', historical: 3800, forecast: null, upper: null, lower: null },
    { label: 'May', historical: 4400, forecast: null, upper: null, lower: null },
    { label: 'Jun', historical: 5100, forecast: null, upper: null, lower: null },
    { label: 'Jul', historical: 5800, forecast: 5800, upper: 6050, lower: 5550 },
    { label: 'Aug', historical: null, forecast: 6700, upper: 7200, lower: 6200 },
    { label: 'Sep', historical: null, forecast: 7600, upper: 8300, lower: 6900 },
    { label: 'Oct', historical: null, forecast: 8500, upper: 9400, lower: 7600 },
  ],
  '1Y': [
    { label: 'Q1 25', historical: 12400, forecast: null, upper: null, lower: null },
    { label: 'Q2 25', historical: 14800, forecast: null, upper: null, lower: null },
    { label: 'Q3 25', historical: 17200, forecast: 17200, upper: 18100, lower: 16300 },
    { label: 'Q4 25', historical: null, forecast: 21500, upper: 23200, lower: 19800 },
    { label: 'Q1 26', historical: null, forecast: 25800, upper: 28400, lower: 23200 },
    { label: 'Q2 26', historical: null, forecast: 29400, upper: 32800, lower: 26000 },
  ],
};

export const DEMAND_MARKET_COMPARISON = [
  { id: 'uae', country: 'UAE', flag: '🇦🇪', demandScore: 94, demandLevel: 'High', growth: '+18.4%', competition: 'Medium', competitionScore: 42, risk: 'Low', riskScore: 18, tariff: '0% CEPA' },
  { id: 'germany', country: 'Germany', flag: '🇩🇪', demandScore: 89, demandLevel: 'High', growth: '+14.2%', competition: 'High', competitionScore: 68, risk: 'Medium', riskScore: 24, tariff: '0% GSP' },
  { id: 'singapore', country: 'Singapore', flag: '🇸🇬', demandScore: 86, demandLevel: 'High', growth: '+12.8%', competition: 'Medium', competitionScore: 48, risk: 'Low', riskScore: 16, tariff: '8.5% Standard' },
  { id: 'uk', country: 'United Kingdom', flag: '🇬🇧', demandScore: 81, demandLevel: 'Medium', growth: '+11.2%', competition: 'High', competitionScore: 72, risk: 'Medium', riskScore: 26, tariff: '0% DCTS' },
  { id: 'usa', country: 'United States', flag: '🇺🇸', demandScore: 83, demandLevel: 'Very High', growth: '+9.4%', competition: 'Very High', competitionScore: 88, risk: 'Medium', riskScore: 32, tariff: '16.5% Standard' },
];

export const DEMAND_AI_INSIGHT = {
  title: 'AI Demand Forecast Synthesis',
  headline: 'Demand for organic cotton apparel is projected to increase over the next quarter in the UAE market.',
  confidence: 91,
  trend: 'Accelerating (+18.4% QoQ projected)',
  drivers: [
    'India-UAE CEPA 0% tariff advantage accelerates price competitiveness over Vietnam exporters',
    'Dubai Q4 retail shopping festivals drive bulk procurement in August–September',
    'Increasing GOTS-certified organic cotton mandate in Gulf corporate uniforms',
  ],
  recommendation: 'Initiate production batch allocation of 5,000 units by August 15 to fulfill UAE delivery timelines before peak import surge.',
};

// ─── Export Analytics Data ──────────────────────────────────────────────────
export const ANALYTICS_SUMMARY_KPIS = [
  { id: 'rev', label: 'Potential Export Revenue', value: '$4.8M', subtext: 'Annualized market pipeline', change: '+22.4% YoY', changeType: 'increase', icon: 'TrendingUp', color: 'emerald' },
  { id: 'realized', label: 'Realized Revenue YTD', value: '$1.28M', subtext: 'Across 4 overseas clients', change: '+18.1% vs Q1', changeType: 'increase', icon: 'DollarSign', color: 'blue' },
  { id: 'margin', label: 'Avg Export Margin', value: '26.8%', subtext: 'vs 14.2% domestic retail', change: '+12.6% Delta', changeType: 'increase', icon: 'Sparkles', color: 'indigo' },
  { id: 'shipments', label: 'Consignments Shipped', value: '34', subtext: '100% on-time delivery', change: '+8 this quarter', changeType: 'increase', icon: 'Globe', color: 'cyan' },
];

export const REVENUE_OPPORTUNITY_CHART = [
  { month: 'Nov', realized: 85000, projected: 95000, tam: 240000 },
  { month: 'Dec', realized: 110000, projected: 125000, tam: 280000 },
  { month: 'Jan', realized: 140000, projected: 155000, tam: 310000 },
  { month: 'Feb', realized: 165000, projected: 180000, tam: 340000 },
  { month: 'Mar', realized: 195000, projected: 220000, tam: 390000 },
  { month: 'Apr (Est)', realized: null, projected: 260000, tam: 440000 },
  { month: 'May (Est)', realized: null, projected: 310000, tam: 490000 },
  { month: 'Jun (Est)', realized: null, projected: 360000, tam: 540000 },
];

export const MARKET_GROWTH_DATA = [
  { market: 'UAE', currentShare: 38, potentialGrowth: 22, color: '#10b981' },
  { market: 'Germany', currentShare: 28, potentialGrowth: 18, color: '#3b82f6' },
  { market: 'Singapore', currentShare: 16, potentialGrowth: 14, color: '#8b5cf6' },
  { market: 'UK', currentShare: 10, potentialGrowth: 11, color: '#06b6d4' },
  { market: 'USA', currentShare: 8, potentialGrowth: 9, color: '#f59e0b' },
];

export const BUYER_FUNNEL_DATA = [
  { stage: 'AI Matched Buyers', count: 48, percentage: '100%', fill: '#3b82f6' },
  { stage: 'Inquiries Dispatched', count: 24, percentage: '50%', fill: '#6366f1' },
  { stage: 'Sample Lookbooks Sent', count: 12, percentage: '25%', fill: '#8b5cf6' },
  { stage: 'Commercial Terms Agreed', count: 7, percentage: '14.5%', fill: '#06b6d4' },
  { stage: 'Purchase Orders Finalized', count: 4, percentage: '8.3%', fill: '#10b981' },
];

export const EXPORT_PIPELINE_CONSIGNMENTS = [
  { id: 'SHP-9021', destination: 'UAE (Dubai)', buyer: 'Gulf Craft Trading LLC', volume: '3,500 Shirts', value: '$84,000', status: 'Customs Cleared', progress: 85, color: 'emerald', eta: 'Aug 28' },
  { id: 'SHP-9022', destination: 'Germany (Frankfurt)', buyer: 'EuroTex Mode GmbH', volume: '2,200 Shirts', value: '$61,600', status: 'In Ocean Transit', progress: 55, color: 'blue', eta: 'Sep 08' },
  { id: 'SHP-9023', destination: 'Singapore', buyer: 'SilkRoad Apparel Pte', volume: '1,200 Shirts', value: '$31,200', status: 'Documentation Ready', progress: 35, color: 'indigo', eta: 'Sep 14' },
  { id: 'SHP-9024', destination: 'UK (London)', buyer: 'Mayfair Retail Ltd', volume: '1,800 Shirts', value: '$48,600', status: 'Production Batching', progress: 20, color: 'amber', eta: 'Sep 22' },
];

export const COUNTRY_PERFORMANCE_METRICS = [
  { country: 'UAE', flag: '🇦🇪', exportRevenue: '$540,000', volume: '22,500 Units', avgMargin: '28.4%', tariff: '0% CEPA', status: 'Optimal' },
  { country: 'Germany', flag: '🇩🇪', exportRevenue: '$420,000', volume: '15,000 Units', avgMargin: '31.2%', tariff: '0% GSP', status: 'High Margin' },
  { country: 'Singapore', flag: '🇸🇬', exportRevenue: '$210,000', volume: '8,000 Units', avgMargin: '24.5%', tariff: '8.5%', status: 'Stable' },
  { country: 'United Kingdom', flag: '🇬🇧', exportRevenue: '$110,000', volume: '4,200 Units', avgMargin: '22.8%', tariff: '0% DCTS', status: 'Emerging' },
];
