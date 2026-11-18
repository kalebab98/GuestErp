// Portal Content, Branding, Contact Numbers & Catalog Configuration Service
// Everything shown on the Guest Portal & Building Directory (Branding, Hero Text, Notice Banner,
// Wi-Fi, Phone Numbers, Medical Store Info, Service Categories, Popular Cards, FAQs,
// Deliverable Items, Presets, and Local Directory) is 100% editable from the Staff Command Center
// and synced live to Supabase `guestcare.settings`.

import { CategoryCode, FAQItem, LocalServiceProvider, PresetServiceItem } from '@/types/guestcare';
import {
  fetchAllSettingsFromSupabase,
  upsertSettingToSupabase,
  subscribeToGuestCareRealtime,
} from '@/lib/supabaseSync';

const STORAGE_KEYS = {
  FAQS: 'guestcare_config_faqs_v3',
  ITEMS: 'guestcare_config_items_v3',
  PRESETS: 'guestcare_config_presets_v3',
  PROVIDERS: 'guestcare_config_providers_v5',
  WIFI: 'guestcare_config_wifi_v3',
  CONTACT: 'guestcare_config_contact_v1',
  BRANDING: 'guestcare_config_branding_v1',
  POPULAR: 'guestcare_config_popular_v1',
  CATEGORIES: 'guestcare_config_categories_v1',
};

export interface CategoryPreset {
  id: string;
  categoryCode: CategoryCode;
  label: string;
  isActive: boolean;
}

export interface WifiConfig {
  networkName: string;
  password: string;
}

export interface PortalBrandingConfig {
  portalBrandName: string;
  heroHeadline: string;
  heroSubtitle: string;
  heroCtaLabel: string;
  directorySectionTitle: string;
  directoryCardTitle: string;
  directoryCardDescription: string;
  noticeBanner: string;
}

export interface PopularServiceConfig {
  id: string;
  title: string;
  subtitle: string;
  eta: string;
  categoryCode: CategoryCode;
  presetText: string;
  imageUrl: string;
  isActive: boolean;
}

export interface CategoryOverride {
  name?: string;
  shortName?: string;
  tagline?: string;
  description?: string;
  slaMinutes?: number;
  isActive?: boolean;
}

export interface ContactAndBuildingConfig {
  propertyName: string;
  frontDeskPhone: string;
  frontDeskWhatsapp: string;
  medicalStoreName: string;
  medicalStorePhone: string;
  medicalStoreHours: string;
  medicalStoreDescription: string;
  slaUrgentMinutes: number;
  slaHighMinutes: number;
  slaMediumMinutes: number;
  slaLowMinutes: number;
  tokenGracePeriodHours: number;
}

const DEFAULT_WIFI: WifiConfig = {
  networkName: 'GrandMarina-5G',
  password: 'residenceguest',
};

const DEFAULT_BRANDING: PortalBrandingConfig = {
  portalBrandName: 'GuestCare',
  heroHeadline: 'Your comfort, one tap away.',
  heroSubtitle:
    'Request housekeeping, laundry, maintenance, or order coffee, food, and everyday essentials right to your door.',
  heroCtaLabel: 'Explore Services',
  directorySectionTitle: 'Local Shops, Food & Ride Numbers',
  directoryCardTitle: 'Quick Dial — Ride, Food, Coffee & Shops',
  directoryCardDescription:
    'Direct dial numbers for Ethiopia rides (RIDE 8294, Feres 6090), ground floor medical store, mini-markets, coffee & meals.',
  noticeBanner: '',
};

const DEFAULT_POPULAR_SERVICES: PopularServiceConfig[] = [
  {
    id: 'pop-towels',
    title: 'Fresh Towels & Linens',
    subtitle: 'Housekeeping',
    eta: '~20 min',
    categoryCode: 'housekeeping',
    presetText: 'Fresh towel replacement',
    imageUrl:
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=600&q=80',
    isActive: true,
  },
  {
    id: 'pop-laundry',
    title: 'Laundry Pickup',
    subtitle: 'Laundry',
    eta: '~30 min',
    categoryCode: 'laundry',
    presetText: 'Pickup laundry bag for wash & fold',
    imageUrl:
      'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=600&q=80',
    isActive: true,
  },
  {
    id: 'pop-shop',
    title: 'Coffee, Tea & Shop',
    subtitle: 'Shop & Delivery',
    eta: '~25 min',
    categoryCode: 'shop_delivery',
    presetText: 'Order fresh coffee or tea to apartment',
    imageUrl:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
    isActive: true,
  },
  {
    id: 'pop-checkout',
    title: 'Late Check-out',
    subtitle: 'Front Desk',
    eta: 'Quick reply',
    categoryCode: 'guest_services',
    presetText: 'Request late check-out',
    imageUrl:
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
    isActive: true,
  },
];

