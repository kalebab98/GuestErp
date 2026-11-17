import React, { useState } from 'react';
import { RequestStatus, GuestRequest } from '@/types/guestcare';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: GuestRequest | null;
  onUpdateStatus: (params: {
    requestId: string;
    newStatus: RequestStatus;
    resolutionNotes?: string;
    reason?: string;
  }) => Promise<void>;
}

export const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  isOpen,
  onClose,
  request,
  onUpdateStatus,
}) => {
  const [status, setStatus] = useState<RequestStatus>('in_progress');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (request) {
      setStatus(request.status);
      setResolutionNotes(request.resolutionNotes || '');
      setReason('');
    }
  }, [request]);

  if (!request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (status === 'resolved' && !resolutionNotes.trim()) {
      alert('Please document resolution notes describing what was done to fix the issue.');
      return;
    }

    setLoading(true);
    try {
      await onUpdateStatus({
        requestId: request.id,
        newStatus: status,
        resolutionNotes: status === 'resolved' ? resolutionNotes.trim() : undefined,
        reason: reason.trim(),
      });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to update status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Ticket Status"
      description={`Ticket #${request.ticketNumber} - ${request.apartmentRef}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <Select
          label="Workflow Status"
          value={status}
          onChange={e => setStatus(e.target.value as RequestStatus)}
          options={[
            { value: 'new', label: 'New (Unacknowledged)' },
            { value: 'acknowledged', label: 'Acknowledged (Under review)' },
            { value: 'assigned', label: 'Assigned (Dispatched to team)' },
            { value: 'in_progress', label: 'In Progress (Work underway)' },
            { value: 'waiting', label: 'Waiting (Awaiting parts / guest response)' },
            { value: 'resolved', label: 'Resolved (Work completed, awaits guest confirmation)' },
            { value: 'closed', label: 'Closed (Complete)' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
        />

        {status === 'resolved' && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 space-y-2">
            <p className="text-xs font-semibold text-emerald-900">
              Work Completed Details (Shared with Guest)
            </p>
            <Textarea
              label="Resolution Summary"
              placeholder="e.g., Cleaned AC filters and recharged unit. Air temperature tested at 20°C."
              rows={3}
              value={resolutionNotes}
              onChange={e => setResolutionNotes(e.target.value)}
              required
            />
          </div>
        )}

        <Textarea
          label="Internal Transition Reason / Log"
          placeholder="e.g., Technician arrived on site, parts ordered, or customer phoned desk..."
          rows={2}
          value={reason}
          onChange={e => setReason(e.target.value)}
        />

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Update Status
          </Button>
        </div>
      </form>
    </Modal>
  );
};

