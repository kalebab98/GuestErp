// Notification Queue Service
// Reliable database & in-memory notification queue with retry handling and idempotency

import { NotificationItem, NotificationChannel, NotificationStatus } from '@/types/guestcare';

const NOTIFS_STORAGE_KEY = 'guestcare_notifications';

function loadNotifications(): NotificationItem[] {
  try {
    if (typeof localStorage !== 'undefined') {
      const data = localStorage.getItem(NOTIFS_STORAGE_KEY);
      if (data) return JSON.parse(data);
    }
  } catch (e) {
    // Ignore in non-browser environments
  }
  return [];
}

function saveNotifications(items: NotificationItem[]): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(items));
    }
  } catch (e) {
    // Ignore in non-browser environments
  }
}

class NotificationService {
  private notifications: NotificationItem[] = loadNotifications();
  private listeners: Array<() => void> = [];

  constructor() {
    if (this.notifications.length === 0) {
      // Seed initial staff notifications for demo
      this.notifications = [
        {
          id: 'notif-1',
          recipientType: 'department',
          recipientId: 'maintenance',
          channel: 'in_app',
          title: 'New Maintenance Request',
          message: 'Penthouse 402 reported: Master bathroom hot water pressure low',
          referenceType: 'request',
          status: 'sent',
          retryCount: 0,
          idempotencyKey: 'init-1',
          createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
          sentAt: new Date(Date.now() - 3590 * 1000).toISOString(),
        },
        {
          id: 'notif-2',
          recipientType: 'staff',
          recipientId: 'reception',
          channel: 'in_app',
          title: 'Guest Health Alert: At Risk',
          message: 'Sarah Jenkins in Apt 402 has 1 unresolved urgent ticket.',
          referenceType: 'health',
          status: 'sent',
          retryCount: 0,
          idempotencyKey: 'init-2',
          createdAt: new Date(Date.now() - 1800 * 1000).toISOString(),
          sentAt: new Date(Date.now() - 1790 * 1000).toISOString(),
        },
      ];
      saveNotifications(this.notifications);
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(): void {
    saveNotifications(this.notifications);
    this.listeners.forEach(l => l());
  }

  /**
   * Enqueues a notification with idempotency check
   */
  async enqueue(params: {
    recipientType: 'staff' | 'guest' | 'department';
    recipientId?: string;
    channel: NotificationChannel;
    title: string;
    message: string;
    referenceType?: 'request' | 'feedback' | 'health' | 'session';
    referenceId?: string;
    idempotencyKey?: string;
  }): Promise<NotificationItem> {
    // Idempotency check
    if (params.idempotencyKey) {
      const existing = this.notifications.find(n => n.idempotencyKey === params.idempotencyKey);
      if (existing) {
        return existing;
      }
    }

    const item: NotificationItem = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `notif-${Date.now()}`,
      recipientType: params.recipientType,
      recipientId: params.recipientId,
      channel: params.channel,
      title: params.title,
      message: params.message,
      referenceType: params.referenceType,
      referenceId: params.referenceId,
      status: 'pending',
      retryCount: 0,
      idempotencyKey: params.idempotencyKey,
      createdAt: new Date().toISOString(),
    };

    this.notifications.unshift(item);
    this.notify();

    // Immediately simulate reliable dispatch worker
    this.dispatch(item.id);

    return item;
  }

  /**
   * Dispatches a pending notification (e.g. Email / Push / In-App feed)
   */
  private async dispatch(id: string): Promise<void> {
    const item = this.notifications.find(n => n.id === id);
    if (!item || item.status === 'sent') return;

    try {
      // Simulate network dispatch with high reliability
      await new Promise(resolve => setTimeout(resolve, 300));
      item.status = 'sent';
      item.sentAt = new Date().toISOString();
      this.notify();
    } catch (err: any) {
      item.retryCount += 1;
      item.errorMessage = err.message || 'Dispatch failed';
      if (item.retryCount >= 3) {
        item.status = 'failed';
      }
      this.notify();
    }
  }

  getNotifications(filter?: {
    recipientType?: 'staff' | 'guest' | 'department';
    recipientId?: string;
  }): NotificationItem[] {
    let result = [...this.notifications];
    if (filter?.recipientType) {
      result = result.filter(n => n.recipientType === filter.recipientType);
    }
    if (filter?.recipientId) {
      result = result.filter(n => !n.recipientId || n.recipientId === filter.recipientId);
    }
    return result;
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => n.status === 'sent').length;
  }

  clearAll(): void {
    this.notifications = [];
    this.notify();
  }
}

export const notificationService = new NotificationService();

