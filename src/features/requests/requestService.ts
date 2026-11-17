// Request Management & Operations Service
// Upgraded with rich subcategories, item catalogs, and tailored hospitality presets

import {
  Category,
  GuestRequest,
  RequestStatus,
  Priority,
  Department,
  RequestComment,
  StatusHistoryEntry,
  GuestFeedback,
  FeedbackAction,
  GuestHealthRecord,
  RequestedItemPayload,
} from '@/types/guestcare';
import { notificationService } from '@/features/notifications/notificationService';
import { GuestHealthEngine } from '@/features/health/healthEngine';

export const CATEGORIES: Category[] = [
  {
    id: 'cat-maint',
    code: 'maintenance',
    name: 'Maintenance & Repairs',
    shortName: 'Maintenance',
    tagline: 'Engineering technicians on standby for climate, plumbing, electrical, and fixtures',
    description: 'Air conditioning, plumbing, power outlets, kitchen appliances, and hardware',
    defaultDepartment: 'maintenance',
    defaultPriority: 'high',
    slaMinutes: 30,
    iconName: 'Wrench',
    displayOrder: 1,
    isActive: true,
    subcategories: [
      { id: 'sub-ac', name: 'Air Conditioning & Climate', description: 'Cooling, heating, fan speed, noise' },
      { id: 'sub-plumb', name: 'Plumbing & Restroom', description: 'Water pressure, drains, hot water, faucets' },
      { id: 'sub-elec', name: 'Lighting & Power', description: 'Bulbs, wall sockets, light switches, fuses' },
      { id: 'sub-appliance', name: 'Kitchen Appliances', description: 'Refrigerator, cooktop, dishwasher, oven, microwave' },
      { id: 'sub-fixtures', name: 'Doors, Safe & Windows', description: 'Keycard lock, safe code reset, balcony slider, blinds' },
    ],
    commonIssues: [
      'AC blowing room temperature air',
      'Shower drain draining slowly',
      'Low water pressure in shower',
      'Electronic safe won’t open / error code',
      'Refrigerator temperature feels too warm',
      'Bedside lamp bulb flickering',
      'Balcony door latch stuck',
      'Dishwasher not draining after cycle',
    ],
    createdAt: '2026-11-01T00:00:00Z',
  },
  {
    id: 'cat-hk',
    code: 'housekeeping',
    name: 'Housekeeping & Supplies',
    shortName: 'Housekeeping',
    tagline: 'Fresh linens, luxury toiletries, coffee refills, and full apartment refresh',
    description: 'Extra towels, pillow menu, toiletries, coffee pods, trash collection, and cleaning',
    defaultDepartment: 'housekeeping',
    defaultPriority: 'medium',
    slaMinutes: 25,
    iconName: 'Sparkles',
    displayOrder: 2,
    isActive: true,
    subcategories: [
      { id: 'sub-towels', name: 'Towels & Linens', description: 'Plush bath towels, robes, bed sheets' },
      { id: 'sub-toiletries', name: 'Luxury Toiletries', description: 'Shampoo, body wash, dental & shaving kits' },
      { id: 'sub-coffee', name: 'Coffee & Refreshments', description: 'Nespresso capsules, fine tea, sugar, water' },
      { id: 'sub-cleaning', name: 'Room Refresh & Cleaning', description: 'Full room refresh, linen change, trash removal' },
    ],
    presetItems: [
      { id: 'item-bath-towel', name: 'Plush Bath Sheets', unit: 'towels', defaultQty: 2, maxQty: 6 },
      { id: 'item-hand-towel', name: 'Hand & Face Towels', unit: 'towels', defaultQty: 2, maxQty: 4 },
      { id: 'item-bath-robe', name: 'Luxury Cotton Bathrobe', unit: 'robes', defaultQty: 1, maxQty: 4 },
      { id: 'item-nespresso', name: 'Nespresso Coffee Pods', unit: 'pods', defaultQty: 4, maxQty: 12 },
      { id: 'item-tea-box', name: 'Artisan Tea Selection', unit: 'sachets', defaultQty: 4, maxQty: 10 },
      { id: 'item-dental-kit', name: 'Dental Kit (Toothbrush + Paste)', unit: 'kits', defaultQty: 2, maxQty: 4 },
      { id: 'item-shaving-kit', name: 'Shaving Kit & Cream', unit: 'kits', defaultQty: 1, maxQty: 3 },
      { id: 'item-extra-pillow', name: 'Hypoallergenic Pillow', unit: 'pillows', defaultQty: 2, maxQty: 4 },
      { id: 'item-bottled-water', name: 'Still Mineral Water (750ml)', unit: 'bottles', defaultQty: 2, maxQty: 6 },
      { id: 'item-trash-pickup', name: 'Trash & Recycling Collection', unit: 'service', defaultQty: 1, maxQty: 1 },
    ],
    commonIssues: [
      'Full room refresh & bed makeup',
      'Fresh bath towel replacement',
      'Replenish Nespresso capsules & tea',
      'Fresh bed linen change',
      'Extra shampoo, conditioner & shower gel',
      'Please collect trash & recyclables',
    ],
    createdAt: '2026-11-01T00:00:00Z',
  },
  {
    id: 'cat-comfort',
    code: 'comfort',
    name: 'Comfort & Room Conditions',
    shortName: 'Comfort',
    tagline: 'Personalized climate, pillow selection, sleep wellness, and kitchenware',
    description: 'Pillow menu, temperature fine-tuning, sleep accessories, kitchen essentials',
    defaultDepartment: 'reception',
    defaultPriority: 'medium',
    slaMinutes: 40,
    iconName: 'BedDouble',
    displayOrder: 3,
    isActive: true,
    subcategories: [
      { id: 'sub-pillow-menu', name: 'Pillow Menu & Sleep Care', description: 'Firm, memory foam, down, sleep kit' },
      { id: 'sub-ambient', name: 'Ambient Temperature & Air', description: 'Dyson fan, extra heater, air purifier' },
      { id: 'sub-kitchenware', name: 'Kitchenware & Glassware', description: 'Wine glasses, blender, extra pots' },
      { id: 'sub-utility', name: 'Utility & Laundry Helpers', description: 'Ironing board, clothes steamer, drying rack' },
    ],
    presetItems: [
      { id: 'item-memory-pillow', name: 'Memory Foam Contour Pillow', unit: 'pillow', defaultQty: 1, maxQty: 2 },
      { id: 'item-down-pillow', name: 'Soft Goose Feather Pillow', unit: 'pillow', defaultQty: 1, maxQty: 2 },
      { id: 'item-sleep-kit', name: 'Sleep Kit (Eye mask & earplugs)', unit: 'set', defaultQty: 2, maxQty: 4 },
      { id: 'item-dyson-fan', name: 'Portable Cooling Fan', unit: 'unit', defaultQty: 1, maxQty: 1 },
      { id: 'item-air-purifier', name: 'HEPA Air Purifier', unit: 'unit', defaultQty: 1, maxQty: 1 },
      { id: 'item-iron-board', name: 'Steam Iron & Full Ironing Board', unit: 'set', defaultQty: 1, maxQty: 1 },
      { id: 'item-wine-glasses', name: 'Set of Crystal Wine Glasses', unit: 'glasses', defaultQty: 4, maxQty: 8 },
      { id: 'item-extra-blanket', name: 'Warm Fleece Throw Blanket', unit: 'blanket', defaultQty: 1, maxQty: 2 },
    ],
    commonIssues: [
      'Room feels slightly too warm / request fan',
      'Request firm orthopedic pillow',
      'Steam iron and ironing board needed',
      'Wine glasses & corkscrew opener needed',
      'Extra warm duvet / blanket',
    ],
    createdAt: '2026-11-01T00:00:00Z',
  },
  {
    id: 'cat-tech',
    code: 'internet_tech',
    name: 'Internet & Technology',
    shortName: 'Wi-Fi & Tech',
    tagline: 'High-speed 500Mbps fiber Wi-Fi, Smart TV streaming, adapters, and workstation support',
    description: 'Wi-Fi speed, Chromecast/AirPlay, Smart TV, international adapters, HDMI',
    defaultDepartment: 'reception',
    defaultPriority: 'medium',
    slaMinutes: 30,
    iconName: 'Wifi',
    displayOrder: 4,
    isActive: true,
    subcategories: [
      { id: 'sub-wifi', name: 'Wi-Fi & Network', description: '5GHz connection, high-speed streaming, credentials' },
      { id: 'sub-tv', name: 'Smart TV & Streaming', description: 'AirPlay, Chromecast, Netflix app, TV remote' },
      { id: 'sub-adapters', name: 'Workstation & Cables', description: 'Universal travel adapters, HDMI, power strip' },
      { id: 'sub-access-card', name: 'Keycard & Digital Key', description: 'Card re-magnetization, mobile phone key' },
    ],
    presetItems: [
      { id: 'item-travel-adapter', name: 'Universal International Power Adapter', unit: 'adapter', defaultQty: 1, maxQty: 3 },
      { id: 'item-hdmi-cable', name: '4K HDMI Cable (2 meters)', unit: 'cable', defaultQty: 1, maxQty: 2 },
      { id: 'item-power-strip', name: 'Multi-outlet Surge Power Strip', unit: 'unit', defaultQty: 1, maxQty: 2 },
      { id: 'item-remote-battery', name: 'New Smart TV Remote Batteries', unit: 'pair', defaultQty: 1, maxQty: 1 },
    ],
    commonIssues: [
      'Need assistance streaming phone to Smart TV',
      'Wi-Fi signal drops in bedroom',
      'Request universal international power adapter',
      'Need HDMI cable to connect laptop to TV',
      'TV remote unresponsive',
    ],
    createdAt: '2026-11-01T00:00:00Z',
  },
  {
    id: 'cat-services',
    code: 'guest_services',
    name: 'Concierge & Guest Services',
    shortName: 'Concierge',
    tagline: 'Luggage handling, late checkout, airport transfers, key duplicates, and local bookings',
    description: 'Late checkout, luggage storage, extra keys, airport transfer, delivery drop-off',
    defaultDepartment: 'reception',
    defaultPriority: 'low',
    slaMinutes: 30,
    iconName: 'Bell',
    displayOrder: 5,
    isActive: true,
    subcategories: [
      { id: 'sub-late-checkout', name: 'Late Checkout Request', description: 'Extend departure to 12 PM, 1 PM, or 2 PM' },
      { id: 'sub-luggage', name: 'Luggage Assistance', description: 'Arrival baggage pickup or checkout storage' },
      { id: 'sub-keys', name: 'Extra Apartment Keycards', description: 'Additional keycards for companions' },
      { id: 'sub-transfer', name: 'Private Chauffeur & Transfers', description: 'Airport pickup or executive town car' },
      { id: 'sub-delivery', name: 'Parcel & Package Delivery', description: 'Deliver front desk parcels to apartment door' },
    ],
    presetItems: [
      { id: 'item-extra-keys', name: 'Extra Room Keycard', unit: 'keys', defaultQty: 1, maxQty: 2 },
      { id: 'item-bellman', name: 'Baggage Assistance at Departure', unit: 'service', defaultQty: 1, maxQty: 1 },
    ],
    commonIssues: [
      'Request late checkout extension',
      'Luggage pickup assistance at checkout',
      'Extra keycard requested for companion',
      'Please bring package delivered at reception to room',
      'Airport transfer booking for departure',
    ],
    createdAt: '2026-11-01T00:00:00Z',
  },
  {
    id: 'cat-noise',
    code: 'noise',
    name: 'Noise & Disturbances',
    shortName: 'Disturbances',
    tagline: 'Rapid 15-minute quiet intervention for neighbor noise, corridor, or external sounds',
    description: 'Neighbor volume, corridor disturbances, mechanical noise, discrete intervention',
    defaultDepartment: 'reception',
    defaultPriority: 'urgent',
    slaMinutes: 15,
    iconName: 'VolumeX',
    displayOrder: 6,
    isActive: true,
    subcategories: [
      { id: 'sub-neighbor', name: 'Neighboring Unit Noise', description: 'Loud music, party, loud television, shouting' },
      { id: 'sub-corridor', name: 'Corridor & Public Area', description: 'Footsteps, talking in hallway, doors slamming' },
      { id: 'sub-external', name: 'External & Street Noise', description: 'Delivery trucks, street activity, exterior alarms' },
      { id: 'sub-mechanical', name: 'Mechanical & Pipe Whistling', description: 'Elevator hum, water pipe hammer, HVAC resonance' },
    ],
    commonIssues: [
      'Loud television / music from neighboring apartment',
      'Frequent loud door slamming in corridor',
      'Unusual mechanical humming sound from ceiling/closet',
      'People gathering noisily in corridor',
    ],
    createdAt: '2026-11-01T00:00:00Z',
  },
  {
    id: 'cat-other',
    code: 'other',
    name: 'Special Requests & Inquiries',
    shortName: 'Special Requests',
    tagline: 'Billing, special celebrations, custom assistance, and direct manager dialogue',
    description: 'Invoicing, surprise setups, accessibility needs, and custom accommodations',
    defaultDepartment: 'reception',
    defaultPriority: 'medium',
    slaMinutes: 45,
    iconName: 'HelpCircle',
    displayOrder: 7,
    isActive: true,
    subcategories: [
      { id: 'sub-billing', name: 'Invoicing & Folio Inquiries', description: 'Corporate invoice details, tax ID, payment query' },
      { id: 'sub-celebration', name: 'Celebration & Special Arrangements', description: 'Birthday/anniversary flowers, wine, setup' },
      { id: 'sub-accessibility', name: 'Accessibility & Special Care', description: 'Shower chair, ramp access, baby cot' },
    ],
    commonIssues: [
      'Request itemized invoice / corporate tax receipt',
      'Baby cot and baby bath requested',
      'Arrange surprise wine / amenity for birthday',
      'General inquiry about residence amenities',
    ],
    createdAt: '2026-11-01T00:00:00Z',
  },
];

