/**
 * ============================================================
 * ExportEase AI — Trade Policy Intelligence Service
 * Connects Frontend UI to /api/v1/compliance endpoints
 * ============================================================
 */

import apiClient from './apiClient';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const POLICY_PROMPTS = [
  'Can I export this product to Germany?',
  'Which documents are required for UAE?',
  'What HS code should I use?',
  'Are there restrictions on cotton apparel?',
  'What RoDTEP rebates are available?',
];

export const POLICY_COMPLIANCE_SCORE = {
  overall: 92,
  breakdown: [
    { name: 'Documentation', score: 88, status: 'verified', note: '7/9 documents valid' },
    { name: 'Policy & Treaty', score: 96, status: 'verified', note: 'CEPA & GSP 0% duty active' },
    { name: 'HS Code Classification', score: 99, status: 'verified', note: 'HS 6205.20.00 validated' },
    { name: 'Destination Clearance', score: 94, status: 'verified', note: 'No sanctions or quotas' },
    { name: 'Product Quality Standards', score: 85, status: 'requires_review', note: 'OEKO-TEX test pending' },
  ],
};

export const POLICY_TIMELINE_STEPS = [
  { id: 1, title: 'Policy detected', desc: 'India-UAE CEPA & EU GSP Chapter 62 identified', status: 'complete', time: '10:42 AM' },
  { id: 2, title: 'Policy checked', desc: '0% preferential customs tariff verified for HS 6205.20', status: 'complete', time: '10:43 AM' },
  { id: 3, title: 'Requirements identified', desc: 'Form AI & 35% local value addition criteria confirmed', status: 'complete', time: '10:44 AM' },
  { id: 4, title: 'Compliance reviewed', desc: 'Overall 92% export clearance readiness established', status: 'active', time: '10:45 AM' },
];

