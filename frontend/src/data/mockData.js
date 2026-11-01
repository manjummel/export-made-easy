/**
 * Central Mock Data Store
 * All mock data used across services lives here.
 * Swap these with real API responses when FastAPI backend is ready.
 */

// ─── Dashboard KPIs ───────────────────────────────────────────────────────────
export const dashboardStats = [
  {
    id: 'export-readiness',
    label: 'Export Readiness Score',
    value: 74,
    unit: '%',
    change: +6.2,
    trend: 'up',
    color: 'emerald',
    icon: 'TrendingUp',
  },
  {
    id: 'active-inquiries',
    label: 'Active Buyer Inquiries',
    value: 38,
    unit: '',
    change: +12,
    trend: 'up',
    color: 'blue',
    icon: 'Users',
  },
  {
    id: 'documents-ready',
    label: 'Documents Ready',
    value: 5,
    unit: ' / 9',
    change: +2,
    trend: 'up',
    color: 'violet',
    icon: 'FileCheck',
  },
  {
    id: 'currency-risk',
    label: 'Currency Risk Level',
    value: 'Medium',
    unit: '',
    change: null,
    trend: 'neutral',
    color: 'amber',
    icon: 'AlertTriangle',
  },
];

// ─── Export Journey Steps ─────────────────────────────────────────────────────
export const exportJourneySteps = [
  { id: 1, label: 'Business Registration', status: 'completed', date: '2024-01-15' },
  { id: 2, label: 'IEC Registration', status: 'completed', date: '2024-02-03' },
  { id: 3, label: 'Product Classification (HS Code)', status: 'completed', date: '2024-03-10' },
  { id: 4, label: 'Target Market Research', status: 'in-progress', date: null },
  { id: 5, label: 'Buyer Identification', status: 'pending', date: null },
  { id: 6, label: 'Sample Export', status: 'pending', date: null },
  { id: 7, label: 'Commercial Export', status: 'pending', date: null },
];

// ─── AI Recommendations ───────────────────────────────────────────────────────
export const aiRecommendations = [
  {
    id: 1,
    type: 'opportunity',
    title: 'Germany shows 23% YoY demand growth for handloom textiles',
    impact: 'High',
    action: 'Explore market',
    tags: ['Textiles', 'Germany', 'B2B'],
  },
  {
    id: 2,
    type: 'risk',
    title: 'USD/INR volatility expected — consider forward contracts',
    impact: 'Medium',
    action: 'View analysis',
    tags: ['Currency', 'Risk'],
  },
  {
    id: 3,
    type: 'document',
    title: 'Your Certificate of Origin has expired',
    impact: 'High',
    action: 'Renew document',
    tags: ['Compliance', 'Document'],
  },
  {
    id: 4,
    type: 'opportunity',
    title: 'UAE MSME import quota renewed — 40% duty reduction',
    impact: 'High',
    action: 'View policy',
    tags: ['UAE', 'Policy'],
  },
];

// ─── Market Intelligence ──────────────────────────────────────────────────────
export const marketDemandData = [
  { month: 'Jan', india: 4200, germany: 3800, uae: 2900, usa: 5100 },
  { month: 'Feb', india: 4500, germany: 4200, uae: 3100, usa: 5300 },
  { month: 'Mar', india: 4800, germany: 4400, uae: 3400, usa: 5600 },
  { month: 'Apr', india: 5100, germany: 4100, uae: 3600, usa: 5400 },
  { month: 'May', india: 5400, germany: 4600, uae: 3900, usa: 5800 },
  { month: 'Jun', india: 5800, germany: 5000, uae: 4200, usa: 6100 },
  { month: 'Jul', india: 6100, germany: 5200, uae: 4500, usa: 6300 },
  { month: 'Aug', india: 6400, germany: 5400, uae: 4700, usa: 6600 },
];

