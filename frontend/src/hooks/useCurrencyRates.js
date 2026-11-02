import { useState, useCallback } from 'react';

const DEFAULT_RATES = {
  USD: 86.85,
  EUR: 92.40,
  GBP: 108.65,
  AED: 23.64,
  JPY: 0.58,
  CAD: 62.45
};

export function useCurrencyRates() {
  const [rates] = useState(DEFAULT_RATES);
  const [lastUpdated] = useState(new Date());

  const convertToINR = useCallback((amount, currency) => {
    const rate = rates[currency] || 1;
    return Number(amount) * rate;
  }, [rates]);

  const convertFromINR = useCallback((amountINR, targetCurrency) => {
    const rate = rates[targetCurrency] || 1;
    return Number(amountINR) / rate;
  }, [rates]);

  const getForwardPremiumPercent = useCallback((currency, days = 30) => {
    return Number(((2.8 * days) / 365).toFixed(2));
  }, []);

  return {
    rates,
    lastUpdated,
    convertToINR,
    convertFromINR,
    getForwardPremiumPercent
  };
}
