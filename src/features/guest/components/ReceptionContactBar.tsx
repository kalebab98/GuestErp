import React from 'react';
import { Phone, MessageCircle, Clock, ShieldCheck, Sparkles } from 'lucide-react';

interface ReceptionContactBarProps {
  phone?: string;
  whatsapp?: string;
  apartmentRef?: string;
}

export const ReceptionContactBar: React.FC<ReceptionContactBarProps> = ({
  phone = '+1 (555) 019-2834',
  whatsapp = '+15550192834',
  apartmentRef = 'My Residence',
}) => {
  const whatsappUrl = `https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hello Reception Concierge, I am currently staying in ${apartmentRef}. I would like assistance with: `
  )}`;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#C5A880]/30 bg-gradient-to-br from-[#091F1C] to-[#0D3B36] p-5 text-white shadow-xl text-left space-y-3.5">
      {/* Subtle gold glow */}
      <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-[#C5A880]/10 blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#C5A880]">
            <Sparkles className="h-3 w-3" />
            <span>24/7 Guest Relations & Concierge</span>
          </div>
          <h3 className="font-serif text-base font-bold text-white mt-0.5">
            Prefer Direct Conversation?
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Desk Active Now</span>
        </div>
      </div>

      <p className="text-xs text-slate-300 font-sans leading-relaxed">
        Our front desk and concierge team are available around the clock to ensure your comfort. You may also dial{' '}
        <span className="font-mono font-bold text-[#C5A880]">Ext. 0</span> from your apartment telephone.
      </p>

      <div className="grid grid-cols-2 gap-2.5 pt-1">
        <a
          href={`tel:${phone.replace(/\s+/g, '')}`}
          className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-3.5 py-3 text-xs font-semibold text-white hover:bg-white/20 active:scale-95 transition-all border border-white/15"
        >
          <Phone className="h-3.5 w-3.5 text-[#C5A880]" />
          <span>Call Reception</span>
        </a>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3.5 py-3 text-xs font-semibold text-white hover:bg-[#20BA5A] active:scale-95 transition-all shadow-sm"
        >
          <MessageCircle className="h-4 w-4" />
          <span>WhatsApp Chat</span>
        </a>
      </div>
    </div>
  );
};
