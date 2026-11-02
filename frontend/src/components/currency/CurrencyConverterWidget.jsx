import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightLeft, DollarSign, X, TrendingUp } from 'lucide-react';
import { useCurrencyRates } from '../../hooks/useCurrencyRates';

export default function CurrencyConverterWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('10000');
  const [currency, setCurrency] = useState('USD');
  const { rates, convertToINR, getForwardPremiumPercent } = useCurrencyRates();

  const inrValue = convertToINR(amount, currency);
  const forwardHedgePercent = getForwardPremiumPercent(currency, 30);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 p-3 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/25 hover:bg-blue-500 transition-all flex items-center justify-center hover:scale-105"
        title="Quick Forex Converter"
      >
        <ArrowRightLeft size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 left-6 z-50 w-80 p-4 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-white"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Forex Spot Converter</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 mt-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Foreign Amount</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:outline-hidden focus:border-blue-500"
                  />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2 text-xs font-bold text-blue-400"
                  >
                    {Object.keys(rates).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Indian Rupee Equivalent</span>
                <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                  ₹{inrValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Rate: 1 {currency} = ₹{rates[currency]}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-blue-950/40 p-2 rounded-md border border-blue-900/30">
                <TrendingUp size={12} className="text-blue-400 shrink-0" />
                <span>30-Day Forward Hedging Premium: <strong className="text-blue-300">+{forwardHedgePercent}% p.a.</strong></span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
