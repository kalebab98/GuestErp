import React, { useState, useEffect } from 'react';
import { portalConfigService, CategoryPreset } from '@/features/config/portalConfigService';
import { CategoryCode, FAQItem, LocalServiceProvider, PresetServiceItem } from '@/types/guestcare';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  Sliders,
  Package,
  HelpCircle,
  Store,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  RotateCcw,
  Eye,
  EyeOff,
  Wifi,
} from 'lucide-react';

const CATEGORY_OPTIONS: Array<{ value: CategoryCode; label: string }> = [
  { value: 'housekeeping', label: 'Housekeeping' },
  { value: 'laundry', label: 'Laundry' },
  { value: 'shop_delivery', label: 'Shop & Delivery' },
  { value: 'comfort', label: 'Comfort' },
  { value: 'internet_tech', label: 'Wi-Fi & Tech' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'guest_services', label: 'Front Desk' },
  { value: 'other', label: 'Other' },
];

export const PortalConfigPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'items' | 'faqs' | 'providers' | 'presets'>('items');

  const [items, setItems] = useState<PresetServiceItem[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [providers, setProviders] = useState<LocalServiceProvider[]>([]);
  const [presets, setPresets] = useState<CategoryPreset[]>([]);
  const [wifiNetwork, setWifiNetwork] = useState(portalConfigService.getWifi().networkName);
  const [wifiPassword, setWifiPassword] = useState(portalConfigService.getWifi().password);
  const [wifiSaved, setWifiSaved] = useState(false);

  // Filter / Form state for Items
  const [itemCatFilter, setItemCatFilter] = useState<CategoryCode | 'all'>('all');
  const [newItemCat, setNewItemCat] = useState<CategoryCode>('housekeeping');
  const [newItemName, setNewItemName] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('items');
  const [newItemMaxQty, setNewItemMaxQty] = useState(6);
  const [newItemPrice, setNewItemPrice] = useState('');

  // Form state for FAQs
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [editFaqQ, setEditFaqQ] = useState('');
  const [editFaqA, setEditFaqA] = useState('');

  // Form state for Local Service Providers
  const [newProvName, setNewProvName] = useState('');
  const [newProvCat, setNewProvCat] = useState('');
  const [newProvPhone, setNewProvPhone] = useState('');
  const [newProvWhatsapp, setNewProvWhatsapp] = useState('');
  const [newProvHours, setNewProvHours] = useState('8:00 AM – 10:00 PM');
  const [newProvDesc, setNewProvDesc] = useState('');

  // Form state for Presets
  const [presetCat, setPresetCat] = useState<CategoryCode>('maintenance');
  const [newPresetLabel, setNewPresetLabel] = useState('');

  const loadAll = () => {
    setItems(portalConfigService.getDeliverableItems());
    setFaqs(portalConfigService.getFaqs());
    setProviders(portalConfigService.getProviders());
    setPresets(portalConfigService.getPresets());
  };

  useEffect(() => {
    loadAll();
    return portalConfigService.subscribe(loadAll);
  }, []);

  // Handlers: Items
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    portalConfigService.addDeliverableItem({
      categoryCode: newItemCat,
      name: newItemName.trim(),
      unit: newItemUnit.trim() || 'items',
      maxQty: Math.max(1, Number(newItemMaxQty) || 6),
      priceLabel: newItemPrice.trim() || undefined,
      isActive: true,
    });
    setNewItemName('');
    setNewItemPrice('');
  };

  // Handlers: FAQs
  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQ.trim() || !newFaqA.trim()) return;
    portalConfigService.addFaq(newFaqQ, newFaqA);
    setNewFaqQ('');
    setNewFaqA('');
  };

  const startEditFaq = (faq: FAQItem) => {
    setEditingFaqId(faq.id);
    setEditFaqQ(faq.question);
    setEditFaqA(faq.answer);
  };

  const saveEditFaq = () => {
    if (!editingFaqId || !editFaqQ.trim() || !editFaqA.trim()) return;
    portalConfigService.updateFaq(editingFaqId, { question: editFaqQ.trim(), answer: editFaqA.trim() });
    setEditingFaqId(null);
  };

  // Handlers: Providers
  const handleAddProvider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProvName.trim() || !newProvPhone.trim()) return;
    portalConfigService.addProvider({
      name: newProvName.trim(),
      category: newProvCat.trim() || 'Local Delivery',
      phone: newProvPhone.trim(),
      whatsapp: newProvWhatsapp.trim() || undefined,
      hours: newProvHours.trim() || 'Open Daily',
      description: newProvDesc.trim() || 'Fast delivery directly to guest apartments.',
      itemsOffered: [],
      isActive: true,
    });
    setNewProvName('');
    setNewProvCat('');
    setNewProvPhone('');
    setNewProvWhatsapp('');
    setNewProvDesc('');
  };

  // Handlers: Presets
  const handleAddPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetLabel.trim()) return;
    portalConfigService.addPreset(presetCat, newPresetLabel);
    setNewPresetLabel('');
  };

  const filteredItems = itemCatFilter === 'all' ? items : items.filter(i => i.categoryCode === itemCatFilter);
  const filteredPresets = presets.filter(p => p.categoryCode === presetCat);

  return (
    <div className="space-y-6 text-left max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Sliders className="h-5 w-5 text-teal-700" />
            <span>Guest Portal Content & Catalog Manager</span>
          </h1>
          <p className="text-xs text-slate-500">
            Edit deliverable items, FAQs, local shop partners, and quick presets — updates reflect live on the Guest Portal
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="text-xs gap-1.5"
          onClick={() => {
            if (window.confirm('Reset all portal FAQs, deliverable items, and shop partners back to defaults?')) {
              portalConfigService.resetDefaults();
            }
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Defaults</span>
        </Button>
      </div>

      {/* Wi-Fi Credentials shown directly on Guest Portal */}
      <Card className="p-4 bg-white">
        <form
          onSubmit={e => {
            e.preventDefault();
            portalConfigService.updateWifi({ networkName: wifiNetwork.trim(), password: wifiPassword.trim() });
            setWifiSaved(true);
            setTimeout(() => setWifiSaved(false), 2000);
          }}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
        >
          <div className="sm:col-span-5">
            <Input
              label="Guest Wi-Fi Network Name"
              value={wifiNetwork}
              onChange={e => setWifiNetwork(e.target.value)}
              required
            />
          </div>
          <div className="sm:col-span-5">
            <Input
              label="Guest Wi-Fi Password"
              value={wifiPassword}
              onChange={e => setWifiPassword(e.target.value)}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" className="w-full h-10 text-xs gap-1.5">
              {wifiSaved ? <Check className="h-3.5 w-3.5" /> : <Wifi className="h-3.5 w-3.5" />}
              <span>{wifiSaved ? 'Saved' : 'Save Wi-Fi'}</span>
            </Button>
          </div>
        </form>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'items', label: `Deliverable Items (${items.length})`, icon: Package },
          { id: 'faqs', label: `FAQs (${faqs.length})`, icon: HelpCircle },
          { id: 'providers', label: `Local Directory & Ride Numbers (${providers.length})`, icon: Store },
          { id: 'presets', label: `Quick Presets (${presets.length})`, icon: Sparkles },
        ].map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                active
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DELIVERABLE ITEMS */}
      {activeTab === 'items' && (
        <div className="space-y-5">
          {/* Add New Deliverable Item Form */}
          <Card className="p-5 bg-white space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Add Deliverable / Orderable Item</h2>
            <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Section</label>
                <select
                  value={newItemCat}
                  onChange={e => setNewItemCat(e.target.value as CategoryCode)}
                  className="w-full h-10 rounded-lg border border-slate-300 bg-white px-2.5 text-xs"
                >
                  {CATEGORY_OPTIONS.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="lg:col-span-2">
                <Input
                  label="Item Name"
                  placeholder="e.g. Fresh Coffee, Bath Towel, Mobile Card"
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  label="Unit"
                  placeholder="cups / towels / packs"
                  value={newItemUnit}
                  onChange={e => setNewItemUnit(e.target.value)}
                />
              </div>
              <div>
                <Input
                  label="Max Qty"
                  type="number"
                  min={1}
                  max={20}
                  value={newItemMaxQty}
                  onChange={e => setNewItemMaxQty(Number(e.target.value))}
                />
              </div>
              <div>
                <Button type="submit" className="w-full h-10 text-xs gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Item</span>
                </Button>
              </div>
            </form>
          </Card>

          {/* Filter & Table */}
          <Card className="p-5 bg-white space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-slate-900">Active Deliverable Items Catalog</h2>
              <select
                value={itemCatFilter}
                onChange={e => setItemCatFilter(e.target.value as any)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
              >
                <option value="all">All Sections</option>
                {CATEGORY_OPTIONS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredItems.map(item => (
                <div key={item.id} className="flex items-center justify-between py-2.5 gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600 shrink-0">
                      {CATEGORY_OPTIONS.find(c => c.value === item.categoryCode)?.label || item.categoryCode}
                    </span>
                    <div className="min-w-0">
                      <p className={`font-semibold truncate ${item.isActive === false ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {item.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Unit: {item.unit || 'item'} • Max Qty: {item.maxQty || 6}
                        {item.priceLabel ? ` • ${item.priceLabel}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={() =>
                        portalConfigService.updateDeliverableItem(item.id, {
                          isActive: item.isActive === false,
                        })
                      }
                      title={item.isActive === false ? 'Show on Guest Portal' : 'Hide from Guest Portal'}
                    >
                      {item.isActive === false ? <EyeOff className="h-3.5 w-3.5 text-slate-400" /> : <Eye className="h-3.5 w-3.5 text-emerald-600" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-rose-600 hover:bg-rose-50"
                      onClick={() => portalConfigService.deleteDeliverableItem(item.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: FAQs */}
      {activeTab === 'faqs' && (
        <div className="space-y-5">
          <Card className="p-5 bg-white space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Add New FAQ</h2>
            <form onSubmit={handleAddFaq} className="space-y-3">
              <Input
                label="Question"
                placeholder="e.g. Where can I buy a local SIM card or coffee?"
                value={newFaqQ}
                onChange={e => setNewFaqQ(e.target.value)}
                required
              />
              <Textarea
                label="Answer"
                placeholder="Write a short, friendly answer for guests..."
                rows={2}
                value={newFaqA}
                onChange={e => setNewFaqA(e.target.value)}
                required
              />
              <Button type="submit" size="sm" className="gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" />
                <span>Add FAQ to Guest Portal</span>
              </Button>
            </form>
          </Card>

          <div className="space-y-3">
            {faqs.map(faq => (
              <Card key={faq.id} className="p-4 bg-white">
                {editingFaqId === faq.id ? (
                  <div className="space-y-3">
                    <Input label="Question" value={editFaqQ} onChange={e => setEditFaqQ(e.target.value)} />
                    <Textarea label="Answer" rows={2} value={editFaqA} onChange={e => setEditFaqA(e.target.value)} />
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={saveEditFaq} className="text-xs gap-1">
                        <Check className="h-3.5 w-3.5" /> Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingFaqId(null)} className="text-xs gap-1">
                        <X className="h-3.5 w-3.5" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <p className={`text-sm font-bold ${!faq.isActive ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {faq.question}
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2"
                        onClick={() => portalConfigService.updateFaq(faq.id, { isActive: !faq.isActive })}
                      >
                        {faq.isActive ? <Eye className="h-3.5 w-3.5 text-emerald-600" /> : <EyeOff className="h-3.5 w-3.5 text-slate-400" />}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => startEditFaq(faq)}>
                        <Edit2 className="h-3.5 w-3.5 text-slate-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-rose-600 hover:bg-rose-50"
                        onClick={() => portalConfigService.deleteFaq(faq.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LOCAL SERVICE PROVIDERS */}
      {activeTab === 'providers' && (
        <div className="space-y-5">
          <Card className="p-5 bg-white space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Add Local Shop / Service Provider</h2>
            <form onSubmit={handleAddProvider} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Input
                label="Shop / Provider Name"
                placeholder="e.g. Corner 24/7 Mini Market"
                value={newProvName}
                onChange={e => setNewProvName(e.target.value)}
                required
              />
              <Input
                label="Category"
                placeholder="e.g. Coffee, Tea & Snacks"
                value={newProvCat}
                onChange={e => setNewProvCat(e.target.value)}
              />
              <Input
                label="Opening Hours"
                placeholder="e.g. Open 24/7"
                value={newProvHours}
                onChange={e => setNewProvHours(e.target.value)}
              />
              <Input
                label="Phone Number"
                placeholder="+1 (555) 210-4411"
                value={newProvPhone}
                onChange={e => setNewProvPhone(e.target.value)}
                required
              />
              <Input
                label="WhatsApp Number (optional)"
                placeholder="+15552104411"
                value={newProvWhatsapp}
                onChange={e => setNewProvWhatsapp(e.target.value)}
              />
              <Input
                label="What They Supply"
                placeholder="Cards, cigarettes, water, coffee, food..."
                value={newProvDesc}
                onChange={e => setNewProvDesc(e.target.value)}
              />
              <div className="sm:col-span-2 lg:col-span-3 pt-1">
                <Button type="submit" size="sm" className="gap-1.5 text-xs">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Service Provider</span>
                </Button>
              </div>
            </form>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map(p => (
              <Card key={p.id} className="p-4 bg-white space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className={`text-sm font-bold ${!p.isActive ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {p.name}
                    </h3>
                    <p className="text-xs font-medium text-teal-700">{p.category} • {p.hours}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2"
                      onClick={() => portalConfigService.updateProvider(p.id, { isActive: !p.isActive })}
                    >
                      {p.isActive ? <Eye className="h-3.5 w-3.5 text-emerald-600" /> : <EyeOff className="h-3.5 w-3.5 text-slate-400" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-rose-600 hover:bg-rose-50"
                      onClick={() => portalConfigService.deleteProvider(p.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-slate-600">{p.description}</p>
                <p className="text-[11px] text-slate-400 font-mono">
                  Phone: {p.phone} {p.whatsapp ? `| WhatsApp: ${p.whatsapp}` : ''}
                </p>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: QUICK REQUEST PRESETS */}
      {activeTab === 'presets' && (
        <div className="space-y-5">
          <Card className="p-5 bg-white space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Manage One-Tap Request Presets</h2>
            <form onSubmit={handleAddPreset} className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="w-full sm:w-52">
                <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={presetCat}
                  onChange={e => setPresetCat(e.target.value as CategoryCode)}
                  className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs"
                >
                  {CATEGORY_OPTIONS.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1 w-full">
                <Input
                  label="Quick Option Label"
                  placeholder="e.g. Pickup laundry bag for wash & fold"
                  value={newPresetLabel}
                  onChange={e => setNewPresetLabel(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="h-10 text-xs gap-1.5 shrink-0">
                <Plus className="h-3.5 w-3.5" />
                <span>Add Preset</span>
              </Button>
            </form>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <p className="text-xs font-semibold text-slate-500">
                Current presets for {CATEGORY_OPTIONS.find(c => c.value === presetCat)?.label}:
              </p>
              <div className="flex flex-wrap gap-2">
                {filteredPresets.map(pre => (
                  <span
                    key={pre.id}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-800"
                  >
                    <span>{pre.label}</span>
                    <button
                      type="button"
                      onClick={() => portalConfigService.deletePreset(pre.id)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

