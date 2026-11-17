import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenService } from '@/lib/tokenService';
import { requestService } from '@/features/requests/requestService';
import { PortalSession, GuestRequest } from '@/types/guestcare';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RequestTimeline } from '../components/RequestTimeline';
import { ConfirmResolutionModal } from '../components/ConfirmResolutionModal';
import {
  ArrowLeft,
  MessageSquare,
  Paperclip,
  Send,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  KeyRound,
  Package,
} from 'lucide-react';
import { formatDate, formatTimeAgo } from '@/lib/utils';

export const MyRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<PortalSession | null>(null);
  const [requests, setRequests] = useState<GuestRequest[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [confirmModalRequest, setConfirmModalRequest] = useState<GuestRequest | null>(null);

  useEffect(() => {
    async function load() {
      const activeToken = sessionStorage.getItem('guestcare_token');
      if (!activeToken) {
        navigate('/portal');
        return;
      }
      const res = await tokenService.validateToken(activeToken);
      if (res.valid && res.session) {
        setSession(res.session);
        setRequests(requestService.listRequests({ reservationRef: res.session.reservationRef }));
      } else {
        navigate('/portal');
      }
    }
    load();

    const unsubscribe = requestService.subscribe(() => {
      if (session) {
        setRequests(requestService.listRequests({ reservationRef: session.reservationRef }));
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

  return (
    <div className="min-h-screen bg-[#F8F7F4] pb-24 text-slate-900 font-sans selection:bg-[#0D3B36] selection:text-white">
      <div className="mx-auto max-w-xl px-4 py-4 md:py-6 space-y-4 text-left">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/portal')}
            className="text-xs text-slate-700 gap-1.5 -ml-2 hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Portal</span>
          </Button>

          <span className="font-mono text-xs font-semibold text-slate-500">
            {requests.length} Request{requests.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#9C7A4E] font-semibold">
            Track In-Stay Requests
          </span>
          <h1 className="font-serif text-xl font-bold text-slate-900 leading-tight">
            My Service History & Timeline
          </h1>
          <p className="text-xs text-slate-500 font-sans mt-0.5">
            Real-time status, dispatch notes, and 2-way resolution confirmations
          </p>
        </div>

        {requests.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center space-y-3 shadow-2xs">
            <p className="font-serif text-base font-bold text-slate-800">No requests submitted yet</p>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              If you need extra towels, climate adjustments, tech assistance, or room maintenance, our team is standing by.
            </p>
            <Button size="sm" onClick={() => navigate('/portal')} className="bg-[#0D3B36] text-white">
              Browse Available Services
            </Button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {requests.map(req => {
              const isExpanded = expandedId === req.id || requests.length === 1;
              const guestVisibleComments = (req.comments || []).filter(c => !c.isInternal);

              return (
                <Card
                  key={req.id}
                  className={`overflow-hidden rounded-2xl transition-all shadow-2xs ${
                    req.status === 'resolved'
                      ? 'border-emerald-300 ring-2 ring-emerald-400/30'
                      : req.status === 'reopened'
                      ? 'border-rose-300 ring-2 ring-rose-400/30'
                      : 'border-slate-200/90'
                  }`}
                >
                  {/* Card Header / Summary */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : req.id)}
                    className="p-4 cursor-pointer hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={req.status} />
                        <PriorityBadge priority={req.priority} />
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {formatTimeAgo(req.createdAt)}
                      </span>
                    </div>

                    <h3 className="font-serif text-base font-bold text-slate-900 mt-1">{req.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed font-sans">{req.description}</p>

                    {/* Structured Item Chips (if any) */}
                    {req.requestedItems && req.requestedItems.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-slate-100">
                        {req.requestedItems.map((item, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-900 border border-teal-200/60"
                          >
                            <Package className="h-3 w-3 text-teal-700" />
                            <span>{item.quantity}x {item.name}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 text-xs text-slate-500">
                      <span className="font-mono text-[11px] font-bold text-slate-600">{req.ticketNumber}</span>
                      <div className="flex items-center gap-1 text-[#0D3B36] font-semibold text-xs">
                        <span>{isExpanded ? 'Hide Details' : 'View Timeline & Notes'}</span>
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </div>
                    </div>
                  </div>

                  {/* Resolution Prompt Banner */}
                  {req.status === 'resolved' && (
                    <div className="bg-emerald-50 px-4 py-3.5 border-t border-b border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="text-xs text-emerald-950">
                        <p className="font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span>Staff marked this request as resolved.</span>
                        </p>
                        <p className="text-[11px] text-emerald-800 mt-0.5">Please confirm if everything is working to your satisfaction.</p>
                      </div>
                      <Button
                        size="sm"
                        variant="success"
                        className="text-xs shrink-0 font-semibold px-4"
                        onClick={() => setConfirmModalRequest(req)}
                      >
                        Confirm or Reopen
                      </Button>
                    </div>
                  )}

                  {/* Reopened Alert */}
                  {req.status === 'reopened' && (
                    <div className="bg-rose-50 px-4 py-3 border-t border-b border-rose-200 text-xs text-rose-900 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Reopened by you.</span>
                        <p className="text-rose-700 text-[11px] mt-0.5">
                          {req.reopenReason || 'Priority escalation sent to duty manager.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Expanded Body */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-4 bg-slate-50/50">
                      {/* Attached photos */}
                      {req.attachments && req.attachments.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                            Attached Photos ({req.attachments.length})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {req.attachments.map((att, idx) => (
                              <div
                                key={idx}
                                className="h-16 w-16 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-2xs"
                              >
                                <img
                                  src={att.filePath.startsWith('http') || att.filePath.startsWith('data:') ? att.filePath : 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=200&q=80'}
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

                      {/* Conversation thread */}
                      <div className="pt-2 border-t border-slate-200/80 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>Direct Staff Messaging</span>
                        </h4>

                        {guestVisibleComments.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No notes posted yet. Send a message below if needed.</p>
                        ) : (
                          <div className="space-y-2">
                            {guestVisibleComments.map(c => {
                              const isGuest = c.authorType === 'guest';
                              return (
                                <div
                                  key={c.id}
                                  className={`rounded-2xl p-3 text-xs leading-relaxed ${
                                    isGuest
                                      ? 'bg-[#0D3B36] text-white ml-6 shadow-xs'
                                      : 'bg-white text-slate-800 border border-slate-200 mr-6 shadow-2xs'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className={`font-semibold ${isGuest ? 'text-teal-200' : 'text-slate-900'}`}>
                                      {c.authorName}
                                    </span>
                                    <span className={`text-[10px] ${isGuest ? 'text-teal-300/80' : 'text-slate-400'}`}>
                                      {formatDate(c.createdAt)}
                                    </span>
                                  </div>
                                  <p>{c.content}</p>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Reply box */}
                        {req.status !== 'closed' && (
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="text"
                              placeholder="Write a message to attending staff..."
                              value={replyText[req.id] || ''}
                              onChange={e =>
                                setReplyText(prev => ({ ...prev, [req.id]: e.target.value }))
                              }
                              onKeyDown={e => {
                                if (e.key === 'Enter') handleSendReply(req.id);
                              }}
                              className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-700 focus:outline-none focus:ring-1 focus:ring-teal-700"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleSendReply(req.id)}
                              disabled={!replyText[req.id]?.trim()}
                              className="bg-[#0D3B36] text-white text-xs px-3"
                            >
                              <Send className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmResolutionModal
        isOpen={Boolean(confirmModalRequest)}
        onClose={() => setConfirmModalRequest(null)}
        request={confirmModalRequest}
        onConfirm={handleConfirmResolution}
      />
    </div>
  );
};
