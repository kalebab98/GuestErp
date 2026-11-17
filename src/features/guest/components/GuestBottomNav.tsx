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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/80 bg-white/95 backdrop-blur-md px-4 py-2.5 shadow-[0_-4px_24px_rgba(15,23,42,0.06)]">
      <div className="mx-auto flex max-w-md items-center justify-between">
        {/* Home */}
        <button
          type="button"
          onClick={onNavigateHome}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === 'home'
              ? 'bg-[#11574A] text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="h-4 w-4" />
          {activeTab === 'home' && <span>Home</span>}
        </button>

        {/* My Requests */}
        <button
          type="button"
          onClick={onNavigateRequests}
          className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === 'requests'
              ? 'bg-[#11574A] text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          {activeTab === 'requests' && <span>Requests</span>}
          {activeRequestCount > 0 && activeTab !== 'requests' && (
            <span className="absolute top-1 right-2.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              {activeRequestCount}
            </span>
          )}
        </button>

        {/* Private Feedback */}
        <button
          type="button"
          onClick={onOpenFeedback}
          className="flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-[#11574A] transition-colors"
          aria-label="Feedback"
        >
          <MessageSquareHeart className="h-4 w-4" />
        </button>

        {/* Contact Reception */}
        <button
          type="button"
          onClick={onOpenContact}
          className="flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold text-slate-500 hover:text-[#11574A] transition-colors"
          aria-label="Reception Help"
        >
          <PhoneCall className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
};