export const topMarkets = [
  {
    id: 'us',
    country: 'United States',
    flag: '🇺🇸',
    demandScore: 92,
    growth: '+14.2%',
    category: 'Textiles & Handicrafts',
    potentialRevenue: 4200000,
    tariff: '3.5%',
    competitiveness: 'High',
  },
  {
    id: 'de',
    country: 'Germany',
    flag: '🇩🇪',
    demandScore: 88,
    growth: '+23.1%',
    category: 'Handloom & Artisanal',
    potentialRevenue: 3800000,
    tariff: '0%',
    competitiveness: 'Medium',
  },
  {
    id: 'ae',
    country: 'UAE',
    flag: '🇦🇪',
    demandScore: 85,
    growth: '+18.5%',
    category: 'Spices & Food Products',
    potentialRevenue: 2900000,
    tariff: '5%',
    competitiveness: 'Low',
  },
  {
    id: 'gb',
    country: 'United Kingdom',
    flag: '🇬🇧',
    demandScore: 79,
    growth: '+9.8%',
    category: 'Leather Goods',
    potentialRevenue: 2200000,
    tariff: '4%',
    competitiveness: 'High',
  },
  {
    id: 'jp',
    country: 'Japan',
    flag: '🇯🇵',
    demandScore: 76,
    growth: '+11.3%',
    category: 'Gems & Jewelry',
    potentialRevenue: 3100000,
    tariff: '2%',
    competitiveness: 'Medium',
  },
];

// ─── Buyers ───────────────────────────────────────────────────────────────────
export const buyerRecommendations = [
  {
    id: 'b1',
    name: 'EuroTex Imports GmbH',
    country: 'Germany',
    flag: '🇩🇪',
    category: 'Textiles',
    matchScore: 94,
    annualImportVolume: 12000000,
    preferredPayment: 'LC',
    status: 'Active',
    lastContact: '2024-08-10',
    verified: true,
  },
  {
    id: 'b2',
    name: 'Gulf Craft Trading LLC',
    country: 'UAE',
    flag: '🇦🇪',
    category: 'Handicrafts',
    matchScore: 89,
    annualImportVolume: 5500000,
    preferredPayment: 'TT',
    status: 'Interested',
    lastContact: '2024-08-18',
    verified: true,
  },
  {
    id: 'b3',
    name: 'Silk Road Wholesalers Inc.',
    country: 'United States',
    flag: '🇺🇸',
    category: 'Textiles',
    matchScore: 86,
    annualImportVolume: 8200000,
    preferredPayment: 'CAD',
    status: 'New',
    lastContact: null,
    verified: false,
  },
  {
    id: 'b4',
    name: 'Spice Globe Ltd.',
    country: 'United Kingdom',
    flag: '🇬🇧',
    category: 'Food & Spices',
    matchScore: 82,
    annualImportVolume: 3400000,
    preferredPayment: 'TT',
    status: 'Active',
    lastContact: '2024-07-29',
    verified: true,
  },
];

// ─── Export Documents ─────────────────────────────────────────────────────────
export const exportDocuments = [
  {
    id: 'd1',
    name: 'Commercial Invoice',
    status: 'completed',
    lastUpdated: '2024-08-01',
    requiredFor: ['USA', 'Germany', 'UAE'],
    autoFillable: true,
  },
  {
    id: 'd2',
    name: 'Packing List',
    status: 'completed',
    lastUpdated: '2024-08-01',
    requiredFor: ['USA', 'Germany', 'UAE'],
    autoFillable: true,
  },
  {
    id: 'd3',
    name: 'Bill of Lading / Airway Bill',
    status: 'completed',
    lastUpdated: '2024-07-28',
    requiredFor: ['USA', 'Germany', 'UAE'],
    autoFillable: false,
  },
  {
    id: 'd4',
    name: 'Certificate of Origin',
    status: 'expired',
    lastUpdated: '2023-08-01',
    requiredFor: ['Germany', 'UAE'],
    autoFillable: true,
  },
  {
    id: 'd5',
    name: 'GST/GSP Declaration',
    status: 'completed',
    lastUpdated: '2024-06-15',
    requiredFor: ['USA'],
    autoFillable: true,
  },
  {
    id: 'd6',
    name: 'Phytosanitary Certificate',
    status: 'pending',
    lastUpdated: null,
    requiredFor: ['Germany'],
    autoFillable: false,
  },
  {
    id: 'd7',
    name: 'Letter of Credit',
    status: 'in-progress',
    lastUpdated: '2024-08-15',
    requiredFor: ['Germany'],
    autoFillable: false,
  },
  {
    id: 'd8',
    name: 'Insurance Certificate',
    status: 'pending',
    lastUpdated: null,
    requiredFor: ['USA', 'UAE'],
    autoFillable: false,
  },
  {
    id: 'd9',
    name: 'Export License (DGFT)',
    status: 'completed',
    lastUpdated: '2024-05-20',
    requiredFor: ['USA', 'Germany', 'UAE'],
    autoFillable: false,
  },
];

