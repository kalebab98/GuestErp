import React, { useState, useMemo } from 'react';
import { LocalServiceProvider } from '@/types/guestcare';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
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
} from 'lucide-react';

interface LocalProvidersSectionProps {
  providers: LocalServiceProvider[];
  apartmentRef: string;
  onOrderViaDesk: (provider: LocalServiceProvider) => void;
}

function getProviderIcon(category: string, name = '') {
  const combined = `${category} ${name}`.toLowerCase();
  if (combined.includes('ride') || combined.includes('taxi') || combined.includes('feres')) {
    return Car;
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
  onOrderViaDesk,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Distinct categories dynamically derived from staff-configured providers
  const categories = useMemo(() => {
    const unique = Array.from(new Set(providers.map(p => p.category)));
    return ['All', ...unique];
  }, [providers]);

  // Providers grouped by category for the menu modal
  const groupedProviders = useMemo(() => {
    const filtered =
      selectedCategory === 'All'
        ? providers
        : providers.filter(p => p.category === selectedCategory);

    const groups: Record<string, LocalServiceProvider[]> = {};
    filtered.forEach(p => {
      if (!groups[p.category]) groups[p.category] = [];
      groups[p.category].push(p);
    });
    return groups;
  }, [providers, selectedCategory]);

  if (providers.length === 0) return null;

  return (
    <section className="space-y-3 text-left">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Local Shops, Food & Ride Numbers
        </h2>
      </div>

      {/* ONE Clean Summary Card with a Details Button */}
      <div
        onClick={() => setMenuOpen(true)}
        className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-[#F6F8F8] hover:bg-white hover:border-[#11574A]/35 p-5 sm:p-6 transition-all duration-200 hover:shadow-md cursor-pointer"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Visual Icon Cluster + Clear Info */}
          <div className="flex items-start sm:items-center gap-4">
            <div className="grid grid-cols-2 gap-1.5 p-2 rounded-2xl bg-white border border-slate-200/70 shadow-2xs shrink-0">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Car className="h-3.5 w-3.5" />
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F0F7F5] text-[#11574A]">
                <Coffee className="h-3.5 w-3.5" />
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                <UtensilsCrossed className="h-3.5 w-3.5" />
              </div>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                <ShoppingBag className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#11574A] transition-colors">
                Quick Dial Directory — Ride, Food, Coffee & Shops
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                Direct dial numbers for Ethiopia rides (RIDE 8294, Feres 6090), nearby mini-markets for cards & essentials, fresh coffee, tea, and local food delivery.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {categories
                  .filter(c => c !== 'All')
                  .map(cat => (
                    <span
                      key={cat}
                      className="rounded-lg bg-white border border-slate-200/80 px-2.5 py-0.5 text-[11px] font-medium text-slate-600"
                    >
                      {cat}
                    </span>
                  ))}
              </div>
            </div>
          </div>

          {/* Right: Prominent Details Button */}
          <div className="shrink-0">
            <Button
              type="button"
              onClick={e => {
                e.stopPropagation();
                setMenuOpen(true);
              }}
              className="w-full sm:w-auto bg-[#11574A] hover:bg-[#0D443A] text-white rounded-xl px-5 py-2.5 text-xs sm:text-sm font-semibold gap-1.5 shadow-xs"
            >
              <span>Details</span>
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Categorized Menu Modal */}
      <Modal
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        title="Local Directory & Quick Dial Menu"
        description="Tap any number to call directly, or order through Front Desk"
        size="lg"
      >
        <div className="space-y-5 text-left">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map(cat => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all border ${
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

          {/* Grouped Menu by Category */}
          <div className="space-y-5">
            {Object.entries(groupedProviders).map(([catName, list]) => {
              const CatIcon = getProviderIcon(catName);
              const isRideCat =
                catName.toLowerCase().includes('ride') || catName.toLowerCase().includes('taxi');

              return (
                <div key={catName} className="space-y-2.5">
                  {/* Category Header */}
                  <div className="flex items-center gap-2 px-1">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-lg ${
                        isRideCat ? 'bg-amber-100 text-amber-700' : 'bg-[#F0F7F5] text-[#11574A]'
                      }`}
                    >
                      <CatIcon className="h-3.5 w-3.5" />
                    </div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {catName}
                    </h4>
                  </div>

                  {/* Items inside this Category */}
                  <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white divide-y divide-slate-100 shadow-2xs">
                    {list.map(provider => {
                      const whatsappLink = provider.whatsapp
                        ? `https://wa.me/${provider.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Hello ${provider.name}, I am staying in ${apartmentRef} and would like to order: `
                          )}`
                        : null;

                      return (
                        <div
                          key={provider.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 hover:bg-[#FAFBFB] transition-colors"
                        >
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-bold text-slate-900">{provider.name}</span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                                <Clock className="h-2.5 w-2.5 text-[#11574A]" />
                                {provider.hours}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              {provider.description}
                            </p>
                          </div>

                          {/* Action Buttons: Dial Number + WhatsApp + Order */}
                          <div className="flex items-center gap-2 shrink-0">
                            <a
                              href={`tel:${provider.phone.replace(/\s+/g, '')}`}
                              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors shadow-2xs ${
                                isRideCat
                                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                  : 'bg-[#11574A] hover:bg-[#0D443A] text-white'
                              }`}
                            >
                              <Phone className="h-3.5 w-3.5" />
                              <span className="font-mono tracking-wide">{provider.phone}</span>
                            </a>

                            {whatsappLink && (
                              <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex h-8.5 w-8.5 items-center justify-center rounded-xl bg-[#25D366] text-white hover:bg-[#20BA5A] transition-colors p-2"
                                title={`WhatsApp ${provider.name}`}
                              >
                                <MessageCircle className="h-4 w-4" />
                              </a>
                            )}

                            {!isRideCat && (
                              <button
                                type="button"
                                onClick={() => {
                                  setMenuOpen(false);
                                  onOrderViaDesk(provider);
                                }}
                                className="rounded-xl border border-slate-200 bg-white hover:border-[#11574A] hover:text-[#11574A] px-3 py-2 text-xs font-semibold text-slate-700 transition-colors"
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
        </div>
      </Modal>
    </section>
  );
};