const REQUESTS_STORAGE_KEY = 'guestcare_requests';
const FEEDBACK_STORAGE_KEY = 'guestcare_feedback';
const ACTIONS_STORAGE_KEY = 'guestcare_feedback_actions';

function loadStored<T>(key: string, defaultValue: T): T {
  try {
    if (typeof localStorage !== 'undefined') {
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
    }
  } catch (e) {
    // Ignore in tests
  }
  return defaultValue;
}

function saveStored<T>(key: string, value: T): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (e) {
    // Ignore in tests
  }
}

// Initial demonstration data for development/demo mode (clearly labeled)
const INITIAL_DEMO_REQUESTS: GuestRequest[] = [
  {
    id: 'req-demo-101',
    ticketNumber: 'GC-20261117-0001',
    reservationRef: 'RES-89211',
    apartmentRef: '402 - Penthouse Apartment 402',
    guestName: 'Sarah Jenkins',
    categoryId: 'cat-maint',
    subcategoryId: 'sub-ac',
    subcategoryName: 'Air Conditioning & Climate',
    title: 'Master Bedroom AC blowing warm air',
    description: 'The air conditioner in the master bedroom has been humming loudly and not cooling since 2 PM.',
    priority: 'high',
    status: 'in_progress',
    assignedDepartment: 'maintenance',
    assignedStaffId: 'staff-carlos',
    assignedStaffName: 'Carlos Gomez',
    preferredTimeWindow: 'Anytime / Immediate',
    roomAccessPermission: true,
    reopenCount: 0,
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    comments: [
      {
        id: 'cmt-1',
        requestId: 'req-demo-101',
        authorType: 'staff',
        authorName: 'Carlos Gomez',
        content: 'I have arrived on site with replacement capacitor.',
        isInternal: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      {
        id: 'cmt-2',
        requestId: 'req-demo-101',
        authorType: 'staff',
        authorName: 'Carlos Gomez',
        content: 'Internal note: Replaced AC filter. Compressor pressure reading normal now.',
        isInternal: true,
        createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      },
    ],
    statusHistory: [
      {
        id: 'hist-1',
        requestId: 'req-demo-101',
        fromStatus: undefined,
        toStatus: 'new',
        changedByType: 'guest',
        changedByName: 'Sarah Jenkins',
        changeReason: 'Initial guest submission via QR portal',
        createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      },
      {
        id: 'hist-2',
        requestId: 'req-demo-101',
        fromStatus: 'new',
        toStatus: 'assigned',
        changedByType: 'staff',
        changedByName: 'Front Desk Dispatch',
        changeReason: 'Assigned to Carlos Gomez (Maintenance)',
        createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'hist-3',
        requestId: 'req-demo-101',
        fromStatus: 'assigned',
        toStatus: 'in_progress',
        changedByType: 'staff',
        changedByName: 'Carlos Gomez',
        changeReason: 'Technician on-site',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'req-demo-102',
    ticketNumber: 'GC-20261117-0002',
    reservationRef: 'RES-89212',
    apartmentRef: '105 - Deluxe Studio 105',
    guestName: 'David Zhao',
    categoryId: 'cat-hk',
    subcategoryId: 'sub-towels',
    subcategoryName: 'Towels & Linens',
    title: 'Extra bath sheets and hypoallergenic pillows',
    description: 'Could we please have 2 extra bath sheets and 2 firm pillows delivered when convenient?',
    priority: 'medium',
    status: 'new',
    assignedDepartment: 'housekeeping',
    preferredTimeWindow: 'Within next 45 minutes',
    roomAccessPermission: true,
    requestedItems: [
      { name: 'Plush Bath Sheets', quantity: 2, unit: 'towels' },
      { name: 'Hypoallergenic Pillow', quantity: 2, unit: 'pillows' },
    ],
    reopenCount: 0,
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    comments: [],
    statusHistory: [
      {
        id: 'hist-4',
        requestId: 'req-demo-102',
        toStatus: 'new',
        changedByType: 'guest',
        changedByName: 'David Zhao',
        createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: 'req-demo-103',
    ticketNumber: 'GC-20261117-0003',
    reservationRef: 'RES-89213',
    apartmentRef: '304 - Two Bedroom Residence 304',
    guestName: 'Elena Rostova',
    categoryId: 'cat-tech',
    subcategoryId: 'sub-tv',
    subcategoryName: 'Smart TV & Streaming',
    title: 'Living room Smart TV won’t connect to Wi-Fi',
    description: 'The TV displays "Network Error" when opening streaming apps.',
    priority: 'medium',
    status: 'resolved',
    assignedDepartment: 'reception',
    assignedStaffId: 'staff-anna',
    assignedStaffName: 'Anna Lin',
    resolutionNotes: 'Reset TV network settings and reconnected to 5GHz guest network. Streaming tested successfully.',
    resolvedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    reopenCount: 0,
    createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    statusHistory: [
      {
        id: 'hist-5',
        requestId: 'req-demo-103',
        toStatus: 'new',
        changedByType: 'guest',
        changedByName: 'Elena Rostova',
        createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      },
      {
        id: 'hist-6',
        requestId: 'req-demo-103',
        fromStatus: 'new',
        toStatus: 'resolved',
        changedByType: 'staff',
        changedByName: 'Anna Lin',
        changeReason: 'Reset network adapter on TV',
        createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      },
    ],
  },
];

class RequestService {
  private requests: GuestRequest[] = loadStored(REQUESTS_STORAGE_KEY, INITIAL_DEMO_REQUESTS);
  private feedback: GuestFeedback[] = loadStored(FEEDBACK_STORAGE_KEY, [
    {
      id: 'fb-1',
      reservationRef: 'RES-89213',
      apartmentRef: '304 - Two Bedroom Residence 304',
      guestName: 'Elena Rostova',
      overallRating: 5,
      cleanlinessRating: 5,
      staffRating: 5,
      comfortRating: 4,
      comments: 'Wonderful residence and super fast help with the television set.',
      isAnonymous: false,
      status: 'reviewed',
      createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    },
  ]);
  private feedbackActions: FeedbackAction[] = loadStored(ACTIONS_STORAGE_KEY, []);
  private listeners: Array<() => void> = [];
  private ticketCounter = 4;

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    saveStored(REQUESTS_STORAGE_KEY, this.requests);
    saveStored(FEEDBACK_STORAGE_KEY, this.feedback);
    saveStored(ACTIONS_STORAGE_KEY, this.feedbackActions);
    this.listeners.forEach(l => l());
  }

  getCategories(): Category[] {
    return CATEGORIES.filter(c => c.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
  }

  getCategoryById(id: string): Category | undefined {
    return CATEGORIES.find(c => c.id === id || c.code === id);
  }

  // --- Request Listing & Search ---

  listRequests(filters?: {
    reservationRef?: string;
    department?: Department;
    status?: RequestStatus;
    priority?: Priority;
    search?: string;
  }): GuestRequest[] {
    let result = [...this.requests];

    if (filters?.reservationRef) {
      result = result.filter(r => r.reservationRef.toLowerCase() === filters.reservationRef!.toLowerCase());
    }

    if (filters?.department) {
      result = result.filter(r => r.assignedDepartment === filters.department);
    }

    if (filters?.status) {
      result = result.filter(r => r.status === filters.status);
    }

    if (filters?.priority) {
      result = result.filter(r => r.priority === filters.priority);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        r =>
          r.ticketNumber.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.guestName.toLowerCase().includes(q) ||
          r.apartmentRef.toLowerCase().includes(q)
      );
    }

    // Attach category object for easy rendering
    return result.map(r => ({
      ...r,
      category: this.getCategoryById(r.categoryId),
    })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getRequestById(id: string): GuestRequest | undefined {
    const req = this.requests.find(r => r.id === id);
    if (!req) return undefined;
    return {
      ...req,
      category: this.getCategoryById(req.categoryId),
    };
  }

  // --- Create Request ---

  async createRequest(input: {
    reservationRef: string;
    apartmentRef: string;
    guestName: string;
    categoryId: string;
    subcategoryId?: string;
    subcategoryName?: string;
    title: string;
    description: string;
    priority?: Priority;
    requestedItems?: RequestedItemPayload[];
    preferredTimeWindow?: string;
    roomAccessPermission?: boolean;
    attachments?: Array<{
      fileName: string;
      filePath: string;
      fileSize: number;
      mimeType: string;
    }>;
  }): Promise<GuestRequest> {
    const cat = this.getCategoryById(input.categoryId);
    const category = cat || CATEGORIES[0];

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const ticketSeq = String(this.ticketCounter++).padStart(4, '0');
    const ticketNumber = `GC-${todayStr}-${ticketSeq}`;

    const priority: Priority = input.priority || category.defaultPriority;
    const department: Department = category.defaultDepartment;

    const newReqId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `req-${Date.now()}`;
    const now = new Date().toISOString();

    const initialHistory: StatusHistoryEntry = {
      id: `hist-${Date.now()}`,
      requestId: newReqId,
      toStatus: 'new',
      changedByType: 'guest',
      changedByName: input.guestName,
      changeReason: 'Initial guest submission via QR portal',
      createdAt: now,
    };

    const newRequest: GuestRequest = {
      id: newReqId,
      ticketNumber,
      reservationRef: input.reservationRef,
      apartmentRef: input.apartmentRef,
      guestName: input.guestName,
      categoryId: category.id,
      category,
      subcategoryId: input.subcategoryId,
      subcategoryName: input.subcategoryName,
      title: input.title.trim(),
      description: input.description.trim(),
      priority,
      status: 'new',
      assignedDepartment: department,
      reopenCount: 0,
      requestedItems: input.requestedItems,
      preferredTimeWindow: input.preferredTimeWindow,
      roomAccessPermission: input.roomAccessPermission,
      createdAt: now,
      updatedAt: now,
      comments: [],
      attachments: (input.attachments || []).map((att, idx) => ({
        id: `att-${Date.now()}-${idx}`,
        requestId: newReqId,
        fileName: att.fileName,
        filePath: att.filePath,
        fileSize: att.fileSize,
        mimeType: att.mimeType,
        uploadedBy: 'guest',
        createdAt: now,
      })),
      statusHistory: [initialHistory],
    };

    this.requests.unshift(newRequest);
    this.notify();

    // Enqueue staff notification
    await notificationService.enqueue({
      recipientType: 'department',
      recipientId: department,
      channel: 'in_app',
      title: `New ${category.name} Request`,
      message: `${input.apartmentRef}: ${input.title}`,
      referenceType: 'request',
      referenceId: newReqId,
      idempotencyKey: `new-req-${newReqId}`,
    });

    return newRequest;
  }

  // --- Update Request Status ---

  async updateStatus(params: {
    requestId: string;
    newStatus: RequestStatus;
    resolutionNotes?: string;
    changedByName?: string;
    changedById?: string;
    actorType?: 'guest' | 'staff' | 'system';
    changeReason?: string;
  }): Promise<GuestRequest> {
    const req = this.requests.find(r => r.id === params.requestId);
    if (!req) throw new Error('Request not found');

    const oldStatus = req.status;
    if (oldStatus === params.newStatus) return req;

    const now = new Date().toISOString();
    req.status = params.newStatus;
    req.updatedAt = now;

    if (params.newStatus === 'resolved') {
      req.resolvedAt = now;
      if (params.resolutionNotes) {
        req.resolutionNotes = params.resolutionNotes;
      }
    } else if (params.newStatus === 'closed') {
      req.closedAt = now;
    }

    const historyEntry: StatusHistoryEntry = {
      id: `hist-${Date.now()}`,
      requestId: req.id,
      fromStatus: oldStatus,
      toStatus: params.newStatus,
      changedByType: params.actorType || 'staff',
      changedById: params.changedById,
      changedByName: params.changedByName || 'Staff Member',
      changeReason: params.changeReason || params.resolutionNotes,
      createdAt: now,
    };

    if (!req.statusHistory) req.statusHistory = [];
    req.statusHistory.push(historyEntry);

    this.notify();

    // If staff resolved, notify guest portal
    if (params.newStatus === 'resolved') {
      await notificationService.enqueue({
        recipientType: 'guest',
        recipientId: req.reservationRef,
        channel: 'in_app',
        title: 'Request Resolved',
        message: `Your request "${req.title}" has been marked resolved. Please confirm your satisfaction.`,
        referenceType: 'request',
        referenceId: req.id,
      });
    }

    return req;
  }

  // --- Assign Request ---

  async assignRequest(params: {
    requestId: string;
    department: Department;
    staffId?: string;
    staffName?: string;
    assignedBy?: string;
    notes?: string;
  }): Promise<GuestRequest> {
    const req = this.requests.find(r => r.id === params.requestId);
    if (!req) throw new Error('Request not found');

    req.assignedDepartment = params.department;
    req.assignedStaffId = params.staffId;
    req.assignedStaffName = params.staffName;
    req.updatedAt = new Date().toISOString();

    if (['new', 'acknowledged'].includes(req.status)) {
      await this.updateStatus({
        requestId: req.id,
        newStatus: 'assigned',
        changedByName: params.assignedBy || 'Dispatcher',
        changeReason: `Assigned to ${params.staffName || params.department}`,
      });
    } else {
      this.notify();
    }

    return req;
  }

  // --- Add Comment ---

  async addComment(params: {
    requestId: string;
    authorType: 'guest' | 'staff' | 'system';
    authorName: string;
    authorId?: string;
    content: string;
    isInternal?: boolean;
  }): Promise<RequestComment> {
    const req = this.requests.find(r => r.id === params.requestId);
    if (!req) throw new Error('Request not found');

    const comment: RequestComment = {
      id: `cmt-${Date.now()}`,
      requestId: req.id,
      authorType: params.authorType,
      authorId: params.authorId,
      authorName: params.authorName,
      content: params.content.trim(),
      isInternal: params.isInternal || false,
      createdAt: new Date().toISOString(),
    };

    if (!req.comments) req.comments = [];
    req.comments.push(comment);
    req.updatedAt = new Date().toISOString();

    this.notify();

    // Alert appropriate party
    if (params.authorType === 'guest') {
      await notificationService.enqueue({
        recipientType: 'department',
        recipientId: req.assignedDepartment,
        channel: 'in_app',
        title: `Guest Reply on ${req.ticketNumber}`,
        message: `${params.authorName}: ${params.content.slice(0, 100)}`,
        referenceType: 'request',
        referenceId: req.id,
      });
    }

    return comment;
  }

  // --- Confirm Resolution (Guest Confirmation / Reopen Workflow) ---

  async confirmResolution(params: {
    requestId: string;
    satisfied: boolean;
    guestName: string;
    notesOrReason?: string;
  }): Promise<GuestRequest> {
    const req = this.requests.find(r => r.id === params.requestId);
    if (!req) throw new Error('Request not found');

    const now = new Date().toISOString();
    req.guestConfirmedAt = now;
    req.guestSatisfaction = params.satisfied ? 'satisfied' : 'unsatisfied';

    if (params.satisfied) {
      await this.updateStatus({
        requestId: req.id,
        newStatus: 'closed',
        actorType: 'guest',
        changedByName: params.guestName,
        changeReason: params.notesOrReason || 'Guest confirmed satisfactory resolution',
      });
    } else {
      req.reopenCount += 1;
      req.reopenReason = params.notesOrReason || 'Guest reported issue is unresolved.';
      req.priority = 'urgent';

      await this.updateStatus({
        requestId: req.id,
        newStatus: 'reopened',
        actorType: 'guest',
        changedByName: params.guestName,
        changeReason: `REOPENED BY GUEST: ${req.reopenReason}`,
      });

      await notificationService.enqueue({
        recipientType: 'staff',
        recipientId: 'reception',
        channel: 'in_app',
        title: `URGENT: Request Reopened by Guest`,
        message: `${req.apartmentRef} reported issue was NOT resolved: "${req.reopenReason}"`,
        referenceType: 'request',
        referenceId: req.id,
      });
    }

    return req;
  }

  // --- In-Stay Guest Feedback ---

  async submitFeedback(input: {
    reservationRef: string;
    apartmentRef: string;
    guestName: string;
    overallRating: number;
    cleanlinessRating?: number;
    staffRating?: number;
    comfortRating?: number;
    comments?: string;
    isAnonymous?: boolean;
  }): Promise<GuestFeedback> {
    const now = new Date().toISOString();
    const fb: GuestFeedback = {
      id: `fb-${Date.now()}`,
      reservationRef: input.reservationRef,
      apartmentRef: input.apartmentRef,
      guestName: input.isAnonymous ? 'Anonymous Guest' : input.guestName,
      overallRating: input.overallRating,
      cleanlinessRating: input.cleanlinessRating,
      staffRating: input.staffRating,
      comfortRating: input.comfortRating,
      comments: input.comments,
      isAnonymous: input.isAnonymous || false,
      status: 'new',
      createdAt: now,
      updatedAt: now,
    };

    this.feedback.unshift(fb);
    this.notify();

    if (input.overallRating <= 2) {
      await notificationService.enqueue({
        recipientType: 'staff',
        recipientId: 'reception',
        channel: 'in_app',
        title: `Low Guest Rating Alert (${input.overallRating}/5)`,
        message: `${input.apartmentRef} submitted low satisfaction feedback: "${input.comments || 'No comment'}"`,
        referenceType: 'feedback',
        referenceId: fb.id,
      });
    }

    return fb;
  }

  listFeedback(): GuestFeedback[] {
    return [...this.feedback];
  }

  async addFeedbackAction(params: {
    feedbackId: string;
    staffName: string;
    staffId?: string;
    actionType: FeedbackAction['actionType'];
    notes: string;
  }): Promise<FeedbackAction> {
    const fb = this.feedback.find(f => f.id === params.feedbackId);
    if (!fb) throw new Error('Feedback not found');

    const action: FeedbackAction = {
      id: `act-${Date.now()}`,
      feedbackId: params.feedbackId,
      staffId: params.staffId,
      staffName: params.staffName,
      actionType: params.actionType,
      notes: params.notes,
      createdAt: new Date().toISOString(),
    };

    this.feedbackActions.push(action);
    fb.status = 'actioned';
    fb.updatedAt = new Date().toISOString();

    this.notify();
    return action;
  }

  getFeedbackActions(feedbackId: string): FeedbackAction[] {
    return this.feedbackActions.filter(a => a.feedbackId === feedbackId);
  }

  // --- Health Engine Evaluation ---

  getGuestHealth(reservationRef: string, apartmentRef = '', guestName = ''): GuestHealthRecord {
    const resRequests = this.requests.filter(
      r => r.reservationRef.toLowerCase() === reservationRef.toLowerCase()
    );
    const resFeedback = this.feedback.filter(
      f => f.reservationRef.toLowerCase() === reservationRef.toLowerCase()
    );

    return GuestHealthEngine.calculate({
      reservationRef,
      apartmentRef: apartmentRef || resRequests[0]?.apartmentRef || 'Apartment',
      guestName: guestName || resRequests[0]?.guestName || 'Guest',
      requests: resRequests,
      feedback: resFeedback,
    });
  }

  listAllGuestHealth(): GuestHealthRecord[] {
    const resMap = new Map<string, { apartmentRef: string; guestName: string }>();

    this.requests.forEach(r => {
      if (!resMap.has(r.reservationRef)) {
        resMap.set(r.reservationRef, { apartmentRef: r.apartmentRef, guestName: r.guestName });
      }
    });

    this.feedback.forEach(f => {
      if (!resMap.has(f.reservationRef)) {
        resMap.set(f.reservationRef, { apartmentRef: f.apartmentRef, guestName: f.guestName });
      }
    });

    const records: GuestHealthRecord[] = [];
    resMap.forEach((info, resRef) => {
      records.push(this.getGuestHealth(resRef, info.apartmentRef, info.guestName));
    });

    return records.sort((a, b) => a.score - b.score);
  }
}

export const requestService = new RequestService();