const DEFAULT_CONTACT: ContactAndBuildingConfig = {
  propertyName: 'GuestCare Residences',
  frontDeskPhone: '+251 911 000 000',
  frontDeskWhatsapp: '+251911000000',
  medicalStoreName: 'Ground Floor Medical Store',
  medicalStorePhone: '+251 911 550 100',
  medicalStoreHours: '8:00 AM – 10:00 PM Daily',
  medicalStoreDescription:
    'Located on the ground floor of this building for medicines, prescriptions, first-aid, and health essentials.',
  slaUrgentMinutes: 15,
  slaHighMinutes: 45,
  slaMediumMinutes: 120,
  slaLowMinutes: 240,
  tokenGracePeriodHours: 2,
};

const DEFAULT_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'What time is standard check-out?',
    answer:
      'Standard check-out is 11:00 AM. If you need extra time, select "Front Desk" and request a late check-out.',
    isActive: true,
  },
  {
    id: 'faq-2',
    question: 'How do I connect to the apartment Wi-Fi?',
    answer:
      'The Wi-Fi network name and password are shown right at the top of your Guest Portal with a one-tap Copy button.',
    isActive: true,
  },
  {
    id: 'faq-3',
    question: 'How does Laundry service work?',
    answer:
      'Place your clothes in the laundry bag inside the wardrobe and submit a Laundry request. Same-day wash & fold pickup is available before 10:00 AM.',
    isActive: true,
  },
  {
    id: 'faq-4',
    question: 'How do I get a taxi or order food, coffee, or SIM cards?',
    answer:
      'Open the "Local Shops, Food & Ride Numbers" card to call RIDE (8294), Feres (6090), or local shops directly — or place a "Shop & Delivery" request for Front Desk delivery.',
    isActive: true,
  },
  {
    id: 'faq-5',
    question: 'Where is the nearest pharmacy or medical store?',
    answer: 'There is a Medical Store located directly on the Ground Floor of this building.',
    isActive: true,
  },
];

