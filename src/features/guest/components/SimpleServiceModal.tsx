import React, { useState, useEffect, useMemo } from 'react';
import { Category, Priority, RequestedItemPayload, LocalServiceProvider } from '@/types/guestcare';
import { portalConfigService } from '@/features/config/portalConfigService';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { PhotoUploader, UploadedFile } from './PhotoUploader';
import { Plus, Minus, Check, AlertCircle, Phone, MessageCircle, Store, X, ShoppingBag } from 'lucide-react';

interface SimpleServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  initialPreset?: string;
  apartmentRef?: string;
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
  apartmentRef = 'My Apartment',
  onSubmit,
}) => {
  const [generalIssue, setGeneralIssue] = useState<string>('');
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [note, setNote] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);
  const [providers, setProviders] = useState<LocalServiceProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (category && isOpen) {
      setGeneralIssue(initialPreset || '');
      setItemQuantities({});
      setNote('');
      setIsUrgent(false);
      setAttachments([]);
      setError(null);
      if (category.code === 'shop_delivery') {
        setProviders(portalConfigService.getProviders(true));
      } else {
        setProviders([]);
      }
    }
  }, [category, isOpen, initialPreset]);

  const deliverableItems = category?.presetItems || [];
  const quickChips = category?.commonIssues || [];

  const selectedItems = useMemo(() => {
    return deliverableItems
      .filter(item => (itemQuantities[item.id] || 0) > 0)
      .map(item => ({
        id: item.id,
        name: item.name,
        quantity: itemQuantities[item.id],
        unit: item.unit,
      }));
  }, [deliverableItems, itemQuantities]);

  const totalSelectedCount = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.quantity, 0),
    [selectedItems]
  );

  if (!category) return null;

  const updateQty = (id: string, delta: number, max = 10) => {
    setItemQuantities(prev => {
      const next = Math.max(0, Math.min(max, (prev[id] || 0) + delta));
      return { ...prev, [id]: next };
    });
  };

  const removeItem = (id: string) => {
    setItemQuantities(prev => ({ ...prev, [id]: 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const requestedItems: RequestedItemPayload[] = selectedItems.map(i => ({
      name: i.name,
      quantity: i.quantity,
      unit: i.unit,
    }));

    let title = generalIssue.trim();
    if (!title && requestedItems.length > 0) {
      title = requestedItems.map(i => `${i.quantity}x ${i.name}`).join(', ');
    }

    if (!title) {
      setError('Please enter your general issue/request or select items to deliver.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const itemsText =
        requestedItems.length > 0
          ? `Items: ${requestedItems.map(i => `${i.quantity}x ${i.name}`).join(', ')}`
          : '';
      const combinedDesc = [title, itemsText, note.trim() ? `Note: ${note.trim()}` : '']
        .filter(Boolean)
        .join('\n');

      await onSubmit({
        categoryId: category.id,
        title,
        description: combinedDesc,
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
      description={`Estimated response: ~${category.slaMinutes} min`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* 1. Quick Tap Common Options */}
        {quickChips.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500">
              Quick select
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickChips.map((chip, idx) => {
                const active = generalIssue === chip;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setGeneralIssue(active ? '' : chip)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all border ${
                      active
                        ? 'bg-[#11574A] text-white border-[#11574A] shadow-2xs'
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

        {/* 2. Deliverable Items (Editable from Staff Dashboard) */}
        {deliverableItems.length > 0 && (
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-slate-500">
              Or add items to deliver
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {deliverableItems.map(item => {
                const qty = itemQuantities[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 border transition-colors ${
                      qty > 0
                        ? 'bg-[#F0F7F5] border-[#11574A]/40'
                        : 'bg-[#F7F8F9] border-transparent'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <span className="block text-xs font-medium text-slate-800 truncate">
                        {item.name}
                      </span>
                      {item.priceLabel && (
                        <span className="block text-[10px] text-slate-400">{item.priceLabel}</span>
                      )}
                    </div>
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

            {/* Live Selected Items Summary Box shown right below */}
            {selectedItems.length > 0 && (
              <div className="rounded-xl bg-[#F0F7F5] border border-[#11574A]/25 p-3 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#11574A]">
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>Selected to Deliver ({totalSelectedCount})</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setItemQuantities({})}
                    className="text-[11px] font-medium text-slate-500 hover:text-rose-600 transition-colors"
                  >
                    Clear all
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {selectedItems.map(item => (
                    <span
                      key={item.id}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-[#11574A]/20 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-2xs"
                    >
                      <span className="text-[#11574A] font-bold">{item.quantity}x</span>
                      <span>{item.name}</span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="ml-0.5 text-slate-400 hover:text-rose-600"
                        aria-label={`Remove ${item.name}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. General Issue / Request Box (BEFORE Additional Note) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
            General issue / What do you need?
          </label>
          <input
            type="text"
            value={generalIssue}
            onChange={e => setGeneralIssue(e.target.value)}
            placeholder={
              category.code === 'shop_delivery'
                ? 'e.g. 2 hot coffees, mobile recharge card, bottle of water...'
                : category.code === 'laundry'
                ? 'e.g. Wash & fold pickup for 1 laundry bag...'
                : 'Describe your main issue or request...'
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#11574A] focus:outline-none focus:ring-1 focus:ring-[#11574A] transition-colors"
          />
        </div>

        {/* 4. Additional Note (Optional) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-500">
            Additional note (optional)
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Preferred time, brand preference, or extra details..."
            className="w-full rounded-xl border border-slate-200 bg-[#F7F8F9] px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#11574A] focus:outline-none focus:ring-1 focus:ring-[#11574A] transition-colors"
          />
        </div>

        {/* 5. Direct Local Service Providers (for Shop & Delivery) */}
        {category.code === 'shop_delivery' && providers.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
              <Store className="h-3.5 w-3.5 text-[#11574A]" />
              <span>Or call local service directly</span>
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {providers.map(p => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-2 rounded-xl bg-[#F7F8F9] px-3 py-2 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{p.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{p.category} • {p.hours}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`tel:${p.phone.replace(/\s+/g, '')}`}
                      className="inline-flex items-center gap-1 rounded-lg bg-white border border-slate-200 px-2 py-1 text-[11px] font-mono font-bold text-[#11574A] hover:bg-slate-50"
                      title={`Call ${p.name}`}
                    >
                      <Phone className="h-3 w-3" />
                      <span>{p.phone}</span>
                    </a>
                    {p.whatsapp && (
                      <a
                        href={`https://wa.me/${p.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Hello ${p.name}, I am staying at ${apartmentRef} and would like to order: `
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#25D366] text-white hover:bg-[#20BA5A]"
                        title={`WhatsApp ${p.name}`}
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compact Photo Attachment */}
        {(category.code === 'maintenance' || category.code === 'other' || category.code === 'comfort') && (
          <PhotoUploader files={attachments} onFilesChange={setAttachments} maxFiles={2} />
        )}

        {/* Urgent Toggle (Maintenance only) */}
        {category.code === 'maintenance' && (
          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-600">
            <input
              type="checkbox"
              checked={isUrgent}
              onChange={e => setIsUrgent(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
            />
            <span>Mark as urgent (active water leak, power outage, lockout)</span>
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
