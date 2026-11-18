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
          <h2 className="text-[16px] sm:text-[18px] font-semibold text-slate-900 tracking-[-0.025em]">
            Popular Requests
          </h2>
          <p className="text-[11.5px] sm:text-xs text-slate-500 mt-0.5">
            One-tap shortcuts guests order most
          </p>
        </div>
        <span className="lg:hidden text-[11px] font-medium text-slate-400">
          Swipe &rarr;
        </span>
        <span className="hidden lg:inline-block text-[11px] font-medium text-slate-400">
          Instant dispatch
        </span>
      </div>

      {/* Mobile: Native Horizontal Snap-Carousel | Desktop: Clean 4-Column Grid */}
      <div className="no-scrollbar flex lg:grid lg:grid-cols-4 gap-3 overflow-x-auto snap-x snap-mandatory scroll-pl-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:scroll-pl-0 pb-1">
        {items.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectPopular(item)}
            className="group relative w-[68vw] max-w-[250px] lg:w-auto lg:max-w-none shrink-0 snap-start overflow-hidden rounded-[1.35rem] bg-slate-900 p-1 ring-1 ring-slate-900/[0.08] shadow-[0_10px_28px_-14px_rgba(15,23,42,0.32)] hover:shadow-[0_18px_36px_-14px_rgba(15,76,64,0.35)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 text-left"
          >
            <div className="relative h-40 sm:h-44 w-full overflow-hidden rounded-[1.05rem] bg-slate-800">
              <img
                src={item.imageUrl}
                alt={item.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
              />
              {/* Editorial Bottom Glass Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-slate-950/15" />

              {/* Top Row: Glass ETA Badge + Action Orb */}
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/55 backdrop-blur-md ring-1 ring-white/15 px-2.5 py-0.5 text-[10px] font-medium text-white tabular-nums">
                  <Clock className="h-2.5 w-2.5 text-teal-300" />
                  <span>{item.eta}</span>
                </span>

                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-sm group-hover:bg-[#0F4C40] group-hover:text-white transition-all duration-200">
                  <ArrowUpRight className="h-3.5 w-3.5 stroke-[2]" />
                </span>
              </div>

              {/* Bottom Overlay Typography */}
              <div className="absolute bottom-3 left-3 right-3 space-y-0.5">
                <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-teal-200/90">
                  {item.subtitle}
                </span>
                <p className="text-[14px] sm:text-[15px] font-semibold tracking-[-0.015em] text-white leading-snug">
                  {item.title}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