const DEFAULT_DELIVERABLE_ITEMS: PresetServiceItem[] = [
  // Housekeeping
  { id: 'item-bath-towel', categoryCode: 'housekeeping', name: 'Bath Towels', unit: 'towels', maxQty: 6, isActive: true },
  { id: 'item-hand-towel', categoryCode: 'housekeeping', name: 'Hand & Face Towels', unit: 'towels', maxQty: 4, isActive: true },
  { id: 'item-pillow', categoryCode: 'housekeeping', name: 'Extra Pillow', unit: 'pillows', maxQty: 4, isActive: true },
  { id: 'item-bedsheet', categoryCode: 'housekeeping', name: 'Fresh Bed Linen Set', unit: 'set', maxQty: 2, isActive: true },
  { id: 'item-toiletries', categoryCode: 'housekeeping', name: 'Shampoo & Shower Gel', unit: 'set', maxQty: 3, isActive: true },
  { id: 'item-dental', categoryCode: 'housekeeping', name: 'Dental / Shaving Kit', unit: 'kits', maxQty: 4, isActive: true },

  // Laundry
  { id: 'item-laundry-wash', categoryCode: 'laundry', name: 'Wash & Fold Bag', unit: 'bags', maxQty: 4, priceLabel: 'Standard rate', isActive: true },
  { id: 'item-laundry-iron', categoryCode: 'laundry', name: 'Shirt / Garment Ironing', unit: 'pieces', maxQty: 10, priceLabel: 'Per piece', isActive: true },
  { id: 'item-laundry-dry', categoryCode: 'laundry', name: 'Dry Cleaning', unit: 'pieces', maxQty: 8, priceLabel: 'Per piece', isActive: true },
  { id: 'item-laundry-bag', categoryCode: 'laundry', name: 'Extra Laundry Bag', unit: 'bags', maxQty: 3, priceLabel: 'Free', isActive: true },

  // Shop & Delivery
  { id: 'shop-coffee', categoryCode: 'shop_delivery', name: 'Fresh Coffee / Espresso', unit: 'cups', maxQty: 6, isActive: true },
  { id: 'shop-tea', categoryCode: 'shop_delivery', name: 'Hot Tea (Black / Green / Spiced)', unit: 'cups', maxQty: 6, isActive: true },
  { id: 'shop-water', categoryCode: 'shop_delivery', name: 'Bottled Mineral Water', unit: 'bottles', maxQty: 12, isActive: true },
  { id: 'shop-food', categoryCode: 'shop_delivery', name: 'Local Meal / Food Order', unit: 'orders', maxQty: 6, isActive: true },
  { id: 'shop-card', categoryCode: 'shop_delivery', name: 'Mobile SIM / Top-Up Card', unit: 'cards', maxQty: 5, isActive: true },
  { id: 'shop-cigarettes', categoryCode: 'shop_delivery', name: 'Cigarettes / Tobacco (18+)', unit: 'packs', maxQty: 4, isActive: true },
  { id: 'shop-snacks', categoryCode: 'shop_delivery', name: 'Snacks & Soft Drinks', unit: 'items', maxQty: 8, isActive: true },

  // Comfort
  { id: 'item-fan', categoryCode: 'comfort', name: 'Standing Fan', unit: 'unit', maxQty: 2, isActive: true },
  { id: 'item-blanket', categoryCode: 'comfort', name: 'Extra Warm Blanket', unit: 'blankets', maxQty: 3, isActive: true },
  { id: 'item-iron-board', categoryCode: 'comfort', name: 'Iron & Ironing Board', unit: 'set', maxQty: 1, isActive: true },
  { id: 'item-glasses', categoryCode: 'comfort', name: 'Drinking / Wine Glasses', unit: 'glasses', maxQty: 6, isActive: true },

  // Wi-Fi & Tech
  { id: 'item-adapter', categoryCode: 'internet_tech', name: 'Universal Power Adapter', unit: 'adapter', maxQty: 3, isActive: true },
  { id: 'item-hdmi', categoryCode: 'internet_tech', name: 'HDMI Cable', unit: 'cable', maxQty: 2, isActive: true },
  { id: 'item-extension', categoryCode: 'internet_tech', name: 'Multi-Plug Power Strip', unit: 'unit', maxQty: 2, isActive: true },
];

const DEFAULT_PRESETS: CategoryPreset[] = [
  { id: 'pre-m1', categoryCode: 'maintenance', label: 'No hot water / low shower pressure', isActive: true },
  { id: 'pre-m2', categoryCode: 'maintenance', label: 'Sink or shower drain is slow', isActive: true },
  { id: 'pre-m3', categoryCode: 'maintenance', label: 'Light bulb out or power socket issue', isActive: true },
  { id: 'pre-m4', categoryCode: 'maintenance', label: 'Kitchen appliance issue (fridge / stove / kettle)', isActive: true },
  { id: 'pre-m5', categoryCode: 'maintenance', label: 'Door lock, window, or safe issue', isActive: true },

  { id: 'pre-h1', categoryCode: 'housekeeping', label: 'Full apartment cleaning & refresh', isActive: true },
  { id: 'pre-h2', categoryCode: 'housekeeping', label: 'Fresh towel replacement', isActive: true },
  { id: 'pre-h3', categoryCode: 'housekeeping', label: 'Change bed sheets & linens', isActive: true },
  { id: 'pre-h4', categoryCode: 'housekeeping', label: 'Trash & recycling pickup', isActive: true },

  { id: 'pre-l1', categoryCode: 'laundry', label: 'Pickup laundry bag for wash & fold', isActive: true },
  { id: 'pre-l2', categoryCode: 'laundry', label: 'Express ironing service', isActive: true },
  { id: 'pre-l3', categoryCode: 'laundry', label: 'Dry cleaning pickup', isActive: true },
  { id: 'pre-l4', categoryCode: 'laundry', label: 'Need clothes drying rack / hangers', isActive: true },

  { id: 'pre-s1', categoryCode: 'shop_delivery', label: 'Order fresh coffee or tea to apartment', isActive: true },
  { id: 'pre-s2', categoryCode: 'shop_delivery', label: 'Buy mobile recharge card / SIM card', isActive: true },
  { id: 'pre-s3', categoryCode: 'shop_delivery', label: 'Buy cigarettes / mini-market items', isActive: true },
  { id: 'pre-s4', categoryCode: 'shop_delivery', label: 'Order food / snacks delivery', isActive: true },

  { id: 'pre-c1', categoryCode: 'comfort', label: 'Request standing fan or extra blanket', isActive: true },
  { id: 'pre-c2', categoryCode: 'comfort', label: 'Need iron & ironing board', isActive: true },
  { id: 'pre-c3', categoryCode: 'comfort', label: 'Extra kitchenware or glasses', isActive: true },

  { id: 'pre-t1', categoryCode: 'internet_tech', label: 'Wi-Fi not connecting or slow', isActive: true },
  { id: 'pre-t2', categoryCode: 'internet_tech', label: 'Smart TV / remote control issue', isActive: true },
  { id: 'pre-t3', categoryCode: 'internet_tech', label: 'Need power adapter or extension cord', isActive: true },

  { id: 'pre-f1', categoryCode: 'guest_services', label: 'Request late check-out', isActive: true },
  { id: 'pre-f2', categoryCode: 'guest_services', label: 'Luggage assistance / bag storage', isActive: true },
  { id: 'pre-f3', categoryCode: 'guest_services', label: 'Extra apartment keycard', isActive: true },
  { id: 'pre-f4', categoryCode: 'guest_services', label: 'Airport taxi / ride booking', isActive: true },

  { id: 'pre-o1', categoryCode: 'other', label: 'Invoice or billing question', isActive: true },
  { id: 'pre-o2', categoryCode: 'other', label: 'General question for reception', isActive: true },
];

