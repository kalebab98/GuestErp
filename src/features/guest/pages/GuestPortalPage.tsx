import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { tokenService } from '@/lib/tokenService';
import { requestService } from '@/features/requests/requestService';
import {
  portalConfigService,
  WifiConfig,
  ContactAndBuildingConfig,
  PortalBrandingConfig,
  PopularServiceConfig,
} from '@/features/config/portalConfigService';
import { mockPMSAdapter } from '@/features/pms/mockAdapter';
import { PortalSession, Category, GuestRequest, FAQItem, LocalServiceProvider } from '@/types/guestcare';
import { ServiceGrid } from '../components/ServiceGrid';
import { PopularServicesRow, PopularServiceItem } from '../components/PopularServicesRow';
import { LocalProvidersSection } from '../components/LocalProvidersSection';
import { GuestFAQSection } from '../components/GuestFAQSection';
import { SimpleServiceModal } from '../components/SimpleServiceModal';
import { ConfirmResolutionModal } from '../components/ConfirmResolutionModal';
import { PrivateFeedbackModal } from '../components/PrivateFeedbackModal';
import { GuestBottomNav } from '../components/GuestBottomNav';
import { Button } from '@/components/ui/Button';
import {
  MapPin,
  Search,
  Wifi,
  Phone,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  ClipboardList,
  MessageSquareHeart,
  ArrowRight,
  X,
} from 'lucide-react';

