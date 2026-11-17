import React from 'react';
import { LocalServiceProvider } from '@/types/guestcare';
import { Phone, MessageCircle, Car, Coffee, UtensilsCrossed, ShoppingBag, Store } from 'lucide-react';

interface LocalProvidersSectionProps {
  providers: LocalServiceProvider[];
  apartmentRef: string;
  onOrderViaDesk: (provider: LocalServiceProvider) => void;
}

function getProviderIcon(category: string, name: string) {
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
  if (providers.length === 0) return null;

  return (
    <section className="space-y-3 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Local Shops, Food & Ride Numbers
          </h2>
          <p className="text-xs text-slate-500">
            Quick dial menu for Ethiopia rides, coffee, food & nearby essentials
          </p>
        </div>
      </div>

      {/* Single Clean Unified Directory Card */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xs">
        {/* Card Subheader */}
        <div className="flex items-center justify-between bg-[#F6F8F8] px-4 sm:px-6 py-3 border-b border-slate-200/70">
          <span className="text-xs font-bold uppercase tracking-wider text-[#11574A]">
            Service & Direct Dial Menu
          </span>
          <span className="text-[11px] text-slate-500">
            Tap number to call directly
          </span>
        </div>

        {/* Clean Menu Rows */}
        <div className="divide-y divide-slate-100">
          {providers.map(provider => {
            const Icon = getProviderIcon(provider.category, provider.name);
            const isRide =
              provider.category.toLowerCase().includes('ride') ||
              provider.category.toLowerCase().includes('taxi');

            const whatsappLink = provider.whatsapp
              ? `https://wa.me/${provider.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Hello ${provider.name}, I am staying in ${apartmentRef} and would like to order: `
                )}`
              : null;

            return (
              <div
                key={provider.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-3.5 hover:bg-[#FAFBFB] transition-colors"
              >
                {/* Left: Service Icon + Name + Clear Description */}
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                      isRide
                        ? 'bg-amber-50 text-amber-700 border-amber-200/70'
                        : 'bg-[#F0F7F5] text-[#11574A] border-[#11574A]/15'
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{provider.name}</h3>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {provider.hours}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                      <span className="font-medium text-slate-700">{provider.category}</span> — {provider.description}
                    </p>
                  </div>
                </div>

                {/* Right: Visible Dial Number Pill + Optional WhatsApp / Order Button */}
                <div className="flex items-center gap-2 shrink-0 sm:ml-4">
                  <a
                    href={`tel:${provider.phone.replace(/\s+/g, '')}`}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors shadow-2xs ${
                      isRide
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

                  {!isRide && (
                    <button
                      type="button"
                      onClick={() => onOrderViaDesk(provider)}
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
    </section>
  );
};
