/**
 * ============================================================
 * ExportEase AI — Currency Risk Intelligence Service
 * Connects Frontend UI to /api/v1/risks & forex telemetry
 * ============================================================
 */

import apiClient from './apiClient';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const CURRENCY_CARDS_DATA = [
  {
    id: 'usd-inr',
    pair: 'USD / INR',
    name: 'US Dollar / Indian Rupee',
    symbol: '$',
    flag: '🇺🇸',
    rate: 84.30,
    change24h: +0.82,
    trend7d: +1.45,
    trend30d: +2.10,
    riskLevel: 'Moderate',
    riskColor: 'amber',
    openExposure: '$84,000',
    invoiceCount: 2,
    sparkline: [83.4, 83.6, 83.5, 83.9, 84.1, 84.0, 84.3],
  },
  {
    id: 'eur-inr',
    pair: 'EUR / INR',
    name: 'Euro / Indian Rupee',
    symbol: '€',
    flag: '🇪🇺',
    rate: 92.40,
    change24h: -0.42,
    trend7d: +0.85,
    trend30d: +1.80,
    riskLevel: 'Moderate',
    riskColor: 'amber',
    openExposure: '€61,600',
    invoiceCount: 1,
    sparkline: [91.2, 91.8, 92.1, 92.0, 92.5, 92.6, 92.4],
  },
  {
    id: 'aed-inr',
    pair: 'AED / INR',
    name: 'UAE Dirham / Indian Rupee',
    symbol: 'د.إ',
    flag: '🇦🇪',
    rate: 22.95,
    change24h: +0.12,
    trend7d: +0.32,
    trend30d: +0.65,
    riskLevel: 'Low',
    riskColor: 'emerald',
    openExposure: 'AED 308,000',
    invoiceCount: 1,
    sparkline: [22.8, 22.85, 22.88, 22.9, 22.92, 22.94, 22.95],
  },
  {
    id: 'gbp-inr',
    pair: 'GBP / INR',
    name: 'British Pound / Indian Rupee',
    symbol: '£',
    flag: '🇬🇧',
    rate: 107.50,
    change24h: -0.65,
    trend7d: -1.20,
    trend30d: +0.90,
    riskLevel: 'Moderate',
    riskColor: 'amber',
    openExposure: '£48,600',
    invoiceCount: 1,
    sparkline: [108.2, 108.5, 107.9, 108.1, 107.8, 107.9, 107.5],
  },
];

export const CURRENCY_RISK_SCORE = {
  overall: 72,
  level: 'Moderate Risk',
  color: 'amber',
  breakdown: [
    { name: 'Forex Volatility', score: 68, status: 'moderate', desc: 'USD/INR 30-day annualized volatility at 4.2%' },
    { name: 'Receivable Exposure', score: 74, status: 'moderate', desc: '$178K total unhedged overseas open invoices' },
    { name: 'Currency Trend', score: 78, status: 'low', desc: 'INR depreciation buffer protects gross export margins' },
    { name: 'Transaction Settlement Risk', score: 65, status: 'moderate', desc: 'Average payment window 60 days on LC terms' },
  ],
};

export const CURRENCY_AI_RECOMMENDATION = {
  headline: 'Your EUR & USD exposure currently represents moderate currency risk. Consider reviewing payment timing and hedging options.',
  reasons: [
    'USD/INR moved +0.82% over the last 48 hours. Locking a 60-day Forward Sale Contract at ₹84.85 locks in a +₹46,200 foreign exchange premium on your UAE consignment.',
    'EUR/INR has exhibited bilateral swing of ±1.8% in 30 days due to ECB rate commentary. A Plain Vanilla Forward or Range Forward collar is recommended.',
    'AED is pegged to USD (3.6725), meaning your UAE export proceeds carry identical risk characteristics to USD receivables.',
  ],
  hedgingAction: 'Book 60% Forward Cover on $84,000 UAE Invoice #EXP-2026-0842 maturing October 2026.',
};

