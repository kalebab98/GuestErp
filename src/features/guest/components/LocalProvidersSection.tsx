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
    <section className="space-y-2.5 text-left">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          {sectionTitle}
        </h2>
        <span className="text-[11px] font-medium text-slate-400">
          {providers.length} contacts
        </span>
      </div>

      {/* ONE Compact, Sleek Summary Card with Slim Inline Details Pill */}
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
        className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-[#F6F8F8] hover:bg-white hover:border-[#11574A]/35 p-3.5 sm:p-5 transition-all duration-200 hover:shadow-md cursor-pointer active:scale-[0.995]"
      >
        <div className="flex items-start justify-between gap-3">
          {/* Left: Compact Icon + Title & Description */}
          <div className="flex items-start gap-3 min-w-0">
            <div className="grid grid-cols-2 gap-1 p-1.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs shrink-0 mt-0.5">
              <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md bg-amber-50 text-amber-600">
                <Car className="h-3 w-3" />
              </div>
              <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md bg-[#F0F7F5] text-[#11574A]">
                <Coffee className="h-3 w-3" />
              </div>
              <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md bg-rose-50 text-rose-600">
                <UtensilsCrossed className="h-3 w-3" />
              </div>
              <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md bg-sky-50 text-sky-600">
                <ShoppingBag className="h-3 w-3" />
              </div>
            </div>

            <div className="min-w-0 space-y-1">
              <h3 className="text-[13px] sm:text-base font-bold text-slate-900 group-hover:text-[#11574A] transition-colors leading-snug">
                {cardTitle}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed line-clamp-2 max-w-xl">
                {cardDesc}
              </p>
            </div>
          </div>

          {/* Right: Slim, Proportionate Details Pill (never bulky on mobile) */}
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              setMenuOpen(true);
            }}
            className="shrink-0 inline-flex items-center gap-1 rounded-full bg-[#11574A] hover:bg-[#0D443A] text-white h-8 sm:h-9 px-3 sm:px-4 text-[11px] sm:text-xs font-semibold shadow-2xs transition-all active:scale-95"
          >
            <span>Details</span>
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Compact Category Chips Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2.5 mt-2.5 border-t border-slate-200/60">
          {categories
            .filter(c => c !== 'All')
            .map(cat => (
              <span
                key={cat}
                className="shrink-0 rounded-full bg-white border border-slate-200/80 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-medium text-slate-600"
              >
                {cat}
              </span>
            ))}
        </div>
      </div>

      {/* Mobile-Optimized Categorized Quick Dial Modal */}
      <Modal
        isOpen={menuOpen}
        onClose={() => {
          setMenuOpen(false);
          setModalSearch('');
        }}
        title="Local Directory & Quick Dial"
        description="Tap any number to call directly, WhatsApp, or order via Front Desk"
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
                  className="w-full rounded-xl bg-[#F6F8F8] pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 border border-slate-200/70 focus:border-[#11574A]/40 focus:bg-white focus:outline-none"
                />
              </div>
            )}

            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              {categories.map(cat => {
                const active = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`shrink-0 rounded-full px-2.5 sm:px-3 py-1 text-[11px] font-semibold transition-all border ${
                      active
                        ? 'bg-[#11574A] text-white border-[#11574A] shadow-2xs'
                        : 'bg-[#F6F8F8] text-slate-600 border-slate-200/80 hover:bg-white hover:text-slate-900'
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
                          isRideCat ? 'bg-amber-100 text-amber-700' : 'bg-[#F0F7F5] text-[#11574A]'
                        }`}
                      >
                        <CatIcon className="h-3 w-3" />
                      </div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        {catName}
                      </h4>
                    </div>

                    {/* Sleek Contact Rows */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white divide-y divide-slate-100">
                      {list.map(provider => {
                        const whatsappLink = provider.whatsapp
                          ? `https://wa.me/${provider.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Hello ${provider.name}, I am staying in ${apartmentRef} and would like to order: `
                            )}`
                          : null;

                        return (
                          <div
                            key={provider.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3 py-2.5 sm:px-4 sm:py-3 hover:bg-[#FAFBFB] transition-colors"
                          >
                            {/* Contact Info */}
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center justify-between sm:justify-start gap-2">
                                <span className="text-[13px] sm:text-sm font-bold text-slate-900 truncate">
                                  {provider.name}
                                </span>
                                <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                                  <Clock className="h-2.5 w-2.5 text-[#11574A]" />
                                  {provider.hours}
                                </span>
                              </div>
                              <p className="text-[11px] sm:text-xs text-slate-500 leading-snug line-clamp-2">
                                {provider.description}
                              </p>
                            </div>

                            {/* Compact Mobile-Friendly Action Strip (Slim Buttons) */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <a
                                href={`tel:${provider.phone.replace(/\s+/g, '')}`}
                                className={`inline-flex items-center gap-1 rounded-lg h-7 sm:h-8 px-2.5 sm:px-3 text-[11px] sm:text-xs font-semibold transition-colors active:scale-95 ${
                                  isRideCat
                                    ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                    : 'bg-[#11574A] hover:bg-[#0D443A] text-white'
                                }`}
                              >
                                <Phone className="h-3 w-3 shrink-0" />
                                <span className="font-mono tracking-tight">{provider.phone}</span>
                              </a>

                              {whatsappLink && (
                                <a
                                  href={whatsappLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-[#25D366]/12 text-[#16A34A] hover:bg-[#25D366] hover:text-white border border-[#25D366]/25 transition-colors active:scale-95"
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
                                  className="inline-flex items-center h-7 sm:h-8 rounded-lg border border-slate-200 bg-white hover:border-[#11574A] hover:text-[#11574A] px-2.5 text-[11px] sm:text-xs font-semibold text-slate-700 transition-colors active:scale-95"
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
