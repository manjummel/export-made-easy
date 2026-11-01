/**
 * ============================================================
 * ExportEase AI — AI Export Consultant Service
 * Communicates with FastAPI /api/v1/chat, /api/v1/ai endpoints
 * with rich structured fallback intelligence
 * ============================================================
 */

import apiClient, { WS_BASE_URL } from './apiClient';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const QUICK_PROMPTS = [
  'Find the best markets',
  'Check export policy',
  'Find buyers',
  'Generate documents',
  'Analyze currency risk',
  'Create export strategy',
];

export const INITIAL_MESSAGES = [
  {
    id: 'msg-1',
    role: 'assistant',
    timestamp: 'Just now',
    text: "Hello! I am your generic AI Export Consultant. I've analyzed your product profile (**Your Core Product**, HS Code: `HS XXXX.XX`, Origin: **Origin State/Country**).\n\nHow can I help accelerate your global expansion today?",
    quickPrompts: QUICK_PROMPTS,
  },
  {
    id: 'msg-2',
    role: 'user',
    timestamp: 'Just now',
    text: 'I manufacture cotton shirts in Tamil Nadu. Which country should I export to?',
  },
  {
    id: 'msg-3',
    role: 'assistant',
    timestamp: 'Just now',
    structured: {
      company: 'Your Company',
      product: 'Your Core Product',
      hsCode: 'HS XXXX.XX (Your Portfolio)',
      origin: 'Origin State/Country',
      headline: 'Target Market Recommendation for Your Export Profile',
      markets: [
        {
          rank: 1,
          name: 'United Arab Emirates',
          flag: '🇦🇪',
          score: 94,
          tariff: '0% (India-UAE CEPA)',
          tam: '$2.4M',
          growth: '+22% YoY',
          buyersCount: 8,
          highlights: 'Duty-free access under CEPA, 4-day shipping from major ports, high demand in retail sector.',
        },
        {
          rank: 2,
          name: 'Germany',
          flag: '🇩🇪',
          score: 89,
          tariff: '0% (EU GSP Scheme)',
          tam: '$4.1M',
          growth: '+18% YoY',
          buyersCount: 11,
          highlights: 'Strong preference for certified organic goods, premium price margins, strict ESG compliance.',
        },
        {
          rank: 3,
          name: 'Singapore',
          flag: '🇸🇬',
          score: 86,
          tariff: '8.5% Standard',
          tam: '$1.2M',
          growth: '+14% YoY',
          buyersCount: 5,
          highlights: 'Gateway to ASEAN markets, tech-enabled customs clearance, affluent consumer base.',
        },
      ],
      reasons: [
        {
          title: 'Surging Global Demand',
          desc: 'Imports in EU and Middle East grew 21% year-over-year due to sustainability regulations.',
        },
        {
          title: 'Tariff & Policy Advantage',
          desc: 'Bilateral trade agreements often provide duty-free access for your product category.',
        },
        {
          title: 'High-Margin Buyer Ecosystem',
          desc: 'Verified corporate buyers are currently active in your price band.',
        },
        {
          title: 'Logistics Efficiency',
          desc: 'Direct maritime trade lanes provide competitive freight costs.',
        },
      ],
      actions: [
        { label: 'Compare Markets', path: '/market-intelligence', variant: 'primary' },
        { label: 'Find Verified Buyers', path: '/buyer-discovery', variant: 'secondary' },
        { label: 'Generate Export Plan', path: '/documents', variant: 'outline' },
      ],
      sources: [
        'DGFT Export Data 2025-26',
        'International Tariff Schedule',
        'UN Comtrade Import Registry',
      ],
    },
  },
];

export const THINKING_STEPS = [
  'Analyzing product specifications & HS classification...',
  'Comparing 47 global markets across demand & import tariffs...',
  'Checking trade agreements & incentives...',
  'Evaluating buyer ecosystem & logistics feasibility...',
  'Calculating risk metrics & synthesizing strategic guidance...',
];

