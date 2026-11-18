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
  ChevronRight,
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
          <h2 className="text-[15px] sm:text-[17px] font-semibold text-slate-900 tracking-[-0.02em]">
            Service Categories
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Tap a service for instant dispatch to your apartment
          </p>
        </div>

        {onToggleShowAll && categories.length > 6 && (
          <button
            type="button"
            onClick={onToggleShowAll}
            className="inline-flex items-center gap-0.5 text-xs font-medium text-[#0F4C40] hover:text-[#0B3B31] transition-colors"
          >
            <span>{showAll ? 'Show less' : 'View all'}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Porcelain Elevated Grid: 2 cols mobile, 3 cols tablet, 4 cols desktop */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {displayedCategories.map(cat => {
          const IconComponent = iconMap[cat.iconName] || HelpCircle;
          const displayLabel = cat.shortName || cat.name;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className="porcelain-card group flex items-center justify-between gap-2.5 rounded-2xl border border-slate-200/75 hover:border-[#0F4C40]/30 p-3 sm:p-3.5 text-left hover:-translate-y-0.5 active:scale-[0.985]"
            >
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-[#F2F7F5] ring-1 ring-[#0F4C40]/[0.08] text-[#0F4C40] group-hover:bg-[#0F4C40] group-hover:text-white group-hover:ring-[#0F4C40] transition-all duration-200">
                  <IconComponent className="h-[18px] w-[18px] stroke-[1.6]" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[12.5px] sm:text-[13.5px] font-semibold tracking-[-0.01em] text-slate-900 truncate">
                    {displayLabel}
                  </span>
                  <span className="block text-[10.5px] sm:text-[11px] font-mono tabular-nums text-slate-400 mt-0.5">
                    ~{cat.slaMinutes}m ETA
                  </span>
                </div>
              </div>

              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 group-hover:text-[#0F4C40] group-hover:translate-x-0.5 transition-all duration-200" />
            </button>
          );
        })}
      </div>
    </section>
  );
};
