// Mock PMS Adapter Implementation
// Represents our 16-Apartment Building (Floors 1-4, 4 units per floor) + Ground Floor Medical Store

import { IPMSAdapter, PMSApartment, PMSReservation, PMSEligibilityResult } from '@/types/pms';

export const BUILDING_INFO = {
  totalApartments: 16,
  floors: [1, 2, 3, 4],
  groundFloor: {
    name: 'Ground Floor Medical Store & Pharmacy',
    description: 'Located on the ground floor of this building for over-the-counter medicines, prescriptions, first-aid, and health essentials.',
    hours: '8:00 AM – 10:00 PM Daily',
    phone: '+251 911 550 100',
  },
};

export const BUILDING_16_APARTMENTS: PMSApartment[] = [
  // Floor 1 (4 units)
  { id: 'apt-101', unitNumber: '101', name: 'Apartment 101', building: 'Main Residence', floor: 1, type: 'studio', features: ['Balcony', 'Kitchenette', 'High-Speed Wi-Fi'] },
  { id: 'apt-102', unitNumber: '102', name: 'Apartment 102', building: 'Main Residence', floor: 1, type: 'one_bedroom', features: ['Full Kitchen', 'Living Area', 'High-Speed Wi-Fi'] },
  { id: 'apt-103', unitNumber: '103', name: 'Apartment 103', building: 'Main Residence', floor: 1, type: 'one_bedroom', features: ['Full Kitchen', 'Work Desk', 'Balcony'] },
  { id: 'apt-104', unitNumber: '104', name: 'Apartment 104', building: 'Main Residence', floor: 1, type: 'two_bedroom', features: ['Full Kitchen', '2 Bathrooms', 'Family Living Area'] },

  // Floor 2 (4 units)
  { id: 'apt-201', unitNumber: '201', name: 'Apartment 201', building: 'Main Residence', floor: 2, type: 'studio', features: ['City View', 'Kitchenette', 'Work Desk'] },
  { id: 'apt-202', unitNumber: '202', name: 'Apartment 202', building: 'Main Residence', floor: 2, type: 'one_bedroom', features: ['Full Kitchen', 'Balcony', 'Washer'] },
  { id: 'apt-203', unitNumber: '203', name: 'Apartment 203', building: 'Main Residence', floor: 2, type: 'one_bedroom', features: ['Full Kitchen', 'City View', 'Work Desk'] },
  { id: 'apt-204', unitNumber: '204', name: 'Apartment 204', building: 'Main Residence', floor: 2, type: 'two_bedroom', features: ['Full Kitchen', 'Balcony', 'Washer'] },

  // Floor 3 (4 units)
  { id: 'apt-301', unitNumber: '301', name: 'Apartment 301', building: 'Main Residence', floor: 3, type: 'studio', features: ['High Floor', 'Kitchenette', 'Balcony'] },
  { id: 'apt-302', unitNumber: '302', name: 'Apartment 302', building: 'Main Residence', floor: 3, type: 'one_bedroom', features: ['Full Kitchen', 'City View', 'Smart TV'] },
  { id: 'apt-303', unitNumber: '303', name: 'Apartment 303', building: 'Main Residence', floor: 3, type: 'one_bedroom', features: ['Full Kitchen', 'Balcony', 'Smart TV'] },
  { id: 'apt-304', unitNumber: '304', name: 'Apartment 304', building: 'Main Residence', floor: 3, type: 'two_bedroom', features: ['Full Kitchen', '2 Bathrooms', 'Balcony'] },

  // Floor 4 (4 units)
  { id: 'apt-401', unitNumber: '401', name: 'Apartment 401', building: 'Main Residence', floor: 4, type: 'one_bedroom', features: ['Top Floor View', 'Full Kitchen', 'Balcony'] },
  { id: 'apt-402', unitNumber: '402', name: 'Apartment 402', building: 'Main Residence', floor: 4, type: 'penthouse', features: ['Panoramic View', 'Full Kitchen', 'Terrace'] },
  { id: 'apt-403', unitNumber: '403', name: 'Apartment 403', building: 'Main Residence', floor: 4, type: 'two_bedroom', features: ['Top Floor View', 'Full Kitchen', '2 Bathrooms'] },
  { id: 'apt-404', unitNumber: '404', name: 'Apartment 404', building: 'Main Residence', floor: 4, type: 'penthouse', features: ['Panoramic View', 'Chef Kitchen', 'Private Terrace'] },
];

