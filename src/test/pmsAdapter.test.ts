import { describe, it, expect } from 'vitest';
import { mockPMSAdapter } from '../features/pms/mockAdapter';

describe('PMS Integration Adapter', () => {
  it('retrieves reservation details by PMS identifier', async () => {
    const res = await mockPMSAdapter.getReservation('RES-89211');

    expect(res).not.toBeNull();
    expect(res?.id).toBe('RES-89211');
    expect(res?.primaryGuest.fullName).toBe('Sarah Jenkins');
    expect(res?.apartment.unitNumber).toBe('402');
  });

  it('verifies stay eligibility for actively checked-in guests', async () => {
    const eligibility = await mockPMSAdapter.verifyStayEligibility('RES-89211');

    expect(eligibility.isEligible).toBe(true);
    expect(eligibility.reservation).toBeDefined();
  });

  it('rejects stay eligibility when guest has completed checkout', async () => {
    const eligibility = await mockPMSAdapter.verifyStayEligibility('RES-89214'); // Michael Brown, checked out

    expect(eligibility.isEligible).toBe(false);
    expect(eligibility.reason).toContain('already completed checkout');
  });

  it('rejects stay eligibility when arrival date is in the future', async () => {
    const eligibility = await mockPMSAdapter.verifyStayEligibility('RES-89215'); // Lucas Miller, arrives in 2 days

    expect(eligibility.isEligible).toBe(false);
    expect(eligibility.reason).toContain('Portal access opens on check-in day');
  });

  it('searches reservations by guest name or apartment unit number', async () => {
    const byName = await mockPMSAdapter.searchReservations('David');
    expect(byName.length).toBeGreaterThanOrEqual(1);
    expect(byName[0].primaryGuest.fullName).toContain('David');

    const byUnit = await mockPMSAdapter.searchReservations('402');
    expect(byUnit.length).toBeGreaterThanOrEqual(1);
    expect(byUnit[0].apartment.unitNumber).toBe('402');
  });
});

