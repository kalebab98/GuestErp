import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { notificationService } from '@/features/notifications/notificationService';
import { portalConfigService } from '@/features/config/portalConfigService';
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
  LogOut,
} from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils';

const NAV_GROUPS = [
  {
    group: 'Operations',
    items: [
      { to: '/staff', label: 'Overview', icon: LayoutDashboard, end: true },
      { to: '/staff/requests', label: 'All Requests', icon: Inbox },
      { to: '/staff/maintenance', label: 'Maintenance', icon: Wrench },
      { to: '/staff/housekeeping', label: 'Housekeeping', icon: Sparkles },
    ],
  },
  {
    group: 'Guest Experience',
    items: [
      { to: '/staff/health', label: 'Guest Health', icon: Activity },
      { to: '/staff/feedback', label: 'Guest Feedback', icon: MessageSquareHeart },
      { to: '/staff/qr-codes', label: 'Apartments & QR Codes', icon: QrCode },
    ],
  },
  {
    group: 'Configuration',
    items: [
      { to: '/staff/portal-config', label: 'Portal Content & Data', icon: Sliders },
      { to: '/staff/reports', label: 'Reports & Analytics', icon: BarChart3 },
      { to: '/staff/settings', label: 'Settings', icon: Settings },
    ],
  },
];

const ALL_NAV_ITEMS = NAV_GROUPS.flatMap(g => g.items);

export const StaffLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [propertyName, setPropertyName] = useState(portalConfigService.getContact().propertyName);
  const [brandName, setBrandName] = useState(portalConfigService.getBranding().portalBrandName);

  useEffect(() => {
    const updateNotifs = () => {
      setNotifications(notificationService.getNotifications());
      setUnreadCount(notificationService.getUnreadCount());
    };
    const updateConfig = () => {
      setPropertyName(portalConfigService.getContact().propertyName);
      setBrandName(portalConfigService.getBranding().portalBrandName);
    };
    updateNotifs();
    updateConfig();
    const unsubN = notificationService.subscribe(updateNotifs);
    const unsubC = portalConfigService.subscribe(updateConfig);
    return () => {
      unsubN();
      unsubC();
    };
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const currentPageLabel =
    ALL_NAV_ITEMS.find(item =>
      item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
    )?.label || 'Command Center';

  const SidebarContent = (
    <div className="flex h-full flex-col bg-white/95 backdrop-blur-xl">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-200/65">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0F4C40] text-white font-bold text-[11px] tracking-wider shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_4px_12px_-4px_rgba(15,76,64,0.5)]">
            GC
          </span>
          <div className="text-left leading-tight min-w-0">
            <span className="block text-[14.5px] font-bold tracking-[-0.02em] text-slate-900 truncate">
              {brandName || 'GuestCare'}
            </span>
            <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Staff Command</span>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800"
          aria-label="Close navigation"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Primary Quick Action: Generate Room QR */}
      <div className="p-3.5 border-b border-slate-100">
        <button
          type="button"
          onClick={() => {
            setMobileMenuOpen(false);
            setQrModalOpen(true);
          }}
          className="group flex w-full items-center justify-between rounded-xl bg-[#F2F7F5] hover:bg-[#E5F2EE] px-3 py-2.5 text-xs font-semibold text-[#0F4C40] ring-1 ring-[#0F4C40]/12 active:scale-[0.985] transition-all"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-white text-[#0F4C40] ring-1 ring-[#0F4C40]/10 shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-1">
              <QrCode className="h-3.5 w-3.5 stroke-[1.75]" />
            </div>
            <span>Generate Room QR</span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-[#0F4C40]/60 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Grouped Linear-Style Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {NAV_GROUPS.map(section => (
          <div key={section.group} className="space-y-1">
            <p className="px-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              {section.group}
            </p>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[12.5px] font-medium tracking-[-0.01em] transition-all ${
                        isActive
                          ? 'bg-[#0F4C40] text-white font-semibold shadow-[0_2px_10px_-3px_rgba(15,76,64,0.45)]'
                          : 'text-slate-600 hover:bg-[#F6F8FA] hover:text-slate-900'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0 stroke-[1.7]" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Quick Links & Sign Out */}
      <div className="p-3 border-t border-slate-100 space-y-1.5">
        <a
          href="/portal"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-1.5 rounded-xl ring-1 ring-slate-900/[0.07] bg-[#F6F8FA] hover:bg-white hover:ring-[#0F4C40]/30 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-[#0F4C40] transition-all"
        >
          <span>Open Guest Portal</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <button
          type="button"
          onClick={() => {
            sessionStorage.removeItem('guestcare_staff_session');
            navigate('/');
          }}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="porcelain-canvas flex h-[100dvh] text-slate-900 overflow-hidden font-sans antialiased">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 lg:w-64 shrink-0 flex-col border-r border-slate-200/70 bg-white">
        {SidebarContent}
      </aside>

      {/* Mobile Slide-Over Sidebar Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 w-72 max-w-[84vw] h-full shadow-2xl animate-fadeIn">
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Column */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Frosted Porcelain Top Bar */}
        <header className="flex h-14 sm:h-16 shrink-0 items-center justify-between border-b border-slate-200/65 bg-[#F6F8FA]/80 backdrop-blur-xl px-4 sm:px-6">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white ring-1 ring-slate-900/[0.08] text-slate-700 hover:text-[#0F4C40] shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
              aria-label="Open navigation"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="text-left min-w-0">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm">
                <span className="hidden sm:inline font-medium text-slate-400 truncate max-w-[180px]">
                  {propertyName}
                </span>
                <span className="hidden sm:inline text-slate-300">/</span>
                <span className="md:hidden font-bold text-[#0F4C40]">{brandName || 'GuestCare'}</span>
                <span className="md:hidden text-slate-300">/</span>
                <h2 className="font-semibold tracking-[-0.02em] text-slate-900 truncate">
                  {currentPageLabel}
                </h2>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Desktop Guest Portal Preview Pill */}
            <a
              href="/portal"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-slate-900/[0.08] hover:ring-[#0F4C40]/35 px-3.5 h-8 text-xs font-semibold text-slate-700 hover:text-[#0F4C40] shadow-[0_1px_2px_rgba(15,23,42,0.03)] active:scale-95 transition-all"
            >
              <span>Guest Portal</span>
              <ExternalLink className="h-3 w-3 text-[#0F4C40]" />
            </a>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifsOpen(!notifsOpen)}
                className="relative inline-flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white ring-1 ring-slate-900/[0.08] text-slate-600 hover:ring-[#0F4C40]/35 hover:text-[#0F4C40] shadow-[0_1px_2px_rgba(15,23,42,0.03)] active:scale-95 transition-all"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4 stroke-[1.75]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9.5px] font-bold text-white ring-2 ring-white tabular-nums">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl ring-1 ring-slate-900/[0.08] bg-white shadow-[0_20px_50px_-16px_rgba(15,23,42,0.22)] z-50 overflow-hidden text-left animate-sheet-up">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-[#FAFBFD]">
                    <span className="text-xs font-semibold text-slate-900">Activity Notifications</span>
                    <button
                      type="button"
                      onClick={() => notificationService.clearAll()}
                      className="text-[11px] text-[#0F4C40] hover:underline font-semibold"
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
                        <div key={n.id} className="p-3.5 hover:bg-[#FAFBFD] transition-colors">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="text-xs font-semibold text-slate-900">{n.title}</span>
                            <span className="text-[10px] font-mono tabular-nums text-slate-400 shrink-0">
                              {formatTimeAgo(n.createdAt)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">{n.message}</p>
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