export class MockPMSAdapter implements IPMSAdapter {
  readonly adapterName = 'MockPMSAdapter (16-Apartment Residence)';
  readonly isMock = true;

  private apartments: PMSApartment[] = [
    ...BUILDING_16_APARTMENTS,
    // Legacy test apartment reference kept for backward-compatibility
    {
      id: 'apt-105',
      unitNumber: '105',
      name: 'Deluxe Studio 105',
      building: 'Main Residence',
      floor: 1,
      type: 'studio',
      features: ['Balcony', 'Kitchenette'],
    },
  ];

  private reservations: PMSReservation[] = [
    {
      id: 'RES-89211',
      apartmentId: 'apt-402',
      apartment: BUILDING_16_APARTMENTS.find(a => a.unitNumber === '402')!,
      primaryGuest: {
        id: 'gst-1001',
        firstName: 'Sarah',
        lastName: 'Jenkins',
        fullName: 'Sarah Jenkins',
        email: 'sarah.jenkins@example.com',
        phone: '+1 (555) 234-5678',
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
      apartmentId: 'apt-101',
      apartment: BUILDING_16_APARTMENTS.find(a => a.unitNumber === '101')!,
      primaryGuest: {
        id: 'gst-1002',
        firstName: 'David',
        lastName: 'Zhao',
        fullName: 'David Zhao',
        email: 'david.zhao@example.com',
        phone: '+1 (555) 345-6789',
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
      apartmentId: 'apt-304',
      apartment: BUILDING_16_APARTMENTS.find(a => a.unitNumber === '304')!,
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
      apartmentId: 'apt-204',
      apartment: BUILDING_16_APARTMENTS.find(a => a.unitNumber === '204')!,
      primaryGuest: {
        id: 'gst-1004',
        firstName: 'Michael',
        lastName: 'Brown',
        fullName: 'Michael Brown',
        email: 'michael.brown@example.com',
        phone: '+1 (555) 789-0123',
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
      apartmentId: 'apt-404',
      apartment: BUILDING_16_APARTMENTS.find(a => a.unitNumber === '404')!,
      primaryGuest: {
        id: 'gst-1005',
        firstName: 'Lucas',
        lastName: 'Miller',
        fullName: 'Lucas Miller',
        email: 'lucas.miller@example.com',
        phone: '+1 (555) 890-1234',
      },
      checkInDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      checkOutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      stayStatus: 'booked',
      adultsCount: 2,
      childrenCount: 0,
      createdAt: '2026-11-12T16:00:00Z',
      updatedAt: '2026-11-12T16:00:00Z',
    },
    // Active reservations for remaining apartments so staff can issue & test QR codes for any of the 16 units
    ...BUILDING_16_APARTMENTS.filter(
      a => !['402', '101', '304', '204', '404'].includes(a.unitNumber)
    ).map((apt, index) => ({
      id: `RES-APT-${apt.unitNumber}`,
      apartmentId: apt.id,
      apartment: apt,
      primaryGuest: {
        id: `gst-apt-${apt.unitNumber}`,
        firstName: 'Guest',
        lastName: `Apt ${apt.unitNumber}`,
        fullName: `Apartment ${apt.unitNumber} Guest`,
        email: `apt${apt.unitNumber}@guest.residence`,
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
      r => r.apartment.unitNumber === unitNumber && r.stayStatus === 'checked_in'
    );
    if (res) return JSON.parse(JSON.stringify(res));
    const anyRes = this.reservations.find(r => r.apartment.unitNumber === unitNumber);
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
        r.apartment.unitNumber.includes(q) ||
        r.apartment.name.toLowerCase().includes(q)
    );
  }
}

export const mockPMSAdapter = new MockPMSAdapter();
