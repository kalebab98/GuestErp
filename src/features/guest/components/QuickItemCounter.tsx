import React from 'react';
import { Plus, Minus } from 'lucide-react';

interface QuickItemCounterProps {
  name: string;
  unit?: string;
  quantity: number;
  maxQty?: number;
  onChange: (qty: number) => void;
}

export const QuickItemCounter: React.FC<QuickItemCounterProps> = ({
  name,
  unit = 'items',
  quantity,
  maxQty = 10,
  onChange,
}) => {
  const handleDec = (e: React.MouseEvent) => {
    e.preventDefault();
    if (quantity > 0) onChange(quantity - 1);
  };

  const handleInc = (e: React.MouseEvent) => {
    e.preventDefault();
    if (quantity < maxQty) onChange(quantity + 1);
  };

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all text-left">
      <div className="flex-1 pr-2">
        <p className="text-xs font-semibold text-slate-800">{name}</p>
        <p className="text-[10px] text-slate-400 capitalize">{unit}</p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleDec}
          disabled={quantity <= 0}
          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all"
        >
          <Minus className="h-3 w-3" />
        </button>

        <span className="w-5 text-center font-mono font-bold text-xs text-slate-900">
          {quantity}
        </span>

        <button
          type="button"
          onClick={handleInc}
          disabled={quantity >= maxQty}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-800 text-white hover:bg-teal-900 disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition-all shadow-2xs"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};