const DEFAULT_PROVIDERS: LocalServiceProvider[] = [
  {
    id: 'prov-ride',
    name: 'RIDE Taxi (Ethiopia)',
    category: 'Ride & Taxi',
    description: '24/7 metered taxi & airport pickup anywhere in Addis Ababa.',
    itemsOffered: ['City Ride', 'Airport Transfer'],
    phone: '8294',
    hours: '24/7',
    isActive: true,
  },
  {
    id: 'prov-feres',
    name: 'Feres Ride (Ethiopia)',
    category: 'Ride & Taxi',
    description: 'Fast on-demand city car dispatch across Addis Ababa.',
    itemsOffered: ['City Ride', 'Airport Pickup'],
    phone: '6090',
    hours: '24/7',
    isActive: true,
  },
  {
    id: 'prov-medical-ground',
    name: 'Building Medical Store (Ground Floor)',
    category: 'Medical Store & Pharmacy',
    description: 'Located right on the Ground Floor of this building — medicines, first-aid & personal care.',
    itemsOffered: ['Medicines', 'First Aid', 'Health Essentials'],
    phone: '+251 911 550 100',
    whatsapp: '+251911550100',
    hours: '8:00 AM – 10:00 PM',
    isActive: true,
  },
  {
    id: 'prov-market',
    name: 'Nearby Mini Market & Shop',
    category: 'Mini Market & Shop',
    description: 'Ethio Telecom / Safaricom cards, cigarettes, bottled water & snacks.',
    itemsOffered: ['Mobile Cards', 'Cigarettes', 'Water', 'Snacks'],
    phone: '+251 911 234 567',
    whatsapp: '+251911234567',
    hours: 'Open 24/7',
    isActive: true,
  },
  {
    id: 'prov-coffee',
    name: 'Local Coffee & Tea Bar',
    category: 'Coffee & Tea',
    description: 'Fresh Ethiopian coffee, macchiato, spiced tea & warm pastries.',
    itemsOffered: ['Ethiopian Coffee', 'Macchiato', 'Tea', 'Pastries'],
    phone: '+251 911 345 678',
    whatsapp: '+251911345678',
    hours: '6:30 AM – 9:30 PM',
    isActive: true,
  },
  {
    id: 'prov-food',
    name: 'Local Food & Meal Delivery',
    category: 'Food & Meals',
    description: 'Hot traditional Ethiopian & international meals delivered to your door.',
    itemsOffered: ['Lunch & Dinner', 'Traditional Dishes', 'Grills & Salads'],
    phone: '+251 911 456 789',
    whatsapp: '+251911456789',
    hours: '10:00 AM – 11:00 PM',
    isActive: true,
  },
];