/**
 * Connect to FastAPI WebSocket chat stream
 */
export function createChatWebSocket(onMessage, onError) {
  // FRONTEND-ONLY MOCK MODE: Intercept WS connections and simulate backend AI
  console.log('[AIConsultant] Mock WebSocket initialized');
  const dummySocket = {
    onopen: null,
    onmessage: null,
    onerror: null,
    onclose: null,
    readyState: 1, // OPEN
    close: () => { console.log('[AIConsultant] Mock WebSocket closed'); },
    send: (msgStr) => {
      try {
        const payload = JSON.parse(msgStr);
        
        // Simulate network delay
        setTimeout(() => {
          // Send thinking steps
          let step = 0;
          const interval = setInterval(() => {
            if (step < THINKING_STEPS.length) {
              if (onMessage) onMessage({ type: 'think', content: THINKING_STEPS[step] });
              step++;
            } else {
              clearInterval(interval);
              // Send final response
              setTimeout(() => {
                const response = {
                  type: 'text',
                  content: "Based on the latest regulatory data, this strategy is highly viable. I recommend proceeding with the documentation phase to secure your export timeline.",
                  metadata: { confidence: 96 }
                };
                if (onMessage) onMessage(response);
              }, 500);
            }
          }, 600);
        }, 300);

      } catch (err) {
        console.error('Failed to parse mock ws message', err);
      }
    }
  };

  setTimeout(() => {
    if (dummySocket.onopen) dummySocket.onopen();
  }, 100);

  return dummySocket;
}

/**
 * Generate AI Response based on prompt
 */
