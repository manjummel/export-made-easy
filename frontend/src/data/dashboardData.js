/**
 * Dashboard mock data for Generic User.
 */

export const COMPANY = {
  name: 'Your Company',
  product: 'Your Core Product',
  origin: 'Origin State/Country',
  hsCode: 'HS XXXX.XX',
  iec: 'AXXXX9999X',
  gstin: '99AXXXX9999X1Z9',
};

export const READINESS_SCORE = {
  overall: 87,
  breakdown: [
    { id: 'docs', label: 'Documentation', score: 78, color: 'blue', icon: 'FileText', desc: '7/9 documents valid' },
    { id: 'market', label: 'Market Fit', score: 94, color: 'emerald', icon: 'Globe', desc: 'Strong EU/UAE alignment' },
    { id: 'compliance', label: 'Compliance', score: 82, color: 'indigo', icon: 'ShieldCheck', desc: 'DGFT registration current' },
    { id: 'buyer', label: 'Buyer Potential', score: 91, color: 'cyan', icon: 'Users', desc: '12 verified matches' },
    { id: 'currency', label: 'Currency Risk', score: 73, color: 'amber', icon: 'DollarSign', desc: 'USD hedging recommended' },
  ],
};

export const AI_INSIGHT = {
  summary: 'UAE, Germany, and Singapore currently show strong import demand for premium organic cotton garments. Your HS Code 6205.20 qualifies for 0% tariff under India-UAE CEPA and EU GSP schemes.',
  opportunity: 'High',
  confidence: 92,
  urgency: 'Act in next 30 days — UAE peak import season begins September.',
  action: 'Explore Markets',
  trend: 'Germany demand for organic textiles increased +18% in last 90 days.',
};

export const MARKETS = [
  {
    id: 'uae',
    country: 'UAE',
    flag: '🇦🇪',
    region: 'Middle East',
    opportunityScore: 94,
    metrics: { demand: 94, growth: 22, competition: 38, risk: 18 },
    tariff: '0% via India-UAE CEPA',
    tariffVariant: 'success',
    buyers: 8,
    tam: '$2.4M',
    trend: '+22% YoY',
    highlight: 'CEPA 0% Duty',
    path: '/market-intelligence',
  },
  {
    id: 'germany',
    country: 'Germany',
    flag: '🇩🇪',
    region: 'European Union',
    opportunityScore: 89,
    metrics: { demand: 89, growth: 18, competition: 52, risk: 22 },
    tariff: '0% via EU GSP',
    tariffVariant: 'success',
    buyers: 11,
    tam: '$4.1M',
    trend: '+18% YoY',
    highlight: 'EU GSP 0% Duty',
    path: '/market-intelligence',
  },
  {
    id: 'singapore',
    country: 'Singapore',
    flag: '🇸🇬',
    region: 'Asia Pacific',
    opportunityScore: 86,
    metrics: { demand: 86, growth: 14, competition: 44, risk: 20 },
    tariff: '8.5% Standard',
    tariffVariant: 'warning',
    buyers: 5,
    tam: '$1.2M',
    trend: '+14% YoY',
    highlight: 'Premium Segment',
    path: '/market-intelligence',
  },
];

