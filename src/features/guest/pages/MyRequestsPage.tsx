import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenService } from '@/lib/tokenService';
import { requestService } from '@/features/requests/requestService';
import { portalConfigService } from '@/features/config/portalConfigService';
import { PortalSession, GuestRequest } from '@/types/guestcare';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { RequestTimeline } from '../components/RequestTimeline';
import { ConfirmResolutionModal } from '../components/ConfirmResolutionModal';
import { PrivateFeedbackModal } from '../components/PrivateFeedbackModal';
import { GuestBottomNav } from '../components/GuestBottomNav';
import {
  ArrowLeft,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Package,
  Plus,
  Inbox,
} from 'lucide-react';
import { formatDate, formatTimeAgo } from '@/lib/utils';

type RequestFilter = 'all' | 'active' | 'completed';

export const MyRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<PortalSession | null>(null);
  const [requests, setRequests] = useState<GuestRequest[]>([]);
  const [filter, setFilter] = useState<RequestFilter>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [confirmModalRequest, setConfirmModalRequest] = useState<GuestRequest | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => {
    let activeReservationRef: string | null = null;

    async function load() {
      const activeToken = sessionStorage.getItem('guestcare_token');
      if (activeToken) {
        const res = await tokenService.validateToken(activeToken);
        if (res.valid && res.session) {
          activeReservationRef = res.session.reservationRef;
          setSession(res.session);
          setRequests(requestService.listRequests({ reservationRef: res.session.reservationRef }));
          return;
        }
      }

      // Support unit-based QR sessions (e.g., ?unit=2B) stored by GuestPortalPage
      const cachedSessionRaw = sessionStorage.getItem('guestcare_active_session');
      if (cachedSessionRaw) {
        try {
          const parsed = JSON.parse(cachedSessionRaw) as PortalSession;
          activeReservationRef = parsed.reservationRef;
          setSession(parsed);
          setRequests(requestService.listRequests({ reservationRef: parsed.reservationRef }));
          return;
        } catch {
          sessionStorage.removeItem('guestcare_active_session');
        }
      }

      navigate('/portal');
    }
    load();

    const unsubscribe = requestService.subscribe(() => {
      const ref = activeReservationRef || session?.reservationRef;
      if (ref) {
        setRequests(requestService.listRequests({ reservationRef: ref }));
      }
    });
    return () => unsubscribe();
  }, [navigate, session?.reservationRef]);

  const handleSendReply = async (requestId: string) => {
    const text = replyText[requestId];
    if (!text || !text.trim() || !session) return;

    await requestService.addComment({
      requestId,
      authorType: 'guest',
      authorName: session.guestName,
      content: text.trim(),
    });

    setReplyText(prev => ({ ...prev, [requestId]: '' }));
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

  const activeCount = requests.filter(r => !['closed', 'cancelled'].includes(r.status)).length;
  const completedCount = requests.length - activeCount;

  const visibleRequests = useMemo(() => {
    if (filter === 'active') {
      return requests.filter(r => !['closed', 'cancelled'].includes(r.status));
    }
    if (filter === 'completed') {
      return requests.filter(r => ['closed', 'cancelled'].includes(r.status));
    }
    return requests;
  }, [requests, filter]);

  const unitLabel = session?.apartmentRef.split(' - ')[0];

  return (
    <div className="porcelain-canvas min-h-[100dvh] text-slate-900 font-sans pb-28 md:pb-14 antialiased text-left">
      {/* Frosted Porcelain Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/65 bg-[#F6F8FA]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 sm:px-6 h-14 sm:h-16">
          <button
            type="button"
            onClick={() => navigate('/portal')}
            className="inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-slate-900/[0.07] hover:ring-[#0F4C40]/35 px-3 h-8 text-xs font-semibold text-slate-700 hover:text-[#0F4C40] shadow-[0_1px_2px_rgba(15,23,42,0.03)] active:scale-95 transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5 stroke-[2]" />
            <span>Back to Portal</span>
          </button>

          <div className="flex items-center gap-2">
            {unitLabel && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-slate-900/[0.06] px-2.5 py-1 text-[11px] font-medium text-slate-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>Apt {unitLabel}</span>
              </span>
            )}
            <span className="text-[11px] font-mono tabular-nums font-medium text-slate-400">
              {requests.length} total
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 pt-5 sm:pt-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-[-0.025em]">
              My Requests & History
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live progress updates, delivery tracking, and direct staff messaging
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/portal')}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-full bg-[#0F4C40] hover:bg-[#0B3B31] text-white px-4 h-9 text-xs font-semibold shadow-[0_2px_10px_-2px_rgba(15,76,64,0.4)] active:scale-95 transition-all"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.2]" />
            <span>New Request</span>
          </button>
        </div>

        {/* Segmented Filter Bar */}
        {requests.length > 0 && (
          <div className="inline-flex items-center gap-1 rounded-full bg-white ring-1 ring-slate-900/[0.06] p-1 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
            {[
              { id: 'all' as const, label: `All (${requests.length})` },
              { id: 'active' as const, label: `Active (${activeCount})` },
              { id: 'completed' as const, label: `Completed (${completedCount})` },
            ].map(tab => {
              const isSelected = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`rounded-full px-3.5 py-1.5 text-[11.5px] font-semibold tabular-nums transition-all ${
                    isSelected
                      ? 'bg-[#0F4C40] text-white shadow-[0_2px_8px_-2px_rgba(15,76,64,0.4)]'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {visibleRequests.length === 0 ? (
          <div className="bezel-shell rounded-[1.5rem] p-1.5">
            <div className="bezel-core rounded-[1.15rem] p-10 text-center space-y-3">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F2F7F5] text-[#0F4C40]">
                <Inbox className="h-5 w-5 stroke-[1.6]" />
              </div>
              <p className="text-sm font-semibold text-slate-900">
                {requests.length === 0 ? 'No requests submitted yet' : 'No requests in this view'}
              </p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Whenever you need housekeeping, extra towels, laundry, maintenance, or local delivery, tap below to send a request.
              </p>
              <button
                type="button"
                onClick={() => navigate('/portal')}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#0F4C40] hover:bg-[#0B3B31] text-white px-4 h-9 text-xs font-semibold active:scale-95 transition-all"
              >
                Browse Services
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleRequests.map(req => {
              const isExpanded = expandedId === req.id || visibleRequests.length === 1;
              const guestVisibleComments = (req.comments || []).filter(c => !c.isInternal);

              return (
                <div
                  key={req.id}
                  className={`overflow-hidden rounded-2xl bg-white border transition-all duration-200 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.1)] ${
                    req.status === 'resolved'
                      ? 'border-emerald-300/90 ring-1 ring-emerald-400/25'
                      : req.status === 'reopened'
                      ? 'border-rose-300/90 ring-1 ring-rose-400/25'
                      : 'border-slate-200/75'
                  }`}
                >
                  {/* Summary Header */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : req.id)}
                    className="p-4 sm:p-5 cursor-pointer hover:bg-[#FAFBFD] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={req.status} />
                        <PriorityBadge priority={req.priority} />
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                        {formatTimeAgo(req.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-[14px] sm:text-[15.5px] font-semibold tracking-[-0.015em] text-slate-900 leading-snug">
                      {req.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {req.description}
                    </p>

                    {/* Requested item pills */}
                    {req.requestedItems && req.requestedItems.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-slate-100">
                        {req.requestedItems.map((item, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#F2F7F5] ring-1 ring-[#0F4C40]/[0.08] px-2 py-0.5 text-[11px] font-semibold text-[#0F4C40] tabular-nums"
                          >
                            <Package className="h-3 w-3" />
                            <span>
                              {item.quantity}x {item.name}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs">
                      <span className="font-mono tabular-nums text-[11px] text-slate-400">
                        {req.ticketNumber}
                      </span>
                      <div className="inline-flex items-center gap-1 text-[#0F4C40] font-semibold text-[11.5px]">
                        <span>{isExpanded ? 'Hide Details' : 'Timeline & Messages'}</span>
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Resolution Prompt Banner */}
                  {req.status === 'resolved' && (
                    <div className="bg-emerald-50/75 px-4 sm:px-5 py-3.5 border-t border-b border-emerald-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-xs text-emerald-950">
                        <p className="font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>Staff marked this request as resolved.</span>
                        </p>
                        <p className="text-[11px] text-emerald-800/90 mt-0.5">
                          Please confirm if everything is completed to your satisfaction.
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="success"
                        className="text-xs shrink-0 font-semibold rounded-full px-4"
                        onClick={() => setConfirmModalRequest(req)}
                      >
                        Confirm or Reopen
                      </Button>
                    </div>
                  )}

                  {/* Reopened Alert */}
                  {req.status === 'reopened' && (
                    <div className="bg-rose-50/80 px-4 sm:px-5 py-3 border-t border-b border-rose-200/70 text-xs text-rose-900 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">Reopened by you.</span>
                        <p className="text-rose-700 text-[11px] mt-0.5">
                          {req.reopenReason || 'Priority escalation sent to duty manager.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Expanded Body (Timeline, Photos, Messaging) */}
                  {isExpanded && (
                    <div className="px-4 sm:px-5 pb-5 pt-4 border-t border-slate-100 space-y-5 bg-[#FAFBFD]">
                      {/* Attached photos */}
                      {req.attachments && req.attachments.length > 0 && (
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 mb-2">
                            Attached Photos ({req.attachments.length})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {req.attachments.map((att, idx) => (
                              <div
                                key={idx}
                                className="h-16 w-16 rounded-xl overflow-hidden ring-1 ring-slate-900/[0.08] bg-white"
                              >
                                <img
                                  src={
                                    att.filePath.startsWith('http') || att.filePath.startsWith('data:')
                                      ? att.filePath
                                      : 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=200&q=80'
                                  }
                                  alt={att.fileName}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Timeline */}
                      <RequestTimeline request={req} />

                      {/* Direct Staff Messaging */}
                      <div className="pt-4 border-t border-slate-200/70 space-y-3">
                        <h4 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-400 flex items-center gap-1.5">
                          <MessageSquare className="h-3.5 w-3.5 text-[#0F4C40]" />
                          <span>Direct Staff Messaging</span>
                        </h4>

                        {guestVisibleComments.length === 0 ? (
                          <p className="text-xs text-slate-400">
                            No messages yet. Send a quick note to the team below if needed.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {guestVisibleComments.map(c => {
                              const isGuest = c.authorType === 'guest';
                              return (
                                <div
                                  key={c.id}
                                  className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                                    isGuest
                                      ? 'bg-[#0F4C40] text-white ml-8 shadow-[0_4px_14px_-6px_rgba(15,76,64,0.45)]'
                                      : 'bg-white text-slate-800 ring-1 ring-slate-900/[0.06] mr-8 shadow-[0_1px_2px_rgba(15,23,42,0.03)]'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-2 mb-0.5">
                                    <span
                                      className={`text-[11px] font-semibold ${
                                        isGuest ? 'text-teal-200' : 'text-slate-900'
                                      }`}
                                    >
                                      {c.authorName}
                                    </span>
                                    <span
                                      className={`text-[10px] font-mono tabular-nums ${
                                        isGuest ? 'text-teal-200/75' : 'text-slate-400'
                                      }`}
                                    >
                                      {formatDate(c.createdAt)}
                                    </span>
                                  </div>
                                  <p>{c.content}</p>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Reply input */}
                        {req.status !== 'closed' && (
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="text"
                              placeholder="Write a message to staff..."
                              value={replyText[req.id] || ''}
                              onChange={e =>
                                setReplyText(prev => ({ ...prev, [req.id]: e.target.value }))
                              }
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleSendReply(req.id);
                              }}
                              className="flex-1 rounded-full bg-white ring-1 ring-slate-900/[0.08] px-4 h-9 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-[#0F4C40]/40 focus:outline-none transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => handleSendReply(req.id)}
                              disabled={!replyText[req.id]?.trim()}
                              aria-label="Send message"
                              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0F4C40] hover:bg-[#0B3B31] text-white disabled:opacity-35 active:scale-95 transition-all"
                            >
                              <Send className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
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

      {/* Floating Glass Island Mobile Dock */}
      <GuestBottomNav
        activeTab="requests"
        activeRequestCount={activeCount}
        onNavigateHome={() => navigate('/portal')}
        onNavigateRequests={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onOpenFeedback={() => setFeedbackOpen(true)}
        onOpenContact={() => {
          const phone = portalConfigService.getContact().frontDeskPhone;
          window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
        }}
      />
    </div>
  );
};
