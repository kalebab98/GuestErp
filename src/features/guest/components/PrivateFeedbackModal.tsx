import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Star, ShieldAlert } from 'lucide-react';

interface PrivateFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: {
    overallRating: number;
    cleanlinessRating?: number;
    staffRating?: number;
    comfortRating?: number;
    comments?: string;
    isAnonymous?: boolean;
  }) => Promise<void>;
}

export const PrivateFeedbackModal: React.FC<PrivateFeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [overallRating, setOverallRating] = useState(5);
  const [cleanlinessRating, setCleanlinessRating] = useState(5);
  const [staffRating, setStaffRating] = useState(5);
  const [comfortRating, setComfortRating] = useState(5);
  const [comments, setComments] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  const StarRating = ({
    value,
    onChange,
    label,
  }: {
    value: number;
    onChange: (val: number) => void;
    label: string;
  }) => (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs font-medium text-slate-700">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 focus:outline-none transition-transform hover:scale-110 active:scale-95"
          >
            <Star
              className={`h-5 w-5 ${
                star <= value
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-300 hover:text-slate-400'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        overallRating,
        cleanlinessRating,
        staffRating,
        comfortRating,
        comments: comments.trim(),
        isAnonymous,
      });
      setComments('');
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to submit feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Private In-Stay Feedback"
      description="Shared directly with general management to ensure your stay exceeds expectations"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="rounded-lg bg-teal-50 p-3 text-xs text-teal-800 border border-teal-200">
          Your feedback is reviewed in real-time by leadership so we can immediately address anything during your stay.
        </div>

        <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
          <StarRating
            label="Overall Experience"
            value={overallRating}
            onChange={setOverallRating}
          />
          <StarRating
            label="Cleanliness & Hygiene"
            value={cleanlinessRating}
            onChange={setCleanlinessRating}
          />
          <StarRating
            label="Staff Attentiveness"
            value={staffRating}
            onChange={setStaffRating}
          />
          <StarRating
            label="Comfort & Noise Level"
            value={comfortRating}
            onChange={setComfortRating}
          />
        </div>

        <Textarea
          label="Private Comments / Suggestions"
          placeholder="Is there anything we could do to make your stay more comfortable today?"
          rows={3}
          value={comments}
          onChange={e => setComments(e.target.value)}
        />

        <div className="flex items-center gap-2 pt-1">
          <input
            id="anon-check"
            type="checkbox"
            checked={isAnonymous}
            onChange={e => setIsAnonymous(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
          <label htmlFor="anon-check" className="text-xs text-slate-600 cursor-pointer">
            Submit anonymously (keep my name private from staff)
          </label>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Send Private Feedback
          </Button>
        </div>
      </form>
    </Modal>
  );
};

