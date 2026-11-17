// Request Management & Operations Service
// Categories synced live with Staff PortalConfigService (no AC, Laundry + Shop & Delivery, Front Desk)

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
import { portalConfigService } from '@/features/config/portalConfigService';
import {
  insertRequestToSupabase,
  updateRequestInSupabase,
  insertCommentToSupabase,
  insertFeedbackToSupabase,
  fetchLiveRequestsFromSupabase,
  fetchLiveFeedbackFromSupabase,
  subscribeToGuestCareRealtime,
} from '@/lib/supabaseSync';

export const BASE_CATEGORIES: Category[] = [
  {
    id: 'cat-maint',
    code: 'maintenance',
    name: 'Maintenance & Repairs',
    shortName: 'Maintenance',
    tagline: 'Plumbing, hot water, lights, power outlets, appliances, and locks',
    description: 'Plumbing, hot water, electrical outlets, kitchen appliances, doors, and windows',
    defaultDepartment: 'maintenance',
    defaultPriority: 'high',
    slaMinutes: 30,
    iconName: 'Wrench',
    displayOrder: 1,
    isActive: true,
    createdAt: '2026-11-01T00:00:00Z',
  },
  {
    id: 'cat-hk',
    code: 'housekeeping',
    name: 'Housekeeping & Supplies',
    shortName: 'Housekeeping',
    tagline: 'Fresh towels, room cleaning, toiletries, and linen change',
    description: 'Fresh towels, bed linen, apartment cleaning, toiletries, and trash removal',
    defaultDepartment: 'housekeeping',
    defaultPriority: 'medium',
    slaMinutes: 25,
    iconName: 'Sparkles',
    displayOrder: 2,
    isActive: true,
    createdAt: '2026-11-01T00:00:00Z',
  },
  {
    id: 'cat-laundry',
    code: 'laundry',
    name: 'Laundry & Ironing',
    shortName: 'Laundry',
    tagline: 'Wash & fold, garment ironing, dry cleaning, and laundry bag pickup',
    description: 'Wash & fold pickup, shirt pressing, dry cleaning, and hangers',
    defaultDepartment: 'housekeeping',
    defaultPriority: 'medium',
    slaMinutes: 30,
    iconName: 'Shirt',
    displayOrder: 3,
    isActive: true,
    createdAt: '2026-11-01T00:00:00Z',
  },
  {
    id: 'cat-shop',
    code: 'shop_delivery',
    name: 'Shop & Local Delivery',
    shortName: 'Shop & Delivery',
    tagline: 'Coffee, tea, food, mobile cards, cigarettes, water, and daily items',
    description: 'Order common essentials or connect with local shops for coffee, tea, food, cards, and groceries',
    defaultDepartment: 'reception',
    defaultPriority: 'medium',
    slaMinutes: 25,
    iconName: 'ShoppingBag',
    displayOrder: 4,
    isActive: true,
    createdAt: '2026-11-01T00:00:00Z',
  },
  {
    id: 'cat-comfort',
    code: 'comfort',
    name: 'Comfort & Essentials',
    shortName: 'Comfort',
    tagline: 'Fans, extra blankets, iron & board, pillows, and kitchenware',
    description: 'Standing fans, extra blankets, pillows, iron & ironing board, and glassware',
    defaultDepartment: 'reception',
    defaultPriority: 'medium',
    slaMinutes: 35,
    iconName: 'BedDouble',
    displayOrder: 5,
    isActive: true,
    createdAt: '2026-11-01T00:00:00Z',
  },
  {
    id: 'cat-tech',
    code: 'internet_tech',
    name: 'Wi-Fi & Tech',
    shortName: 'Wi-Fi & Tech',
    tagline: 'Wi-Fi help, Smart TV, power adapters, and extension cords',
    description: 'Wi-Fi connection help, Smart TV, remote batteries, HDMI cables, and adapters',
    defaultDepartment: 'reception',
    defaultPriority: 'medium',
    slaMinutes: 30,
    iconName: 'Wifi',
    displayOrder: 6,
    isActive: true,
    createdAt: '2026-11-01T00:00:00Z',
  },
  {
    id: 'cat-services',
    code: 'guest_services',
    name: 'Front Desk Services',
    shortName: 'Front Desk',
    tagline: 'Late check-out, luggage help, extra keys, and taxi bookings',
    description: 'Late check-out, luggage storage, extra apartment keys, and taxi/airport rides',
    defaultDepartment: 'reception',
    defaultPriority: 'low',
    slaMinutes: 20,
    iconName: 'Bell',
    displayOrder: 7,
    isActive: true,
    createdAt: '2026-11-01T00:00:00Z',
  },
  {
    id: 'cat-other',
    code: 'other',
    name: 'Other Requests',
    shortName: 'Other',
    tagline: 'Billing questions, special arrangements, or general inquiries',
    description: 'Invoicing, special requests, and general assistance from our team',
    defaultDepartment: 'reception',
    defaultPriority: 'medium',
    slaMinutes: 40,
    iconName: 'HelpCircle',
    displayOrder: 8,
    isActive: true,
    createdAt: '2026-11-01T00:00:00Z',
  },
];

// Exported alias for charts/reports
export const CATEGORIES = BASE_CATEGORIES;

const REQUESTS_STORAGE_KEY = 'guestcare_requests_v3';
const FEEDBACK_STORAGE_KEY = 'guestcare_feedback_v2';
const ACTIONS_STORAGE_KEY = 'guestcare_feedback_actions_v2';

