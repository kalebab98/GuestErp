import React, { useState } from 'react';
import { GuestRequest } from '@/types/guestcare';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { CheckCircle2, AlertOctagon, ThumbsUp, ThumbsDown } from 'lucide-react';

interface ConfirmResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: GuestRequest | null;
  onConfirm: (satisfied: boolean, notesOrReason?: string) => Promise<void>;
}

export const ConfirmResolutionModal: React.FC<ConfirmResolutionModalProps> = ({
  isOpen,
  onClose,
  request,
  onConfirm,
}) => {
  const [decision, setDecision] = useState<'satisfied' | 'unsatisfied' | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!request) return null;

  const handleSubmit = async () => {
    if (decision === null) return;
    if (decision === 'unsatisfied' && !notes.trim()) {
      alert('Please let us know why the issue is still unresolved so our team can fix it.');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(decision === 'satisfied', notes.trim());
      setDecision(null);
      setNotes('');
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to submit response.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Service Resolution"
      description={`Ticket #${request.ticketNumber}: ${request.title}`}
    >
      <div className="space-y-4 text-left">
        {request.resolutionNotes && (
          <div className="rounded-lg bg-slate-50 p-3 text-xs border border-slate-200">
            <span className="font-semibold text-slate-700">Team notes: </span>
            <span className="text-slate-600">{request.resolutionNotes}</span>
          </div>
        )}

        <p className="text-sm font-medium text-slate-800">
          Has this issue been resolved to your full satisfaction?
        </p>

        {/* Choice buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setDecision('satisfied')}
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition-all ${
              decision === 'satisfied'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className={`rounded-full p-2.5 ${decision === 'satisfied' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              <ThumbsUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold">Yes, fully resolved</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Close this ticket</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setDecision('unsatisfied')}
            className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-center transition-all ${
              decision === 'unsatisfied'
                ? 'border-rose-600 bg-rose-50 text-rose-900 ring-2 ring-rose-500'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className={`rounded-full p-2.5 ${decision === 'unsatisfied' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
              <ThumbsDown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold">No, problem persists</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Reopen immediately</p>
            </div>
          </button>
        </div>

        {decision === 'satisfied' && (
          <div className="space-y-1.5 animate-fadeIn">
            <Textarea
              label="Compliments / Feedback (Optional)"
              placeholder="Any kind words for the attending team member..."
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        )}

        {decision === 'unsatisfied' && (
          <div className="space-y-1.5 animate-fadeIn">
            <div className="flex items-center gap-1.5 text-xs text-rose-700 font-medium">
              <AlertOctagon className="h-4 w-4 shrink-0 text-rose-600" />
              <span>This ticket will reopen as high priority for immediate escalation.</span>
            </div>
            <Textarea
              label="What remains unresolved? (Required)"
              placeholder="e.g., The shower valve was checked, but hot water pressure is still low..."
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              required
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={decision === 'unsatisfied' ? 'danger' : 'success'}
            disabled={decision === null || loading}
            loading={loading}
            onClick={handleSubmit}
          >
            {decision === 'unsatisfied' ? 'Reopen Ticket' : 'Confirm & Close'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

