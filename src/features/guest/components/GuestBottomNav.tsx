import React from 'react';
import { Home, ClipboardList, MessageSquareHeart, PhoneCall } from 'lucide-react';

interface GuestBottomNavProps {
  activeTab: 'home' | 'requests';
  activeRequestCount?: number;
  onNavigateHome: () => void;
  onNavigateRequests: () => void;
  onOpenFeedback: () => void;
  onOpenContact: () => void;
}

export const GuestBottomNav: React.FC<GuestBottomNavProps> = ({
  activeTab,
  activeRequestCount = 0,
  onNavigateHome,
  onNavigateRequests,
  onOpenFeedback,
  onOpenContact,
}) => {
  return (
    <div className="md:hidden fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 right-3 z-40 pointer-events-none">
      <nav
        aria-label="Guest Navigation"
        className="pointer-events-auto mx-auto max-w-md rounded-2xl bg-white/95 backdrop-blur-2xl ring-1 ring-slate-900/[0.08] shadow-[0_12px_32px_-8px_rgba(15,23,42,0.18),0_2px_6px_rgba(15,23,42,0.06)] p-1.5"
      >
        <div className="grid grid-cols-4 gap-1">
          {/* Home */}
          <button
            type="button"
            onClick={onNavigateHome}
            className={`flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 px-1 text-[10.5px] font-semibold tracking-[-0.01em] transition-all duration-200 active:scale-95 ${
              activeTab === 'home'
                ? 'bg-[#0F4C40] text-white shadow-[0_2px_10px_-2px_rgba(15,76,64,0.45)]'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Home className="h-[17px] w-[17px] stroke-[1.75]" />
            <span>Home</span>
          </button>

          {/* Requests */}
          <button
            type="button"
            onClick={onNavigateRequests}
            className={`relative flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 px-1 text-[10.5px] font-semibold tracking-[-0.01em] transition-all duration-200 active:scale-95 ${
              activeTab === 'requests'
                ? 'bg-[#0F4C40] text-white shadow-[0_2px_10px_-2px_rgba(15,76,64,0.45)]'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <ClipboardList className="h-[17px] w-[17px] stroke-[1.75]" />
            <span>Requests</span>
            {activeRequestCount > 0 && activeTab !== 'requests' && (
              <span className="absolute top-1 right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white ring-2 ring-white tabular-nums">
                {activeRequestCount}
              </span>
            )}
          </button>

          {/* Feedback */}
          <button
            type="button"
            onClick={onOpenFeedback}
            className="flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 px-1 text-[10.5px] font-semibold tracking-[-0.01em] text-slate-500 hover:text-[#0F4C40] hover:bg-slate-100/70 transition-all duration-200 active:scale-95"
          >
            <MessageSquareHeart className="h-[17px] w-[17px] stroke-[1.75]" />
            <span>Feedback</span>
          </button>

          {/* Front Desk */}
          <button
            type="button"
            onClick={onOpenContact}
            className="flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 px-1 text-[10.5px] font-semibold tracking-[-0.01em] text-slate-500 hover:text-[#0F4C40] hover:bg-slate-100/70 transition-all duration-200 active:scale-95"
          >
            <PhoneCall className="h-[17px] w-[17px] stroke-[1.75]" />
            <span>Front Desk</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
