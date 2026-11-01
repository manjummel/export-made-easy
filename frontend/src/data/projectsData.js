/**
 * Enterprise Export Projects Registry
 * Powers the Project Hub and individual Project Workspaces with 9 integrated domains:
 * Overview, Live AI Trace, HS Classification, Compliance, Documents & Consistency, Market, Risk, Roadmap, Sources.
 */

export const PROJECTS_REGISTRY = [
  {
    id: 'turmeric-germany',
    title: 'Turmeric Powder (Salem/Erode Grade)',
    productName: 'Organic High-Curcumin Turmeric Powder',
    category: 'Spices & Agricultural Produce',
    originState: 'Tamil Nadu, India',
    originPort: 'Chennai Sea Port (INMAA1)',
    destinationCountry: 'Germany',
    destinationCity: 'Hamburg',
    destinationPort: 'Port of Hamburg (DEHAM)',
    flag: '🇩🇪',
    originFlag: '🇮🇳',
    buyerName: 'BioKräuter Import GmbH',
    buyerCity: 'Frankfurt, Germany',
    orderVolume: '18,000 kg (18 MT)',
    orderValueUSD: '$72,000',
    orderValueINR: '₹60,69,600',
    incoterm: 'CIF Hamburg Port',
    paymentTerms: 'Confirmed Irrevocable LC 60 Days',
    progress: 74,
    riskLevel: 'low',
    riskScore: 18,
    complianceReadiness: 94,
    aiConfidence: 98,
    status: 'In Clearance Preparation',
    updatedAt: '15 mins ago',
    activePhase: 'Phytosanitary & Document Verification',
    hsCode: '0910.30.20',
    hsDescription: 'Curcuma (Turmeric) — In Powder Form',

    // 1. HS Classification Details
    hsClassification: {
      recommendedCode: '0910.30.20',
      description: 'Curcuma (turmeric), crushed or ground (powder form), with curcumin content >= 3.0%',
      confidence: 98,
      leadAuthority: 'CBIC ITC-HS 2025 Chapter 9',
      explanation: 'Classified under Chapter 9 (Coffee, tea, maté and spices). Subheading 0910 covers ginger, saffron, turmeric (curcuma), thyme, bay leaves, curry and other spices. National tariff line 0910.30.20 specifically distinguishes ground powder from raw roots (0910.30.10).',
      candidates: [
        { code: '0910.30.20', name: 'Turmeric (curcuma) in powder form', match: '98%', status: 'Recommended' },
        { code: '0910.30.10', name: 'Turmeric (curcuma) fresh or dried roots', match: '64%', status: 'Alternative' },
        { code: '2103.90.90', name: 'Mixed seasonings and curry powders', match: '42%', status: 'Inapplicable' },
      ],
      ruleOfOrigin: 'Wholly Obtained (WO) criterion met under Spices Board Certification.',
      evidence: {
        authority: 'Spices Board of India / DGFT',
        document: 'ITC (HS) Tariff Classification Guidelines 2025',
        section: 'Chapter 09 — Spices, item 0910.30.20',
        confidence: 98,
        verificationStatus: 'Officially Validated Tariff Line',
        excerpt: 'Turmeric powder produced exclusively from Indian agricultural harvests meets 100% Wholly Obtained origin requirements for EU GSP clearance.',
        officialUrl: 'https://www.indianspices.com',
      },
    },

    // 2. Compliance Matrix
    compliance: {
      overallScore: 94,
      requirements: [
        {
          id: 'cmp-1',
          name: 'Spices Board CRES Certificate',
          authority: 'Spices Board of India',
          status: 'completed',
          reason: 'Mandatory export registration certificate issued and valid till March 2027.',
          confidence: 99,
          evidenceDoc: 'Spices Board Reg #SB/EXP/2024/9021',
        },
        {
          id: 'cmp-2',
          name: 'EU Maximum Residue Limit (MRL) Test Report',
          authority: 'EU Regulation (EC) No 396/2005 / Eurofins',
          status: 'completed',
          reason: 'Aflatoxin, Ochratoxin A, and pesticide residue levels well within EU strict limits (< 10 ppb).',
          confidence: 96,
          evidenceDoc: 'Eurofins Lab Test Cert #EF-DE-89214',
        },
        {
          id: 'cmp-3',
          name: 'Phytosanitary Certificate',
          authority: 'Plant Quarantine Division, Ministry of Agriculture',
          status: 'pending',
          reason: 'Inspection scheduled at Chennai port terminal 48 hours prior to container loading.',
          confidence: 92,
          evidenceDoc: 'PQ Application #PQIS-2026-0814',
        },
        {
          id: 'cmp-4',
          name: 'REX (Registered Exporter System) Statement',
          authority: 'DGFT / European Commission',
          status: 'completed',
          reason: 'REX number INREX10293847 incorporated on Commercial Invoice for 0% GSP duty claim.',
          confidence: 97,
          evidenceDoc: 'DGFT REX Registration Slip #INREX10293847',
        },
      ],
    },

    // 3. Document Workspace & Consistency
    documents: [
      { id: 'ci', name: 'Commercial Invoice', status: 'generated', format: 'PDF', confidence: 99, updated: 'Today, 10:15 AM' },
      { id: 'pl', name: 'Packing List (720 Cartons / 25kg each)', status: 'generated', format: 'PDF', confidence: 98, updated: 'Today, 10:18 AM' },
      { id: 'coo', name: 'Certificate of Origin (REX / GSP)', status: 'validated', format: 'Digital EDI', confidence: 97, updated: 'Yesterday' },
      { id: 'sb', name: 'ICEGATE Shipping Bill Draft', status: 'ready_to_file', format: 'ICEGATE XML', confidence: 95, updated: 'Today, 11:00 AM' },
      { id: 'phyto', name: 'Phytosanitary Inspection Slip', status: 'scheduled', format: 'Original', confidence: 92, updated: '2 days ago' },
    ],

    // Consistency Engine Cross-Match
    consistencyCheck: {
      isConsistent: true,
      score: 98,
      items: [
        { field: 'Product Description', match: true, value: 'Organic Turmeric Powder (Curcuma Longa)' },
        { field: 'Consignment Quantity', match: true, value: '18,000 kg (720 Cartons)' },
        { field: 'Total Invoice Value', match: true, value: '$72,000.00 USD' },
        { field: 'HS Tariff Code', match: true, value: '0910.30.20' },
        { field: 'Country of Origin', match: true, value: 'India' },
        { field: 'Settlement Currency', match: true, value: 'USD ($)' },
      ],
    },

    // 4. Market & Trade Lane
    market: {
      destination: 'Germany (European Union)',
      marketOpportunityScore: 92,
      tariffRate: '0% (via EU GSP Preference)',
      transitDays: '18 Days (Chennai → Hamburg)',
      freightEstimateUSD: '$2,450 (1x 20ft FCL Reefer/Ventilated)',
      buyerCreditRating: 'AAA (Euler Hermes Insured)',
      demandTrend: '+16.8% YoY German Organic Spice Imports',
    },

    // 5. Risk Assessment
    risk: {
      overall: 18,
      regulatory: 'Low (0% Tariff & Clear MRL test)',
      documentation: 'Low (All 5 mandatory trade documents mapped)',
      destination: 'Low (Germany Frankfurt/Hamburg Port cleared)',
      financial: 'Moderate (USD/INR volatility — 70% forward hedge recommended)',
      uncertainty: 'Low (Spices Board & DGFT verified records)',
    },

    // 6. 8-Step Export Execution Roadmap
    roadmap: [
      { step: 1, name: 'Product Quality & Lab Testing', status: 'completed', date: 'Aug 14, 2026', note: 'Eurofins MRL report passed' },
      { step: 2, name: 'HS Classification (0910.30.20)', status: 'completed', date: 'Aug 16, 2026', note: 'CBIC 8-digit tariff line mapped' },
      { step: 3, name: 'Regulatory Compliance & REX', status: 'completed', date: 'Aug 18, 2026', note: 'REX #INREX10293847 stamped' },
      { step: 4, name: 'Commercial Invoicing & Packing', status: 'completed', date: 'Aug 20, 2026', note: 'CI #EXP-2026-TURM-01 compiled' },
      { step: 5, name: 'Phytosanitary Quarantine Clearance', status: 'active', date: 'Aug 27, 2026', note: 'Port inspection scheduled' },
      { step: 6, name: 'ICEGATE Shipping Bill Filing', status: 'pending', date: 'Aug 28, 2026', note: 'RoDTEP 2.5% claim ready' },
      { step: 7, name: 'Vessel Dispatch & Ocean BL', status: 'pending', date: 'Sep 02, 2026', note: 'Hapag-Lloyd booking confirmed' },
      { step: 8, name: 'Bank LC Document Presentation', status: 'pending', date: 'Sep 05, 2026', note: 'Payment realization via State Bank of India' },
    ],

    nextBestAction: {
      title: 'Complete Port Phytosanitary Inspection',
      description: 'Ensure sample lots from Tirupur warehouse arrive at Chennai port quarantine desk 48 hours prior to vessel cutoff.',
      urgency: 'Action due in 48 hours',
      actionLabel: 'Schedule Quarantine Officer',
    },
  },
  {
    id: 'cotton-shirts-uae',
    title: 'Premium Organic Cotton Shirts',
    productName: 'Men’s 100% Organic Woven Cotton Shirts',
    category: 'Textiles & Apparel',
    originState: 'Tamil Nadu, India',
    originPort: 'Tuticorin / Chennai Port',
    destinationCountry: 'United Arab Emirates',
    destinationCity: 'Dubai',
    destinationPort: 'Jebel Ali Port (AEJEA)',
    flag: '🇦🇪',
    originFlag: '🇮🇳',
    buyerName: 'Gulf Craft Trading LLC',
    buyerCity: 'Dubai, UAE',
    orderVolume: '3,500 Units',
    orderValueUSD: '$84,000',
    orderValueINR: '₹70,81,200',
    incoterm: 'FOB Chennai Port',
    paymentTerms: 'Letter of Credit (LC) at Sight — 60 Days',
    progress: 88,
    riskLevel: 'low',
    riskScore: 14,
    complianceReadiness: 96,
    aiConfidence: 96,
    status: 'Ready for Shipping Bill Filing',
    updatedAt: '25 mins ago',
    activePhase: 'Certificate of Origin Form AI Dispatch',
    hsCode: '6205.20.00',
    hsDescription: 'Men\'s or Boys\' Shirts of Cotton (Woven)',

    hsClassification: {
      recommendedCode: '6205.20.00',
      description: 'Men\'s or boys\' shirts of cotton, not knitted or crocheted, woven fabric',
      confidence: 98,
      leadAuthority: 'CBIC Tariff Chapter 62',
      explanation: 'Woven garments are strictly distinguished from knitted polo shirts (Heading 6105). Qualifies for 0% immediate duty elimination under India-UAE CEPA.',
      candidates: [
        { code: '6205.20.00', name: 'Men’s shirts of cotton (woven)', match: '98%', status: 'Recommended' },
        { code: '6105.10.00', name: 'Men’s shirts of cotton (knitted/crocheted)', match: '58%', status: 'Alternative' },
      ],
      ruleOfOrigin: 'Qualifying Value Content (QVC) >= 35% under CEPA Annex 2B.',
      evidence: {
        authority: 'Ministry of Commerce / DGFT',
        document: 'India-UAE CEPA Bilateral Agreement',
        section: 'Annex 2B — Product Specific Rules for Apparel',
        confidence: 98,
        verificationStatus: 'Zero-Duty CEPA Tariff Schedule',
        excerpt: 'Textiles classified in Heading 6205 exported from Indian territory qualify for 0% duty at Jebel Ali port.',
        officialUrl: 'https://commerce.gov.in',
      },
    },

    compliance: {
      overallScore: 96,
      requirements: [
        { id: 'cmp-u1', name: 'Certificate of Origin (Form AI)', authority: 'DGFT / EPC', status: 'completed', reason: 'Form AI generated with 35% local value add.' },
        { id: 'cmp-u2', name: 'GOTS Organic Certification', authority: 'Control Union', status: 'completed', reason: 'Organic textile certification verified.' },
        { id: 'cmp-u3', name: 'ICEGATE RoDTEP Claim', authority: 'CBIC Customs', status: 'ready', reason: '2.5% cash incentive mapped.' },
      ],
    },

    documents: [
      { id: 'ci-u', name: 'Commercial Invoice #EXP-2026-0842', status: 'generated', format: 'PDF', confidence: 99, updated: 'Today' },
      { id: 'pl-u', name: 'Packing List (70 Master Cartons)', status: 'generated', format: 'PDF', confidence: 98, updated: 'Today' },
      { id: 'coo-u', name: 'Form AI Certificate of Origin', status: 'generated', format: 'Official PDF', confidence: 98, updated: 'Today' },
    ],

    consistencyCheck: {
      isConsistent: true,
      score: 100,
      items: [
        { field: 'Product Description', match: true, value: 'Men\'s Organic Woven Cotton Shirts' },
        { field: 'Consignment Quantity', match: true, value: '3,500 Units (70 Cartons)' },
        { field: 'Total Invoice Value', match: true, value: '$84,000.00 USD' },
        { field: 'HS Tariff Code', match: true, value: '6205.20.00' },
      ],
    },

    market: {
      destination: 'United Arab Emirates',
      marketOpportunityScore: 94,
      tariffRate: '0% (India-UAE CEPA)',
      transitDays: '4 Days (Chennai → Jebel Ali)',
      freightEstimateUSD: '$850 (LCL / 70 Cartons)',
      buyerCreditRating: 'Dun & Bradstreet Verified #AE-89214',
    },

    risk: {
      overall: 14,
      regulatory: 'Low (CEPA 0% Duty)',
      documentation: 'Low (Zero errors)',
      destination: 'Low (4-day transit)',
      financial: 'Moderate (USD/INR open hedge)',
      uncertainty: 'Low',
    },

    roadmap: [
      { step: 1, name: 'GOTS Raw Material Validation', status: 'completed', date: 'Aug 10, 2026' },
      { step: 2, name: 'HS Classification (6205.20.00)', status: 'completed', date: 'Aug 12, 2026' },
      { step: 3, name: 'CEPA 0% Concession Verification', status: 'completed', date: 'Aug 15, 2026' },
      { step: 4, name: 'Form AI Issuance', status: 'completed', date: 'Aug 18, 2026' },
      { step: 5, name: 'Commercial Invoicing', status: 'completed', date: 'Aug 21, 2026' },
      { step: 6, name: 'Filing ICEGATE Shipping Bill', status: 'active', date: 'Aug 26, 2026' },
      { step: 7, name: 'Port Loading (Maersk Line)', status: 'pending', date: 'Aug 29, 2026' },
      { step: 8, name: 'LC Payment Realization', status: 'pending', date: 'Sep 08, 2026' },
    ],

    nextBestAction: {
      title: 'Submit Shipping Bill on ICEGATE EDI',
      description: 'Transmit electronic export declaration to claim 2.5% RoDTEP cash rebate and generate Let Export Order (LEO).',
      urgency: 'Action due today',
      actionLabel: 'Transmit to ICEGATE',
    },
  },
  {
    id: 'brassware-usa',
    title: 'Handcrafted Brass Artware & Lighting',
    productName: 'Artisanal Brass Decorative Lamps & Planters',
    category: 'Handicrafts & Metalware',
    originState: 'Uttar Pradesh, India',
    originPort: 'Nhava Sheva (JNPT Mumbai)',
    destinationCountry: 'United States',
    destinationCity: 'New York',
    destinationPort: 'Port of New York & New Jersey (USNYC)',
    flag: '🇺🇸',
    originFlag: '🇮🇳',
    buyerName: 'Manhattan Home Decor Inc',
    buyerCity: 'New York, NY',
    orderVolume: '1,200 Sets',
    orderValueUSD: '$54,000',
    orderValueINR: '₹45,52,200',
    incoterm: 'FOB JNPT Port',
    paymentTerms: '30% Advance + 70% against BL scan',
    progress: 58,
    riskLevel: 'medium',
    riskScore: 32,
    complianceReadiness: 86,
    aiConfidence: 94,
    status: 'In Packaging & EPCH Certification',
    updatedAt: '1 hour ago',
    activePhase: 'Lacey Act & US Customs 10+2 ISF Filing',
    hsCode: '7419.80.30',
    hsDescription: 'Articles of Brass Handcrafted (Artware)',

    hsClassification: {
      recommendedCode: '7419.80.30',
      description: 'Other articles of copper/brass — Artware of brass, handcrafted',
      confidence: 94,
      leadAuthority: 'CBIC Chapter 74 & US HTS 7419.99',
      explanation: 'Classified under Chapter 74 for brass articles. Handcrafted certification from EPCH qualifies for reduced customs scrutiny under US HTS classification.',
      candidates: [
        { code: '7419.80.30', name: 'Brass Artware (Handcrafted)', match: '94%', status: 'Recommended' },
        { code: '9405.10.00', name: 'Electric ceiling or wall lighting fixtures', match: '72%', status: 'Alternative' },
      ],
      ruleOfOrigin: 'EPCH Master Craftsperson Certificate required.',
    },

    compliance: {
      overallScore: 86,
      requirements: [
        { id: 'cmp-b1', name: 'EPCH Handicraft Certificate', authority: 'EPCH India', status: 'completed', reason: 'Authentic Indian handicraft certificate issued.' },
        { id: 'cmp-b2', name: 'US Customs 10+2 ISF Filing', authority: 'US CBP', status: 'pending', reason: 'Importer Security Filing must be submitted 24h prior to vessel departure.' },
        { id: 'cmp-b3', name: 'Lead & Heavy Metal Safety Test', authority: 'SGS India', status: 'completed', reason: 'Passes US Proposition 65 safety standard.' },
      ],
    },

    documents: [
      { id: 'ci-b', name: 'Commercial Invoice', status: 'generated', format: 'PDF', confidence: 97, updated: 'Yesterday' },
      { id: 'pl-b', name: 'Packing List (Palletized)', status: 'generated', format: 'PDF', confidence: 96, updated: 'Yesterday' },
    ],

    consistencyCheck: {
      isConsistent: true,
      score: 96,
      items: [
        { field: 'Product Description', match: true, value: 'Artisanal Brass Decorative Lamps' },
        { field: 'Consignment Quantity', match: true, value: '1,200 Sets' },
        { field: 'Total Invoice Value', match: true, value: '$54,000.00 USD' },
      ],
    },

    market: {
      destination: 'United States',
      marketOpportunityScore: 88,
      tariffRate: '3.0% Standard MFN Duty',
      transitDays: '26 Days (JNPT → New York)',
      freightEstimateUSD: '$3,100 (1x 20ft FCL Container)',
      buyerCreditRating: 'AA Verified US Retailer',
    },

    risk: {
      overall: 32,
      regulatory: 'Low (US CBP clear)',
      documentation: 'Medium (ISF 10+2 deadline strict)',
      destination: 'Low',
      financial: 'Moderate (Advance 30% secured)',
      uncertainty: 'Low',
    },

    roadmap: [
      { step: 1, name: 'Handicraft Artisan Verification', status: 'completed', date: 'Aug 05, 2026' },
      { step: 2, name: 'HS Classification (7419.80.30)', status: 'completed', date: 'Aug 08, 2026' },
      { step: 3, name: 'US Prop 65 Safety Testing', status: 'completed', date: 'Aug 12, 2026' },
      { step: 4, name: 'EPCH Certificate Issuance', status: 'completed', date: 'Aug 15, 2026' },
      { step: 5, name: 'Packaging & Palletization', status: 'completed', date: 'Aug 22, 2026' },
      { step: 6, name: 'US Customs 10+2 ISF Filing', status: 'active', date: 'Aug 26, 2026' },
      { step: 7, name: 'Port Clearance at JNPT Mumbai', status: 'pending', date: 'Aug 30, 2026' },
      { step: 8, name: 'Final 70% Wire Realization', status: 'pending', date: 'Sep 15, 2026' },
    ],

    nextBestAction: {
      title: 'Submit Importer Security Filing (ISF 10+2)',
      description: 'Coordinate with freight forwarder to submit US Customs ISF 10+2 form 24 hours prior to container loading at JNPT.',
      urgency: 'Action required within 48h',
      actionLabel: 'Transmit ISF 10+2',
    },
  },
];