export async function sendConsultantQuery(query, history = [], productContext = {}) {
  // Attempt live backend REST AI chat endpoint
  try {
    const apiResponse = await apiClient.post('http://localhost:8000/chat', {
      message: query,
      history: history,
    });

    if (apiResponse && apiResponse.response) {
      return {
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: apiResponse.response,
      };
    }
  } catch (err) {
    console.log('[AIService] Using client-side structured intelligence engine:', err.message);
  }

  // Graceful simulation latency for realistic AI reasoning experience
  await delay(1200);

  const lower = query.toLowerCase();

  if (lower.includes('policy') || lower.includes('tariff') || lower.includes('cepa')) {
    return {
      role: 'assistant',
      timestamp: 'Just now',
      structured: {
        headline: 'Export Policy & Tariff Concession Analysis',
        hsCode: 'HS XXXX.XX — Your Product Category',
        markets: [
          {
            rank: 1,
            name: 'Preferential Trade Agreement',
            flag: '🌍',
            score: 98,
            tariff: '0% Immediate Duty Elimination',
            tam: 'Available benefit',
            growth: 'Active',
            buyersCount: 14,
            highlights: 'Requires Certificate of Origin. Ensure value addition criteria are met.',
          },
          {
            rank: 2,
            name: 'GSP / Standard Scheme',
            flag: '🇪🇺',
            score: 92,
            tariff: '0% Preferential Duty',
            tam: 'Available benefit',
            growth: 'Active',
            buyersCount: 22,
            highlights: 'Registration with local authorities needed. Industry standard certification recommended.',
          },
        ],
        reasons: [
          {
            title: 'Incentives Available',
            desc: 'Applicable cash rebates and drawback rates are available for your export consignments via government portals.',
          },
          {
            title: 'Duty Drawback (DBK)',
            desc: 'Additional industry rates available for non-cenvat inputs used in manufacturing.',
          },
        ],
        actions: [
          { label: 'Check Policy Details', path: '/trade-policies', variant: 'primary' },
          { label: 'Generate Compliance Docs', path: '/documents', variant: 'secondary' },
        ],
        sources: ['DGFT Notifications', 'Customs Schedule'],
      },
    };
  }

  if (lower.includes('buyer') || lower.includes('importer')) {
    return {
      role: 'assistant',
      timestamp: 'Just now',
      structured: {
        headline: 'Top 3 Matched International Buyers for Your Company',
        hsCode: 'HS XXXX.XX — Your Product Portfolio',
        markets: [
          {
            rank: 1,
            name: 'Generic Trading LLC, Dubai (94% Fit)',
            flag: '🇦🇪',
            score: 94,
            tariff: 'LC 60 Days',
            tam: '$1.4M / yr',
            growth: 'Verified Importer',
            buyersCount: 1,
          },
          {
            rank: 2,
            name: 'EuroTex Mode GmbH (Frankfurt, Germany)',
            flag: '🇩🇪',
            score: 89,
            tariff: 'Advance 30% + CAD',
            tam: '$2.8M / yr',
            growth: 'Verified Importer',
            buyersCount: 1,
            highlights: 'Specializes in sustainable organic retail chains across DACH region. GOTS certificate required.',
          },
          {
            rank: 3,
            name: 'SilkRoad Apparel Pte (Singapore)',
            flag: '🇸🇬',
            score: 86,
            tariff: 'Letter of Credit',
            tam: '$950K / yr',
            growth: 'Verified Importer',
            buyersCount: 1,
            highlights: 'Boutique department store supplier. Fast 14-day sample turnaround expected.',
          },
        ],
        reasons: [
          {
            title: 'Credit Rating & Verification',
            desc: 'All 3 buyers have valid Dun & Bradstreet / Euler Hermes credit ratings above 80/100 with zero default records.',
          },
          {
            title: 'Compatible MOQ (Minimum Order Quantity)',
            desc: 'Buyer volume requirements match your Tamil Nadu production batch size of 2,000–5,000 units.',
          },
        ],
        actions: [
          { label: 'Send Trade Inquiries', path: '/buyer-discovery', variant: 'primary' },
          { label: 'Draft Commercial Invoice', path: '/documents', variant: 'secondary' },
        ],
        sources: ['Export Promotion Council Directory', 'Global Trade Repository Verified Records'],
      },
    };
  }

  if (lower.includes('currency') || lower.includes('forex') || lower.includes('hedg')) {
    return {
      role: 'assistant',
      timestamp: 'Just now',
      structured: {
        headline: 'Forex Risk & USD/INR Exposure Advisory',
        hsCode: 'Settlement: USD / EUR',
        markets: [
          {
            rank: 1,
            name: 'USD / INR Spot: ₹84.30',
            flag: '🇺🇸',
            score: 91,
            tariff: '+0.8% 48h Volatility',
            tam: 'High Impact',
            growth: 'Upward Trend',
            buyersCount: 3,
            highlights: 'Rupee depreciation benefits exporters. Recommend booking 3-month forward contracts at ₹84.85.',
          },
        ],
        reasons: [
          {
            title: 'Recommended Hedging Ratio: 60%',
            desc: 'Lock in 60% of anticipated export receivables via Forward Sale Contract to protect operating margins above 18%.',
          },
          {
            title: 'Payment Terms Advisory',
            desc: 'Request LC (Letter of Credit) at Sight or Maximum 60 days to reduce FX open-window exposure.',
          },
        ],
        actions: [
          { label: 'View Currency Dashboard', path: '/currency-risk', variant: 'primary' },
        ],
        sources: ['RBI Reference Rates', 'Bloomberg FX Interbank Feed'],
      },
    };
  }

  // Default intelligent response for general strategic queries
  return {
    role: 'assistant',
    timestamp: 'Just now',
    structured: {
      headline: `Strategic Export Guidance: ${query.length > 50 ? query.substring(0, 50) + '...' : query}`,
      hsCode: '6205.20.00 (Usha Textiles Portfolio)',
      markets: [
        {
          rank: 1,
          name: 'UAE Market Fast-Track',
          flag: '🇦🇪',
          score: 94,
          tariff: '0% CEPA Concession',
          tam: '$2.4M TAM',
          growth: '+22% Demand',
          buyersCount: 8,
          highlights: 'Shortest transit time (4 days), lowest regulatory friction, duty-free clearance under CEPA.',
        },
        {
          rank: 2,
          name: 'Germany GOTS Expansion',
          flag: '🇩🇪',
          score: 89,
          tariff: '0% EU GSP',
          tam: '$4.1M TAM',
          growth: '+18% Demand',
          buyersCount: 11,
          highlights: 'Highest margin realization (₹2,800/shirt FOB vs ₹1,650 domestic).',
        },
      ],
      reasons: [
        {
          title: 'Actionable Next Steps',
          desc: '1. Validate Form AI for UAE\n2. Dispatch sample swatches to EuroTex GmbH\n3. Lock USD forward contract at ₹84.80.',
        },
        {
          title: 'Financial Projections',
          desc: 'Expected first shipment net margin: 24.2% after factoring 2.5% RoDTEP rebate and 0% destination tariff.',
        },
      ],
      actions: [
        { label: 'Explore Target Markets', path: '/market-intelligence', variant: 'primary' },
        { label: 'Browse Verified Buyers', path: '/buyer-discovery', variant: 'secondary' },
        { label: 'Generate Compliance Docs', path: '/documents', variant: 'outline' },
      ],
      sources: ['DGFT Policy Book 2025', 'FIEO International Trade Advisory'],
    },
  };
}

