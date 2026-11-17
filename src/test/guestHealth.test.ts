import { describe, it, expect } from 'vitest';
import { GuestHealthEngine } from '../features/health/healthEngine';
import { GuestRequest } from '../types/guestcare';

describe('Rule-Based Guest Experience Health Engine', () => {
  it('assigns 100 score and "good" status when guest has zero open complaints', () => {
    const health = GuestHealthEngine.calculate({
      reservationRef: 'RES-PERFECT',
      apartmentRef: 'Penthouse 402',
      guestName: 'Lady Bracknell',
      requests: [],
      feedback: [],
    });

    expect(health.score).toBe(100);
    expect(health.status).toBe('good');
    expect(health.reasons[0]).toContain('nominal guest satisfaction');
  });

  it('drops score to "at_risk" on open high-priority or standard requests', () => {
    const mockRequest: GuestRequest = {
      id: 'req-1',
      ticketNumber: 'GC-20261117-001',
      reservationRef: 'RES-RISK',
      apartmentRef: 'Suite 101',
      guestName: 'Jack Worthing',
      categoryId: 'cat-maint',
      title: 'AC Broken',
      description: 'Hot room',
      priority: 'high',
      status: 'in_progress',
      assignedDepartment: 'maintenance',
      reopenCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const health = GuestHealthEngine.calculate({
      reservationRef: 'RES-RISK',
      apartmentRef: 'Suite 101',
      guestName: 'Jack Worthing',
      requests: [mockRequest],
    });

    expect(health.score).toBe(80); // 100 - 20
    expect(health.reasons[0]).toContain('high priority request(s) open');
  });

  it('triggers "critical" status when urgent tickets or guest reopens exist', () => {
    const mockReopenedRequest: GuestRequest = {
      id: 'req-2',
      ticketNumber: 'GC-20261117-002',
      reservationRef: 'RES-CRITICAL',
      apartmentRef: 'Suite 102',
      guestName: 'Algernon Moncrieff',
      categoryId: 'cat-maint',
      title: 'Water Leak',
      description: 'Active leak',
      priority: 'urgent',
      status: 'reopened',
      assignedDepartment: 'maintenance',
      reopenCount: 1,
      guestSatisfaction: 'unsatisfied',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const health = GuestHealthEngine.calculate({
      reservationRef: 'RES-CRITICAL',
      apartmentRef: 'Suite 102',
      guestName: 'Algernon Moncrieff',
      requests: [mockReopenedRequest],
    });

    // 100 - 35 (urgent) - 25 (reopened) - 30 (unsatisfied) = 10
    expect(health.score).toBeLessThanOrEqual(50);
    expect(health.status).toBe('critical');
    expect(health.reasons.some(r => r.includes('urgent ticket'))).toBe(true);
    expect(health.reasons.some(r => r.includes('reopened by guest'))).toBe(true);
  });

  it('promotes guest to "improving" after prior issues are resolved', () => {
    const mockResolvedRequest: GuestRequest = {
      id: 'req-3',
      ticketNumber: 'GC-20261117-003',
      reservationRef: 'RES-IMPROVING',
      apartmentRef: 'Suite 103',
      guestName: 'Cecily Cardew',
      categoryId: 'cat-hk',
      title: 'Towel delivery',
      description: 'Extra towels',
      priority: 'medium',
      status: 'closed',
      guestSatisfaction: 'satisfied',
      assignedDepartment: 'housekeeping',
      reopenCount: 0,
      createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const health = GuestHealthEngine.calculate({
      reservationRef: 'RES-IMPROVING',
      apartmentRef: 'Suite 103',
      guestName: 'Cecily Cardew',
      requests: [mockResolvedRequest],
    });

    expect(health.score).toBe(100);
    expect(health.status).toBe('improving');
    expect(health.reasons.some(r => r.includes('successfully resolved'))).toBe(true);
  });
});
