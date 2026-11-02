import React, { useState } from 'react';
import { Tag, ShieldCheck } from 'lucide-react';
import { findHSCode } from '../../data/hsCodeDatabase';
import { formatHSCode } from '../../utils/validationRules';

export default function HSCodeChip({ code, showDetails = true, onClick }) {
  const [showPopover, setShowPopover] = useState(false);
  const formatted = formatHSCode(code);
  const data = findHSCode(code);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => onClick ? onClick(code) : setShowPopover(!showPopover)}
        onMouseEnter={() => setShowPopover(true)}
        onMouseLeave={() => setShowPopover(false)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all cursor-pointer"
      >
        <Tag size={12} className="text-blue-400" />
        <span>{formatted || code}</span>
      </button>

      {showPopover && showDetails && data && (
        <div className="absolute z-50 bottom-full left-0 mb-2 w-72 p-3 bg-slate-900 border border-slate-700 rounded-lg shadow-xl text-left pointer-events-none">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 pb-1 border-b border-slate-800">
            <span>Chapter {data.chapter}</span>
            <span className="text-emerald-400">MFN: {data.mfnDuty}%</span>
          </div>
          <p className="text-xs text-slate-200 mt-1 line-clamp-2">{data.title}</p>
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck size={11} /> 0% CEPA / ECTA
            </span>
            <span className="text-blue-400">RoDTEP: {data.rodtepRate}%</span>
          </div>
        </div>
      )}
    </div>
  );
}
