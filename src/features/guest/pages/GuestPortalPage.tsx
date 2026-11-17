import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { tokenService } from '@/lib/tokenService';
import { requestService } from '@/features/requests/requestService';
import { PortalSession, Category, GuestRequest } from '@/types/guestcare';
import { StayPassportCard } from '../components/StayPassportCard';
import { ServiceGrid } from '../components/ServiceGrid';
import { DetailedServiceModal } from '../components/DetailedServiceModal';
import { ConfirmResolutionModal } from '../components/ConfirmResolutionModal';
import { PrivateFeedbackModal } from '../components/PrivateFeedbackModal';
import { ReceptionContactBar } from '../components/ReceptionContactBar';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  ListChecks,
  MessageSquareHeart,
  AlertCircle,
  ChevronRight,
  Clock,
  Sparkles,
  CheckCircle2,
  Wifi,
  Coffee,
  KeyRound,
  ShieldCheck,
  Compass,
  Building,
  Info,
} from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils';

export const GuestPortalPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenParam = searchParams.get('token');

  const [session, setSession] = useState<PortalSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [myRequests, setMyRequests] = useState<GuestRequest[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const [activeTab, setActiveTab] = useState<'services' | 'amenities'>('services');
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [confirmModalRequest, setConfirmModalRequest] = useState<GuestRequest | null>(null);

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
        } catch (e: any) {
          setAuthError('No valid QR access token found. Please scan the QR code in your apartment.');
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

  // Load data & subscribe to real-time updates
  useEffect(() => {
    if (!session) return;

    const loadData = () => {
      setCategories(requestService.getCategories());
      setMyRequests(requestService.listRequests({ reservationRef: session.reservationRef }));
    };

    loadData();
    const unsubscribe = requestService.subscribe(loadData);
    return () => unsubscribe();
  }, [session]);

  const handleCreateRequest = async (data: {
    categoryId: string;
    subcategoryId?: string;
    subcategoryName?: string;
    title: string;
    description: string;
    priority?: any;
    requestedItems?: any[];
    preferredTimeWindow?: string;
    roomAccessPermission?: boolean;
    attachments: any[];
  }) => {
    if (!session) return;
    await requestService.createRequest({
      reservationRef: session.reservationRef,
      apartmentRef: session.apartmentRef,
      guestName: session.guestName,
      categoryId: data.categoryId,
      subcategoryId: data.subcategoryId,
      subcategoryName: data.subcategoryName,
      title: data.title,
      description: data.description,
      priority: data.priority,
      requestedItems: data.requestedItems,
      preferredTimeWindow: data.preferredTimeWindow,
      roomAccessPermission: data.roomAccessPermission,
      attachments: data.attachments,
    });
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

  // Quick preset shortcuts
  const openCategoryByCode = (code: string) => {
    const cat = categories.find(c => c.code === code);
    if (cat) setSelectedCategory(cat);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-[#FAF8F5]">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0D3B36] border-t-transparent" />
          <p className="font-serif text-sm font-semibold text-[#0D3B36]">Verifying Residence Access...</p>
        </div>
      </div>
    );
  }

  if (authError || !session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-[#FAF8F5] text-center">
        <div className="max-w-md w-full rounded-3xl bg-white p-7 shadow-lg border border-slate-200/90 space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="font-serif text-xl font-bold text-slate-900">Access Restricted</h2>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">{authError}</p>
          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                sessionStorage.removeItem('guestcare_token');
                window.location.href = '/';
              }}
            >
              Return Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const activeRequests = myRequests.filter(r => !['closed', 'cancelled'].includes(r.status));
  const resolvedPendingConfirmation = myRequests.filter(r => r.status === 'resolved');

  return (
    <div className="min-h-screen bg-[#F8F7F4] pb-24 text-slate-900 font-sans selection:bg-[#0D3B36] selection:text-white">
      {/* Mobile-first centered container */}
      <div className="mx-auto max-w-xl px-4 py-4 md:py-6 space-y-5">
        {/* Top Hospitality Header */}
        <header className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0D3B36] text-white font-serif font-bold text-sm shadow-xs">
              GM
            </span>
            <div className="text-left">
              <span className="font-serif font-bold text-slate-900 text-sm tracking-tight block leading-tight">
                Grand Marina
              </span>
              <span className="text-[10px] text-slate-400 font-sans uppercase tracking-wider block">
                Digital Concierge
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/portal/requests')}
              className="relative inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 transition-all"
            >
              <ListChecks className="h-3.5 w-3.5 text-teal-800" />
              <span>My Requests</span>
              {myRequests.length > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-800 text-[10px] font-bold text-white ml-0.5">
                  {myRequests.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* 1. Stay Passport Card (Hero) */}
        <StayPassportCard session={session} />

        {/* 2. Quick Concierge Shortcuts (Horizontal Scroll) */}
        <div className="space-y-1.5 text-left">
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-semibold px-1">
            Express Requests
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
            <button
              onClick={() => openCategoryByCode('housekeeping')}
              className="flex items-center gap-1.5 shrink-0 rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 border border-slate-200/90 shadow-2xs hover:border-teal-600 active:scale-95 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5 text-teal-700" />
              <span>Towels & Linens</span>
            </button>

            <button
              onClick={() => openCategoryByCode('guest_services')}
              className="flex items-center gap-1.5 shrink-0 rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 border border-slate-200/90 shadow-2xs hover:border-amber-600 active:scale-95 transition-all"
            >
              <Clock className="h-3.5 w-3.5 text-[#9C7A4E]" />
              <span>Late Checkout</span>
            </button>

            <button
              onClick={() => openCategoryByCode('comfort')}
              className="flex items-center gap-1.5 shrink-0 rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 border border-slate-200/90 shadow-2xs hover:border-indigo-600 active:scale-95 transition-all"
            >
              <Coffee className="h-3.5 w-3.5 text-indigo-700" />
              <span>Pillows & Comfort</span>
            </button>

            <button
              onClick={() => setFeedbackOpen(true)}
              className="flex items-center gap-1.5 shrink-0 rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 border border-slate-200/90 shadow-2xs hover:border-rose-400 active:scale-95 transition-all"
            >
              <MessageSquareHeart className="h-3.5 w-3.5 text-rose-500" />
              <span>Private Feedback</span>
            </button>
          </div>
        </div>

        {/* 3. Action Alert: Guest Confirmation Required */}
        {resolvedPendingConfirmation.length > 0 && (
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50/90 p-4 text-left shadow-sm space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                <span>Service Marked Completed by Staff</span>
              </div>
              <span className="rounded-full bg-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-emerald-900 uppercase">
                Action Required
              </span>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed font-sans">
              Our team has attended to "<strong>{resolvedPendingConfirmation[0].title}</strong>". Has everything been resolved to your satisfaction?
            </p>
            <Button
              size="sm"
              variant="success"
              className="w-full text-xs font-semibold py-2.5"
              onClick={() => setConfirmModalRequest(resolvedPendingConfirmation[0])}
            >
              Confirm Satisfaction or Reopen Ticket
            </Button>
          </div>
        )}

        {/* 4. Active In-Progress Requests Tracker */}
        {activeRequests.length > 0 && resolvedPendingConfirmation.length === 0 && (
          <div
            onClick={() => navigate('/portal/requests')}
            className="flex items-center justify-between rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50 to-amber-100/50 p-4 text-left shadow-xs cursor-pointer hover:border-amber-300 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-200 text-amber-900 shadow-2xs">
                <Clock className="h-5 w-5 animate-spin" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-amber-950">
                    {activeRequests.length} Active Request in progress
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 font-medium truncate max-w-[220px]">
                  {activeRequests[0].title}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-amber-900">
              <span>View Timeline</span>
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        )}

        {/* 5. Navigation Tab Switcher (Services vs Residence Guide) */}
        <div className="flex items-center rounded-2xl bg-slate-200/60 p-1 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('services')}
            className={`flex-1 rounded-xl py-2 text-center transition-all ${
              activeTab === 'services'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            Services & Requests
          </button>
          <button
            onClick={() => setActiveTab('amenities')}
            className={`flex-1 rounded-xl py-2 text-center transition-all ${
              activeTab === 'amenities'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            Apartment Guide & Tips
          </button>
        </div>

        {/* Tab 1: Services Grid */}
        {activeTab === 'services' && (
          <ServiceGrid
            categories={categories}
            onSelectCategory={cat => setSelectedCategory(cat)}
          />
        )}

        {/* Tab 2: Residence Guide & Amenities */}
        {activeTab === 'amenities' && (
          <div className="space-y-3 text-left animate-fadeIn">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-serif text-lg font-bold text-slate-900">
                Residence Essentials
              </h2>
              <span className="text-xs text-slate-400">Useful stay information</span>
            </div>

            <div className="space-y-2.5">
              <Card className="p-4 bg-white space-y-1">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Clock className="h-4 w-4 text-[#9C7A4E]" />
                  <span>Pool, Sun Deck & Wellness Spa</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Located on the 5th floor rooftop. Open daily from 6:30 AM to 10:00 PM. Complimentary towels and chilled water provided poolside.
                </p>
              </Card>

              <Card className="p-4 bg-white space-y-1">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Sparkles className="h-4 w-4 text-teal-700" />
                  <span>Fitness Center</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Accessible 24/7 with your room keycard on Level 2. Equipped with Technogym treadmills, free weights, and Peloton bikes.
                </p>
              </Card>

              <Card className="p-4 bg-white space-y-1">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Building className="h-4 w-4 text-indigo-700" />
                  <span>Trash & Recycling Chute</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Refuse chutes are located in the service foyer next to the main elevators on every residential floor. Alternatively, request collection via Housekeeping.
                </p>
              </Card>

              <Card className="p-4 bg-white space-y-1">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Compass className="h-4 w-4 text-amber-600" />
                  <span>Grocery & Pharmacy Delivery</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Deliveries may be addressed to reception: <em>"Grand Marina Residences, Apt {session.apartmentRef.split(' - ')[0]}"</em>. Our team will bring parcels directly to your door.
                </p>
              </Card>
            </div>
          </div>
        )}

        {/* 6. Private In-Stay Feedback Card */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 text-left shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5 pr-2">
            <span className="text-[10px] uppercase font-mono tracking-wider text-rose-600 font-bold">
              Direct to Management
            </span>
            <h3 className="font-serif text-sm font-bold text-slate-900">Private Feedback</h3>
            <p className="text-xs text-slate-500">Rate your stay or suggest improvements while you are here</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFeedbackOpen(true)}
            className="shrink-0 text-xs gap-1.5 border-slate-300 hover:border-rose-400"
          >
            <MessageSquareHeart className="h-3.5 w-3.5 text-rose-500" />
            <span>Rate Stay</span>
          </Button>
        </div>

        {/* 7. Immediate Reception & Concierge Contact Bar */}
        <ReceptionContactBar apartmentRef={session.apartmentRef} />
      </div>

      {/* Upgraded Detailed Service Request Modal */}
      <DetailedServiceModal
        isOpen={Boolean(selectedCategory)}
        onClose={() => setSelectedCategory(null)}
        category={selectedCategory}
        onSubmit={handleCreateRequest}
      />

      {/* Confirmation of Resolution Modal */}
      <ConfirmResolutionModal
        isOpen={Boolean(confirmModalRequest)}
        onClose={() => setConfirmModalRequest(null)}
        request={confirmModalRequest}
        onConfirm={handleConfirmResolution}
      />

      {/* Private In-Stay Feedback Modal */}
      <PrivateFeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        onSubmit={handleFeedbackSubmit}
      />
    </div>
  );
};
