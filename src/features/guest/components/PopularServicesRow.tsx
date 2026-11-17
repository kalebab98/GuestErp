import React from 'react';
import { Clock, ChevronRight } from 'lucide-react';

export interface PopularServiceItem {
  id: string;
  title: string;
  subtitle: string;
  eta: string;
  categoryCode: string;
  presetText: string;
  imageUrl: string;
}

export const POPULAR_SERVICES: PopularServiceItem[] = [
  {
    id: 'pop-towels',
    title: 'Fresh Towels & Linens',
    subtitle: 'Housekeeping',
    eta: '~20 min',
    categoryCode: 'housekeeping',
    presetText: 'Fresh bath towel replacement',
    imageUrl: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'pop-clean',
    title: 'Apartment Refresh',
    subtitle: 'Housekeeping',
    eta: '~30 min',
    categoryCode: 'housekeeping',
    presetText: 'Full room refresh & bed makeup',
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'pop-ac',
    title: 'AC & Climate Support',
    subtitle: 'Maintenance',
    eta: '~30 min',
    categoryCode: 'maintenance',
    presetText: 'AC blowing room temperature air',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'pop-checkout',
    title: 'Late Checkout',
    subtitle: 'Concierge',
    eta: 'Instant review',
    categoryCode: 'guest_services',
    presetText: 'Request late checkout extension',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
  },
];

interface PopularServicesRowProps {
  onSelectPopular: (item: PopularServiceItem) => void;
}

export const PopularServicesRow: React.FC<PopularServicesRowProps> = ({ onSelectPopular }) => {
  return (
    <section className="space-y-4 text-left">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Popular Requests
        </h2>
        <span className="text-xs text-slate-400">One-tap dispatch</span>
      </div>

      {/* Responsive Grid: 2 cols mobile, 4 cols tablet/PC */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {POPULAR_SERVICES.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectPopular(item)}
            className="group flex flex-col overflow-hidden rounded-2xl bg-white border border-slate-200/70 shadow-2xs hover:shadow-md hover:border-[#11574A]/30 transition-all duration-200 text-left active:scale-[0.98]"
          >
            <div className="relative h-28 sm:h-36 w-full overflow-hidden bg-slate-100">
              <img
                src={item.imageUrl}
                alt={item.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-semibold text-slate-800 shadow-2xs">
                <Clock className="h-2.5 w-2.5 text-[#11574A]" />
                <span>{item.eta}</span>
              </div>
            </div>

            <div className="p-3 sm:p-3.5 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-slate-900 truncate group-hover:text-[#11574A] transition-colors">
                  {item.title}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.subtitle}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-[#11574A] transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
