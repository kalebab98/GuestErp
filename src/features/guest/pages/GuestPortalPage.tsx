import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { tokenService } from '@/lib/tokenService';
import { requestService } from '@/features/requests/requestService';
import { portalConfigService, WifiConfig, ContactAndBuildingConfig } from '@/features/config/portalConfigService';
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
} from 'lucide-react';

export const GuestPortalPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenParam = searchParams.get('token');

  const [session, setSession] = useState<PortalSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [myRequests, setMyRequests] = useState<GuestRequest[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [providers, setProviders] = useState<LocalServiceProvider[]>([]);
  const [wifi, setWifi] = useState<WifiConfig>(portalConfigService.getWifi());
  const [contact, setContact] = useState<ContactAndBuildingConfig>(portalConfigService.getContact());

  const [searchQuery, setSearchQuery] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(true);

  // Modals
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [initialPreset, setInitialPreset] = useState<string | undefined>(undefined);
  const [confirmModalRequest, setConfirmModalRequest] = useState<GuestRequest | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [wifiCopied, setWifiCopied] = useState(false);

  // Validate token on mount
  useEffect(() => {
    async function initSession() {
      setLoading(true);
      setAuthError(null);

      let activeToken = tokenParam;
      if (!activeToken) {
        activeToken = sessionStorage.getItem('guestcare_token');
      }

      if (!activeToken) {
        try {
          const generated = await tokenService.createPortalSession('RES-89211');
          activeToken = generated.rawToken;
          sessionStorage.setItem('guestcare_token', activeToken);
        } catch {
          setAuthError('No active room pass found. Please scan the QR code located in your apartment.');
          setLoading(false);
          return;
        }
      }

      const res = await tokenService.validateToken(activeToken);
      if (res.valid && res.session) {
        setSession(res.session);
        sessionStorage.setItem('guestcare_token', activeToken);
      } else {
        setAuthError(res.error || 'Access pass could not be verified.');
      }
      setLoading(false);
    }

    initSession();
  }, [tokenParam]);

  // Load live data & subscribe to both requestService and staff portalConfigService
  useEffect(() => {
    if (!session) return;

    const loadData = () => {
      setCategories(requestService.getCategories());
      setMyRequests(requestService.listRequests({ reservationRef: session.reservationRef }));
      setFaqs(portalConfigService.getFaqs(true));
      setProviders(portalConfigService.getProviders(true));
      setWifi(portalConfigService.getWifi());
      setContact(portalConfigService.getContact());
    };

    loadData();
    const unsubReq = requestService.subscribe(loadData);
    const unsubCfg = portalConfigService.subscribe(loadData);
    return () => {
      unsubReq();
      unsubCfg();
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
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-[#11574A] border-t-transparent" />
          <p className="text-sm font-medium text-slate-600">Loading your stay portal...</p>
        </div>
      </div>
    );
  }

  if (authError || !session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 text-center">
        <div className="max-w-md w-full rounded-2xl bg-white p-7 shadow-sm border border-slate-200 space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
          <p className="text-xs text-slate-600 leading-relaxed">{authError}</p>
          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full text-xs"
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
    );
  }

  const activeRequests = myRequests.filter(r => !['closed', 'cancelled'].includes(r.status));
  const resolvedPendingConfirmation = myRequests.filter(r => r.status === 'resolved');
  const unitLabel = session.apartmentRef.split(' - ')[0];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans pb-24 md:pb-12 antialiased">
      {/* Top Navigation Bar: Responsive (Mobile + Tablet + PC) */}
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6 py-3">
          {/* Brand Logo + FULL WORD ALWAYS SHOWN ON MOBILE, TABLET & PC */}
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#11574A] text-white font-black text-xs tracking-wider shadow-xs">
              GC
            </span>
            <div className="text-left leading-tight">
              <span className="block text-sm sm:text-base font-extrabold tracking-tight text-slate-900">
                GuestCare
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <MapPin className="h-3 w-3 text-[#11574A]" />
                <span>Apt {unitLabel}</span>
              </span>
            </div>
          </div>

          {/* Desktop / Tablet Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <button
              onClick={() => navigate('/portal/requests')}
              className="inline-flex items-center gap-1.5 hover:text-[#11574A] transition-colors"
            >
              <ClipboardList className="h-4 w-4 text-[#11574A]" />
              <span>My Requests</span>
              {myRequests.length > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#11574A] px-1 text-[10px] text-white">
                  {myRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setFeedbackOpen(true)}
              className="inline-flex items-center gap-1.5 hover:text-[#11574A] transition-colors"
            >
              <MessageSquareHeart className="h-4 w-4 text-rose-500" />
              <span>Private Feedback</span>
            </button>
          </div>

          {/* Direct Call Front Desk */}
          <div className="flex items-center gap-2">
            <a
              href={`tel:${contact.frontDeskPhone.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#F0F7F5] px-3.5 py-2 text-xs font-semibold text-[#11574A] hover:bg-[#E2F0EC] transition-colors"
              title="Call Front Desk"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>Front Desk</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area (Responsive: Mobile -> Tablet -> PC max-w-6xl) */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 pt-5 sm:pt-7 space-y-6 sm:space-y-8 text-left">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search for a service or item (e.g. towels, laundry, coffee, wifi)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl bg-[#F6F8F8] pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 border border-transparent focus:border-[#11574A]/40 focus:bg-white focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Hero Card + Directly Visible Wi-Fi Password Box */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F4F43] via-[#11574A] to-[#156758] p-5 sm:p-7 md:p-8 text-white shadow-lg">
          <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-black/10 pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            {/* Left: Welcome Headline */}
            <div className="lg:col-span-7 space-y-2.5">
              <span className="inline-block text-[10px] sm:text-xs font-mono font-semibold uppercase tracking-widest text-teal-200">
                Welcome, {session.guestName} • Apt {unitLabel}
              </span>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
                YOUR COMFORT, ONE TAP AWAY!
              </h1>
              <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed font-light max-w-lg">
                Request housekeeping, laundry, maintenance, or order coffee, food, and everyday essentials right to your door.
              </p>
              <div className="pt-1">
                <Button
                  onClick={() => {
                    const target = document.getElementById('service-categories-section');
                    target?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-white text-[#11574A] hover:bg-teal-50 font-bold text-xs sm:text-sm rounded-xl px-5 py-2.5 shadow-sm"
                >
                  Explore Services
                </Button>
              </div>
            </div>

            {/* Right: Directly Visible Apartment Wi-Fi & Password Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-black/20 backdrop-blur-md border border-white/15 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 text-teal-200">
                      <Wifi className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider text-teal-200 font-semibold">
                        Apartment Wi-Fi
                      </span>
                      <span className="block text-sm font-bold text-white font-mono">
                        {wifi.networkName}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyWifi}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-[#11574A] hover:bg-teal-50 active:scale-95 transition-all shadow-xs"
                  >
                    {wifiCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-black/25 px-3.5 py-2 border border-white/10">
                  <span className="text-[11px] text-teal-200 font-medium">Password</span>
                  <span className="font-mono text-sm font-bold tracking-wider text-white select-all">
                    {wifi.password}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Banner: Guest Confirmation Pending */}
        {resolvedPendingConfirmation.length > 0 && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50/90 p-4 sm:p-5 text-left shadow-xs space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs sm:text-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Service Marked Completed by Staff</span>
              </div>
              <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-900 uppercase">
                Action Required
              </span>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed">
              Our team has marked "<strong>{resolvedPendingConfirmation[0].title}</strong>" as resolved. Was this completed to your full satisfaction?
            </p>
            <Button
              size="sm"
              variant="success"
              className="w-full text-xs font-semibold py-2"
              onClick={() => setConfirmModalRequest(resolvedPendingConfirmation[0])}
            >
              Confirm Satisfaction or Reopen Ticket
            </Button>
          </div>
        )}

        {/* Active In-Progress Banner */}
        {activeRequests.length > 0 && resolvedPendingConfirmation.length === 0 && (
          <div
            onClick={() => navigate('/portal/requests')}
            className="flex items-center justify-between rounded-2xl bg-[#FFFDF7] border border-amber-200/90 p-3.5 sm:p-4 cursor-pointer hover:border-amber-300 transition-colors shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-900">
                <Clock className="h-4 w-4 animate-spin" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-950">
                  {activeRequests.length} Active Request in progress
                </p>
                <p className="text-[11px] text-amber-800 truncate max-w-[220px] sm:max-w-md">
                  {activeRequests[0].title}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#11574A] hover:underline shrink-0">
              Track Status &rarr;
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

        {/* Section 2: Popular Requests */}
        {!searchQuery && <PopularServicesRow onSelectPopular={handleSelectPopular} />}

        {/* Section 3: ONE Unified Local Shops, Food & Ethiopia Ride Directory Card */}
        {!searchQuery && (
          <LocalProvidersSection
            providers={providers}
            apartmentRef={session.apartmentRef}
            onOrderViaDesk={handleOrderViaDesk}
          />
        )}

        {/* Section 4: Frequently Asked Questions (Staff Editable) */}
        {!searchQuery && <GuestFAQSection faqs={faqs} />}

        {/* Section 5: Feedback & 24/7 Front Desk */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white p-4 shadow-2xs">
            <div className="space-y-0.5 pr-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-500">
                Direct to Management
              </span>
              <h3 className="text-sm font-bold text-slate-900">Private Feedback</h3>
              <p className="text-xs text-slate-500">Share your thoughts before checkout</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setFeedbackOpen(true)}
              className="text-xs border-slate-200 hover:border-rose-400 shrink-0"
            >
              Rate Stay
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white p-4 shadow-2xs">
            <div className="space-y-0.5 pr-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#11574A]">
                24/7 Front Desk
              </span>
              <h3 className="text-sm font-bold text-slate-900">Need Immediate Help?</h3>
              <p className="text-xs text-slate-500 font-mono">{contact.frontDeskPhone}</p>
            </div>
            <a
              href={`tel:${contact.frontDeskPhone.replace(/\s+/g, '')}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#11574A] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#0D443A] transition-colors shrink-0"
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