export const CURRENCY_HISTORICAL_SERIES = {
  '7D': [
    { date: 'Aug 19', usdInr: 83.8, eurInr: 91.8, gbpInr: 108.2, aedInr: 22.82 },
    { date: 'Aug 20', usdInr: 83.9, eurInr: 92.0, gbpInr: 108.4, aedInr: 22.85 },
    { date: 'Aug 21', usdInr: 84.0, eurInr: 92.2, gbpInr: 108.0, aedInr: 22.88 },
    { date: 'Aug 22', usdInr: 84.1, eurInr: 92.5, gbpInr: 108.1, aedInr: 22.90 },
    { date: 'Aug 23', usdInr: 84.15, eurInr: 92.6, gbpInr: 107.8, aedInr: 22.92 },
    { date: 'Aug 24', usdInr: 84.22, eurInr: 92.5, gbpInr: 107.9, aedInr: 22.94 },
    { date: 'Aug 25', usdInr: 84.30, eurInr: 92.4, gbpInr: 107.5, aedInr: 22.95 },
  ],
  '30D': [
    { date: 'Jul 28', usdInr: 83.2, eurInr: 90.6, gbpInr: 106.8, aedInr: 22.65 },
    { date: 'Aug 04', usdInr: 83.5, eurInr: 91.2, gbpInr: 107.4, aedInr: 22.75 },
    { date: 'Aug 11', usdInr: 83.8, eurInr: 91.9, gbpInr: 108.1, aedInr: 22.82 },
    { date: 'Aug 18', usdInr: 84.1, eurInr: 92.5, gbpInr: 107.9, aedInr: 22.91 },
    { date: 'Aug 25', usdInr: 84.3, eurInr: 92.4, gbpInr: 107.5, aedInr: 22.95 },
  ],
  '90D': [
    { date: 'Jun 01', usdInr: 82.8, eurInr: 89.8, gbpInr: 105.4, aedInr: 22.54 },
    { date: 'Jun 20', usdInr: 83.1, eurInr: 90.4, gbpInr: 106.2, aedInr: 22.62 },
    { date: 'Jul 10', usdInr: 83.4, eurInr: 91.0, gbpInr: 107.0, aedInr: 22.70 },
    { date: 'Jul 30', usdInr: 83.7, eurInr: 91.6, gbpInr: 107.6, aedInr: 22.80 },
    { date: 'Aug 15', usdInr: 84.0, eurInr: 92.2, gbpInr: 108.0, aedInr: 22.88 },
    { date: 'Aug 25', usdInr: 84.3, eurInr: 92.4, gbpInr: 107.5, aedInr: 22.95 },
  ],
  '1Y': [
    { date: 'Q3 25', usdInr: 82.2, eurInr: 88.5, gbpInr: 103.8, aedInr: 22.38 },
    { date: 'Q4 25', usdInr: 82.9, eurInr: 89.6, gbpInr: 105.1, aedInr: 22.57 },
    { date: 'Q1 26', usdInr: 83.5, eurInr: 91.0, gbpInr: 106.8, aedInr: 22.74 },
    { date: 'Q2 26', usdInr: 84.1, eurInr: 92.2, gbpInr: 107.9, aedInr: 22.90 },
    { date: 'Q3 26', usdInr: 84.3, eurInr: 92.4, gbpInr: 107.5, aedInr: 22.95 },
  ],
};

export const CURRENCY_ALERTS = [
  { id: 'alt-1', pair: 'USD / INR', severity: 'medium', message: 'INR moved +0.82% vs USD in 48h. Favorable for exporters; consider locking 60-day forward hedge.' },
  { id: 'alt-2', pair: 'EUR / INR', severity: 'high', message: 'ECB rate decision scheduled in 6 days. Expected EUR volatility band ±1.4%.' },
  { id: 'alt-3', pair: 'GBP / INR', severity: 'low', message: 'UK inflation cooling. Sterling stabilizing within ₹107.20 - ₹108.00 range.' },
];

export async function getCurrentRates() {
  await delay(200);
  return {
    usdInr: 84.30,
    eurInr: 92.40,
    aedInr: 22.95,
    gbpInr: 107.50,
  };
}

export async function getCurrencyHistory() {
  await delay(300);
  return CURRENCY_HISTORICAL_SERIES['90D'];
}

export async function getCurrencyAlerts() {
  await delay(200);
  return CURRENCY_ALERTS;
}

export default {
  CURRENCY_CARDS_DATA,
  CURRENCY_RISK_SCORE,
  CURRENCY_AI_RECOMMENDATION,
  CURRENCY_HISTORICAL_SERIES,
  CURRENCY_ALERTS,
  getCurrentRates,
  getCurrencyHistory,
  getCurrencyAlerts,
};
