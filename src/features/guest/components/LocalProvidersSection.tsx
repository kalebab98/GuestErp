import React from 'react';
import { LocalServiceProvider } from '@/types/guestcare';
import { Phone, MessageCircle, Store, Clock } from 'lucide-react';

interface LocalProvidersSectionProps {
  providers: LocalServiceProvider[];
  apartmentRef: string;
  onOrderViaDesk: (provider: LocalServiceProvider) => void;
}

export const LocalProvidersSection: React.FC<LocalProvidersSectionProps> = ({
  providers,
  apartmentRef,
  onOrderViaDesk,
}) => {
  if (providers.length === 0) return null;

  return (
    <section className="space-y-4 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Local Shops & Delivery
          </h2>
          <p className="text-xs text-slate-500">
            Coffee, tea, food, mobile cards, cigarettes & daily essentials
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {providers.map(provider => {
          const whatsappLink = provider.whatsapp
            ? `https://wa.me/${provider.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                `Hello ${provider.name}, I am staying in ${apartmentRef} and would like to order: `
              )}`
            : null;

          return (
            <div
              key={provider.id}
              className="flex flex-col justify-between rounded-2xl bg-[#F6F8F8] hover:bg-white border border-slate-200/70 hover:border-[#11574A]/30 p-4 transition-all hover:shadow-sm space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#11574A] shadow-2xs border border-slate-100 shrink-0">
                    <Store className="h-4 w-4" />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-slate-500 border border-slate-100">
                    <Clock className="h-2.5 w-2.5 text-[#11574A]" />
                    {provider.hours}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 pt-1">{provider.name}</h3>
                <p className="text-[11px] font-medium text-[#11574A]">{provider.category}</p>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {provider.description}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={() => onOrderViaDesk(provider)}
                  className="flex-1 rounded-xl bg-[#11574A] hover:bg-[#0D443A] px-3 py-2 text-xs font-semibold text-white transition-colors text-center"
                >
                  Order
                </button>
                <a
                  href={`tel:${provider.phone.replace(/\s+/g, '')}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#11574A] transition-colors shrink-0"
                  title={`Call ${provider.name}`}
                >
                  <Phone className="h-3.5 w-3.5" />
                </a>
                {whatsappLink && (
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#25D366] text-white hover:bg-[#20BA5A] transition-colors shrink-0"
                    title={`WhatsApp ${provider.name}`}
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
