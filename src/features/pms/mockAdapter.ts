// Mock PMS Adapter Implementation
// 16-Apartment Building: 1A, 1B, 2A, 2B, 3A, 3B, 4A, 4B, 5A, 5B, 6A, 6B, 7A, 7B, 8A, 8B + Ground Floor Medical Store

import { IPMSAdapter, PMSApartment, PMSReservation, PMSEligibilityResult } from '@/types/pms';

export const BUILDING_INFO = {
  totalApartments: 16,
  floors: [1, 2, 3, 4, 5, 6, 7, 8],
};

export const BUILDING_16_APARTMENTS: PMSApartment[] = [1, 2, 3, 4, 5, 6, 7, 8].flatMap(floor => [
  {
    id: `apt-${floor}a`,
    unitNumber: `${floor}A`,
    name: `Apartment ${floor}A`,
    building: 'Main Residence',
    floor,
    type: floor === 8 ? 'penthouse' : floor % 2 === 0 ? 'two_bedroom' : 'one_bedroom',
    features: ['Balcony', 'Full Kitchen', 'High-Speed Wi-Fi'],
  },
  {
    id: `apt-${floor}b`,
    unitNumber: `${floor}B`,
    name: `Apartment ${floor}B`,
    building: 'Main Residence',
    floor,
    type: floor === 8 ? 'penthouse' : floor % 2 === 0 ? 'one_bedroom' : 'two_bedroom',
    features: ['City View', 'Full Kitchen', 'High-Speed Wi-Fi'],
  },
]);

export class MockPMSAdapter implements IPMSAdapter {
  readonly adapterName = 'MockPMSAdapter (16 Apartments: 1A–8B)';
  readonly isMock = true;

  private apartments: PMSApartment[] = [...BUILDING_16_APARTMENTS];

  private reservations: PMSReservation[] = [
    {
      id: 'RES-89211',
      apartmentId: 'apt-1a',
      apartment: BUILDING_16_APARTMENTS.find(a => a.unitNumber === '1A')!,
      primaryGuest: {
        id: 'gst-1001',
        firstName: 'Sarah',
        lastName: 'Jenkins',
        fullName: 'Sarah Jenkins',
        email: 'sarah.jenkins@example.com',
        phone: '+251 911 234 567',
        vipStatus: true,
      },
      checkInDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      checkOutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      stayStatus: 'checked_in',
      adultsCount: 2,
      childrenCount: 0,
      createdAt: '2026-11-01T10:00:00Z',
      updatedAt: '2026-11-15T15:00:00Z',
    },
    {
      id: 'RES-89212',
      apartmentId: 'apt-1b',
      apartment: BUILDING_16_APARTMENTS.find(a => a.unitNumber === '1B')!,
      primaryGuest: {
        id: 'gst-1002',
        firstName: 'David',
        lastName: 'Zhao',
        fullName: 'David Zhao',
        email: 'david.zhao@example.com',
        phone: '+251 911 345 678',
      },
      checkInDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      checkOutDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      stayStatus: 'checked_in',
      adultsCount: 1,
      childrenCount: 0,
      createdAt: '2026-11-10T14:30:00Z',
      updatedAt: '2026-11-16T18:00:00Z',
    },
    {
      id: 'RES-89213',
      apartmentId: 'apt-2a',
      apartment: BUILDING_16_APARTMENTS.find(a => a.unitNumber === '2A')!,
      primaryGuest: {
        id: 'gst-1003',
        firstName: 'Elena',
        lastName: 'Rostova',
        fullName: 'Elena Rostova',
        email: 'elena.rostova@example.com',
        phone: '+44 20 7946 0912',
        vipStatus: true,
      },
      checkInDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      checkOutDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      stayStatus: 'checked_in',
      adultsCount: 2,
      childrenCount: 2,
      createdAt: '2026-11-05T09:15:00Z',
      updatedAt: '2026-11-13T14:00:00Z',
    },
    {
      id: 'RES-89214',
      apartmentId: 'apt-2b',
      apartment: BUILDING_16_APARTMENTS.find(a => a.unitNumber === '2B')!,
      primaryGuest: {
        id: 'gst-1004',
        firstName: 'Michael',
        lastName: 'Brown',
        fullName: 'Michael Brown',
        email: 'michael.brown@example.com',
        phone: '+251 911 789 012',
      },
      checkInDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      checkOutDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      stayStatus: 'checked_out',
      adultsCount: 1,
      childrenCount: 0,
      createdAt: '2026-10-25T11:00:00Z',
      updatedAt: '2026-11-16T11:00:00Z',
    },
    {
      id: 'RES-89215',
      apartmentId: 'apt-8b',
      apartment: BUILDING_16_APARTMENTS.find(a => a.unitNumber === '8B')!,
      primaryGuest: {
        id: 'gst-1005',
        firstName: 'Lucas',
        lastName: 'Miller',
        fullName: 'Lucas Miller',
        email: 'lucas.miller@example.com',
        phone: '+251 911 890 123',
      },
      checkInDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      checkOutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      stayStatus: 'booked',
      adultsCount: 2,
      childrenCount: 0,
      createdAt: '2026-11-12T16:00:00Z',
      updatedAt: '2026-11-12T16:00:00Z',
    },
    // Active reservations for all remaining apartments (3A through 8A)
    ...BUILDING_16_APARTMENTS.filter(
      a => !['1A', '1B', '2A', '2B', '8B'].includes(a.unitNumber)
    ).map((apt, index) => ({
      id: `RES-APT-${apt.unitNumber}`,
      apartmentId: apt.id,
      apartment: apt,
      primaryGuest: {
        id: `gst-apt-${apt.unitNumber}`,
        firstName: 'Guest',
        lastName: `Apt ${apt.unitNumber}`,
        fullName: `Apartment ${apt.unitNumber} Guest`,
        email: `apt${apt.unitNumber.toLowerCase()}@guest.residence`,
        phone: `+251 911 000 ${String(100 + index).slice(-3)}`,
      },
      checkInDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      checkOutDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      stayStatus: 'checked_in' as const,
      adultsCount: 2,
      childrenCount: 0,
      createdAt: '2026-11-15T10:00:00Z',
      updatedAt: '2026-11-16T10:00:00Z',
    })),
  ];

