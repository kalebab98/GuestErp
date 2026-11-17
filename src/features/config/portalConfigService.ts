// Portal Content & Catalog Configuration Service
// All FAQs, Deliverable Items, Common Presets, Wi-Fi Info, and Local Directory Numbers
// are dynamically editable from the Staff Dashboard and reflect live in the Guest Portal.

import { CategoryCode, FAQItem, LocalServiceProvider, PresetServiceItem } from '@/types/guestcare';

const STORAGE_KEYS = {
  FAQS: 'guestcare_config_faqs_v3',
  ITEMS: 'guestcare_config_items_v3',
  PRESETS: 'guestcare_config_presets_v3',
  PROVIDERS: 'guestcare_config_providers_v3',
  WIFI: 'guestcare_config_wifi_v3',
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

const DEFAULT_WIFI: WifiConfig = {
  networkName: 'GrandMarina-5G',
  password: 'residenceguest',
};

const DEFAULT_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'What time is standard check-out?',
    answer: 'Standard check-out is 11:00 AM. If you need extra time, select "Front Desk" and request a late check-out.',
    isActive: true,
  },
  {
    id: 'faq-2',
    question: 'How do I connect to the apartment Wi-Fi?',
    answer: 'The Wi-Fi network name and password are shown right at the top of your Guest Portal with a one-tap Copy button.',
    isActive: true,
  },
  {
    id: 'faq-3',
    question: 'How does Laundry service work?',
    answer: 'Place your clothes in the laundry bag inside the wardrobe and submit a Laundry request. Same-day wash & fold pickup is available before 10:00 AM.',
    isActive: true,
  },
  {
    id: 'faq-4',
    question: 'How do I get a taxi or order food, coffee, or SIM cards?',
    answer: 'Use the "Local Services & Quick Dial" card below to call RIDE (8294), Feres (6090), or local shops directly — or place a "Shop & Delivery" request for our Front Desk to bring it to your door.',
    isActive: true,
  },
  {
    id: 'faq-5',
    question: 'Where do I dispose of trash & recycling?',
    answer: 'Trash chutes are located beside the service elevator on every floor, or request pickup anytime under Housekeeping.',
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
  // Maintenance (no AC)
  { id: 'pre-m1', categoryCode: 'maintenance', label: 'No hot water / low shower pressure', isActive: true },
  { id: 'pre-m2', categoryCode: 'maintenance', label: 'Sink or shower drain is slow', isActive: true },
  { id: 'pre-m3', categoryCode: 'maintenance', label: 'Light bulb out or power socket issue', isActive: true },
  { id: 'pre-m4', categoryCode: 'maintenance', label: 'Kitchen appliance issue (fridge / stove / kettle)', isActive: true },
  { id: 'pre-m5', categoryCode: 'maintenance', label: 'Door lock, window, or safe issue', isActive: true },

  // Housekeeping
  { id: 'pre-h1', categoryCode: 'housekeeping', label: 'Full apartment cleaning & refresh', isActive: true },
  { id: 'pre-h2', categoryCode: 'housekeeping', label: 'Fresh towel replacement', isActive: true },
  { id: 'pre-h3', categoryCode: 'housekeeping', label: 'Change bed sheets & linens', isActive: true },
  { id: 'pre-h4', categoryCode: 'housekeeping', label: 'Trash & recycling pickup', isActive: true },

  // Laundry
  { id: 'pre-l1', categoryCode: 'laundry', label: 'Pickup laundry bag for wash & fold', isActive: true },
  { id: 'pre-l2', categoryCode: 'laundry', label: 'Express ironing service', isActive: true },
  { id: 'pre-l3', categoryCode: 'laundry', label: 'Dry cleaning pickup', isActive: true },
  { id: 'pre-l4', categoryCode: 'laundry', label: 'Need clothes drying rack / hangers', isActive: true },

  // Shop & Delivery
  { id: 'pre-s1', categoryCode: 'shop_delivery', label: 'Order fresh coffee or tea to apartment', isActive: true },
  { id: 'pre-s2', categoryCode: 'shop_delivery', label: 'Buy mobile recharge card / SIM card', isActive: true },
  { id: 'pre-s3', categoryCode: 'shop_delivery', label: 'Buy cigarettes / mini-market items', isActive: true },
  { id: 'pre-s4', categoryCode: 'shop_delivery', label: 'Order food / snacks delivery', isActive: true },

  // Comfort
  { id: 'pre-c1', categoryCode: 'comfort', label: 'Request standing fan or extra blanket', isActive: true },
  { id: 'pre-c2', categoryCode: 'comfort', label: 'Need iron & ironing board', isActive: true },
  { id: 'pre-c3', categoryCode: 'comfort', label: 'Extra kitchenware or glasses', isActive: true },

  // Wi-Fi & Tech
  { id: 'pre-t1', categoryCode: 'internet_tech', label: 'Wi-Fi not connecting or slow', isActive: true },
  { id: 'pre-t2', categoryCode: 'internet_tech', label: 'Smart TV / remote control issue', isActive: true },
  { id: 'pre-t3', categoryCode: 'internet_tech', label: 'Need power adapter or extension cord', isActive: true },

  // Front Desk
  { id: 'pre-f1', categoryCode: 'guest_services', label: 'Request late check-out', isActive: true },
  { id: 'pre-f2', categoryCode: 'guest_services', label: 'Luggage assistance / bag storage', isActive: true },
  { id: 'pre-f3', categoryCode: 'guest_services', label: 'Extra apartment keycard', isActive: true },
  { id: 'pre-f4', categoryCode: 'guest_services', label: 'Airport taxi / ride booking', isActive: true },

  // Other
  { id: 'pre-o1', categoryCode: 'other', label: 'Invoice or billing question', isActive: true },
  { id: 'pre-o2', categoryCode: 'other', label: 'General question for reception', isActive: true },
];

