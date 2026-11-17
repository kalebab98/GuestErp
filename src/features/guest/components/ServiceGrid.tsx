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
  Clock,
} from 'lucide-react';

interface ServiceGridProps {
  categories: Category[];
  onSelectCategory: (category: Category) => void;
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

export const ServiceGrid: React.FC<ServiceGridProps> = ({ categories, onSelectCategory }) => {
  return (
    <div className="space-y-4 text-left">
      {/* Section Header */}
      <div className="flex items-end justify-between px-1">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#9C7A4E] font-semibold">
            In-Residence Services
          </span>
          <h2 className="font-serif text-xl font-bold text-slate-900 tracking-tight">
            How May We Assist You?
          </h2>
        </div>
        <span className="text-xs text-slate-400 font-sans hidden sm:inline-block">
          Tap any service for tailored options
        </span>
      </div>

      {/* Grid of Luxury Service Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {categories.map(cat => {
          const IconComponent = iconMap[cat.iconName] || HelpCircle;

          // Theme styling per category
          const themes: Record<
            string,
            {
              borderHover: string;
              iconBg: string;
              iconColor: string;
              accentTag: string;
              previewItems: string[];
            }
          > = {
            maintenance: {
              borderHover: 'hover:border-[#C5A880]/60 hover:bg-[#FDFBF7]',
              iconBg: 'bg-[#9C7A4E]/15 text-[#9C7A4E]',
              iconColor: 'text-[#9C7A4E]',
              accentTag: 'Engineering',
              previewItems: ['Air Conditioning', 'Plumbing', 'Power & Light', 'Appliances'],
            },
            housekeeping: {
              borderHover: 'hover:border-teal-500/50 hover:bg-[#F0F9F8]',
              iconBg: 'bg-teal-700/10 text-teal-800',
              iconColor: 'text-teal-800',
              accentTag: 'Housekeeping',
              previewItems: ['Plush Towels', 'Pillow Menu', 'Toiletries', 'Room Refresh'],
            },
            comfort: {
              borderHover: 'hover:border-indigo-500/50 hover:bg-indigo-50/20',
              iconBg: 'bg-indigo-900/10 text-indigo-800',
              iconColor: 'text-indigo-800',
              accentTag: 'Wellness & Sleep',
              previewItems: ['Memory Pillow', 'Dyson Fan', 'Iron & Board', 'Air Purifier'],
            },
            internet_tech: {
              borderHover: 'hover:border-sky-500/50 hover:bg-sky-50/20',
              iconBg: 'bg-sky-800/10 text-sky-800',
              iconColor: 'text-sky-800',
              accentTag: 'Technology',
              previewItems: ['Wi-Fi 500Mbps', 'AirPlay & TV', 'HDMI Cables', 'Adapters'],
            },
            guest_services: {
              borderHover: 'hover:border-[#C5A880]/60 hover:bg-[#FDFBF7]',
              iconBg: 'bg-[#C5A880]/20 text-[#85653A]',
              iconColor: 'text-[#85653A]',
              accentTag: 'Concierge',
              previewItems: ['Late Checkout', 'Luggage Assistance', 'Extra Keys', 'Chauffeur'],
            },
            noise: {
              borderHover: 'hover:border-rose-400/60 hover:bg-rose-50/20',
              iconBg: 'bg-rose-600/10 text-rose-700',
              iconColor: 'text-rose-700',
              accentTag: '15-Min Response',
              previewItems: ['Neighbor Volume', 'Corridor Noise', 'Discreet Check'],
            },
            other: {
              borderHover: 'hover:border-slate-400/60 hover:bg-slate-50',
              iconBg: 'bg-slate-700/10 text-slate-800',
              iconColor: 'text-slate-800',
              accentTag: 'Front Desk',
              previewItems: ['Itemized Folio', 'Celebration Setup', 'Custom Inquiries'],
            },
          };

          const theme = themes[cat.code] || themes.other;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4.5 text-left shadow-2xs transition-all active:scale-[0.98] ${theme.borderHover}`}
            >
              {/* Top Row: Icon + Department Tag + SLA */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${theme.iconBg}`}
                  >
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {theme.accentTag}
                    </span>
                    <h3 className="font-serif font-bold text-base text-slate-900 group-hover:text-teal-950 transition-colors leading-tight">
                      {cat.name}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-1 rounded-full bg-slate-100/90 px-2 py-0.5 text-[10px] font-semibold text-slate-600 shrink-0">
                  <Clock className="h-2.5 w-2.5 text-slate-400" />
                  <span>~{cat.slaMinutes}m</span>
                </div>
              </div>

              {/* Tagline / Description */}
              <p className="text-xs text-slate-500 font-sans mt-2.5 mb-3 leading-relaxed line-clamp-2">
                {cat.tagline || cat.description}
              </p>

              {/* Preview Item Chips */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                {theme.previewItems.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-block rounded-md bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200/60"
                  >
                    {item}
                  </span>
                ))}
              </div>

              {/* Action Prompt */}
              <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-50 text-[11px] font-semibold text-teal-800">
                <span>Request Options & Presets</span>
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
