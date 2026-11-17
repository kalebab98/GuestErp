import React, { useState } from 'react';
import { Category, Priority } from '@/types/guestcare';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { PhotoUploader, UploadedFile } from './PhotoUploader';
import { AlertCircle, Clock } from 'lucide-react';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onSubmit: (data: {
    categoryId: string;
    title: string;
    description: string;
    priority?: Priority;
    attachments: UploadedFile[];
  }) => Promise<void>;
}

export const RequestModal: React.FC<RequestModalProps> = ({
  isOpen,
  onClose,
  category,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  if (!category) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { title?: string; description?: string } = {};
    if (!title.trim()) newErrors.title = 'Please specify what you need.';
    if (!description.trim()) newErrors.description = 'Please provide details so our team can assist promptly.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await onSubmit({
        categoryId: category.id,
        title: title.trim(),
        description: description.trim(),
        priority: isUrgent ? 'urgent' : category.defaultPriority,
        attachments,
      });

      // Reset and close
      setTitle('');
      setDescription('');
      setIsUrgent(false);
      setAttachments([]);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category.name}
      description={`Dispatched directly to our ${category.defaultDepartment} team`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 text-xs text-teal-800 border border-teal-200">
          <Clock className="h-4 w-4 shrink-0 text-teal-600" />
          <span>Average team response time: <strong>~{category.slaMinutes} minutes</strong></span>
        </div>

        <Input
          label="Summary"
          placeholder={
            category.code === 'maintenance'
              ? 'e.g., Shower drain draining slowly'
              : category.code === 'housekeeping'
              ? 'e.g., Extra bath sheets and hand towels'
              : 'e.g., Assistance needed'
          }
          value={title}
          onChange={e => setTitle(e.target.value)}
          error={errors.title}
          autoFocus
        />

        <Textarea
          label="Details"
          placeholder="Please describe location in apartment, timing, or specific items required..."
          rows={3}
          value={description}
          onChange={e => setDescription(e.target.value)}
          error={errors.description}
        />

        {/* Photo attachments */}
        <PhotoUploader files={attachments} onFilesChange={setAttachments} />

        {/* Urgent toggle */}
        <div className="flex items-center gap-2.5 pt-1">
          <input
            id="urgent-check"
            type="checkbox"
            checked={isUrgent}
            onChange={e => setIsUrgent(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
          />
          <label htmlFor="urgent-check" className="text-xs text-slate-700 flex items-center gap-1 cursor-pointer">
            <span>Mark as urgent (active leak, safety hazard, lockout)</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Submit Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};

