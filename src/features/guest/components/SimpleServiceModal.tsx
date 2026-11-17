import React, { useState, useEffect } from 'react';
import { Category, Priority, RequestedItemPayload } from '@/types/guestcare';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { PhotoUploader, UploadedFile } from './PhotoUploader';
import { Plus, Minus, Clock, Check, AlertCircle } from 'lucide-react';

interface SimpleServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  initialPreset?: string;
  onSubmit: (data: {
    categoryId: string;
    title: string;
    description: string;
    priority?: Priority;
    requestedItems?: RequestedItemPayload[];
    attachments: UploadedFile[];
  }) => Promise<void>;
}

export const SimpleServiceModal: React.FC<SimpleServiceModalProps> = ({
  isOpen,
  onClose,
  category,
  initialPreset,
  onSubmit,
}) => {
  const [selectedChip, setSelectedChip] = useState<string>('');
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [note, setNote] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (category && isOpen) {
      setSelectedChip(initialPreset || '');
      setItemQuantities({});
      setNote('');
      setIsUrgent(category.code === 'noise');
      setAttachments([]);
      setError(null);
    }
  }, [category, isOpen, initialPreset]);

  if (!category) return null;

  const hasPresetItems = category.code === 'housekeeping' || category.code === 'comfort';
  const topItems = (category.presetItems || []).slice(0, 6);
  const quickChips = (category.commonIssues || []).slice(0, 5);

  const updateQty = (id: string, delta: number, max = 6) => {
    setItemQuantities(prev => {
      const next = Math.max(0, Math.min(max, (prev[id] || 0) + delta));
      return { ...prev, [id]: next };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requestedItems: RequestedItemPayload[] = [];
    topItems.forEach(item => {
      const qty = itemQuantities[item.id] || 0;
      if (qty > 0) {
        requestedItems.push({ name: item.name, quantity: qty, unit: item.unit });
      }
    });

    let title = selectedChip;
    if (!title && requestedItems.length > 0) {
      title = requestedItems.map(i => `${i.quantity}x ${i.name}`).join(', ');
    }
    if (!title && note.trim()) {
      title = note.trim().slice(0, 60);
    }

    if (!title) {
      setError('Please select an option or write a short note.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const description =
        note.trim() ||
        (requestedItems.length > 0
          ? `Requested: ${requestedItems.map(i => `${i.quantity}x ${i.name}`).join(', ')}`
          : selectedChip);

      await onSubmit({
        categoryId: category.id,
        title,
        description,
        priority: isUrgent ? 'urgent' : category.defaultPriority,
        requestedItems: requestedItems.length > 0 ? requestedItems : undefined,
        attachments,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Could not send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category.shortName || category.name}
      description={`Response time: ~${category.slaMinutes} min`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-left">
        {/* Quick Tap Options */}
        {quickChips.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500">
              Select a common request
            </label>
            <div className="flex flex-wrap gap-2">
              {quickChips.map((chip, idx) => {
                const active = selectedChip === chip;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedChip(active ? '' : chip)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all border ${
                      active
                        ? 'bg-[#11574A] text-white border-[#11574A] shadow-xs'
                        : 'bg-[#F7F8F9] text-slate-700 border-slate-200/80 hover:bg-slate-100'
                    }`}
                  >
                    {active && <Check className="h-3.5 w-3.5" />}
                    <span>{chip}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Simple Item Quantity Picker (only for supplies / comfort) */}
        {hasPresetItems && topItems.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500">
              Or add items to deliver
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {topItems.map(item => {
                const qty = itemQuantities[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 border transition-colors ${
                      qty > 0
                        ? 'bg-[#F0F7F5] border-[#11574A]/40'
                        : 'bg-[#F7F8F9] border-transparent'
                    }`}
                  >
                    <span className="text-xs font-medium text-slate-800 truncate pr-2">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, -1, item.maxQty)}
                        disabled={qty === 0}
                        className="flex h-6 w-6 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 disabled:opacity-30"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-4 text-center text-xs font-bold text-slate-900">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, 1, item.maxQty)}
                        className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#11574A] text-white"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Short Note */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500">
            Additional note (optional)
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Any extra details or preferred time..."
            className="w-full rounded-xl border border-slate-200 bg-[#F7F8F9] px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#11574A] focus:outline-none focus:ring-1 focus:ring-[#11574A] transition-colors"
          />
        </div>

        {/* Compact Photo Attachment */}
        {(category.code === 'maintenance' || category.code === 'other' || category.code === 'comfort') && (
          <PhotoUploader files={attachments} onFilesChange={setAttachments} maxFiles={2} />
        )}

        {/* Simple Urgent Toggle */}
        {(category.code === 'maintenance' || category.code === 'noise') && (
          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-600">
            <input
              type="checkbox"
              checked={isUrgent}
              onChange={e => setIsUrgent(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
            />
            <span>Mark as urgent (needs immediate attention)</span>
          </label>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Footer */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            className="bg-[#11574A] hover:bg-[#0D443A] text-white rounded-xl px-6"
          >
            Send Request
          </Button>
        </div>
      </form>
    </Modal>
  );
};
