import React, { useState } from 'react';
import { GuestRequest, Department, RequestStatus } from '@/types/guestcare';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import {
  X,
  User,
  Building,
  Clock,
  CheckCircle,
  AlertTriangle,
  Send,
  Lock,
  MessageSquare,
  History,
  Paperclip,
} from 'lucide-react';
import { formatDate, formatTimeAgo } from '@/lib/utils';

interface RequestDetailDrawerProps {
  request: GuestRequest | null;
  onClose: () => void;
  onOpenAssign: (req: GuestRequest) => void;
  onOpenStatusChange: (req: GuestRequest) => void;
  onAddComment: (params: {
    requestId: string;
    content: string;
    isInternal: boolean;
  }) => Promise<void>;
}

export const RequestDetailDrawer: React.FC<RequestDetailDrawerProps> = ({
  request,
  onClose,
  onOpenAssign,
  onOpenStatusChange,
  onAddComment,
}) => {
  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal] = useState(true);
  const [loadingComment, setLoadingComment] = useState(false);

  if (!request) return null;

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setLoadingComment(true);
    try {
      await onAddComment({
        requestId: request.id,
        content: commentText.trim(),
        isInternal,
      });
      setCommentText('');
    } catch (err: any) {
      alert(err.message || 'Failed to post comment.');
    } finally {
      setLoadingComment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div
        className="fixed inset-0 transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white shadow-2xl z-10 flex flex-col h-full overflow-hidden text-left">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-500">{request.ticketNumber}</span>
              <StatusBadge status={request.status} />
              <PriorityBadge priority={request.priority} />
            </div>
            <h2 className="text-base font-bold text-slate-900 mt-1 line-clamp-1">{request.title}</h2>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => onOpenAssign(request)}>
              Assign
            </Button>
            <Button size="sm" onClick={() => onOpenStatusChange(request)}>
              Update Status
            </Button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors ml-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Reopen Warning Banner */}
          {request.status === 'reopened' && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900 space-y-1">
              <div className="flex items-center gap-2 font-bold text-rose-700">
                <AlertTriangle className="h-4 w-4" />
                <span>REOPENED BY GUEST (Count: {request.reopenCount})</span>
              </div>
              <p className="text-rose-800">
                <strong>Reason given:</strong> {request.reopenReason}
              </p>
            </div>
          )}

          {/* Guest Satisfaction Pill */}
          {request.guestSatisfaction && (
            <div
              className={`rounded-xl p-3 text-xs flex items-center gap-2 ${
                request.guestSatisfaction === 'satisfied'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>
                Guest Confirmation: <strong>{request.guestSatisfaction.toUpperCase()}</strong>{' '}
                at {formatDate(request.guestConfirmedAt)}
              </span>
            </div>
          )}

          {/* Metadata Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 text-xs">
            <div>
              <span className="text-slate-400 font-medium">Apartment</span>
              <p className="font-semibold text-slate-800 truncate mt-0.5">{request.apartmentRef}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Guest Name</span>
              <p className="font-semibold text-slate-800 truncate mt-0.5">{request.guestName}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Department</span>
              <p className="font-semibold text-slate-800 capitalize mt-0.5">{request.assignedDepartment}</p>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Assigned To</span>
              <p className="font-semibold text-slate-800 truncate mt-0.5">
                {request.assignedStaffName || 'Unassigned'}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Request Description</h3>
            <p className="text-sm text-slate-800 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
              {request.description}
            </p>
          </div>

          {/* Photos */}
          {request.attachments && request.attachments.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Paperclip className="h-3.5 w-3.5" />
                <span>Attachments ({request.attachments.length})</span>
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {request.attachments.map((att, i) => (
                  <div key={i} className="h-20 w-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs">
                    <img
                      src={att.filePath.startsWith('http') || att.filePath.startsWith('data:') ? att.filePath : 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80'}
                      alt={att.fileName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resolution notes */}
          {request.resolutionNotes && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-1 text-xs">
              <span className="font-bold text-emerald-900 uppercase tracking-wider text-[10px]">
                Resolution Report ({formatDate(request.resolvedAt)})
              </span>
              <p className="text-emerald-950 text-sm mt-0.5 leading-relaxed">{request.resolutionNotes}</p>
            </div>
          )}

          {/* Timeline & Status Audit History */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <History className="h-3.5 w-3.5" />
              <span>Audit Trail & State Transitions</span>
            </h3>

            <div className="relative pl-5 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 text-xs">
              {(request.statusHistory || []).map((h, i) => (
                <div key={i} className="relative flex items-start gap-2.5">
                  <div className="absolute -left-5 mt-1 h-2.5 w-2.5 rounded-full bg-teal-600 ring-2 ring-white" />
                  <div className="flex-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">
                        {h.fromStatus ? `${h.fromStatus} → ${h.toStatus}` : `Created as ${h.toStatus}`}
                      </span>
                      <span className="text-[11px] text-slate-400">{formatDate(h.createdAt)}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      By <strong>{h.changedByName}</strong> ({h.changedByType})
                      {h.changeReason ? ` — ${h.changeReason}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Collaboration & Guest Messaging */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Communications Thread</span>
            </h3>

            <div className="space-y-2">
              {(request.comments || []).length === 0 ? (
                <p className="text-xs text-slate-400 italic">No notes or messages posted yet.</p>
              ) : (
                (request.comments || []).map(c => (
                  <div
                    key={c.id}
                    className={`rounded-xl p-3 text-xs border ${
                      c.isInternal
                        ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                        : c.authorType === 'guest'
                        ? 'bg-teal-50 border-teal-200 text-teal-950'
                        : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-semibold">
                        {c.isInternal && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-amber-200/80 px-1.5 py-0.2 text-[10px] text-amber-900 font-bold uppercase">
                            <Lock className="h-2.5 w-2.5" /> Internal Staff Note
                          </span>
                        )}
                        <span>{c.authorName}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({c.authorType})</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{formatDate(c.createdAt)}</span>
                    </div>
                    <p className="leading-relaxed">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Post note form */}
            <form onSubmit={handleSendComment} className="space-y-2 pt-2">
              <Textarea
                placeholder={isInternal ? 'Add private internal team note...' : 'Send message visible to guest in their portal...'}
                rows={2}
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    id="internal-toggle"
                    type="checkbox"
                    checked={isInternal}
                    onChange={e => setIsInternal(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="internal-toggle" className="text-xs text-slate-600 cursor-pointer flex items-center gap-1">
                    <Lock className="h-3 w-3 text-amber-600" />
                    <span>Internal Staff Only (Hidden from guest)</span>
                  </label>
                </div>

                <Button size="sm" type="submit" loading={loadingComment} disabled={!commentText.trim()} className="text-xs">
                  <Send className="h-3 w-3 mr-1" />
                  Post
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

