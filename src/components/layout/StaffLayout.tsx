import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { notificationService } from '@/features/notifications/notificationService';
import { NotificationItem } from '@/types/guestcare';
import { QRGeneratorModal } from '@/features/staff/components/QRGeneratorModal';
import {
  LayoutDashboard,
  Inbox,
  Wrench,
  Sparkles,
  Activity,
  MessageSquareHeart,
  QrCode,
  BarChart3,
  Settings,
  Sliders,
  Bell,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/staff', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/staff/requests', label: 'All Requests', icon: Inbox },
  { to: '/staff/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/staff/housekeeping', label: 'Housekeeping', icon: Sparkles },
  { to: '/staff/health', label: 'Guest Health', icon: Activity },
  { to: '/staff/feedback', label: 'Guest Feedback', icon: MessageSquareHeart },
  { to: '/staff/portal-config', label: 'Portal Items & FAQs', icon: Sliders },
  { to: '/staff/reports', label: 'Reports & Analytics', icon: BarChart3 },
  { to: '/staff/settings', label: 'Settings', icon: Settings },
];

export const StaffLayout: React.FC = () => {
  const location = useLocation();
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const updateNotifs = () => {
      setNotifications(notificationService.getNotifications());
      setUnreadCount(notificationService.getUnreadCount());
    };
    updateNotifs();
    return notificationService.subscribe(updateNotifs);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const currentPageLabel =
    NAV_ITEMS.find(item =>
      item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
    )?.label || 'Staff Command Center';

  const SidebarContent = (
    <div className="flex h-full flex-col bg-white">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#11574A] text-white font-black text-xs tracking-wider shadow-xs">
            GC
          </span>
          <div className="text-left leading-tight">
            <span className="block text-base font-extrabold tracking-tight text-slate-900">
              GuestCare
            </span>
            <span className="block text-[11px] font-medium text-slate-400">
              Staff Operations
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Primary Quick Action: Generate Room QR */}
      <div className="p-4 border-b border-slate-100">
        <button
          type="button"
          onClick={() => {
            setMobileMenuOpen(false);
            setQrModalOpen(true);
          }}
          className="group flex w-full items-center justify-between rounded-2xl bg-[#F0F7F5] hover:bg-[#E3F1ED] px-3.5 py-3 text-xs font-bold text-[#11574A] border border-[#11574A]/15 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[#11574A] shadow-2xs">
              <QrCode className="h-4 w-4" />
            </div>
            <span>Generate Room QR</span>
          </div>
          <ChevronRight className="h-4 w-4 text-[#11574A]/70 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#11574A] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-[#F6F8F8] hover:text-slate-900'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Quick Link */}
      <div className="p-4 border-t border-slate-100">
        <a
          href="/portal"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-[#F6F8F8] hover:bg-white hover:border-[#11574A]/30 px-3 py-2.5 text-xs font-semibold text-slate-700 hover:text-[#11574A] transition-all"
        >
          <span>Open Guest Portal</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F6F8F8] text-slate-900 overflow-hidden font-sans antialiased">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-slate-200/70 bg-white">
        {SidebarContent}
      </aside>

      {/* Mobile Slide-Over Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl animate-fadeIn">
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Clean Top Header Bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/70 bg-white/95 backdrop-blur-md px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#F6F8F8] text-slate-700 hover:bg-slate-200/70"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="md:hidden font-extrabold text-sm text-[#11574A]">GuestCare</span>
                <span className="md:hidden text-slate-300">/</span>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  {currentPageLabel}
                </h2>
              </div>
              <span className="hidden sm:block text-[11px] text-slate-400">
                Grand Marina Residences • Operational Command
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Guest Portal Preview Pill */}
            <a
              href="/portal"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#F0F7F5] hover:bg-[#E3F1ED] px-3.5 py-2 text-xs font-semibold text-[#11574A] transition-colors"
            >
              <span>Guest Portal</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifsOpen(!notifsOpen)}
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#F6F8F8] text-slate-700 hover:bg-[#F0F7F5] hover:text-[#11574A] transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden text-left animate-fadeIn">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-[#F6F8F8]">
                    <span className="text-xs font-bold text-slate-900">Activity Notifications</span>
                    <button
                      type="button"
                      onClick={() => notificationService.clearAll()}
                      className="text-[11px] text-[#11574A] hover:underline font-semibold"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No notifications right now
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-3.5 hover:bg-[#F6F8F8] transition-colors">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs font-bold text-slate-900">{n.title}</span>
                            <span className="text-[10px] text-slate-400">{formatTimeAgo(n.createdAt)}</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Workspace Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 sm:py-7 text-left">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* QR Generator Modal */}
      <QRGeneratorModal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} />
    </div>
  );
};
