import React, { useState } from 'react';
import { FAQItem } from '@/types/guestcare';
import { ChevronDown } from 'lucide-react';

interface GuestFAQSectionProps {
  faqs: FAQItem[];
}

export const GuestFAQSection: React.FC<GuestFAQSectionProps> = ({ faqs }) => {
  const [openId, setOpenId] = useState<string | null>(null);

  if (faqs.length === 0) return null;

  return (
    <section className="space-y-3.5 text-left">
      <div className="flex items-end justify-between px-0.5">
        <div>
          <h2 className="text-[15px] sm:text-[17px] font-semibold text-slate-900 tracking-[-0.02em]">
            Frequently Asked Questions
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Quick answers about your apartment and stay
          </p>
        </div>
        <span className="text-[11px] font-mono tabular-nums text-slate-400">
          {faqs.length} topics
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
        {faqs.map((faq, index) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className={`rounded-2xl bg-white border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'border-[#0F4C40]/30 shadow-[0_10px_28px_-16px_rgba(15,76,64,0.18)]'
                  : 'border-slate-200/75 hover:border-slate-300/90 shadow-[0_1px_2px_rgba(15,23,42,0.03)]'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-[10.5px] font-mono tabular-nums font-semibold text-[#0F4C40]/60 shrink-0">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-[12.5px] sm:text-[13.5px] font-semibold tracking-[-0.01em] text-slate-900 leading-snug">
                    {faq.question}
                  </span>
                </div>
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
                    isOpen ? 'bg-[#ECF5F2] text-[#0F4C40] rotate-180' : 'bg-slate-100/80 text-slate-400'
                  }`}
                >
                  <ChevronDown className="h-3.5 w-3.5 stroke-[2]" />
                </span>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-2.5 text-xs sm:text-[13px] text-slate-600 leading-relaxed border-t border-slate-100 bg-[#FAFBFD] animate-fadeIn">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
