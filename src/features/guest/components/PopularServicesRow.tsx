import React from 'react';
import { Clock, ArrowUpRight } from 'lucide-react';
import { PopularServiceConfig } from '@/features/config/portalConfigService';

export type PopularServiceItem = PopularServiceConfig;

interface PopularServicesRowProps {
  items: PopularServiceItem[];
  onSelectPopular: (item: PopularServiceItem) => void;
}

export const PopularServicesRow: React.FC<PopularServicesRowProps> = ({ items, onSelectPopular }) => {
  if (!items || items.length === 0) return null;

  return (
    <section className="space-y-3.5 text-left">
      <div className="flex items-end justify-between px-0.5">
        <div>
          <h2 className="text-[15px] sm:text-[17px] font-semibold text-slate-900 tracking-[-0.02em]">
            Popular Requests
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            One-tap shortcuts for the most requested services
          </p>
        </div>
        <span className="hidden sm:inline-block text-[11px] font-medium text-slate-400">
          Instant dispatch
        </span>
      </div>

      {/* Double-Bezel Editorial Photo Cards: 2 cols mobile, 4 cols desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {items.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectPopular(item)}
            className="porcelain-card group flex flex-col overflow-hidden rounded-2xl border border-slate-200/75 hover:border-[#0F4C40]/30 p-1.5 text-left hover:-translate-y-0.5 active:scale-[0.985]"
          >
            {/* Concentric Inner Photo Core */}
            <div className="relative h-24 sm:h-32 w-full overflow-hidden rounded-[11px] bg-slate-100">
              <img
                src={item.imageUrl}
                alt={item.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-slate-950/10 pointer-events-none" />

              {/* Frosted Glass ETA Pill (Readable on any image) */}
              <div className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-slate-950/60 backdrop-blur-md ring-1 ring-white/15 px-2 py-0.5 text-[10px] font-medium text-white tabular-nums">
                <Clock className="h-2.5 w-2.5 text-teal-300" />
                <span>{item.eta}</span>
              </div>
            </div>

            <div className="px-2 pt-2.5 pb-1.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[12.5px] sm:text-[13.5px] font-semibold tracking-[-0.01em] text-slate-900 truncate group-hover:text-[#0F4C40] transition-colors">
                  {item.title}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.subtitle}</p>
              </div>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100/80 text-slate-400 group-hover:bg-[#0F4C40] group-hover:text-white transition-all duration-200">
                <ArrowUpRight className="h-3.5 w-3.5 stroke-[1.75]" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
