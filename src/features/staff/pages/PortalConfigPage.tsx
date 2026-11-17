import React, { useState, useEffect } from 'react';
import {
  portalConfigService,
  CategoryPreset,
  PortalBrandingConfig,
  PopularServiceConfig,
} from '@/features/config/portalConfigService';
import { requestService } from '@/features/requests/requestService';
import {
  Category,
  CategoryCode,
  FAQItem,
  LocalServiceProvider,
  PresetServiceItem,
} from '@/types/guestcare';
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
  LayoutGrid,
  Megaphone,
  Flame,
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

type ConfigTab = 'branding' | 'categories' | 'popular' | 'items' | 'providers' | 'faqs' | 'presets';

export const PortalConfigPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ConfigTab>('providers');

  const [branding, setBranding] = useState<PortalBrandingConfig>(portalConfigService.getBranding());
  const [brandingSaved, setBrandingSaved] = useState(false);

  const [categories, setCategories] = useState<Category[]>(requestService.getCategories(true));
  const [editingCatCode, setEditingCatCode] = useState<CategoryCode | null>(null);
  const [editCatForm, setEditCatForm] = useState({
    name: '',
    shortName: '',
    tagline: '',
    description: '',
    slaMinutes: 30,
  });

  const [popularCards, setPopularCards] = useState<PopularServiceConfig[]>(
    portalConfigService.getPopularServices()
  );
  const [newPopForm, setNewPopForm] = useState({
    title: '',
    subtitle: 'Housekeeping',
    eta: '~20 min',
    categoryCode: 'housekeeping' as CategoryCode,
    presetText: '',
    imageUrl:
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=600&q=80',
  });
  const [editingPopId, setEditingPopId] = useState<string | null>(null);
  const [editPopForm, setEditPopForm] = useState({
    title: '',
    subtitle: '',
    eta: '',
    categoryCode: 'housekeeping' as CategoryCode,
    presetText: '',
    imageUrl: '',
  });

  const [items, setItems] = useState<PresetServiceItem[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [providers, setProviders] = useState<LocalServiceProvider[]>([]);
  const [presets, setPresets] = useState<CategoryPreset[]>([]);
  const [wifiNetwork, setWifiNetwork] = useState(portalConfigService.getWifi().networkName);
  const [wifiPassword, setWifiPassword] = useState(portalConfigService.getWifi().password);
  const [wifiSaved, setWifiSaved] = useState(false);

  // Filter / Form state for Deliverable Items
  const [itemCatFilter, setItemCatFilter] = useState<CategoryCode | 'all'>('all');
  const [newItemCat, setNewItemCat] = useState<CategoryCode>('housekeeping');
  const [newItemName, setNewItemName] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('items');
  const [newItemMaxQty, setNewItemMaxQty] = useState(6);
  const [newItemPrice, setNewItemPrice] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editItemForm, setEditItemForm] = useState({
    categoryCode: 'housekeeping' as CategoryCode,
    name: '',
    unit: 'items',
    maxQty: 6,
    priceLabel: '',
  });

  // Form state for FAQs
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [editFaqQ, setEditFaqQ] = useState('');
  const [editFaqA, setEditFaqA] = useState('');

  // Form state for Local Service Providers
  const [newProvName, setNewProvName] = useState('');
  const [newProvCat, setNewProvCat] = useState('Mini Market & Shop');
  const [newProvPhone, setNewProvPhone] = useState('');
  const [newProvWhatsapp, setNewProvWhatsapp] = useState('');
  const [newProvHours, setNewProvHours] = useState('8:00 AM – 10:00 PM');
  const [newProvDesc, setNewProvDesc] = useState('');
  const [editingProvId, setEditingProvId] = useState<string | null>(null);
  const [editProvForm, setEditProvForm] = useState({
    name: '',
    category: '',
    phone: '',
    whatsapp: '',
    hours: '',
    description: '',
  });

  // Form state for Presets
  const [presetCat, setPresetCat] = useState<CategoryCode>('maintenance');
  const [newPresetLabel, setNewPresetLabel] = useState('');
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editPresetLabel, setEditPresetLabel] = useState('');

  const loadAll = () => {
    setBranding(portalConfigService.getBranding());
    setCategories(requestService.getCategories(true));
    setPopularCards(portalConfigService.getPopularServices());
    setItems(portalConfigService.getDeliverableItems());
    setFaqs(portalConfigService.getFaqs());
    setProviders(portalConfigService.getProviders());
    setPresets(portalConfigService.getPresets());
    const w = portalConfigService.getWifi();
    setWifiNetwork(w.networkName);
    setWifiPassword(w.password);
  };

  useEffect(() => {
    loadAll();
    return portalConfigService.subscribe(loadAll);
  }, []);

  // Handlers: Branding
  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    portalConfigService.updateBranding({
      portalBrandName: branding.portalBrandName.trim() || 'GuestCare',
      heroHeadline: branding.heroHeadline.trim(),
      heroSubtitle: branding.heroSubtitle.trim(),
      heroCtaLabel: branding.heroCtaLabel.trim() || 'Explore Services',
      directorySectionTitle: branding.directorySectionTitle.trim(),
      directoryCardTitle: branding.directoryCardTitle.trim(),
      directoryCardDescription: branding.directoryCardDescription.trim(),
      noticeBanner: branding.noticeBanner.trim(),
    });
    setBrandingSaved(true);
    setTimeout(() => setBrandingSaved(false), 2000);
  };

  // Handlers: Categories
  const startEditCategory = (cat: Category) => {
    setEditingCatCode(cat.code);
    setEditCatForm({
      name: cat.name,
      shortName: cat.shortName || cat.name,
      tagline: cat.tagline || '',
      description: cat.description,
      slaMinutes: cat.slaMinutes,
    });
  };

  const saveEditCategory = () => {
    if (!editingCatCode || !editCatForm.name.trim()) return;
    portalConfigService.updateCategoryOverride(editingCatCode, {
      name: editCatForm.name.trim(),
      shortName: editCatForm.shortName.trim() || editCatForm.name.trim(),
      tagline: editCatForm.tagline.trim(),
      description: editCatForm.description.trim(),
      slaMinutes: Math.max(5, Number(editCatForm.slaMinutes) || 30),
    });
    setEditingCatCode(null);
  };

  // Handlers: Popular Cards
  const handleAddPopular = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPopForm.title.trim()) return;
    portalConfigService.addPopularService({
      title: newPopForm.title.trim(),
      subtitle: newPopForm.subtitle.trim() || 'Service',
      eta: newPopForm.eta.trim() || '~20 min',
      categoryCode: newPopForm.categoryCode,
      presetText: newPopForm.presetText.trim() || newPopForm.title.trim(),
      imageUrl:
        newPopForm.imageUrl.trim() ||
        'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=600&q=80',
      isActive: true,
    });
    setNewPopForm({
      ...newPopForm,
      title: '',
      presetText: '',
    });
  };

  const startEditPopular = (p: PopularServiceConfig) => {
    setEditingPopId(p.id);
    setEditPopForm({
      title: p.title,
      subtitle: p.subtitle,
      eta: p.eta,
      categoryCode: p.categoryCode,
      presetText: p.presetText,
      imageUrl: p.imageUrl,
    });
  };

  const saveEditPopular = () => {
    if (!editingPopId || !editPopForm.title.trim()) return;
    portalConfigService.updatePopularService(editingPopId, {
      title: editPopForm.title.trim(),
      subtitle: editPopForm.subtitle.trim(),
      eta: editPopForm.eta.trim(),
      categoryCode: editPopForm.categoryCode,
      presetText: editPopForm.presetText.trim(),
      imageUrl: editPopForm.imageUrl.trim(),
    });
    setEditingPopId(null);
  };

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

  const startEditItem = (item: PresetServiceItem) => {
    setEditingItemId(item.id);
    setEditItemForm({
      categoryCode: item.categoryCode,
      name: item.name,
      unit: item.unit || 'items',
      maxQty: item.maxQty || 6,
      priceLabel: item.priceLabel || '',
    });
  };

  const saveEditItem = () => {
    if (!editingItemId || !editItemForm.name.trim()) return;
    portalConfigService.updateDeliverableItem(editingItemId, {
      categoryCode: editItemForm.categoryCode,
      name: editItemForm.name.trim(),
      unit: editItemForm.unit.trim() || 'items',
      maxQty: Math.max(1, Number(editItemForm.maxQty) || 6),
      priceLabel: editItemForm.priceLabel.trim() || undefined,
    });
    setEditingItemId(null);
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
    setNewProvCat('Mini Market & Shop');
    setNewProvPhone('');
    setNewProvWhatsapp('');
    setNewProvDesc('');
  };

  const startEditProvider = (p: LocalServiceProvider) => {
    setEditingProvId(p.id);
    setEditProvForm({
      name: p.name,
      category: p.category,
      phone: p.phone,
      whatsapp: p.whatsapp || '',
      hours: p.hours,
      description: p.description,
    });
  };

  const saveEditProvider = () => {
    if (!editingProvId || !editProvForm.name.trim() || !editProvForm.phone.trim()) return;
    portalConfigService.updateProvider(editingProvId, {
      name: editProvForm.name.trim(),
      category: editProvForm.category.trim() || 'Local Delivery',
      phone: editProvForm.phone.trim(),
      whatsapp: editProvForm.whatsapp.trim() || undefined,
      hours: editProvForm.hours.trim() || 'Open Daily',
      description: editProvForm.description.trim(),
    });
    setEditingProvId(null);
  };

  // Handlers: Presets
  const handleAddPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetLabel.trim()) return;
    portalConfigService.addPreset(presetCat, newPresetLabel);
    setNewPresetLabel('');
  };

  const saveEditPreset = () => {
    if (!editingPresetId || !editPresetLabel.trim()) return;
    portalConfigService.updatePreset(editingPresetId, { label: editPresetLabel.trim() });
    setEditingPresetId(null);
    setEditPresetLabel('');
  };

  const filteredItems = itemCatFilter === 'all' ? items : items.filter(i => i.categoryCode === itemCatFilter);
  const filteredPresets = presets.filter(p => p.categoryCode === presetCat);

  const tabs: Array<{ id: ConfigTab; label: string; icon: React.ComponentType<any> }> = [
    { id: 'providers', label: `Local Directory (${providers.length})`, icon: Store },
    { id: 'branding', label: 'Hero & Branding', icon: Megaphone },
    { id: 'categories', label: `Categories (${categories.length})`, icon: LayoutGrid },
    { id: 'popular', label: `Popular Cards (${popularCards.length})`, icon: Flame },
    { id: 'items', label: `Deliverable Items (${items.length})`, icon: Package },
    { id: 'faqs', label: `FAQs (${faqs.length})`, icon: HelpCircle },
    { id: 'presets', label: `Quick Presets (${presets.length})`, icon: Sparkles },
  ];

  return (
    <div className="space-y-6 text-left max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Sliders className="h-5 w-5 text-[#11574A]" />
            <span>Guest Portal Content & Data Manager</span>
          </h1>
          <p className="text-xs text-slate-500">
            Control 100% of Guest Portal content — every edit saves live to Supabase and updates all guest devices immediately
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          className="text-xs gap-1.5 self-start sm:self-auto"
          onClick={() => {
            if (window.confirm('Reset all Guest Portal text, categories, popular cards, items, directory numbers, and FAQs back to defaults?')) {
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
      <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-3">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                active
                  ? 'bg-[#11574A] text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-[#F0F7F5] hover:text-[#11574A]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: BRANDING, HERO & LIVE NOTICE BANNER */}
      {activeTab === 'branding' && (
        <Card className="p-5 bg-white">
          <form onSubmit={handleSaveBranding} className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Portal Branding, Hero Text & Notice Banner</h2>
                <p className="text-xs text-slate-500">Customize all headlines, welcome text, and live announcements shown on every apartment portal</p>
              </div>
              {brandingSaved && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <Check className="h-4 w-4" /> Saved live
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Portal Brand Name"
                value={branding.portalBrandName}
                onChange={e => setBranding({ ...branding, portalBrandName: e.target.value })}
                required
              />
              <Input
                label="Hero Button Label"
                value={branding.heroCtaLabel}
                onChange={e => setBranding({ ...branding, heroCtaLabel: e.target.value })}
                required
              />
            </div>

            <Input
              label="Hero Welcome Headline"
              value={branding.heroHeadline}
              onChange={e => setBranding({ ...branding, heroHeadline: e.target.value })}
              required
            />

            <Textarea
              label="Hero Welcome Subtitle"
              rows={2}
              value={branding.heroSubtitle}
              onChange={e => setBranding({ ...branding, heroSubtitle: e.target.value })}
            />

            <Input
              label="Live Guest Announcement Banner (optional — leave blank to hide)"
              placeholder="e.g. Scheduled water maintenance today 2:00 PM – 2:30 PM"
              value={branding.noticeBanner}
              onChange={e => setBranding({ ...branding, noticeBanner: e.target.value })}
            />

            <div className="pt-3 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Local Directory Card Copy
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Directory Section Title"
                  value={branding.directorySectionTitle}
                  onChange={e => setBranding({ ...branding, directorySectionTitle: e.target.value })}
                />
                <Input
                  label="Directory Card Title"
                  value={branding.directoryCardTitle}
                  onChange={e => setBranding({ ...branding, directoryCardTitle: e.target.value })}
                />
              </div>
              <Textarea
                label="Directory Card Subtitle"
                rows={2}
                value={branding.directoryCardDescription}
                onChange={e => setBranding({ ...branding, directoryCardDescription: e.target.value })}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" size="sm" className="px-5 gap-1.5 text-xs">
                <Check className="h-3.5 w-3.5" />
                <span>Save Branding & Copy</span>
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TAB: SERVICE CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map(cat => (
            <Card key={cat.id} className="p-4 bg-white space-y-2">
              {editingCatCode === cat.code ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <Input
                      label="Full Category Name"
                      value={editCatForm.name}
                      onChange={e => setEditCatForm({ ...editCatForm, name: e.target.value })}
                    />
                    <Input
                      label="Short Tile Label"
                      value={editCatForm.shortName}
                      onChange={e => setEditCatForm({ ...editCatForm, shortName: e.target.value })}
                    />
                  </div>
                  <Input
                    label="Short Tagline"
                    value={editCatForm.tagline}
                    onChange={e => setEditCatForm({ ...editCatForm, tagline: e.target.value })}
                  />
                  <Textarea
                    label="Description"
                    rows={2}
                    value={editCatForm.description}
                    onChange={e => setEditCatForm({ ...editCatForm, description: e.target.value })}
                  />
                  <Input
                    label="Target SLA (minutes)"
                    type="number"
                    min={5}
                    value={editCatForm.slaMinutes}
                    onChange={e => setEditCatForm({ ...editCatForm, slaMinutes: Number(e.target.value) })}
                  />
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={saveEditCategory} className="text-xs gap-1">
                      <Check className="h-3.5 w-3.5" /> Save Category
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingCatCode(null)} className="text-xs gap-1">
                      <X className="h-3.5 w-3.5" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`text-sm font-bold ${!cat.isActive ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {cat.shortName || cat.name}
                        </h3>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono text-slate-600">
                          SLA {cat.slaMinutes}m
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-[#11574A]">{cat.name}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2"
                        onClick={() =>
                          portalConfigService.updateCategoryOverride(cat.code, { isActive: !cat.isActive })
                        }
                        title={cat.isActive ? 'Hide category from Guest Portal' : 'Show category on Guest Portal'}
                      >
                        {cat.isActive ? (
                          <Eye className="h-3.5 w-3.5 text-emerald-600" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5 text-slate-400" />
                        )}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => startEditCategory(cat)}>
                        <Edit2 className="h-3.5 w-3.5 text-slate-600" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600">{cat.description}</p>
                </>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* TAB: POPULAR REQUEST CARDS */}
      {activeTab === 'popular' && (
        <div className="space-y-5">
          <Card className="p-5 bg-white space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Add Popular One-Tap Request Card</h2>
            <form onSubmit={handleAddPopular} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Input
                label="Card Title"
                placeholder="e.g. Airport Transfer"
                value={newPopForm.title}
                onChange={e => setNewPopForm({ ...newPopForm, title: e.target.value })}
                required
              />
              <Input
                label="Subtitle"
                placeholder="e.g. Front Desk"
                value={newPopForm.subtitle}
                onChange={e => setNewPopForm({ ...newPopForm, subtitle: e.target.value })}
              />
              <Input
                label="Estimated Time Badge"
                placeholder="e.g. ~20 min"
                value={newPopForm.eta}
                onChange={e => setNewPopForm({ ...newPopForm, eta: e.target.value })}
              />
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Opens Category</label>
                <select
                  value={newPopForm.categoryCode}
                  onChange={e => setNewPopForm({ ...newPopForm, categoryCode: e.target.value as CategoryCode })}
                  className="w-full h-10 rounded-lg border border-slate-300 bg-white px-2.5 text-xs"
                >
                  {CATEGORY_OPTIONS.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <Input
                label="Auto-Filled Request Text"
                placeholder="e.g. Book airport taxi pickup"
                value={newPopForm.presetText}
                onChange={e => setNewPopForm({ ...newPopForm, presetText: e.target.value })}
              />
              <Input
                label="Photo URL"
                value={newPopForm.imageUrl}
                onChange={e => setNewPopForm({ ...newPopForm, imageUrl: e.target.value })}
              />
              <div className="sm:col-span-2 lg:col-span-3 pt-1">
                <Button type="submit" size="sm" className="gap-1.5 text-xs">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Popular Card</span>
                </Button>
              </div>
            </form>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularCards.map(card => (
              <Card key={card.id} className="p-4 bg-white space-y-3">
                {editingPopId === card.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <Input
                        label="Card Title"
                        value={editPopForm.title}
                        onChange={e => setEditPopForm({ ...editPopForm, title: e.target.value })}
                      />
                      <Input
                        label="Subtitle"
                        value={editPopForm.subtitle}
                        onChange={e => setEditPopForm({ ...editPopForm, subtitle: e.target.value })}
                      />
                      <Input
                        label="ETA Badge"
                        value={editPopForm.eta}
                        onChange={e => setEditPopForm({ ...editPopForm, eta: e.target.value })}
                      />
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
                        <select
                          value={editPopForm.categoryCode}
                          onChange={e =>
                            setEditPopForm({ ...editPopForm, categoryCode: e.target.value as CategoryCode })
                          }
                          className="w-full h-10 rounded-lg border border-slate-300 bg-white px-2.5 text-xs"
                        >
                          {CATEGORY_OPTIONS.map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <Input
                      label="Auto-Filled Preset Text"
                      value={editPopForm.presetText}
                      onChange={e => setEditPopForm({ ...editPopForm, presetText: e.target.value })}
                    />
                    <Input
                      label="Photo URL"
                      value={editPopForm.imageUrl}
                      onChange={e => setEditPopForm({ ...editPopForm, imageUrl: e.target.value })}
                    />
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={saveEditPopular} className="text-xs gap-1">
                        <Check className="h-3.5 w-3.5" /> Save Card
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingPopId(null)} className="text-xs gap-1">
                        <X className="h-3.5 w-3.5" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={card.imageUrl}
                        alt={card.title}
                        className="h-14 w-16 rounded-xl object-cover bg-slate-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className={`text-sm font-bold truncate ${!card.isActive ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {card.title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {card.subtitle} • {card.eta}
                        </p>
                        <p className="text-[11px] text-[#11574A] truncate">{card.presetText}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2"
                        onClick={() => portalConfigService.updatePopularService(card.id, { isActive: !card.isActive })}
                      >
                        {card.isActive ? <Eye className="h-3.5 w-3.5 text-emerald-600" /> : <EyeOff className="h-3.5 w-3.5 text-slate-400" />}
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => startEditPopular(card)}>
                        <Edit2 className="h-3.5 w-3.5 text-slate-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-rose-600 hover:bg-rose-50"
                        onClick={() => portalConfigService.deletePopularService(card.id)}
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

      {/* TAB: DELIVERABLE ITEMS (WITH FULL INLINE EDIT) */}
      {activeTab === 'items' && (
        <div className="space-y-5">
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
                <div key={item.id} className="py-2.5 text-xs">
                  {editingItemId === item.id ? (
                    <div className="space-y-2.5 bg-[#F6F8F8] p-3 rounded-xl">
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                        <div>
                          <label className="block text-[11px] font-medium text-slate-600 mb-1">Section</label>
                          <select
                            value={editItemForm.categoryCode}
                            onChange={e =>
                              setEditItemForm({ ...editItemForm, categoryCode: e.target.value as CategoryCode })
                            }
                            className="w-full h-9 rounded-lg border border-slate-300 bg-white px-2 text-xs"
                          >
                            {CATEGORY_OPTIONS.map(c => (
                              <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <Input
                            label="Item Name"
                            value={editItemForm.name}
                            onChange={e => setEditItemForm({ ...editItemForm, name: e.target.value })}
                          />
                        </div>
                        <Input
                          label="Unit"
                          value={editItemForm.unit}
                          onChange={e => setEditItemForm({ ...editItemForm, unit: e.target.value })}
                        />
                        <Input
                          label="Max Qty"
                          type="number"
                          min={1}
                          max={20}
                          value={editItemForm.maxQty}
                          onChange={e => setEditItemForm({ ...editItemForm, maxQty: Number(e.target.value) })}
                        />
                      </div>
                      <div className="flex flex-wrap items-end justify-between gap-2">
                        <div className="w-full sm:w-64">
                          <Input
                            label="Price / Note Label (optional)"
                            placeholder="e.g. Free, Standard rate, 50 ETB"
                            value={editItemForm.priceLabel}
                            onChange={e => setEditItemForm({ ...editItemForm, priceLabel: e.target.value })}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={saveEditItem} className="text-xs gap-1">
                            <Check className="h-3.5 w-3.5" /> Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingItemId(null)} className="text-xs gap-1">
                            <X className="h-3.5 w-3.5" /> Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
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

                      <div className="flex items-center gap-1 shrink-0">
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
                          className="h-7 px-2"
                          onClick={() => startEditItem(item)}
                          title="Edit Item"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-slate-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-rose-600 hover:bg-rose-50"
                          onClick={() => portalConfigService.deleteDeliverableItem(item.id)}
                          title="Delete Item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB: FAQs */}
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

      {/* TAB: LOCAL DIRECTORY & RIDE NUMBERS */}
      {activeTab === 'providers' && (
        <div className="space-y-5">
          <Card className="p-5 bg-white space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Add Local Shop / Ride / Delivery Contact</h2>
            <form onSubmit={handleAddProvider} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Input
                label="Shop / Service Name"
                placeholder="e.g. RIDE Taxi, Corner Mini Market"
                value={newProvName}
                onChange={e => setNewProvName(e.target.value)}
                required
              />
              <Input
                label="Category"
                placeholder="e.g. Ride & Taxi, Coffee & Tea, Food & Meals"
                value={newProvCat}
                onChange={e => setNewProvCat(e.target.value)}
              />
              <Input
                label="Opening Hours"
                placeholder="e.g. 24/7 or 8:00 AM – 10:00 PM"
                value={newProvHours}
                onChange={e => setNewProvHours(e.target.value)}
              />
              <Input
                label="Dial / Phone Number"
                placeholder="e.g. 8294 or +251 911 234 567"
                value={newProvPhone}
                onChange={e => setNewProvPhone(e.target.value)}
                required
              />
              <Input
                label="WhatsApp Number (optional)"
                placeholder="+251911234567"
                value={newProvWhatsapp}
                onChange={e => setNewProvWhatsapp(e.target.value)}
              />
              <Input
                label="What They Supply"
                placeholder="Cards, water, coffee, traditional meals..."
                value={newProvDesc}
                onChange={e => setNewProvDesc(e.target.value)}
              />
              <div className="sm:col-span-2 lg:col-span-3 pt-1">
                <Button type="submit" size="sm" className="gap-1.5 text-xs">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Directory Contact</span>
                </Button>
              </div>
            </form>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map(p => (
              <Card key={p.id} className="p-4 bg-white space-y-2">
                {editingProvId === p.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <Input
                        label="Name"
                        value={editProvForm.name}
                        onChange={e => setEditProvForm({ ...editProvForm, name: e.target.value })}
                      />
                      <Input
                        label="Category"
                        value={editProvForm.category}
                        onChange={e => setEditProvForm({ ...editProvForm, category: e.target.value })}
                      />
                      <Input
                        label="Dial / Phone Number"
                        value={editProvForm.phone}
                        onChange={e => setEditProvForm({ ...editProvForm, phone: e.target.value })}
                      />
                      <Input
                        label="WhatsApp (optional)"
                        value={editProvForm.whatsapp}
                        onChange={e => setEditProvForm({ ...editProvForm, whatsapp: e.target.value })}
                      />
                      <Input
                        label="Opening Hours"
                        value={editProvForm.hours}
                        onChange={e => setEditProvForm({ ...editProvForm, hours: e.target.value })}
                      />
                      <Input
                        label="Description"
                        value={editProvForm.description}
                        onChange={e => setEditProvForm({ ...editProvForm, description: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <Button size="sm" onClick={saveEditProvider} className="text-xs gap-1">
                        <Check className="h-3.5 w-3.5" /> Save Changes
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingProvId(null)}
                        className="text-xs gap-1"
                      >
                        <X className="h-3.5 w-3.5" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className={`text-sm font-bold ${!p.isActive ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {p.name}
                        </h3>
                        <p className="text-xs font-medium text-[#11574A]">{p.category} • {p.hours}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2"
                          onClick={() => portalConfigService.updateProvider(p.id, { isActive: !p.isActive })}
                          title={p.isActive ? 'Hide from Guest Portal' : 'Show on Guest Portal'}
                        >
                          {p.isActive ? <Eye className="h-3.5 w-3.5 text-emerald-600" /> : <EyeOff className="h-3.5 w-3.5 text-slate-400" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2"
                          onClick={() => startEditProvider(p)}
                          title="Edit Contact"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-slate-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-rose-600 hover:bg-rose-50"
                          onClick={() => portalConfigService.deleteProvider(p.id)}
                          title="Delete Contact"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600">{p.description}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Dial: <strong>{p.phone}</strong> {p.whatsapp ? `| WhatsApp: ${p.whatsapp}` : ''}
                    </p>
                  </>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB: QUICK REQUEST PRESETS (WITH INLINE EDIT + VISIBILITY TOGGLE) */}
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
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200/70 overflow-hidden">
                {filteredPresets.map(pre => (
                  <div key={pre.id} className="flex items-center justify-between gap-2 px-3 py-2 bg-white text-xs">
                    {editingPresetId === pre.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editPresetLabel}
                          onChange={e => setEditPresetLabel(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') saveEditPreset();
                          }}
                          className="flex-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs focus:border-[#11574A] focus:outline-none"
                        />
                        <Button size="sm" onClick={saveEditPreset} className="h-7 px-2.5 text-xs">
                          <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingPresetId(null)}
                          className="h-7 px-2.5 text-xs"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className={!pre.isActive ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}>
                          {pre.label}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => portalConfigService.updatePreset(pre.id, { isActive: !pre.isActive })}
                            className="p-1.5 rounded-lg hover:bg-slate-100"
                            title={pre.isActive ? 'Hide preset' : 'Show preset'}
                          >
                            {pre.isActive ? (
                              <Eye className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <EyeOff className="h-3.5 w-3.5 text-slate-400" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPresetId(pre.id);
                              setEditPresetLabel(pre.label);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                            title="Edit preset"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => portalConfigService.deletePreset(pre.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600"
                            title="Delete preset"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
