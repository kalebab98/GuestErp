import React, { useState } from 'react';
import { FAQItem } from '@/types/guestcare';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface GuestFAQSectionProps {
  faqs: FAQItem[];
}

export const GuestFAQSection: React.FC<GuestFAQSectionProps> = ({ faqs }) => {
  const [openId, setOpenId] = useState<string | null>(null);

  if (faqs.length === 0) return null;

  return (
    <section className="space-y-4 text-left">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4.5 w-4.5 text-[#11574A]" />
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>
        <span className="text-xs text-slate-400">Quick answers</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {faqs.map(faq => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className="rounded-2xl border border-slate-200/70 bg-[#F6F8F8] transition-colors overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left hover:bg-white transition-colors"
              >
                <span className="text-xs sm:text-sm font-semibold text-slate-800">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-[#11574A]' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed bg-white border-t border-slate-100 animate-fadeIn">
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