function loadStored<T>(key: string, defaultValue: T): T {
  try {
    if (typeof localStorage !== 'undefined') {
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
    }
  } catch {
    // Ignore storage errors in test runner
  }
  return defaultValue;
}

function saveStored<T>(key: string, value: T): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // Ignore storage errors in test runner
  }
}

const INITIAL_DEMO_REQUESTS: GuestRequest[] = [
  {
    id: 'req-demo-101',
    ticketNumber: 'GC-20261117-0001',
    reservationRef: 'RES-89211',
    apartmentRef: '1A - Apartment 1A',
    guestName: 'Sarah Jenkins',
    categoryId: 'cat-maint',
    title: 'Master bathroom hot water pressure low',
    description: 'The shower water pressure feels weak and takes several minutes to warm up.',
    priority: 'high',
    status: 'in_progress',
    assignedDepartment: 'maintenance',
    assignedStaffId: 'staff-carlos',
    assignedStaffName: 'Carlos Gomez',
    reopenCount: 0,
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    comments: [
      {
        id: 'cmt-1',
        requestId: 'req-demo-101',
        authorType: 'staff',
        authorName: 'Carlos Gomez',
        content: 'I am checking the hot water pressure valve now.',
        isInternal: false,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      {
        id: 'cmt-2',
        requestId: 'req-demo-101',
        authorType: 'staff',
        authorName: 'Carlos Gomez',
        content: 'Internal note: Cleaned shower aerator and adjusted mixer valve pressure.',
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
    apartmentRef: '1B - Apartment 1B',
    guestName: 'David Zhao',
    categoryId: 'cat-hk',
    title: 'Extra bath towels and pillows',
    description: 'Could we please have 2 extra bath towels and 2 pillows delivered?',
    priority: 'medium',
    status: 'new',
    assignedDepartment: 'housekeeping',
    requestedItems: [
      { name: 'Bath Towels', quantity: 2, unit: 'towels' },
      { name: 'Extra Pillow', quantity: 2, unit: 'pillows' },
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
    apartmentRef: '2A - Apartment 2A',
    guestName: 'Elena Rostova',
    categoryId: 'cat-tech',
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
      apartmentRef: '2A - Apartment 2A',
      guestName: 'Elena Rostova',
      overallRating: 5,
      cleanlinessRating: 5,
      staffRating: 5,
      comfortRating: 4,
      comments: 'Wonderful apartment and super fast help with the television set.',
      isAnonymous: false,
      status: 'reviewed',
      createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    },
  ]);
  private feedbackActions: FeedbackAction[] = loadStored(ACTIONS_STORAGE_KEY, []);
  private listeners: Array<() => void> = [];
  private ticketCounter = 4;

  constructor() {
    void this.syncFromSupabase();
    subscribeToGuestCareRealtime(() => {
      void this.syncFromSupabase();
      void portalConfigService.syncFromSupabase();
    });
  }

  async syncFromSupabase(): Promise<void> {
    const [remoteReqs, remoteFb] = await Promise.all([
      fetchLiveRequestsFromSupabase(),
      fetchLiveFeedbackFromSupabase(),
    ]);

    let updated = false;
    if (remoteReqs && remoteReqs.length > 0) {
      this.requests = remoteReqs;
      updated = true;
    }
    if (remoteFb && remoteFb.length > 0) {
      this.feedback = remoteFb;
      updated = true;
    }
    if (updated) {
      saveStored(REQUESTS_STORAGE_KEY, this.requests);
      saveStored(FEEDBACK_STORAGE_KEY, this.feedback);
      this.listeners.forEach(l => l());
    }
  }

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

  /**
   * Returns categories hydrated with live Staff-editable overrides, items, and presets
   */
  getCategories(includeHidden = false): Category[] {
    const overrides = portalConfigService.getCategoryOverrides();
    return BASE_CATEGORIES.map(cat => {
      const ov = overrides[cat.code];
      return {
        ...cat,
        ...(ov || {}),
        isActive: ov?.isActive !== undefined ? ov.isActive : cat.isActive,
        presetItems: portalConfigService.getDeliverableItems(cat.code, true),
        commonIssues: portalConfigService.getPresets(cat.code, true).map(p => p.label),
      };
    })
      .filter(c => includeHidden || c.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder);
  }

  getCategoryById(id: string): Category | undefined {
    const base = BASE_CATEGORIES.find(c => c.id === id || c.code === id);
    if (!base) return undefined;
    const ov = portalConfigService.getCategoryOverrides()[base.code];
    return {
      ...base,
      ...(ov || {}),
      isActive: ov?.isActive !== undefined ? ov.isActive : base.isActive,
      presetItems: portalConfigService.getDeliverableItems(base.code, true),
      commonIssues: portalConfigService.getPresets(base.code, true).map(p => p.label),
    };
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

    return result
      .map(r => ({
        ...r,
        category: this.getCategoryById(r.categoryId),
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
    const category = cat || this.getCategories()[0];

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
    void insertRequestToSupabase(newRequest, category.code);

    await notificationService.enqueue({
      recipientType: 'department',
      recipientId: department,
      channel: 'in_app',
      title: `New ${category.shortName || category.name} Request`,
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
    void updateRequestInSupabase(req);

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
    void insertCommentToSupabase(comment);

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

  // --- Confirm Resolution ---

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
    void insertFeedbackToSupabase(fb);

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
