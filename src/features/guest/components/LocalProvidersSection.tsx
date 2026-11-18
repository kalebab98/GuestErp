import React, { useState, useMemo } from 'react';
import { LocalServiceProvider } from '@/types/guestcare';
import { PortalBrandingConfig } from '@/features/config/portalConfigService';
import { Modal } from '@/components/ui/Modal';
import {
  Phone,
  MessageCircle,
  Car,
  Coffee,
  UtensilsCrossed,
  ShoppingBag,
  Store,
  ChevronRight,
  Clock,
  Cross,
  Search,
} from 'lucide-react';

interface LocalProvidersSectionProps {
  providers: LocalServiceProvider[];
  apartmentRef: string;
  branding?: PortalBrandingConfig;
  onOrderViaDesk: (provider: LocalServiceProvider) => void;
}

function getProviderIcon(category: string, name = '') {
  const combined = `${category} ${name}`.toLowerCase();
  if (combined.includes('ride') || combined.includes('taxi') || combined.includes('feres')) {
    return Car;
  }
  if (combined.includes('medical') || combined.includes('pharm')) {
    return Cross;
  }
  if (combined.includes('coffee') || combined.includes('tea')) {
    return Coffee;
  }
  if (combined.includes('food') || combined.includes('meal') || combined.includes('restaurant')) {
    return UtensilsCrossed;
  }
  if (combined.includes('market') || combined.includes('shop') || combined.includes('card')) {
    return ShoppingBag;
  }
  return Store;
}

