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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/80 bg-white/95 backdrop-blur-md px-2 py-2 shadow-[0_-4px_24px_rgba(15,23,42,0.06)]">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {/* Home */}
        <button
          type="button"
          onClick={onNavigateHome}
          className={`flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 px-1 text-[11px] font-semibold transition-all ${
            activeTab === 'home'
              ? 'bg-[#11574A] text-white shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </button>

        {/* My Requests */}
        <button
          type="button"
          onClick={onNavigateRequests}
          className={`relative flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 px-1 text-[11px] font-semibold transition-all ${
            activeTab === 'requests'
              ? 'bg-[#11574A] text-white shadow-2xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          <span>Requests</span>
          {activeRequestCount > 0 && activeTab !== 'requests' && (
            <span className="absolute top-0.5 right-3 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
              {activeRequestCount}
            </span>
          )}
        </button>

        {/* Feedback */}
        <button
          type="button"
          onClick={onOpenFeedback}
          className="flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 px-1 text-[11px] font-semibold text-slate-500 hover:text-[#11574A] transition-colors"
        >
          <MessageSquareHeart className="h-4 w-4" />
          <span>Feedback</span>
        </button>

        {/* Front Desk */}
        <button
          type="button"
          onClick={onOpenContact}
          className="flex flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 px-1 text-[11px] font-semibold text-slate-500 hover:text-[#11574A] transition-colors"
        >
          <PhoneCall className="h-4 w-4" />
          <span>Front Desk</span>
        </button>
      </div>
    </nav>
  );
};