// ─── Currency ─────────────────────────────────────────────────────────────────
export const currencyPairData = [
  { date: 'Aug 1', usdInr: 83.4, eurInr: 91.2, gbpInr: 106.1 },
  { date: 'Aug 5', usdInr: 83.8, eurInr: 91.7, gbpInr: 106.8 },
  { date: 'Aug 10', usdInr: 83.6, eurInr: 91.4, gbpInr: 106.3 },
  { date: 'Aug 15', usdInr: 84.1, eurInr: 92.1, gbpInr: 107.2 },
  { date: 'Aug 20', usdInr: 83.9, eurInr: 91.8, gbpInr: 107.0 },
  { date: 'Aug 25', usdInr: 84.3, eurInr: 92.4, gbpInr: 107.5 },
];

export const currencyAlerts = [
  {
    id: 'ca1',
    pair: 'USD/INR',
    type: 'volatility',
    message: 'High volatility detected — INR weakened 0.8% in 48 hrs',
    severity: 'high',
    timestamp: '2024-08-25T08:30:00',
  },
  {
    id: 'ca2',
    pair: 'EUR/INR',
    type: 'opportunity',
    message: 'EUR strengthened — consider invoicing in EUR for Germany orders',
    severity: 'medium',
    timestamp: '2024-08-24T14:00:00',
  },
];

// ─── Trade Policies ───────────────────────────────────────────────────────────
export const tradePolicies = [
  {
    id: 'tp1',
    title: 'India-UAE CEPA 2022',
    type: 'FTA',
    countries: ['UAE'],
    summary: 'Comprehensive Economic Partnership Agreement — 0% duty on 80% of Indian goods',
    effectiveDate: '2022-05-01',
    relevanceScore: 95,
  },
  {
    id: 'tp2',
    title: 'EU GSP Scheme',
    type: 'Preference',
    countries: ['Germany', 'France', 'Italy', 'Netherlands'],
    summary: 'Generalised Scheme of Preferences — Reduced tariffs for Indian exports to EU',
    effectiveDate: '2014-01-01',
    relevanceScore: 88,
  },
  {
    id: 'tp3',
    title: 'RoDTEP Scheme',
    type: 'Incentive',
    countries: ['All'],
    summary: 'Remission of Duties and Taxes on Exported Products — Export incentive for MSMEs',
    effectiveDate: '2021-01-01',
    relevanceScore: 92,
  },
];

// ─── AI Chat Messages ─────────────────────────────────────────────────────────
export const initialChatMessages = [
  {
    id: 'm0',
    role: 'assistant',
    content:
      "Namaste! I'm your AI Export Consultant 🌏\n\nI can help you with:\n• **Export readiness assessment**\n• **Market entry strategies**\n• **Document requirements**\n• **Buyer discovery**\n• **Trade policy insights**\n\nHow can I assist your export journey today?",
    timestamp: new Date().toISOString(),
  },
];

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsData = {
  revenueByMarket: [
    { name: 'USA', value: 4200000, fill: '#6366f1' },
    { name: 'Germany', value: 3800000, fill: '#8b5cf6' },
    { name: 'UAE', value: 2900000, fill: '#a78bfa' },
    { name: 'UK', value: 2200000, fill: '#c4b5fd' },
    { name: 'Others', value: 1500000, fill: '#ddd6fe' },
  ],
  monthlyExports: [
    { month: 'Mar', value: 480000 },
    { month: 'Apr', value: 520000 },
    { month: 'May', value: 610000 },
    { month: 'Jun', value: 580000 },
    { month: 'Jul', value: 720000 },
    { month: 'Aug', value: 850000 },
  ],
  productCategories: [
    { category: 'Textiles', exports: 38, growth: 14 },
    { category: 'Handicrafts', exports: 22, growth: 8 },
    { category: 'Spices', exports: 18, growth: 21 },
    { category: 'Leather', exports: 12, growth: -2 },
    { category: 'Gems & Jewelry', exports: 10, growth: 5 },
  ],
};