// Unified Local Services & Quick Dial Directory (Ethiopia Ride + Shops + Coffee + Food)
const DEFAULT_PROVIDERS: LocalServiceProvider[] = [
  {
    id: 'prov-ride',
    name: 'RIDE Taxi (Ethiopia)',
    category: 'Ride & Airport Taxi',
    description: '24/7 metered taxi & airport pickup anywhere in Addis Ababa.',
    itemsOffered: ['City Ride', 'Airport Transfer'],
    phone: '8294',
    hours: '24/7',
    isActive: true,
  },
  {
    id: 'prov-feres',
    name: 'Feres Ride (Ethiopia)',
    category: 'Ride & City Taxi',
    description: 'Fast on-demand city car dispatch across Addis Ababa.',
    itemsOffered: ['City Ride', 'Airport Pickup'],
    phone: '6090',
    hours: '24/7',
    isActive: true,
  },
  {
    id: 'prov-market',
    name: 'Nearby Mini Market & Shop',
    category: 'Cards, Cigarettes, Water & Snacks',
    description: 'Ethio Telecom / Safaricom recharge cards, cigarettes, bottled water & daily items.',
    itemsOffered: ['Mobile Cards', 'Cigarettes', 'Water', 'Snacks'],
    phone: '+251 911 234 567',
    whatsapp: '+251911234567',
    hours: 'Open 24/7',
    isActive: true,
  },
  {
    id: 'prov-coffee',
    name: 'Local Coffee & Tea Bar',
    category: 'Coffee, Tea & Breakfast',
    description: 'Fresh Ethiopian coffee, macchiato, spiced tea, and warm pastries delivered to your door.',
    itemsOffered: ['Ethiopian Coffee', 'Macchiato', 'Tea', 'Pastries'],
    phone: '+251 911 345 678',
    whatsapp: '+251911345678',
    hours: '6:30 AM – 9:30 PM',
    isActive: true,
  },
  {
    id: 'prov-food',
    name: 'Local Food & Meal Delivery',
    category: 'Food & Restaurant Service',
    description: 'Hot traditional Ethiopian & international meals delivered directly to the apartment.',
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
  private listeners: Array<() => void> = [];

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emit(): void {
    save(STORAGE_KEYS.FAQS, this.faqs);
    save(STORAGE_KEYS.ITEMS, this.items);
    save(STORAGE_KEYS.PRESETS, this.presets);
    save(STORAGE_KEYS.PROVIDERS, this.providers);
    save(STORAGE_KEYS.WIFI, this.wifi);
    this.listeners.forEach(l => l());
  }

  // --- Wi-Fi Info ---
  getWifi(): WifiConfig {
    return { ...this.wifi };
  }

  updateWifi(patch: Partial<WifiConfig>): void {
    this.wifi = { ...this.wifi, ...patch };
    this.emit();
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
    this.emit();
    return item;
  }

  updateFaq(id: string, patch: Partial<Omit<FAQItem, 'id'>>): void {
    this.faqs = this.faqs.map(f => (f.id === id ? { ...f, ...patch } : f));
    this.emit();
  }

  deleteFaq(id: string): void {
    this.faqs = this.faqs.filter(f => f.id !== id);
    this.emit();
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
    this.emit();
    return item;
  }

  updateDeliverableItem(id: string, patch: Partial<Omit<PresetServiceItem, 'id'>>): void {
    this.items = this.items.map(i => (i.id === id ? { ...i, ...patch } : i));
    this.emit();
  }

  deleteDeliverableItem(id: string): void {
    this.items = this.items.filter(i => i.id !== id);
    this.emit();
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
    this.emit();
    return item;
  }

  deletePreset(id: string): void {
    this.presets = this.presets.filter(p => p.id !== id);
    this.emit();
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
    this.emit();
    return provider;
  }

  updateProvider(id: string, patch: Partial<Omit<LocalServiceProvider, 'id'>>): void {
    this.providers = this.providers.map(p => (p.id === id ? { ...p, ...patch } : p));
    this.emit();
  }

  deleteProvider(id: string): void {
    this.providers = this.providers.filter(p => p.id !== id);
    this.emit();
  }

  resetDefaults(): void {
    this.faqs = [...DEFAULT_FAQS];
    this.items = [...DEFAULT_DELIVERABLE_ITEMS];
    this.presets = [...DEFAULT_PRESETS];
    this.providers = [...DEFAULT_PROVIDERS];
    this.wifi = { ...DEFAULT_WIFI };
    this.emit();
  }
}

export const portalConfigService = new PortalConfigService();
