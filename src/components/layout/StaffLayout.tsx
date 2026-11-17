import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { notificationService } from '@/features/notifications/notificationService';
import { NotificationItem } from '@/types/guestcare';
import { QRGeneratorModal } from '@/features/staff/components/QRGeneratorModal';
import { Button } from '@/components/ui/Button';
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
  Bell,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  X,
} from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils';

export const StaffLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const updateNotifs = () => {
      const all = notificationService.getNotifications();
      setNotifications(all);
      setUnreadCount(notificationService.getUnreadCount());
    };
    updateNotifs();
    const unsub = notificationService.subscribe(updateNotifs);
    return () => unsub();
  }, []);

  const navItems = [
    { to: '/staff', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/staff/requests', label: 'All Requests', icon: Inbox },
    { to: '/staff/maintenance', label: 'Maintenance', icon: Wrench },
    { to: '/staff/housekeeping', label: 'Housekeeping', icon: Sparkles },
    { to: '/staff/health', label: 'Guest Health', icon: Activity },
    { to: '/staff/feedback', label: 'Guest Feedback', icon: MessageSquareHeart },
    { to: '/staff/reports', label: 'Reports & Analytics', icon: BarChart3 },
    { to: '/staff/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-100/80 text-slate-900 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-white shadow-2xs">
        {/* Brand */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-800 text-white font-black text-sm tracking-wider shadow-sm">
              GC
            </span>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-slate-900 leading-tight">GuestCare</h1>
              <p className="text-[11px] font-medium text-slate-400">Staff Operations</p>
            </div>
          </div>
        </div>

        {/* Quick QR Generation Action */}
        <div className="p-4 border-b border-slate-100">
          <button
            onClick={() => setQrModalOpen(true)}
            className="flex w-full items-center justify-between rounded-xl bg-teal-50 px-3.5 py-2.5 text-xs font-semibold text-teal-900 border border-teal-200 hover:bg-teal-100/70 active:scale-[0.98] transition-all"
          >
            <div className="flex items-center gap-2">
              <QrCode className="h-4 w-4 text-teal-700" />
              <span>Generate Room QR</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-teal-600" />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Staff profile summary */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-white font-bold text-xs">
              FD
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-semibold text-slate-800 truncate">Front Desk Duty</p>
              <div className="flex items-center gap-1 text-[10px] text-teal-700 font-medium">
                <ShieldCheck className="h-3 w-3" />
                <span>Duty Manager</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div className="flex items-center gap-3">
            <div className="text-left">
              <span className="text-xs text-slate-400 font-medium">Grand Marina Residences & Suites</span>
              <h2 className="text-sm font-bold text-slate-800">Operational Command</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Direct link to preview guest portal */}
            <a
              href="/portal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <span>Guest Portal Preview</span>
              <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
            </a>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotifsOpen(!notifsOpen)}
                className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Dropdown */}
              {notifsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden text-left animate-fadeIn">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <span className="text-xs font-bold text-slate-900">Activity Notifications</span>
                    <button
                      onClick={() => notificationService.clearAll()}
                      className="text-[11px] text-teal-700 hover:underline font-medium"
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
                        <div key={n.id} className="p-3.5 hover:bg-slate-50/70 transition-colors">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs font-semibold text-slate-900">{n.title}</span>
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

        {/* Dynamic Route Outlet */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 text-left">
          <Outlet />
        </main>
      </div>

      {/* QR Generator Modal */}
      <QRGeneratorModal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} />
    </div>
  );
};