function load<T>(key: string, fallback: T): T {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    }
  } catch {
    // Ignore storage errors in tests
  }
  return fallback;
}

function save<T>(key: string, value: T): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // Ignore storage errors in tests
  }
}

class PortalConfigService {
  private faqs: FAQItem[] = load(STORAGE_KEYS.FAQS, DEFAULT_FAQS);
  private items: PresetServiceItem[] = load(STORAGE_KEYS.ITEMS, DEFAULT_DELIVERABLE_ITEMS);
  private presets: CategoryPreset[] = load(STORAGE_KEYS.PRESETS, DEFAULT_PRESETS);
  private providers: LocalServiceProvider[] = load(STORAGE_KEYS.PROVIDERS, DEFAULT_PROVIDERS);
  private wifi: WifiConfig = load(STORAGE_KEYS.WIFI, DEFAULT_WIFI);
  private contact: ContactAndBuildingConfig = load(STORAGE_KEYS.CONTACT, DEFAULT_CONTACT);
  private branding: PortalBrandingConfig = load(STORAGE_KEYS.BRANDING, DEFAULT_BRANDING);
  private popularServices: PopularServiceConfig[] = load(STORAGE_KEYS.POPULAR, DEFAULT_POPULAR_SERVICES);
  private categoryOverrides: Partial<Record<CategoryCode, CategoryOverride>> = load(
    STORAGE_KEYS.CATEGORIES,
    {}
  );
  private listeners: Array<() => void> = [];

  constructor() {
    void this.syncFromSupabase();
    subscribeToGuestCareRealtime(() => {
      void this.syncFromSupabase();
    });
  }

  async syncFromSupabase(): Promise<void> {
    const remote = await fetchAllSettingsFromSupabase();
    if (!remote) return;
    let changed = false;
    if (Array.isArray(remote.portal_faqs)) {
      this.faqs = remote.portal_faqs;
      changed = true;
    }
    if (Array.isArray(remote.portal_deliverable_items)) {
      this.items = remote.portal_deliverable_items;
      changed = true;
    }
    if (Array.isArray(remote.portal_presets)) {
      this.presets = remote.portal_presets;
      changed = true;
    }
    if (Array.isArray(remote.portal_providers)) {
      this.providers = remote.portal_providers;
      changed = true;
    }
    if (remote.wifi_config && typeof remote.wifi_config === 'object') {
      this.wifi = { ...this.wifi, ...remote.wifi_config };
      changed = true;
    }
    if (remote.contact_info && typeof remote.contact_info === 'object') {
      this.contact = { ...this.contact, ...remote.contact_info };
      changed = true;
    }
    if (remote.portal_branding && typeof remote.portal_branding === 'object') {
      this.branding = { ...this.branding, ...remote.portal_branding };
      changed = true;
    }
    if (Array.isArray(remote.portal_popular_services)) {
      this.popularServices = remote.portal_popular_services;
      changed = true;
    }
    if (remote.portal_category_overrides && typeof remote.portal_category_overrides === 'object') {
      this.categoryOverrides = remote.portal_category_overrides;
      changed = true;
    }
    if (changed) {
      this.saveLocalOnly();
      this.listeners.forEach(l => l());
    }
  }

