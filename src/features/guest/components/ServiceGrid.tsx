import React from 'react';
import { Category } from '@/types/guestcare';
import {
  Wrench,
  Sparkles,
  BedDouble,
  Wifi,
  Bell,
  VolumeX,
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
  BedDouble,
  Wifi,
  Bell,
  VolumeX,
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
    <section className="space-y-4 text-left">
      {/* Clean Section Header (inspired by AFTER layout) */}
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Service Categories
        </h2>
        {onToggleShowAll && categories.length > 6 && (
          <button
            type="button"
            onClick={onToggleShowAll}
            className="inline-flex items-center gap-0.5 text-xs sm:text-sm font-medium text-[#11574A] hover:text-[#0D443A] transition-colors"
          >
            <span>{showAll ? 'Show less' : 'View all'}</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Responsive Clean Category Grid: 2 cols mobile, 3 cols tablet, 4 cols PC */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {displayedCategories.map(cat => {
          const IconComponent = iconMap[cat.iconName] || HelpCircle;
          const displayLabel = cat.shortName || cat.name;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className="group flex items-center justify-between gap-2.5 rounded-2xl bg-[#F6F8F8] hover:bg-white border border-slate-200/60 hover:border-[#11574A]/30 p-3 sm:p-4 text-left transition-all duration-200 hover:shadow-md active:scale-[0.98]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#11574A] shadow-2xs border border-slate-100 group-hover:bg-[#11574A] group-hover:text-white transition-colors duration-200">
                  <IconComponent className="h-5 w-5 stroke-[1.75]" />
                </div>
                <div className="min-w-0">
                  <span className="block text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-slate-950 truncate">
                    {displayLabel}
                  </span>
                  <span className="hidden sm:block text-[11px] text-slate-400 truncate mt-0.5">
                    ~{cat.slaMinutes} min
                  </span>
                </div>
              </div>

              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-[#11574A] group-hover:translate-x-0.5 transition-all" />
            </button>
          );
        })}
      </div>
    </section>
  );
};