export const LocalProvidersSection: React.FC<LocalProvidersSectionProps> = ({
  providers,
  apartmentRef,
  branding,
  onOrderViaDesk,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [modalSearch, setModalSearch] = useState('');

  // Distinct categories dynamically derived from staff-configured providers
  const categories = useMemo(() => {
    const unique = Array.from(new Set(providers.map(p => p.category)));
    return ['All', ...unique];
  }, [providers]);

  // Providers grouped by category for the menu modal
  const groupedProviders = useMemo(() => {
    const q = modalSearch.trim().toLowerCase();
    const filtered = providers.filter(p => {
      const catMatch = selectedCategory === 'All' || p.category === selectedCategory;
      const searchMatch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q);
      return catMatch && searchMatch;
    });

    const groups: Record<string, LocalServiceProvider[]> = {};
    filtered.forEach(p => {
      if (!groups[p.category]) groups[p.category] = [];
      groups[p.category].push(p);
    });
    return groups;
  }, [providers, selectedCategory, modalSearch]);

  if (providers.length === 0) return null;

  const sectionTitle = branding?.directorySectionTitle || 'Local Shops, Food & Ride Numbers';
  const cardTitle = branding?.directoryCardTitle || 'Quick Dial — Ride, Food, Coffee & Shops';
  const cardDesc =
    branding?.directoryCardDescription ||
    'Direct dial numbers for Ethiopia rides (RIDE 8294, Feres 6090), ground floor medical store, mini-markets, coffee & meals.';

  return (
    <section className="space-y-3 text-left">
      <div className="flex items-end justify-between px-0.5">
        <div>
          <h2 className="text-[15px] sm:text-[17px] font-semibold text-slate-900 tracking-[-0.02em]">
            {sectionTitle}
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Direct call, WhatsApp, or front desk delivery
          </p>
        </div>
        <span className="text-[11px] font-mono tabular-nums text-slate-400">
          {providers.length} contacts
        </span>
      </div>

      {/* Double-Bezel Porcelain Directory Card */}
      <div className="bezel-shell rounded-[1.5rem] p-1.5">
        <div
          onClick={() => setMenuOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setMenuOpen(true);
            }
          }}
          className="bezel-core group relative overflow-hidden rounded-[1.15rem] border border-slate-200/60 hover:border-[#0F4C40]/30 p-3.5 sm:p-5 transition-all duration-200 cursor-pointer active:scale-[0.995]"
        >
          <div className="flex items-start justify-between gap-3">
            {/* Left: Machined 2x2 Icon Grid + Concise Info */}
            <div className="flex items-start gap-3 min-w-0">
              <div className="grid grid-cols-2 gap-1 p-1.5 rounded-xl bg-[#F6F8FA] ring-1 ring-slate-900/[0.05] shrink-0 mt-0.5">
                <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md bg-amber-50 text-amber-600">
                  <Car className="h-3 w-3 stroke-[1.75]" />
                </div>
                <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md bg-[#ECF5F2] text-[#0F4C40]">
                  <Coffee className="h-3 w-3 stroke-[1.75]" />
                </div>
                <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md bg-rose-50 text-rose-600">
                  <UtensilsCrossed className="h-3 w-3 stroke-[1.75]" />
                </div>
                <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md bg-sky-50 text-sky-600">
                  <ShoppingBag className="h-3 w-3 stroke-[1.75]" />
                </div>
              </div>

              <div className="min-w-0 space-y-1">
                <h3 className="text-[13px] sm:text-[15px] font-semibold tracking-[-0.015em] text-slate-900 group-hover:text-[#0F4C40] transition-colors leading-snug">
                  {cardTitle}
                </h3>
                <p className="text-[11.5px] sm:text-xs text-slate-500 leading-relaxed line-clamp-2 max-w-xl">
                  {cardDesc}
                </p>
              </div>
            </div>

            {/* Right: Slim Machined Details Pill */}
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                setMenuOpen(true);
              }}
              className="shrink-0 inline-flex items-center gap-1 rounded-full bg-[#0F4C40] hover:bg-[#0B3B31] text-white h-8 sm:h-9 px-3 sm:px-4 text-[11px] sm:text-xs font-semibold shadow-[0_2px_10px_-2px_rgba(15,76,64,0.4)] transition-all active:scale-95"
            >
              <span>Details</span>
              <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Slim Horizontal Scrollable Category Chips */}
          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pt-2.5 mt-3 border-t border-slate-100">
            {categories
              .filter(c => c !== 'All')
              .map(cat => (
                <span
                  key={cat}
                  className="shrink-0 rounded-full bg-[#F6F8FA] ring-1 ring-slate-900/[0.05] px-2.5 py-0.5 text-[10.5px] font-medium text-slate-600"
                >
                  {cat}
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Categorized Quick Dial Bottom-Sheet Modal */}
      <Modal
        isOpen={menuOpen}
        onClose={() => {
          setMenuOpen(false);
          setModalSearch('');
        }}
        title="Local Directory & Quick Dial"
        description="Tap any number to dial directly, message on WhatsApp, or order via Front Desk"
        size="lg"
      >
        <div className="space-y-3.5 text-left">
          {/* Quick Search + Category Filter Pills */}
          <div className="space-y-2.5">
            {providers.length > 4 && (
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search rides, pharmacy, coffee, food..."
                  value={modalSearch}
                  onChange={e => setModalSearch(e.target.value)}
                  className="w-full rounded-xl bg-[#F6F8FA] pl-8.5 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-900/[0.06] focus:ring-[#0F4C40]/40 focus:bg-white focus:outline-none transition-all"
                />
              </div>
            )}

            <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-0.5">
              {categories.map(cat => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`shrink-0 rounded-full px-2.5 sm:px-3 py-1 text-[11px] font-semibold transition-all ${
                      active
                        ? 'bg-[#0F4C40] text-white shadow-[0_2px_8px_-2px_rgba(15,76,64,0.4)]'
                        : 'bg-[#F6F8FA] text-slate-600 ring-1 ring-slate-900/[0.06] hover:bg-white hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grouped Directory List */}
          {Object.keys(groupedProviders).length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
              No matching contacts found.
            </div>
          ) : (
            <div className="space-y-4 pb-1">
              {Object.entries(groupedProviders).map(([catName, list]) => {
                const CatIcon = getProviderIcon(catName);
                const isRideCat =
                  catName.toLowerCase().includes('ride') || catName.toLowerCase().includes('taxi');

                return (
                  <div key={catName} className="space-y-2">
                    {/* Compact Category Header */}
                    <div className="flex items-center gap-1.5 px-0.5">
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-md ${
                          isRideCat ? 'bg-amber-100/80 text-amber-700' : 'bg-[#ECF5F2] text-[#0F4C40]'
                        }`}
                      >
                        <CatIcon className="h-3 w-3 stroke-[1.75]" />
                      </div>
                      <h4 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
                        {catName}
                      </h4>
                    </div>

                    {/* Sleek Hairline Contact Rows */}
                    <div className="overflow-hidden rounded-2xl ring-1 ring-slate-900/[0.06] bg-white divide-y divide-slate-100">
                      {list.map(provider => {
                        const whatsappLink = provider.whatsapp
                          ? `https://wa.me/${provider.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Hello ${provider.name}, I am staying in ${apartmentRef} and would like to order: `
                            )}`
                          : null;

                        return (
                          <div
                            key={provider.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3 py-2.5 sm:px-4 sm:py-3 hover:bg-[#F9FBFD] transition-colors"
                          >
                            {/* Contact Info */}
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center justify-between sm:justify-start gap-2">
                                <span className="text-[13px] sm:text-[13.5px] font-semibold tracking-[-0.01em] text-slate-900 truncate">
                                  {provider.name}
                                </span>
                                <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-[#F6F8FA] ring-1 ring-slate-900/[0.05] px-2 py-0.5 text-[10px] font-medium text-slate-500">
                                  <Clock className="h-2.5 w-2.5 text-[#0F4C40]" />
                                  {provider.hours}
                                </span>
                              </div>
                              <p className="text-[11px] sm:text-xs text-slate-500 leading-snug line-clamp-2">
                                {provider.description}
                              </p>
                            </div>

                            {/* Slim Proportionate Action Strip (Mobile-Friendly) */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <a
                                href={`tel:${provider.phone.replace(/\s+/g, '')}`}
                                className={`inline-flex items-center gap-1 rounded-lg h-7 sm:h-8 px-2.5 sm:px-3 text-[11px] sm:text-xs font-semibold transition-all active:scale-95 ${
                                  isRideCat
                                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                    : 'bg-[#0F4C40] hover:bg-[#0B3B31] text-white'
                                }`}
                              >
                                <Phone className="h-3 w-3 shrink-0" />
                                <span className="font-mono tabular-nums tracking-tight">
                                  {provider.phone}
                                </span>
                              </a>

                              {whatsappLink && (
                                <a
                                  href={whatsappLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-[#25D366]/10 text-[#15803D] hover:bg-[#25D366] hover:text-white ring-1 ring-[#25D366]/25 transition-all active:scale-95"
                                  title={`WhatsApp ${provider.name}`}
                                  aria-label={`WhatsApp ${provider.name}`}
                                >
                                  <MessageCircle className="h-3.5 w-3.5" />
                                </a>
                              )}

                              {!isRideCat && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMenuOpen(false);
                                    onOrderViaDesk(provider);
                                  }}
                                  className="inline-flex items-center h-7 sm:h-8 rounded-lg ring-1 ring-slate-200 bg-white hover:ring-[#0F4C40] hover:text-[#0F4C40] px-2.5 text-[11px] sm:text-xs font-semibold text-slate-700 transition-all active:scale-95"
                                >
                                  Order
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>
    </section>
  );
};