export const MOCK_POLICY_RESPONSES = {
  germany: {
    answer: 'Yes, your Premium Organic Cotton Shirts (HS 6205.20.00) are fully eligible for export to Germany with 0% customs duty under the EU Generalised Scheme of Preferences (GSP).',
    complianceStatus: 'Eligible — 0% Duty Preference',
    complianceBadge: 'verified',
    requiredDocuments: [
      'Commercial Invoice with REX Declaration',
      'Certificate of Origin (Form A or REX statement on invoice)',
      'Packing List with carton dimensions',
      'OEKO-TEX Standard 100 or GOTS Chemical Safety Test Report',
      'Ocean Bill of Lading (JNPT to Hamburg port)',
    ],
    relevantPolicy: 'EU Generalised Scheme of Preferences (GSP) & Foreign Trade Policy 2023-28',
    importantConditions: [
      'Value addition of minimum 35% within India is mandatory for GSP eligibility.',
      'Exporter must be registered under REX (Registered Exporter System) for consignments exceeding €6,000.',
      'Textile dyes must comply with EU REACH (EC 1907/2006) chemical regulations.',
    ],
    lastUpdated: 'August 18, 2026',
    reference: 'DGFT Trade Notice No. 08/2024 · EU Official Journal L 343/1',
  },
  uae: {
    answer: 'Yes, 100% duty-free export is guaranteed under the landmark India-UAE CEPA (Comprehensive Economic Partnership Agreement) which entered into force in May 2022.',
    complianceStatus: 'Eligible — 0% CEPA Duty Concession',
    complianceBadge: 'verified',
    requiredDocuments: [
      'Commercial Invoice with FOB value',
      'Certificate of Origin (Form AI) issued by authorized Indian agency',
      'Packing List matched with container shipping marks',
      'Shipping Bill filed on ICEGATE portal',
    ],
    relevantPolicy: 'India-UAE Comprehensive Economic Partnership Agreement (CEPA) Chapter 62',
    importantConditions: [
      'Certificate of Origin Form AI must be procured prior to vessel departure.',
      'Rule of origin requires 35% local value addition and change in tariff heading (CTH).',
      'Eligible for 2.5% RoDTEP cashback claim on FOB value via ICEGATE.',
    ],
    lastUpdated: 'August 22, 2026',
    reference: 'Ministry of Commerce & Industry Notification CEPA/2022/IND-UAE',
  },
  hscode: {
    answer: 'Your product is accurately classified under HS Code 6205.20.00: "Men\'s or boys\' shirts of cotton, not knitted or crocheted".',
    complianceStatus: 'Standard 8-Digit HS Code Validated',
    complianceBadge: 'verified',
    requiredDocuments: [
      'Product Fabric Composition Certificate (100% Organic Cotton)',
      'CBIC ITC-HS 2025 Verification Slip',
    ],
    relevantPolicy: 'Indian Trade Classification (Harmonised System) Code Book 2025-26',
    importantConditions: [
      'Ensure woven shirts are not classified under 6105 (which covers knitted/crocheted polo shirts).',
      'Clearance is streamlined under Green Channel customs assessment at Tuticorin/Chennai ports.',
    ],
    lastUpdated: 'August 20, 2026',
    reference: 'CBIC Tariff Chapter 62 Item 62052000',
  },
  restrictions: {
    answer: 'There are currently NO quantitative quotas, export bans, or Minimum Export Price (MEP) restrictions on cotton shirts (HS 6205.20.00) from India.',
    complianceStatus: 'Freely Exportable (Zero Restrictions)',
    complianceBadge: 'verified',
    requiredDocuments: [
      'Standard IEC (Import Export Code) registration',
      'GST LUT (Letter of Undertaking) for zero-rated IGST export',
    ],
    relevantPolicy: 'DGFT Export Policy Schedule 2 — Free Export Category',
    importantConditions: [
      'Export is entirely unrestricted under current Foreign Trade Policy guidelines.',
      'No specific export license required from DGFT.',
    ],
    lastUpdated: 'August 15, 2026',
    reference: 'DGFT Notification S.O. 1042(E) Export Policy Book 2024-2028',
  },
  rodtep: {
    answer: 'You are eligible to claim a 2.5% RoDTEP (Remission of Duties and Taxes on Exported Products) cash rebate on the FOB value of all exported cotton shirt consignments.',
    complianceStatus: 'Rebate Active — 2.5% FOB Value',
    complianceBadge: 'updated',
    requiredDocuments: [
      'Shipping Bill with RoDTEP Claim declaration flag (Y)',
      'e-BRC / Electronic Bank Realisation Certificate after payment receipt',
    ],
    relevantPolicy: 'RoDTEP Scheme Guidelines under Chapter 4 of Foreign Trade Policy',
    importantConditions: [
      'Claim must be submitted via ICEGATE portal within 12 months of shipping bill date.',
      'Credit scrip is transferable and can be used to pay basic customs duty on other imports.',
    ],
    lastUpdated: 'August 12, 2026',
    reference: 'CBIC Circular No. 23/2024-Customs · RoDTEP Cap ₹38/piece',
  },
};

/**
 * Query Policy Assistant
 */
export async function queryPolicyAssistant(query) {
  try {
    const data = await apiClient.post('/compliance/analyze', {
      product_name: 'Organic Cotton Apparel',
      destination_country: /germany/i.test(query) ? 'Germany' : 'United Arab Emirates',
      query,
    });
    if (data?.answer) return data;
  } catch (err) {
    console.log('[PolicyService] Compliance analyze fallback:', err.message);
  }

  await delay(1200);

  const lower = query.toLowerCase();
  if (lower.includes('germany') || lower.includes('europe') || lower.includes('eu')) {
    return MOCK_POLICY_RESPONSES.germany;
  }
  if (lower.includes('uae') || lower.includes('dubai') || lower.includes('cepa')) {
    return MOCK_POLICY_RESPONSES.uae;
  }
  if (lower.includes('hs code') || lower.includes('classification')) {
    return MOCK_POLICY_RESPONSES.hscode;
  }
  if (lower.includes('restriction') || lower.includes('quota') || lower.includes('ban')) {
    return MOCK_POLICY_RESPONSES.restrictions;
  }
  if (lower.includes('rodtep') || lower.includes('rebate') || lower.includes('incentive')) {
    return MOCK_POLICY_RESPONSES.rodtep;
  }

  return MOCK_POLICY_RESPONSES.uae;
}

export default {
  POLICY_PROMPTS,
  POLICY_COMPLIANCE_SCORE,
  POLICY_TIMELINE_STEPS,
  MOCK_POLICY_RESPONSES,
  queryPolicyAssistant,
};