export const JOURNEY_STAGES = [
  {
    id: 'product',
    label: 'Product Ready',
    icon: 'Package',
    status: 'complete',
    progress: 100,
    detail: 'Your Core Product — HS XXXX.XX',
    recommendation: 'Product validated for global export standards.',
    path: '/ai-consultant',
    color: 'emerald',
  },
  {
    id: 'market',
    label: 'Market Discovery',
    icon: 'Globe',
    status: 'complete',
    progress: 100,
    detail: 'UAE, Germany, Singapore identified as top lanes',
    recommendation: 'AI ranked 47 markets by import demand score.',
    path: '/market-intelligence',
    color: 'emerald',
  },
  {
    id: 'buyers',
    label: 'Buyer Matching',
    icon: 'Users',
    status: 'active',
    progress: 65,
    detail: '12 verified buyers matched — 3 pending response',
    recommendation: 'Send introductory trade inquiry to Gulf Craft Trading LLC.',
    path: '/buyer-discovery',
    color: 'blue',
  },
  {
    id: 'docs',
    label: 'Documentation',
    icon: 'FileText',
    status: 'active',
    progress: 78,
    detail: '7 of 9 documents validated',
    recommendation: 'Renew Certificate of Origin — expires in 8 days.',
    path: '/documents',
    color: 'amber',
  },
  {
    id: 'compliance',
    label: 'Compliance',
    icon: 'ShieldCheck',
    status: 'pending',
    progress: 45,
    detail: 'DGFT registration verified, IEC active',
    recommendation: 'Obtain BIS certification for Germany market entry.',
    path: '/trade-policies',
    color: 'slate',
  },
  {
    id: 'shipment',
    label: 'Shipment',
    icon: 'Ship',
    status: 'pending',
    progress: 0,
    detail: 'Awaiting documentation completion',
    recommendation: 'Compare freight rates for JNPT → Hamburg via AI.',
    path: '/documents',
    color: 'slate',
  },
  {
    id: 'sale',
    label: 'Global Sale',
    icon: 'TrendingUp',
    status: 'pending',
    progress: 0,
    detail: 'Target: $280K first-year export revenue',
    recommendation: 'Complete journey to unlock global sale milestone.',
    path: '/analytics',
    color: 'slate',
  },
];

export const AI_ACTIVITY = [
  { id: 1, text: 'Germany demand for HS 6205.20 increased +18% in 90 days.', type: 'market', time: 'Just now', icon: 'TrendingUp' },
  { id: 2, text: 'New verified buyer match: Gulf Craft Trading LLC, Dubai (89% fit).', type: 'buyer', time: '4m ago', icon: 'UserCheck' },
  { id: 3, text: 'Certificate of Origin Form AI pre-filled for Germany shipment.', type: 'doc', time: '18m ago', icon: 'FileCheck' },
  { id: 4, text: 'USD/INR moved +0.7% — forward contract hedge recommended.', type: 'forex', time: '32m ago', icon: 'DollarSign' },
  { id: 5, text: 'India-UAE CEPA tariff rate confirmed: 0% for HS 6205.20.00.', type: 'policy', time: '1h ago', icon: 'ShieldCheck' },
  { id: 6, text: 'EuroTex GmbH (Frankfurt) replied to your trade inquiry.', type: 'buyer', time: '2h ago', icon: 'Mail' },
];

export const ANALYTICS_KPIS = [
  { id: 'revenue', label: 'Potential Export Revenue', value: '$4.8M', change: '+22%', color: 'emerald', icon: 'TrendingUp' },
  { id: 'markets', label: 'Target Markets', value: '3', change: '+2 this month', color: 'blue', icon: 'Globe' },
  { id: 'buyers', label: 'Buyer Matches', value: '12', change: '+4 this week', color: 'cyan', icon: 'Users' },
  { id: 'documents', label: 'Docs Generated', value: '7', change: '9 required', color: 'indigo', icon: 'FileText' },
  { id: 'risk', label: 'Risk Score', value: 'Low', change: '24/100', color: 'amber', icon: 'AlertTriangle' },
];

export const QUICK_ACTIONS = [
  { id: 'ai', label: 'Ask ExportEase AI', icon: 'Bot', path: '/ai-consultant', variant: 'ai', description: 'Get instant trade advice' },
  { id: 'product', label: 'Analyze Product', icon: 'Sparkles', path: '/ai-consultant', variant: 'primary', description: 'HS code & market fit' },
  { id: 'buyers', label: 'Find Buyers', icon: 'Users', path: '/buyer-discovery', variant: 'secondary', description: 'AI-matched importers' },
  { id: 'docs', label: 'Generate Document', icon: 'FileText', path: '/documents', variant: 'secondary', description: 'Invoice, CoO, Packing list' },
  { id: 'policy', label: 'Check Policy', icon: 'BookOpen', path: '/trade-policies', variant: 'secondary', description: 'FTA & tariff rules' },
  { id: 'forex', label: 'Currency Risk', icon: 'DollarSign', path: '/currency-risk', variant: 'secondary', description: 'Hedge forex exposure' },
];
