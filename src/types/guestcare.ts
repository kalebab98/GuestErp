// Project: GuestCare
// Domain types and models

export type CategoryCode =
  | 'maintenance'
  | 'housekeeping'
  | 'comfort'
  | 'internet_tech'
  | 'guest_services'
  | 'noise'
  | 'other';

export type Department = 'maintenance' | 'housekeeping' | 'reception' | 'management';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type RequestStatus =
  | 'new'
  | 'acknowledged'
  | 'assigned'
  | 'in_progress'
  | 'waiting'
  | 'resolved'
  | 'reopened'
  | 'closed'
  | 'cancelled';

export type GuestHealthStatus = 'good' | 'improving' | 'at_risk' | 'critical';

export type GuestSatisfaction = 'satisfied' | 'unsatisfied';

export type NotificationChannel = 'in_app' | 'email';

export type NotificationStatus = 'pending' | 'sent' | 'failed';

export interface Category {
  id: string;
  code: CategoryCode;
  name: string;
  description: string;
  defaultDepartment: Department;
  defaultPriority: Priority;
  slaMinutes: number;
  iconName: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

export interface PortalSession {
  id: string;
  reservationRef: string;
  apartmentRef: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  tokenHash: string;
  checkInDate: string;
  checkOutDate: string;
  expiresAt: string;
  revokedAt?: string;
  revocationReason?: string;
  lastActiveAt: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface RequestAttachment {
  id: string;
  requestId: string;
  commentId?: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: 'guest' | 'staff';
  createdAt: string;
}

export interface RequestComment {
  id: string;
  requestId: string;
  authorType: 'guest' | 'staff' | 'system';
  authorId?: string;
  authorName: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  attachments?: RequestAttachment[];
}

export interface StatusHistoryEntry {
  id: string;
  requestId: string;
  fromStatus?: RequestStatus;
  toStatus: RequestStatus;
  changedByType: 'guest' | 'staff' | 'system';
  changedById?: string;
  changedByName: string;
  changeReason?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface GuestRequest {
  id: string;
  ticketNumber: string;
  reservationRef: string;
  apartmentRef: string;
  guestName: string;
  categoryId: string;
  category?: Category;
  title: string;
  description: string;
  priority: Priority;
  status: RequestStatus;
  assignedDepartment: Department;
  assignedStaffId?: string;
  assignedStaffName?: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  closedAt?: string;
  guestConfirmedAt?: string;
  guestSatisfaction?: GuestSatisfaction;
  reopenCount: number;
  reopenReason?: string;
  createdAt: string;
  updatedAt: string;
  attachments?: RequestAttachment[];
  comments?: RequestComment[];
  statusHistory?: StatusHistoryEntry[];
}

export interface RequestAssignment {
  id: string;
  requestId: string;
  department: Department;
  staffId?: string;
  staffName?: string;
  assignedBy?: string;
  notes?: string;
  createdAt: string;
}

export interface GuestFeedback {
  id: string;
  reservationRef: string;
  apartmentRef: string;
  guestName: string;
  overallRating: number; // 1-5
  cleanlinessRating?: number;
  staffRating?: number;
  comfortRating?: number;
  comments?: string;
  isAnonymous: boolean;
  status: 'new' | 'reviewed' | 'actioned';
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackAction {
  id: string;
  feedbackId: string;
  staffId?: string;
  staffName: string;
  actionType: 'contacted_guest' | 'room_visit' | 'sent_amenity' | 'discount_issued' | 'internal_escalation';
  notes: string;
  createdAt: string;
}

export interface GuestHealthRecord {
  id: string;
  reservationRef: string;
  apartmentRef: string;
  guestName: string;
  status: GuestHealthStatus;
  score: number; // 0-100
  reasons: string[];
  lastCalculatedAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  recipientType: 'staff' | 'guest' | 'department';
  recipientId?: string;
  channel: NotificationChannel;
  title: string;
  message: string;
  referenceType?: 'request' | 'feedback' | 'health' | 'session';
  referenceId?: string;
  status: NotificationStatus;
  retryCount: number;
  errorMessage?: string;
  idempotencyKey?: string;
  createdAt: string;
  sentAt?: string;
}

export interface AuditLogEntry {
  id: string;
  actorType: 'guest' | 'staff' | 'system' | 'pms';
  actorId?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface SystemSettings {
  slaUrgentMinutes: number;
  slaHighMinutes: number;
  slaMediumMinutes: number;
  slaLowMinutes: number;
  tokenGracePeriodHours: number;
  receptionPhone: string;
  receptionWhatsApp: string;
}
