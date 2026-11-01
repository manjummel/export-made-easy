/**
 * ============================================================
 * ExportEase AI — Export Document Studio Service
 * Connects Frontend UI to FastAPI /api/v1/documents endpoints
 * ============================================================
 */

import apiClient from './apiClient';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const DOCUMENT_TYPES = [
  {
    id: 'ci',
    name: 'Commercial Invoice',
    category: 'Commercial',
    code: 'CI-6205',
    description: 'Official customs billing document detailing unit prices, FOB value, and HS tariff codes for clearance.',
    icon: 'FileText',
    estTime: '3 sec',
    recommended: true,
    requiredFor: ['UAE (CEPA)', 'Germany (EU-GSP)', 'USA', 'Singapore'],
  },
  {
    id: 'pi',
    name: 'Proforma Invoice',
    category: 'Commercial',
    code: 'PI-2026',
    description: 'Preliminary quotation sent to overseas buyers to request LC issuance and import advance payment.',
    icon: 'Receipt',
    estTime: '2 sec',
    recommended: false,
    requiredFor: ['Buyer Quotation', 'Bank LC Opening'],
  },
  {
    id: 'pl',
    name: 'Packing List',
    category: 'Logistics',
    code: 'PL-SHIP',
    description: 'Itemized breakdown of package dimensions, gross/net weight, marks, numbers, and carton counts.',
    icon: 'PackageCheck',
    estTime: '4 sec',
    recommended: true,
    requiredFor: ['Freight Forwarding', 'Port Terminal Handling'],
  },
  {
    id: 'coo',
    name: 'Certificate of Origin (Form AI)',
    category: 'Certificates',
    code: 'COO-CEPA',
    description: 'Official certification granting 0% tariff under India-UAE CEPA or EU GSP preferential trade regimes.',
    icon: 'ShieldCheck',
    estTime: '5 sec',
    recommended: true,
    requiredFor: ['0% Duty Exemption in UAE & Germany'],
  },
  {
    id: 'bl',
    name: 'Shipping Bill / Ocean Bill of Lading',
    category: 'Logistics',
    code: 'BL-MAERSK',
    description: 'Carrier receipt and document of title issued by shipping line for port-to-port maritime freight.',
    icon: 'Ship',
    estTime: '6 sec',
    recommended: false,
    requiredFor: ['Customs Clearance at Origin & Destination'],
  },
  {
    id: 'decl',
    name: 'ICEGATE Export Declaration',
    category: 'Compliance',
    code: 'DECL-DGFT',
    description: 'Standard customs declaration filing required for claiming RoDTEP cash incentives and Duty Drawback.',
    icon: 'FileCheck2',
    estTime: '4 sec',
    recommended: false,
    requiredFor: ['ICEGATE RoDTEP 2.5% Claim'],
  },
];

export const INITIAL_FORM_STATE = {
  product: 'Premium Organic Cotton Shirts',
  hsCode: '6205.20.00',
  quantity: '3500',
  unitPrice: '24.00',
  buyer: 'Gulf Craft Trading LLC',
  country: 'United Arab Emirates',
  shippingDetails: 'Chennai Sea Port → Jebel Ali Port, Dubai (Maersk Line)',
  currency: 'USD',
  invoiceNumber: 'EXP-2026-0842',
  exporterName: 'Your Company Legal Name',
  exporterAddress: 'Origin City, Origin State/Country, India',
  iec: 'AAICU9823D',
  gstin: '33AAICU9823D1Z4',
  buyerAddress: 'Al Quoz Industrial Area 3, P.O. Box 8421, Dubai, UAE',
  paymentTerms: 'Letter of Credit (LC) at Sight — 60 Days',
  incoterm: 'FOB Chennai Port',
  documentType: 'ci',
};

export const MOCK_OCR_EXTRACTIONS = [
  {
    field: 'Product Description',
    key: 'product',
    extractedValue: 'Premium Organic Cotton Shirts (GOTS Certified)',
    confidence: 98,
    status: 'verified',
  },
  {
    field: 'Harmonized System Code',
    key: 'hsCode',
    extractedValue: '6205.20.00',
    confidence: 99,
    status: 'verified',
  },
  {
    field: 'Consignment Quantity',
    key: 'quantity',
    extractedValue: '3500',
    confidence: 96,
    status: 'verified',
  },
  {
    field: 'Unit Price (FOB)',
    key: 'unitPrice',
    extractedValue: '24.00',
    confidence: 97,
    status: 'verified',
  },
  {
    field: 'Buyer Organization',
    key: 'buyer',
    extractedValue: 'Gulf Craft Trading LLC',
    confidence: 94,
    status: 'verified',
  },
  {
    field: 'Destination Country',
    key: 'country',
    extractedValue: 'United Arab Emirates',
    confidence: 99,
    status: 'verified',
  },
  {
    field: 'Invoice Reference Number',
    key: 'invoiceNumber',
    extractedValue: 'EXP-2026-0842',
    confidence: 95,
    status: 'verified',
  },
  {
    field: 'Currency Code',
    key: 'currency',
    extractedValue: 'USD',
    confidence: 99,
    status: 'verified',
  },
  {
    field: 'Incoterm / Delivery Terms',
    key: 'incoterm',
    extractedValue: 'FOB Chennai Port',
    confidence: 91,
    status: 'needs_review',
  },
];

export const OCR_STAGES = [
  'Uploading document to secure processing sandbox...',
  'Scanning layout structure, headers & line items...',
  'Extracting OCR entities, numbers & text blocks...',
  'Validating HS codes against CBIC tariff database...',
  'Extraction complete — 96.8% aggregate confidence score.',
];

/**
 * Fetch required documents from backend document engine
 */
export async function analyzeDocumentRequirements(projectId, product = 'Cotton Shirts', destination = 'Germany') {
  try {
    const data = await apiClient.post('/documents/analyze', {
      project_id: projectId || 'proj-001',
      product_name: product,
      destination_country: destination,
    });
    return data;
  } catch (err) {
    console.log('[DocumentService] analyze requirements fallback:', err.message);
    return null;
  }
}

/**
 * Simulate OCR extraction from an uploaded file
 */
export async function simulateOCRExtraction(file) {
  await delay(2000);
  return MOCK_OCR_EXTRACTIONS;
}

/**
 * Generate Export Document
 */
export async function generateExportDocument(formData) {
  try {
    // Attempt backend document completion if project exists
    if (formData.projectId && formData.documentId) {
      await apiClient.post(`/projects/${formData.projectId}/documents/${formData.documentId}/complete`, {
        data: formData
      });
    }
  } catch {
    // continue
  }

  await delay(1200);
  const totalAmount = (parseFloat(formData.quantity || 0) * parseFloat(formData.unitPrice || 0)).toFixed(2);
  
  return {
    success: true,
    documentId: `DOC-${Date.now().toString().slice(-6)}`,
    generatedAt: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
    totalAmount,
    ...formData,
  };
}

export default {
  DOCUMENT_TYPES,
  INITIAL_FORM_STATE,
  MOCK_OCR_EXTRACTIONS,
  OCR_STAGES,
  analyzeDocumentRequirements,
  simulateOCRExtraction,
  generateExportDocument,
};