export const GuestPortalPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenParam = searchParams.get('token');
  const unitParam = searchParams.get('unit');

  const [session, setSession] = useState<PortalSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [myRequests, setMyRequests] = useState<GuestRequest[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [providers, setProviders] = useState<LocalServiceProvider[]>([]);
  const [popularServices, setPopularServices] = useState<PopularServiceConfig[]>(
    portalConfigService.getPopularServices(true)
  );
  const [wifi, setWifi] = useState<WifiConfig>(portalConfigService.getWifi());
  const [contact, setContact] = useState<ContactAndBuildingConfig>(portalConfigService.getContact());
  const [branding, setBranding] = useState<PortalBrandingConfig>(portalConfigService.getBranding());

  const [searchQuery, setSearchQuery] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(true);

  // Modals
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [initialPreset, setInitialPreset] = useState<string | undefined>(undefined);
  const [confirmModalRequest, setConfirmModalRequest] = useState<GuestRequest | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [wifiCopied, setWifiCopied] = useState(false);

  // Resolve apartment session cleanly from QR token (cross-device via Supabase) or unit code (1A-8B)
  useEffect(() => {
    async function initSession() {
      setLoading(true);
      setAuthError(null);

      // Helper to resolve a session directly for a building apartment unit (1A - 8B)
      const resolveByUnit = async (unitCode: string): Promise<boolean> => {
        const normalized = unitCode.trim().toUpperCase();
        const apt = mockPMSAdapter
          .listAllBuildingApartments()
          .find(a => a.unitNumber.toUpperCase() === normalized);
        if (!apt) return false;

        const res = await mockPMSAdapter.getReservationByApartmentUnit(apt.unitNumber);
        if (res && res.stayStatus === 'checked_in') {
          try {
            const generated = await tokenService.getOrCreateUnitSession(apt.unitNumber, res.id);
            setSession(generated.session);
            sessionStorage.setItem('guestcare_token', generated.rawToken);
            sessionStorage.setItem('guestcare_active_session', JSON.stringify(generated.session));
            return true;
          } catch {
            // Fall through to apartment session
          }
        }

        // Direct unit session for vacant/standby apartments so every QR opens its apartment cleanly
        const unitSession: PortalSession = {
          id: `unit-sess-${apt.unitNumber}`,
          reservationRef: res?.id || `UNIT-${apt.unitNumber}`,
          apartmentRef: `${apt.unitNumber} - ${apt.name}`,
          guestName: res?.primaryGuest.fullName || `Apartment ${apt.unitNumber} Guest`,
          tokenHash: `unit-${apt.unitNumber}`,
          checkInDate: res?.checkInDate || new Date().toISOString(),
          checkOutDate: res?.checkOutDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          lastActiveAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        setSession(unitSession);
        sessionStorage.removeItem('guestcare_token');
        sessionStorage.setItem('guestcare_active_session', JSON.stringify(unitSession));
        return true;
      };

      // 1. Validate explicit QR token from URL against local cache + live Supabase
      if (tokenParam) {
        const res = await tokenService.validateToken(tokenParam);
        if (res.valid && res.session) {
          setSession(res.session);
          sessionStorage.setItem('guestcare_token', tokenParam);
          sessionStorage.setItem('guestcare_active_session', JSON.stringify(res.session));
          setLoading(false);
          return;
        }
        // Respect explicit revocation, otherwise fall back to exact apartment unit code if present
        const isExplicitlyRevoked = Boolean(res.error && res.error.toLowerCase().includes('revoked'));
        if (!isExplicitlyRevoked && unitParam && (await resolveByUnit(unitParam))) {
          setLoading(false);
          return;
        }
        setAuthError(res.error || 'Access pass could not be verified. Please contact Front Desk.');
        setLoading(false);
        return;
      }

      // 2. Direct apartment QR code (?unit=3A, ?unit=8B, etc.)
      if (unitParam) {
        const resolved = await resolveByUnit(unitParam);
        if (resolved) {
          setLoading(false);
          return;
        }
        setAuthError(`Apartment "${unitParam}" was not found. Please scan the QR code inside your apartment.`);
        setLoading(false);
        return;
      }

      // 3. Returning guest in same browser tab (e.g. back from /portal/requests)
      const cachedSessionRaw = sessionStorage.getItem('guestcare_active_session');
      if (cachedSessionRaw) {
        try {
          const parsed = JSON.parse(cachedSessionRaw) as PortalSession;
          setSession(parsed);
          setLoading(false);
          return;
        } catch {
          // Ignore malformed cache
        }
      }

      const storedToken = sessionStorage.getItem('guestcare_token');
      if (storedToken) {
        const res = await tokenService.validateToken(storedToken);
        if (res.valid && res.session) {
          setSession(res.session);
          sessionStorage.setItem('guestcare_active_session', JSON.stringify(res.session));
          setLoading(false);
          return;
        }
      }

      // 4. Direct visit to /portal with no parameters -> default to Apartment 1A
      const fallbackOk = await resolveByUnit('1A');
      if (!fallbackOk) {
        setAuthError('No active room pass found. Please scan the QR code located in your apartment.');
      }
      setLoading(false);
    }

    initSession();
  }, [tokenParam, unitParam]);

  // Load live data & subscribe to requestService, staff portalConfigService, and apartment stays
  useEffect(() => {
    if (!session) return;

    const loadData = () => {
      setCategories(requestService.getCategories());
      setMyRequests(requestService.listRequests({ reservationRef: session.reservationRef }));
      setFaqs(portalConfigService.getFaqs(true));
      setProviders(portalConfigService.getProviders(true));
      setPopularServices(portalConfigService.getPopularServices(true));
      setWifi(portalConfigService.getWifi());
      setContact(portalConfigService.getContact());
      setBranding(portalConfigService.getBranding());
    };

    const refreshGuestNameFromPMS = async () => {
      const unitCode = session.apartmentRef.split(' - ')[0];
      const latestRes = await mockPMSAdapter.getReservationByApartmentUnit(unitCode);
      if (latestRes && latestRes.primaryGuest.fullName !== session.guestName) {
        const updatedSession: PortalSession = {
          ...session,
          guestName: latestRes.primaryGuest.fullName,
          apartmentRef: `${latestRes.apartment.unitNumber} - ${latestRes.apartment.name}`,
        };
        setSession(updatedSession);
        sessionStorage.setItem('guestcare_active_session', JSON.stringify(updatedSession));
      }
    };

    loadData();
    const unsubReq = requestService.subscribe(loadData);
    const unsubCfg = portalConfigService.subscribe(loadData);
    const unsubPms = mockPMSAdapter.subscribe(() => {
      void refreshGuestNameFromPMS();
    });
    return () => {
      unsubReq();
      unsubCfg();
      unsubPms();
    };
  }, [session]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase().trim();
    return categories.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        (c.shortName && c.shortName.toLowerCase().includes(q)) ||
        c.description.toLowerCase().includes(q) ||
        (c.commonIssues && c.commonIssues.some(issue => issue.toLowerCase().includes(q))) ||
        (c.presetItems && c.presetItems.some(item => item.name.toLowerCase().includes(q)))
    );
  }, [categories, searchQuery]);

  const handleCreateRequest = async (data: {
    categoryId: string;
    title: string;
    description: string;
    priority?: any;
    requestedItems?: any[];
    attachments: any[];
  }) => {
    if (!session) return;
    await requestService.createRequest({
      reservationRef: session.reservationRef,
      apartmentRef: session.apartmentRef,
      guestName: session.guestName,
      categoryId: data.categoryId,
      title: data.title,
      description: data.description,
      priority: data.priority,
      requestedItems: data.requestedItems,
      attachments: data.attachments,
    });
  };

  const handleSelectPopular = (item: PopularServiceItem) => {
    const matchedCategory = categories.find(c => c.code === item.categoryCode) || categories[0];
    setSelectedCategory(matchedCategory);
    setInitialPreset(item.presetText);
  };

  const handleOrderViaDesk = (provider: LocalServiceProvider) => {
    const shopCategory = categories.find(c => c.code === 'shop_delivery') || categories[0];
    setSelectedCategory(shopCategory);
    setInitialPreset(`Order from ${provider.name} (${provider.category})`);
  };

  const handleConfirmResolution = async (satisfied: boolean, notesOrReason?: string) => {
    if (!confirmModalRequest || !session) return;
    await requestService.confirmResolution({
      requestId: confirmModalRequest.id,
      satisfied,
      guestName: session.guestName,
      notesOrReason,
    });
  };

  const handleFeedbackSubmit = async (feedback: {
    overallRating: number;
    cleanlinessRating?: number;
    staffRating?: number;
    comfortRating?: number;
    comments?: string;
    isAnonymous?: boolean;
  }) => {
    if (!session) return;
    await requestService.submitFeedback({
      reservationRef: session.reservationRef,
      apartmentRef: session.apartmentRef,
      guestName: session.guestName,
      ...feedback,
    });
  };

  const handleCopyWifi = () => {
    navigator.clipboard.writeText(wifi.password);
    setWifiCopied(true);
    setTimeout(() => setWifiCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="porcelain-canvas flex min-h-[100dvh] flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#0F4C40] border-t-transparent" />
          <p className="text-xs font-medium tracking-[-0.01em] text-slate-500">
            Loading your stay portal...
          </p>
        </div>
      </div>
    );
  }

  if (authError || !session) {
    return (
      <div className="porcelain-canvas flex min-h-[100dvh] flex-col items-center justify-center p-5 text-center">
        <div className="bezel-shell max-w-md w-full rounded-[1.5rem] p-1.5">
          <div className="bezel-core rounded-[1.15rem] p-7 space-y-4">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 ring-1 ring-rose-200/80 text-rose-600">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-semibold tracking-[-0.02em] text-slate-900">
                Access Restricted
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed">{authError}</p>
            </div>
            <div className="pt-1">
              <Button
                variant="outline"
                className="w-full text-xs rounded-xl"
                onClick={() => {
                  sessionStorage.removeItem('guestcare_token');
                  window.location.href = '/';
                }}
              >
                Return to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeRequests = myRequests.filter(r => !['closed', 'cancelled'].includes(r.status));
  const resolvedPendingConfirmation = myRequests.filter(r => r.status === 'resolved');
  const unitLabel = session.apartmentRef.split(' - ')[0];

  return (
    <div className="porcelain-canvas min-h-[100dvh] text-slate-900 font-sans pb-28 md:pb-14 antialiased">
      {/* Frosted Porcelain Header Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/65 bg-[#F6F8FA]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 h-14 sm:h-16">
          {/* Brand Lockup + Full Word + Live Apt Pill */}
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-[#0F4C40] text-white font-bold text-[11px] tracking-wider shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_4px_12px_-4px_rgba(15,76,64,0.5)]">
              GC
            </span>
            <div className="text-left leading-tight">
              <span className="block text-[14px] sm:text-[15px] font-bold tracking-[-0.02em] text-slate-900">
                {branding.portalBrandName || 'GuestCare'}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Apt {unitLabel}</span>
              </span>
            </div>
          </div>

          {/* Desktop / Tablet Segmented Nav */}
          <div className="hidden md:flex items-center gap-1 rounded-full bg-white/85 ring-1 ring-slate-900/[0.06] p-1 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            <button
              type="button"
              onClick={() => navigate('/portal/requests')}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-[#F2F7F5] hover:text-[#0F4C40] transition-colors"
            >
              <ClipboardList className="h-3.5 w-3.5 text-[#0F4C40]" />
              <span>My Requests</span>
              {myRequests.length > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#0F4C40] px-1 text-[10px] font-bold text-white tabular-nums">
                  {myRequests.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setFeedbackOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-rose-50/70 hover:text-rose-600 transition-colors"
            >
              <MessageSquareHeart className="h-3.5 w-3.5 text-rose-500" />
              <span>Feedback</span>
            </button>
          </div>

          {/* Crisp Direct Call Front Desk Pill */}
          <a
            href={`tel:${contact.frontDeskPhone.replace(/\s+/g, '')}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-slate-900/[0.08] hover:ring-[#0F4C40]/35 px-3 sm:px-3.5 h-8 sm:h-9 text-[11.5px] sm:text-xs font-semibold text-slate-800 hover:text-[#0F4C40] shadow-[0_1px_2px_rgba(15,23,42,0.04)] active:scale-95 transition-all"
            title="Call Front Desk"
          >
            <Phone className="h-3.5 w-3.5 text-[#0F4C40] stroke-[1.75]" />
            <span>Front Desk</span>
          </a>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6 pt-4 sm:pt-6 space-y-6 sm:space-y-8 text-left">
        {/* Optional Staff Live Announcement Banner */}
        {branding.noticeBanner?.trim() && (
          <div className="flex items-center gap-2.5 rounded-2xl bg-white ring-1 ring-[#0F4C40]/20 px-4 py-2.5 text-xs font-medium text-[#0F4C40] shadow-[0_2px_10px_-4px_rgba(15,76,64,0.12)] animate-fadeIn">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
            <span className="leading-snug">{branding.noticeBanner}</span>
          </div>
        )}

        {/* Spotlight-Style Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 stroke-[1.75]" />
          <input
            type="text"
            placeholder="Search services or items (towels, laundry, coffee, wifi)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl bg-white pl-10 pr-10 h-11 sm:h-12 text-xs sm:text-[13.5px] text-slate-900 placeholder:text-slate-400 ring-1 ring-slate-900/[0.07] shadow-[0_1px_2px_rgba(15,23,42,0.03),0_6px_18px_-12px_rgba(15,23,42,0.12)] focus:ring-2 focus:ring-[#0F4C40]/35 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Double-Bezel Machined Obsidian-Emerald Hero + Glass Wi-Fi Card */}
        <div className="bezel-shell rounded-[1.75rem] p-1.5">
          <div
            className="relative overflow-hidden rounded-[1.375rem] bg-[#0B231E] p-5 sm:p-7 md:p-8 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_20px_48px_-20px_rgba(11,35,30,0.65)]"
            style={{
              backgroundImage:
                'radial-gradient(ellipse 70% 80% at 10% 0%, rgba(45, 212, 191, 0.22), transparent 58%), radial-gradient(ellipse 60% 70% at 95% 100%, rgba(16, 185, 129, 0.16), transparent 55%)',
            }}
          >
            {/* Subtle architectural micro-dot texture */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.12]"
              style={{
                backgroundImage:
                  'radial-gradient(rgba(255,255,255,0.45) 0.75px, transparent 0.75px)',
                backgroundSize: '18px 18px',
              }}
            />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-center">
              {/* Left: Editorial Welcome & Precision CTA */}
              <div className="lg:col-span-7 space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.08] ring-1 ring-white/[0.14] px-3 py-1 text-[11px] font-medium text-teal-100 backdrop-blur-md">
                  <MapPin className="h-3 w-3 text-teal-300" />
                  <span>
                    {session.guestName} <span className="text-white/40 mx-1">•</span> Apt {unitLabel}
                  </span>
                </div>

                <h1 className="text-[22px] sm:text-[28px] md:text-[32px] font-bold tracking-[-0.03em] text-white leading-[1.12] [text-wrap:balance]">
                  {branding.heroHeadline}
                </h1>

                <p className="text-xs sm:text-[13.5px] text-teal-100/80 leading-relaxed max-w-lg font-normal">
                  {branding.heroSubtitle}
                </p>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const target = document.getElementById('service-categories-section');
                      target?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="group inline-flex items-center gap-2 rounded-full bg-white hover:bg-teal-50 text-[#0B231E] font-semibold text-xs sm:text-[13px] px-4.5 py-2.5 shadow-[0_6px_20px_-6px_rgba(0,0,0,0.4)] active:scale-95 transition-all"
                  >
                    <span>{branding.heroCtaLabel || 'Explore Services'}</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>

              {/* Right: Machined Smoked-Glass Wi-Fi Card */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl bg-white/[0.06] backdrop-blur-xl ring-1 ring-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-teal-400/15 ring-1 ring-teal-300/25 text-teal-200">
                        <Wifi className="h-4 w-4 stroke-[1.75]" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[10px] uppercase tracking-[0.12em] text-teal-200/75 font-semibold">
                          Apartment Wi-Fi
                        </span>
                        <span className="block text-[13.5px] font-semibold text-white font-mono truncate">
                          {wifi.networkName}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyWifi}
                      className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 h-7.5 py-1 text-[11px] font-semibold active:scale-95 transition-all ${
                        wifiCopied
                          ? 'bg-emerald-400 text-slate-950'
                          : 'bg-white text-[#0B231E] hover:bg-teal-50'
                      }`}
                    >
                      {wifiCopied ? (
                        <>
                          <Check className="h-3 w-3 stroke-[2.5]" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-black/25 px-3.5 py-2 ring-1 ring-white/[0.08]">
                    <span className="text-[11px] text-teal-200/75 font-medium">Password</span>
                    <span className="font-mono tabular-nums text-[13px] font-semibold tracking-wider text-white select-all">
                      {wifi.password}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Banner: Guest Confirmation Pending */}
        {resolvedPendingConfirmation.length > 0 && (
          <div className="rounded-2xl bg-white ring-1 ring-emerald-500/30 shadow-[0_8px_24px_-12px_rgba(16,185,129,0.22)] p-4 sm:p-5 text-left space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-emerald-950 font-semibold text-xs sm:text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Service Marked Completed by Staff</span>
              </div>
              <span className="rounded-full bg-emerald-50 ring-1 ring-emerald-200 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                Action Required
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our team marked "<strong className="text-slate-900">{resolvedPendingConfirmation[0].title}</strong>" as resolved. Was everything completed to your satisfaction?
            </p>
            <Button
              size="sm"
              variant="success"
              className="w-full sm:w-auto text-xs font-semibold rounded-xl px-4 py-2"
              onClick={() => setConfirmModalRequest(resolvedPendingConfirmation[0])}
            >
              Confirm Satisfaction or Reopen
            </Button>
          </div>
        )}

        {/* Active In-Progress Banner */}
        {activeRequests.length > 0 && resolvedPendingConfirmation.length === 0 && (
          <div
            onClick={() => navigate('/portal/requests')}
            role="button"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') navigate('/portal/requests');
            }}
            className="porcelain-card flex items-center justify-between gap-3 rounded-2xl border border-amber-200/80 p-3.5 sm:p-4 cursor-pointer active:scale-[0.995]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 ring-1 ring-amber-200/70 text-amber-600">
                <Clock className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 tabular-nums">
                  {activeRequests.length} Active Request{activeRequests.length !== 1 ? 's' : ''} in progress
                </p>
                <p className="text-[11px] text-slate-500 truncate max-w-[200px] sm:max-w-md">
                  {activeRequests[0].title}
                </p>
              </div>
            </div>
            <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-[#F2F7F5] px-3 py-1 text-[11px] font-semibold text-[#0F4C40]">
              <span>Track</span>
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        )}

        {/* Section 1: Service Categories */}
        <div id="service-categories-section">
          <ServiceGrid
            categories={filteredCategories}
            onSelectCategory={cat => {
              setSelectedCategory(cat);
              setInitialPreset(undefined);
            }}
            showAll={showAllCategories}
            onToggleShowAll={() => setShowAllCategories(!showAllCategories)}
          />
        </div>

        {/* Section 2: Popular Requests (Staff Editable) */}
        {!searchQuery && (
          <PopularServicesRow items={popularServices} onSelectPopular={handleSelectPopular} />
        )}

        {/* Section 3: ONE Unified Local Shops, Food & Ethiopia Ride Directory Card */}
        {!searchQuery && (
          <LocalProvidersSection
            providers={providers}
            apartmentRef={session.apartmentRef}
            branding={branding}
            onOrderViaDesk={handleOrderViaDesk}
          />
        )}

        {/* Section 4: Frequently Asked Questions (Staff Editable) */}
        {!searchQuery && <GuestFAQSection faqs={faqs} />}

        {/* Section 5: Feedback & 24/7 Front Desk */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="porcelain-card flex items-center justify-between gap-3 rounded-2xl border border-slate-200/75 p-4">
            <div className="space-y-0.5 min-w-0">
              <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-rose-500">
                <MessageSquareHeart className="h-3 w-3" />
                <span>Direct to Management</span>
              </span>
              <h3 className="text-[13.5px] font-semibold tracking-[-0.01em] text-slate-900">
                Private Feedback
              </h3>
              <p className="text-[11.5px] text-slate-500">Share thoughts anytime during your stay</p>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackOpen(true)}
              className="shrink-0 rounded-full ring-1 ring-slate-200 bg-white hover:ring-rose-300 hover:text-rose-600 px-3.5 h-8 text-xs font-semibold text-slate-700 active:scale-95 transition-all"
            >
              Rate Stay
            </button>
          </div>

          <div className="porcelain-card flex items-center justify-between gap-3 rounded-2xl border border-slate-200/75 p-4">
            <div className="space-y-0.5 min-w-0">
              <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#0F4C40]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>24/7 Front Desk</span>
              </span>
              <h3 className="text-[13.5px] font-semibold tracking-[-0.01em] text-slate-900">
                Need Immediate Help?
              </h3>
              <p className="text-[11.5px] text-slate-500 font-mono tabular-nums">
                {contact.frontDeskPhone}
              </p>
            </div>
            <a
              href={`tel:${contact.frontDeskPhone.replace(/\s+/g, '')}`}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#0F4C40] hover:bg-[#0B3B31] px-3.5 h-8 text-xs font-semibold text-white shadow-[0_2px_10px_-2px_rgba(15,76,64,0.4)] active:scale-95 transition-all"
            >
              <Phone className="h-3 w-3" />
              <span>Call Desk</span>
            </a>
          </div>
        </div>
      </main>

      {/* Fast Service Request Modal (with Selected Items Summary + General Issue Box) */}
      <SimpleServiceModal
        isOpen={Boolean(selectedCategory)}
        onClose={() => {
          setSelectedCategory(null);
          setInitialPreset(undefined);
        }}
        category={selectedCategory}
        initialPreset={initialPreset}
        apartmentRef={session.apartmentRef}
        onSubmit={handleCreateRequest}
      />

      {/* Confirmation of Resolution Modal */}
      <ConfirmResolutionModal
        isOpen={Boolean(confirmModalRequest)}
        onClose={() => setConfirmModalRequest(null)}
        request={confirmModalRequest}
        onConfirm={handleConfirmResolution}
      />

      {/* Private Feedback Modal */}
      <PrivateFeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        onSubmit={handleFeedbackSubmit}
      />

      {/* Mobile Sticky Bottom Navigation (with Full Word Labels) */}
      <GuestBottomNav
        activeTab="home"
        activeRequestCount={activeRequests.length}
        onNavigateHome={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onNavigateRequests={() => navigate('/portal/requests')}
        onOpenFeedback={() => setFeedbackOpen(true)}
        onOpenContact={() => {
          window.location.href = `tel:${contact.frontDeskPhone.replace(/\s+/g, '')}`;
        }}
      />
    </div>
  );
};
