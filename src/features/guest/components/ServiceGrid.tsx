import React from 'react';
import { Category } from '@/types/guestcare';
import {
  Wrench,
  Sparkles,
  Shirt,
  ShoppingBag,
  BedDouble,
  Wifi,
  Bell,
  HelpCircle,
  LucideIcon,
  ArrowUpRight,
} from 'lucide-react';

interface ServiceGridProps {
  categories: Category[];
  onSelectCategory: (category: Category) => void;
  showAll?: boolean;
  onToggleShowAll?: () => void;
}

const iconMap: Record<string, LucideIcon> = {
  Wrench,
  Sparkles,
  Shirt,
  ShoppingBag,
  BedDouble,
  Wifi,
  Bell,
  HelpCircle,
};

// Restrained, desaturated Apple-style icon well tints for instant visual scanning
const categoryAccents: Record<string, { well: string; hoverWell: string }> = {
  maintenance: {
    well: 'bg-amber-50/90 text-amber-700 ring-amber-600/[0.12]',
    hoverWell: 'group-hover:bg-amber-600 group-hover:text-white group-hover:ring-amber-600',
  },
  housekeeping: {
    well: 'bg-emerald-50/90 text-emerald-700 ring-emerald-600/[0.12]',
    hoverWell: 'group-hover:bg-[#0F4C40] group-hover:text-white group-hover:ring-[#0F4C40]',
  },
  laundry: {
    well: 'bg-sky-50/90 text-sky-700 ring-sky-600/[0.12]',
    hoverWell: 'group-hover:bg-sky-600 group-hover:text-white group-hover:ring-sky-600',
  },
  shop_delivery: {
    well: 'bg-rose-50/90 text-rose-700 ring-rose-600/[0.12]',
    hoverWell: 'group-hover:bg-rose-600 group-hover:text-white group-hover:ring-rose-600',
  },
  comfort: {
    well: 'bg-teal-50/90 text-teal-700 ring-teal-600/[0.12]',
    hoverWell: 'group-hover:bg-[#0F4C40] group-hover:text-white group-hover:ring-[#0F4C40]',
  },
  internet_tech: {
    well: 'bg-indigo-50/90 text-indigo-700 ring-indigo-600/[0.12]',
    hoverWell: 'group-hover:bg-indigo-600 group-hover:text-white group-hover:ring-indigo-600',
  },
  guest_services: {
    well: 'bg-[#ECF5F2] text-[#0F4C40] ring-[#0F4C40]/[0.12]',
    hoverWell: 'group-hover:bg-[#0F4C40] group-hover:text-white group-hover:ring-[#0F4C40]',
  },
  other: {
    well: 'bg-slate-100/90 text-slate-700 ring-slate-900/[0.08]',
    hoverWell: 'group-hover:bg-slate-900 group-hover:text-white group-hover:ring-slate-900',
  },
};

export const ServiceGrid: React.FC<ServiceGridProps> = ({
  categories,
  onSelectCategory,
  showAll = true,
  onToggleShowAll,
}) => {
  const displayedCategories = showAll ? categories : categories.slice(0, 6);

  return (
    <section className="space-y-3.5 text-left">
      <div className="flex items-end justify-between px-0.5">
        <div>
          <h2 className="text-[16px] sm:text-[18px] font-semibold text-slate-900 tracking-[-0.025em]">
            How can we help?
          </h2>
          <p className="text-[11.5px] sm:text-xs text-slate-500 mt-0.5">
            Select a category for direct dispatch to your apartment
          </p>
        </div>

        {onToggleShowAll && categories.length > 6 && (
          <button
            type="button"
            onClick={onToggleShowAll}
            className="text-xs font-semibold text-[#0F4C40] hover:text-[#0B3B31] transition-colors"
          >
            {showAll ? 'Show less' : `All (${categories.length})`}
          </button>
        )}
      </div>

      {/* Tactile Apple Home / Linear Tile Grid: 2 cols mobile, 4 cols desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {displayedCategories.map(cat => {
          const IconComponent = iconMap[cat.iconName] || HelpCircle;
          const displayLabel = cat.shortName || cat.name;
          const accent = categoryAccents[cat.code] || categoryAccents.other;
          const shortDesc = cat.tagline || cat.description;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className="porcelain-card group relative flex h-full flex-col justify-between gap-3 rounded-2xl border border-slate-200/75 hover:border-[#0F4C40]/30 p-3.5 sm:p-4 text-left hover:-translate-y-0.5 active:scale-[0.98]"
            >
              {/* Top Row: Tinted Icon Well + Subtle ETA Pill */}
              <div className="flex items-start justify-between gap-2 w-full">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 transition-all duration-200 ${accent.well} ${accent.hoverWell}`}
                >
                  <IconComponent className="h-[19px] w-[19px] stroke-[1.65]" />
                </div>

                <div className="flex items-center gap-1">
                  <span className="rounded-full bg-[#F6F8FA] ring-1 ring-slate-900/[0.05] px-2 py-0.5 text-[10px] font-mono tabular-nums font-medium text-slate-500">
                    ~{cat.slaMinutes}m
                  </span>
                </div>
              </div>

              {/* Bottom Row: Title + Helpful 1-Line Hint + Hover Arrow */}
              <div className="space-y-1 min-w-0 w-full">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[13.5px] sm:text-[14.5px] font-semibold tracking-[-0.015em] text-slate-900 group-hover:text-[#0F4C40] transition-colors truncate">
                    {displayLabel}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-slate-300 group-hover:text-[#0F4C40] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                </div>
                <p className="text-[11px] sm:text-[11.5px] text-slate-500 leading-snug line-clamp-1">
                  {shortDesc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
