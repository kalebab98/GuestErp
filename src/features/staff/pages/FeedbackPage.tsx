import React, { useState, useEffect } from 'react';
import { requestService } from '@/features/requests/requestService';
import { GuestFeedback, FeedbackAction } from '@/types/guestcare';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import {
  MessageSquareHeart,
  Star,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  PlusCircle,
} from 'lucide-react';
import { formatDate, formatTimeAgo } from '@/lib/utils';

export const FeedbackPage: React.FC = () => {
  const [feedbackList, setFeedbackList] = useState<GuestFeedback[]>([]);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [actionModalFb, setActionModalFb] = useState<GuestFeedback | null>(null);

  const [actionType, setActionType] = useState<FeedbackAction['actionType']>('contacted_guest');
  const [actionNotes, setActionNotes] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  const loadData = () => {
    setFeedbackList(requestService.listFeedback());
  };

  useEffect(() => {
    loadData();
    const unsub = requestService.subscribe(loadData);
    return () => unsub();
  }, []);

  const handleSaveAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionModalFb || !actionNotes.trim()) return;

    setLoadingAction(true);
    try {
      await requestService.addFeedbackAction({
        feedbackId: actionModalFb.id,
        staffName: 'Duty Manager',
        actionType,
        notes: actionNotes.trim(),
      });
      setActionNotes('');
      setActionModalFb(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to record follow-up action.');
    } finally {
      setLoadingAction(false);
    }
  };

  const filtered = feedbackList.filter(f => {
    if (filterRating !== 'all' && f.overallRating !== filterRating) return false;
    return true;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <MessageSquareHeart className="h-5 w-5 text-rose-500" />
            <span>In-Stay Guest Feedback</span>
          </h1>
          <p className="text-xs text-slate-500">
            Real-time ratings and private guest remarks received before checkout
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterRating}
            onChange={e => setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700"
          >
            <option value="all">All Ratings</option>
            <option value="1">1 Star</option>
            <option value="2">2 Stars</option>
            <option value="3">3 Stars</option>
            <option value="4">4 Stars</option>
            <option value="5">5 Stars</option>
          </select>
        </div>
      </div>

      {/* Feedback Feed */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <Card className="p-8 text-center bg-white text-slate-400 text-xs">
            No feedback entries found.
          </Card>
        ) : (
          filtered.map(fb => {
            const actions = requestService.getFeedbackActions(fb.id);
            const isLow = fb.overallRating <= 2;

            return (
              <Card
                key={fb.id}
                className={`p-5 bg-white transition-all ${
                  isLow ? 'border-l-4 border-l-rose-500' : 'border-l-4 border-l-emerald-500'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{fb.apartmentRef}</span>
                      <span className="text-xs text-slate-500">({fb.reservationRef})</span>
                      {fb.isAnonymous && (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 font-medium">
                          Anonymous
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Guest: {fb.guestName}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < fb.overallRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-400">{formatTimeAgo(fb.createdAt)}</span>
                  </div>
                </div>

                {/* Sub-ratings breakdown */}
                <div className="grid grid-cols-3 gap-2 py-3 text-xs text-slate-600 border-b border-slate-100">
                  <div>
                    <span className="text-slate-400">Cleanliness:</span>{' '}
                    <strong>{fb.cleanlinessRating || '—'}/5</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Staff:</span>{' '}
                    <strong>{fb.staffRating || '—'}/5</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Comfort:</span>{' '}
                    <strong>{fb.comfortRating || '—'}/5</strong>
                  </div>
                </div>

                {/* Guest Comments */}
                <div className="py-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Guest Comment:
                  </p>
                  <p className="text-sm text-slate-800 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                    "{fb.comments || 'No written comment provided.'}"
                  </p>
                </div>

                {/* Follow-up actions logged */}
                {actions.length > 0 && (
                  <div className="mt-2 space-y-2 rounded-lg bg-teal-50/50 p-3 border border-teal-100 text-xs">
                    <span className="font-bold text-teal-900 block text-[11px] uppercase tracking-wider">
                      Management Follow-up ({actions.length})
                    </span>
                    {actions.map(act => (
                      <div key={act.id} className="text-teal-950">
                        <span className="font-semibold capitalize">
                          {act.actionType.replace('_', ' ')}
                        </span>{' '}
                        by {act.staffName} ({formatTimeAgo(act.createdAt)}): {act.notes}
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Button */}
                <div className="flex items-center justify-between pt-3 mt-1 text-xs">
                  <span className="text-slate-400">
                    Status: <strong className="capitalize">{fb.status}</strong>
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs gap-1.5"
                    onClick={() => setActionModalFb(fb)}
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Log Follow-up Action</span>
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Follow-up Action Modal */}
      <Modal
        isOpen={Boolean(actionModalFb)}
        onClose={() => setActionModalFb(null)}
        title="Record Manager Intervention"
        description={`Follow-up action for ${actionModalFb?.apartmentRef} (${actionModalFb?.guestName})`}
      >
        <form onSubmit={handleSaveAction} className="space-y-4 text-left">
          <Select
            label="Action Type"
            value={actionType}
            onChange={e => setActionType(e.target.value as any)}
            options={[
              { value: 'contacted_guest', label: 'Contacted Guest via Phone / Message' },
              { value: 'room_visit', label: 'In-Person Room Visit by Manager' },
              { value: 'sent_amenity', label: 'Complimentary Amenity / Gift Delivered' },
              { value: 'discount_issued', label: 'Rate Adjustment / Credit Applied' },
              { value: 'internal_escalation', label: 'Internal Department Escalation' },
            ]}
          />

          <Textarea
            label="Action Notes & Outcome"
            placeholder="e.g., Phoned guest to apologize for noise. Provided complimentary late checkout at 2 PM..."
            rows={3}
            value={actionNotes}
            onChange={e => setActionNotes(e.target.value)}
            required
          />

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActionModalFb(null)}
              disabled={loadingAction}
            >
              Cancel
            </Button>
            <Button type="submit" loading={loadingAction}>
              Save Follow-up
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