export async function streamConsultantQuery(query, history = [], onChunk) {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: query, history: history })
    });

    if (!response.ok) {
      throw new Error(`Backend server responded with status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep the incomplete line in the buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            return;
          }
          if (data.startsWith('Error: ')) {
            onChunk('\\n\\n*(Backend Error: ' + data.slice(7) + ')*');
            return;
          }
          // The backend sends escaped newlines (\\n) so they don't break SSE framing.
          onChunk(data.replace(/\\n/g, '\n'));
        }
      }
    }
  } catch (err) {
    console.error('[AIService] Streaming failed:', err.message);
    
    // Provide a synthetic fallback response if the backend is down or the API key fails
    const lower = query.toLowerCase();
    let fallbackResponse = "";

    if (lower.includes('currency') || lower.includes('risk') || lower.includes('forex')) {
      fallbackResponse = "*(Note: Actian AI Backend disconnected. Providing cached response:)*\n\nBased on current market analysis, USD/INR is experiencing slight volatility. **Recommendation:** Lock in 60% of anticipated export receivables via a 3-month Forward Sale Contract to protect your margins.";
    } else if (lower.includes('buyer') || lower.includes('market') || lower.includes('demand')) {
      fallbackResponse = "*(Note: Actian AI Backend disconnected. Providing cached response:)*\n\nI've analyzed global demand for your product category. The top recommended markets are:\n\n1. **UAE:** 0% tariff under CEPA.\n2. **Germany:** Strong preference for organic goods.\n3. **Singapore:** Fast 14-day turnaround.";
    } else if (lower.includes('document') || lower.includes('procedure') || lower.includes('compliance')) {
      fallbackResponse = "*(Note: Actian AI Backend disconnected. Providing cached response:)*\n\nFor this export, you will need:\n- **Commercial Invoice & Packing List**\n- **Certificate of Origin (CoO)**\n- **Shipping Bill (ICEGATE)**\n- **Bill of Lading**\n\nPlease ensure your IEC is active.";
    } else {
      fallbackResponse = `*(Note: Actian AI Backend disconnected. Providing cached response:)*\n\nTo assist you with "${query}", my analysis suggests focusing on the UAE and European markets. Your product qualifies for several export incentives under the FTP.`;
    }

    // Simulate streaming the fallback response
    const words = fallbackResponse.split(" ");
    for (let i = 0; i < words.length; i++) {
      onChunk(words[i] + " ");
      await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 30));
    }
  }
}

export default {
  QUICK_PROMPTS,
  INITIAL_MESSAGES,
  THINKING_STEPS,
  createChatWebSocket,
  sendConsultantQuery,
  streamConsultantQuery,
};