  private saveLocalOnly(): void {
    save(STORAGE_KEYS.FAQS, this.faqs);
    save(STORAGE_KEYS.ITEMS, this.items);
    save(STORAGE_KEYS.PRESETS, this.presets);
    save(STORAGE_KEYS.PROVIDERS, this.providers);
    save(STORAGE_KEYS.WIFI, this.wifi);
    save(STORAGE_KEYS.CONTACT, this.contact);
    save(STORAGE_KEYS.BRANDING, this.branding);
    save(STORAGE_KEYS.POPULAR, this.popularServices);
    save(STORAGE_KEYS.CATEGORIES, this.categoryOverrides);
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emit(syncKey?: string): void {
    this.saveLocalOnly();

    // Sync asynchronously to live Supabase `guestcare.settings`
    if (!syncKey || syncKey === 'portal_faqs') {
      void upsertSettingToSupabase('portal_faqs', this.faqs, 'Guest portal FAQs');
    }
    if (!syncKey || syncKey === 'portal_deliverable_items') {
      void upsertSettingToSupabase('portal_deliverable_items', this.items, 'Guest portal deliverable items');
    }
    if (!syncKey || syncKey === 'portal_presets') {
      void upsertSettingToSupabase('portal_presets', this.presets, 'Guest portal quick presets');
    }
    if (!syncKey || syncKey === 'portal_providers') {
      void upsertSettingToSupabase('portal_providers', this.providers, 'Local directory & Ethiopia ride numbers');
    }
    if (!syncKey || syncKey === 'wifi_config') {
      void upsertSettingToSupabase('wifi_config', this.wifi, 'Apartment Wi-Fi credentials');
    }
    if (!syncKey || syncKey === 'contact_info') {
      void upsertSettingToSupabase('contact_info', this.contact, 'Building contact numbers & medical store info');
    }
    if (!syncKey || syncKey === 'portal_branding') {
      void upsertSettingToSupabase('portal_branding', this.branding, 'Guest portal hero text, branding & notices');
    }
    if (!syncKey || syncKey === 'portal_popular_services') {
      void upsertSettingToSupabase('portal_popular_services', this.popularServices, 'Popular one-tap request cards');
    }
    if (!syncKey || syncKey === 'portal_category_overrides') {
      void upsertSettingToSupabase('portal_category_overrides', this.categoryOverrides, 'Editable service category labels & visibility');
    }

    this.listeners.forEach(l => l());
  }

  // --- Portal Branding, Hero & Directory Copy ---
  getBranding(): PortalBrandingConfig {
    return { ...this.branding };
  }

  updateBranding(patch: Partial<PortalBrandingConfig>): void {
    this.branding = { ...this.branding, ...patch };
    this.emit('portal_branding');
  }

  // --- Popular Request Cards ---
  getPopularServices(onlyActive = false): PopularServiceConfig[] {
    return onlyActive ? this.popularServices.filter(p => p.isActive) : [...this.popularServices];
  }

  addPopularService(input: Omit<PopularServiceConfig, 'id'>): PopularServiceConfig {
    const item: PopularServiceConfig = {
      ...input,
      id: `pop-${Date.now()}`,
      isActive: input.isActive !== false,
    };
    this.popularServices.push(item);
    this.emit('portal_popular_services');
    return item;
  }

  updatePopularService(id: string, patch: Partial<Omit<PopularServiceConfig, 'id'>>): void {
    this.popularServices = this.popularServices.map(p => (p.id === id ? { ...p, ...patch } : p));
    this.emit('portal_popular_services');
  }

  deletePopularService(id: string): void {
    this.popularServices = this.popularServices.filter(p => p.id !== id);
    this.emit('portal_popular_services');
  }

  // --- Service Category Overrides ---
  getCategoryOverrides(): Partial<Record<CategoryCode, CategoryOverride>> {
    return { ...this.categoryOverrides };
  }

  updateCategoryOverride(code: CategoryCode, patch: Partial<CategoryOverride>): void {
    this.categoryOverrides = {
      ...this.categoryOverrides,
      [code]: { ...(this.categoryOverrides[code] || {}), ...patch },
    };
    this.emit('portal_category_overrides');
  }

  // --- Contact, Phone Numbers & Building Info ---
  getContact(): ContactAndBuildingConfig {
    return { ...this.contact };
  }

  updateContact(patch: Partial<ContactAndBuildingConfig>): void {
    this.contact = { ...this.contact, ...patch };
    // Keep Ground Floor Medical Store directory entry aligned automatically
    const medIdx = this.providers.findIndex(p => p.id === 'prov-medical-ground');
    if (medIdx >= 0) {
      const prev = this.providers[medIdx];
      this.providers[medIdx] = {
        ...prev,
        name: this.contact.medicalStoreName || prev.name,
        phone: this.contact.medicalStorePhone || prev.phone,
        hours: this.contact.medicalStoreHours || prev.hours,
        description: this.contact.medicalStoreDescription || prev.description,
      };
      this.emit();
      return;
    }
    this.emit('contact_info');
  }

  // --- Wi-Fi Info ---
  getWifi(): WifiConfig {
    return { ...this.wifi };
  }

  updateWifi(patch: Partial<WifiConfig>): void {
    this.wifi = { ...this.wifi, ...patch };
    this.emit('wifi_config');
  }

  // --- FAQs ---
  getFaqs(onlyActive = false): FAQItem[] {
    return onlyActive ? this.faqs.filter(f => f.isActive) : [...this.faqs];
  }

  addFaq(question: string, answer: string): FAQItem {
    const item: FAQItem = {
      id: `faq-${Date.now()}`,
      question: question.trim(),
      answer: answer.trim(),
      isActive: true,
    };
    this.faqs.push(item);
    this.emit('portal_faqs');
    return item;
  }

  updateFaq(id: string, patch: Partial<Omit<FAQItem, 'id'>>): void {
    this.faqs = this.faqs.map(f => (f.id === id ? { ...f, ...patch } : f));
    this.emit('portal_faqs');
  }

  deleteFaq(id: string): void {
    this.faqs = this.faqs.filter(f => f.id !== id);
    this.emit('portal_faqs');
  }

  // --- Deliverable Items ---
  getDeliverableItems(categoryCode?: CategoryCode, onlyActive = false): PresetServiceItem[] {
    let list = [...this.items];
    if (categoryCode) {
      list = list.filter(i => i.categoryCode === categoryCode);
    }
    if (onlyActive) {
      list = list.filter(i => i.isActive !== false);
    }
    return list;
  }

  addDeliverableItem(input: Omit<PresetServiceItem, 'id'>): PresetServiceItem {
    const item: PresetServiceItem = {
      ...input,
      id: `item-${Date.now()}`,
      isActive: input.isActive !== false,
      maxQty: input.maxQty || 6,
    };
    this.items.push(item);
    this.emit('portal_deliverable_items');
    return item;
  }

  updateDeliverableItem(id: string, patch: Partial<Omit<PresetServiceItem, 'id'>>): void {
    this.items = this.items.map(i => (i.id === id ? { ...i, ...patch } : i));
    this.emit('portal_deliverable_items');
  }

  deleteDeliverableItem(id: string): void {
    this.items = this.items.filter(i => i.id !== id);
    this.emit('portal_deliverable_items');
  }

  // --- Common Presets ---
  getPresets(categoryCode?: CategoryCode, onlyActive = false): CategoryPreset[] {
    let list = [...this.presets];
    if (categoryCode) {
      list = list.filter(p => p.categoryCode === categoryCode);
    }
    if (onlyActive) {
      list = list.filter(p => p.isActive);
    }
    return list;
  }

  addPreset(categoryCode: CategoryCode, label: string): CategoryPreset {
    const item: CategoryPreset = {
      id: `pre-${Date.now()}`,
      categoryCode,
      label: label.trim(),
      isActive: true,
    };
    this.presets.push(item);
    this.emit('portal_presets');
    return item;
  }

  updatePreset(id: string, patch: Partial<Omit<CategoryPreset, 'id'>>): void {
    this.presets = this.presets.map(p => (p.id === id ? { ...p, ...patch } : p));
    this.emit('portal_presets');
  }

  deletePreset(id: string): void {
    this.presets = this.presets.filter(p => p.id !== id);
    this.emit('portal_presets');
  }

  // --- Local Service Providers & Quick Dial ---
  getProviders(onlyActive = false): LocalServiceProvider[] {
    return onlyActive ? this.providers.filter(p => p.isActive) : [...this.providers];
  }

  addProvider(input: Omit<LocalServiceProvider, 'id'>): LocalServiceProvider {
    const provider: LocalServiceProvider = {
      ...input,
      id: `prov-${Date.now()}`,
    };
    this.providers.push(provider);
    this.emit('portal_providers');
    return provider;
  }

  updateProvider(id: string, patch: Partial<Omit<LocalServiceProvider, 'id'>>): void {
    this.providers = this.providers.map(p => (p.id === id ? { ...p, ...patch } : p));
    this.emit('portal_providers');
  }

  deleteProvider(id: string): void {
    this.providers = this.providers.filter(p => p.id !== id);
    this.emit('portal_providers');
  }

  resetDefaults(): void {
    this.faqs = [...DEFAULT_FAQS];
    this.items = [...DEFAULT_DELIVERABLE_ITEMS];
    this.presets = [...DEFAULT_PRESETS];
    this.providers = [...DEFAULT_PROVIDERS];
    this.wifi = { ...DEFAULT_WIFI };
    this.contact = { ...DEFAULT_CONTACT };
    this.branding = { ...DEFAULT_BRANDING };
    this.popularServices = [...DEFAULT_POPULAR_SERVICES];
    this.categoryOverrides = {};
    this.emit();
  }
}

export const portalConfigService = new PortalConfigService();
