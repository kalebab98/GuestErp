import React, { useState, useEffect } from 'react';
import { Category, Priority, RequestedItemPayload } from '@/types/guestcare';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { PhotoUploader, UploadedFile } from './PhotoUploader';
import { QuickItemCounter } from './QuickItemCounter';
import {
  Clock,
  ShieldCheck,
  AlertOctagon,
  Sparkles,
  KeyRound,
  Check,
  Plus,
  HelpCircle,
} from 'lucide-react';

interface DetailedServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onSubmit: (data: {
    categoryId: string;
    subcategoryId?: string;
    subcategoryName?: string;
    title: string;
    description: string;
    priority?: Priority;
    requestedItems?: RequestedItemPayload[];
    preferredTimeWindow?: string;
    roomAccessPermission?: boolean;
    attachments: UploadedFile[];
  }) => Promise<void>;
}

export const DetailedServiceModal: React.FC<DetailedServiceModalProps> = ({
  isOpen,
  onClose,
  category,
  onSubmit,
}) => {
  const [selectedSubcatId, setSelectedSubcatId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [preferredTime, setPreferredTime] = useState('Immediate / As soon as possible');
  const [allowRoomEntry, setAllowRoomEntry] = useState(true);
  const [isUrgent, setIsUrgent] = useState(false);
  const [isDiscreet, setIsDiscreet] = useState(false);
  const [lateCheckoutHour, setLateCheckoutHour] = useState('1:00 PM');
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  // Reset state when modal opens or category changes
  useEffect(() => {
    if (category) {
      const firstSubcat = category.subcategories?.[0]?.id || '';
      setSelectedSubcatId(firstSubcat);
      setTitle('');
      setDescription('');
      setItemQuantities({});
      setPreferredTime('Immediate / As soon as possible');
      setAllowRoomEntry(true);
      setIsUrgent(category.code === 'noise');
      setIsDiscreet(false);
      setLateCheckoutHour('1:00 PM');
      setAttachments([]);
      setErrors({});
    }
  }, [category, isOpen]);

  if (!category) return null;

  const currentSubcat = category.subcategories?.find(s => s.id === selectedSubcatId);

  // Quick autofill chip handler
  const handleSelectCommonIssue = (issue: string) => {
    setTitle(issue);
    if (!description) {
      setDescription(`Requesting: ${issue}. Please assist at your earliest convenience.`);
    }
  };

  // Item quantity counter
  const handleItemQtyChange = (itemId: string, qty: number) => {
    setItemQuantities(prev => ({
      ...prev,
      [itemId]: qty,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare requested items list from quantities
    const requestedItems: RequestedItemPayload[] = [];
    if (category.presetItems) {
      category.presetItems.forEach(item => {
        const qty = itemQuantities[item.id] || 0;
        if (qty > 0) {
          requestedItems.push({
            name: item.name,
            quantity: qty,
            unit: item.unit,
          });
        }
      });
    }

    let finalTitle = title.trim();
    if (!finalTitle && requestedItems.length > 0) {
      finalTitle = requestedItems.map(i => `${i.quantity}x ${i.name}`).join(', ');
    } else if (!finalTitle && currentSubcat) {
      finalTitle = `${currentSubcat.name} Service`;
    } else if (!finalTitle) {
      finalTitle = `${category.name} Request`;
    }

    // Validation
    const newErrors: { title?: string; description?: string } = {};
    if (!finalTitle) {
      newErrors.title = 'Please describe or select what you need.';
    }
    if (!description.trim() && requestedItems.length === 0) {
      newErrors.description = 'Please provide details or select items so our team can prepare.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      let finalDescription = description.trim();
      if (requestedItems.length > 0) {
        finalDescription = `Requested Items:\n${requestedItems.map(i => `• ${i.quantity}x ${i.name} (${i.unit || 'unit'})`).join('\n')}\n\nNotes: ${finalDescription || 'None'}`;
      }
      if (category.code === 'guest_services' && selectedSubcatId === 'sub-late-checkout') {
        finalDescription = `Late Checkout Extension requested to ${lateCheckoutHour}.\nReason/Notes: ${finalDescription}`;
      }
      if (category.code === 'noise' && isDiscreet) {
        finalDescription = `[DISCREET INTERVENTION REQUESTED - DO NOT REVEAL CALLING ROOM]\n${finalDescription}`;
      }

      await onSubmit({
        categoryId: category.id,
        subcategoryId: selectedSubcatId || undefined,
        subcategoryName: currentSubcat?.name || undefined,
        title: finalTitle,
        description: finalDescription,
        priority: isUrgent ? 'urgent' : category.defaultPriority,
        requestedItems,
        preferredTimeWindow: preferredTime,
        roomAccessPermission: allowRoomEntry,
        attachments,
      });

      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category.name}
      description={category.tagline || category.description}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-left pt-1">
        {/* Header SLA & Department Banner */}
        <div className="flex items-center justify-between rounded-xl bg-[#F0F9F8] p-3 text-xs text-[#0D3B36] border border-[#A7DDD6]/60">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#1E6861] shrink-0" />
            <span>Target response: <strong>~{category.slaMinutes} minutes</strong></span>
          </div>
          <span className="font-semibold uppercase tracking-wider text-[10px] text-[#144F49]">
            Dispatched to: {category.defaultDepartment}
          </span>
        </div>

        {/* 1. Subcategories Tabs (if available) */}
        {category.subcategories && category.subcategories.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Select Specific Service Area
            </label>
            <div className="flex flex-wrap gap-1.5">
              {category.subcategories.map(sub => {
                const active = sub.id === selectedSubcatId;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      setSelectedSubcatId(sub.id);
                      if (!title) setTitle(sub.name);
                    }}
                    className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all border ${
                      active
                        ? 'bg-teal-900 text-white border-teal-900 shadow-xs ring-1 ring-teal-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Common Issues / Quick Autofill Chips */}
        {category.commonIssues && category.commonIssues.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Frequently Requested / One-Tap Presets
              </span>
              <span className="text-[10px] text-teal-800 font-medium">Tap to fill</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {category.commonIssues.map((issue, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectCommonIssue(issue)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs text-left transition-all border ${
                    title === issue
                      ? 'bg-teal-50 text-teal-900 border-teal-400 font-semibold ring-1 ring-teal-400'
                      : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {issue}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. Preset Item Counters (for Housekeeping, Supplies, Tech, Comfort) */}
        {category.presetItems && category.presetItems.length > 0 && (
          <div className="space-y-2 rounded-2xl bg-slate-50/70 p-4 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Select Items & Quantities
              </span>
              <span className="text-[11px] text-slate-500">Delivered directly to room</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {category.presetItems.map(item => (
                <QuickItemCounter
                  key={item.id}
                  name={item.name}
                  unit={item.unit}
                  maxQty={item.maxQty}
                  quantity={itemQuantities[item.id] || 0}
                  onChange={qty => handleItemQtyChange(item.id, qty)}
                />
              ))}
            </div>
          </div>
        )}

        {/* 4. Late Checkout Custom Selector (if Late Checkout Subcategory) */}
        {category.code === 'guest_services' && selectedSubcatId === 'sub-late-checkout' && (
          <div className="rounded-2xl bg-amber-50/60 p-4 border border-amber-200 space-y-3">
            <span className="text-xs font-bold text-amber-950 uppercase tracking-wider block">
              Requested Departure Time
            </span>
            <div className="grid grid-cols-3 gap-2">
              {['12:00 PM', '1:00 PM', '2:00 PM'].map(time => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setLateCheckoutHour(time)}
                  className={`rounded-xl p-2.5 text-center text-xs font-bold transition-all border ${
                    lateCheckoutHour === time
                      ? 'bg-amber-600 text-white border-amber-600 ring-2 ring-amber-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Standard checkout is 11:00 AM. Extensions up to 1:00 PM are complimentary subject to housekeeping availability.
            </p>
          </div>
        )}

        {/* 5. Custom Title & Description */}
        <div className="space-y-3">
          <Input
            label="Summary Title"
            placeholder="e.g. Master Bedroom shower slow drain, Extra towels"
            value={title}
            onChange={e => setTitle(e.target.value)}
            error={errors.title}
          />

          <Textarea
            label="Additional Notes or Specific Instructions"
            placeholder="Please detail location in apartment, timing, or any specific preferences..."
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            error={errors.description}
          />
        </div>

        {/* 6. Photo Attachments (especially for maintenance/repairs) */}
        <PhotoUploader files={attachments} onFilesChange={setAttachments} />

        {/* 7. Logistics: Preferred Timing & Access Permission */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">Preferred Service Timing</label>
            <select
              value={preferredTime}
              onChange={e => setPreferredTime(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-teal-700 focus:outline-none"
            >
              <option value="Immediate / As soon as possible">Immediate / As soon as possible</option>
              <option value="Morning (9:00 AM – 12:00 PM)">Morning (9:00 AM – 12:00 PM)</option>
              <option value="Afternoon (1:00 PM – 4:00 PM)">Afternoon (1:00 PM – 4:00 PM)</option>
              <option value="Evening (5:00 PM – 8:00 PM)">Evening (5:00 PM – 8:00 PM)</option>
              <option value="Call my phone before arriving">Call my mobile phone before arriving</option>
            </select>
          </div>

          <div className="flex flex-col justify-center space-y-2 pt-1 sm:pt-4">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
              <input
                type="checkbox"
                checked={allowRoomEntry}
                onChange={e => setAllowRoomEntry(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-teal-800 focus:ring-teal-700"
              />
              <span>Staff may enter with master key if I am out</span>
            </label>
          </div>
        </div>

        {/* 8. Urgent Triage & Noise Discretion toggles */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2.5">
            <input
              id="urgent-box"
              type="checkbox"
              checked={isUrgent}
              onChange={e => setIsUrgent(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
            />
            <label htmlFor="urgent-box" className="text-xs text-slate-700 flex items-center gap-1.5 cursor-pointer">
              <AlertOctagon className="h-3.5 w-3.5 text-rose-600" />
              <span>Mark as urgent (active water leak, lock failure, high disruption)</span>
            </label>
          </div>

          {category.code === 'noise' && (
            <div className="flex items-center gap-2.5">
              <input
                id="discreet-box"
                type="checkbox"
                checked={isDiscreet}
                onChange={e => setIsDiscreet(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-teal-800 focus:ring-teal-700"
              />
              <label htmlFor="discreet-box" className="text-xs text-slate-700 flex items-center gap-1 cursor-pointer">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-700" />
                <span>Discreet intervention (do not disclose my room number to neighbors)</span>
              </label>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="bg-teal-900 hover:bg-teal-950 text-white px-5">
            Submit Request to {category.defaultDepartment}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