  listAllBuildingApartments(): PMSApartment[] {
    return BUILDING_16_APARTMENTS.map(a => ({ ...a }));
  }

  async getReservation(reservationId: string): Promise<PMSReservation | null> {
    const res = this.reservations.find(r => r.id.toLowerCase() === reservationId.toLowerCase());
    return res ? JSON.parse(JSON.stringify(res)) : null;
  }

  async getReservationByApartmentUnit(unitNumber: string): Promise<PMSReservation | null> {
    const res = this.reservations.find(
      r => r.apartment.unitNumber.toLowerCase() === unitNumber.toLowerCase() && r.stayStatus === 'checked_in'
    );
    if (res) return JSON.parse(JSON.stringify(res));
    const anyRes = this.reservations.find(
      r => r.apartment.unitNumber.toLowerCase() === unitNumber.toLowerCase()
    );
    return anyRes ? JSON.parse(JSON.stringify(anyRes)) : null;
  }

  async getApartment(apartmentId: string): Promise<PMSApartment | null> {
    const apt = this.apartments.find(a => a.id.toLowerCase() === apartmentId.toLowerCase());
    return apt ? JSON.parse(JSON.stringify(apt)) : null;
  }

  async verifyStayEligibility(reservationId: string): Promise<PMSEligibilityResult> {
    const res = await this.getReservation(reservationId);
    if (!res) {
      return { isEligible: false, reason: 'Reservation not found in PMS records.' };
    }

    if (res.stayStatus === 'cancelled') {
      return { isEligible: false, reason: 'This reservation has been cancelled.', reservation: res };
    }

    if (res.stayStatus === 'checked_out') {
      return {
        isEligible: false,
        reason: 'Guest has already completed checkout. Portal access is closed.',
        reservation: res,
      };
    }

    const now = new Date();
    const checkIn = new Date(res.checkInDate);
    const checkOut = new Date(res.checkOutDate);

    const earlyWindow = new Date(checkIn.getTime() - 4 * 60 * 60 * 1000);
    const lateGracePeriod = new Date(checkOut.getTime() + 2 * 60 * 60 * 1000);

    if (now < earlyWindow) {
      return {
        isEligible: false,
        reason: `Portal access opens on check-in day (${checkIn.toLocaleDateString()}).`,
        reservation: res,
      };
    }

    if (now > lateGracePeriod) {
      return {
        isEligible: false,
        reason: 'Stay duration has expired. Portal access concluded at checkout.',
        reservation: res,
      };
    }

    return {
      isEligible: true,
      reservation: res,
    };
  }

  async listActiveReservations(): Promise<PMSReservation[]> {
    return this.reservations
      .filter(r => r.stayStatus === 'checked_in')
      .map(r => JSON.parse(JSON.stringify(r)));
  }

  async searchReservations(query: string): Promise<PMSReservation[]> {
    const q = query.toLowerCase().trim();
    return this.reservations.filter(
      r =>
        r.id.toLowerCase().includes(q) ||
        r.primaryGuest.fullName.toLowerCase().includes(q) ||
        r.apartment.unitNumber.toLowerCase().includes(q) ||
        r.apartment.name.toLowerCase().includes(q)
    );
  }
}

export const mockPMSAdapter = new MockPMSAdapter();
