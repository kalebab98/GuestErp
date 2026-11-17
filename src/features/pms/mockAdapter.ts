// Mock PMS Adapter Implementation
// Clearly labeled as demonstration / development mock implementation
// Provides simulated live hotel/apartment property management system data

import { IPMSAdapter, PMSApartment, PMSReservation, PMSEligibilityResult } from '@/types/pms';

export class MockPMSAdapter implements IPMSAdapter {
  readonly adapterName = 'MockPMSAdapter (Development & Demo)';
  readonly isMock = true;

  private apartments: PMSApartment[] = [
    {
      id: 'apt-105',
      unitNumber: '105',
      name: 'Deluxe Studio 105',
      building: 'Garden Wing',
      floor: 1,
      type: 'studio',
      features: ['Balcony', 'Kitchenette', 'Garden View', 'King Bed'],
    },
    {
      id: 'apt-204',
      unitNumber: '204',
      name: 'One Bedroom Suite 204',
      building: 'Courtyard Wing',
      floor: 2,
      type: 'one_bedroom',
      features: ['Full Kitchen', 'Washer/Dryer', 'City View', 'Work Desk'],
    },
    {
      id: 'apt-304',
      unitNumber: '304',
      name: 'Two Bedroom Residence 304',
      building: 'Harbor Wing',
      floor: 3,
      type: 'two_bedroom',
      features: ['Full Kitchen', 'Harbor View', 'Dishwasher', 'Master Ensuite', 'Balcony'],
    },
    {
      id: 'apt-402',
      unitNumber: '402',
      name: 'Penthouse Apartment 402',
      building: 'Ocean Tower',
      floor: 4,
      type: 'penthouse',
      features: ['Panoramic Ocean View', 'Chef Kitchen', 'Terrace Jacuzzi', 'Dedicated Elevator'],
    },
    {
      id: 'apt-501',
      unitNumber: '501',
      name: 'Executive Studio 501',
      building: 'Skyline Wing',
      floor: 5,
      type: 'studio',
      features: ['Skyline View', 'Espresso Machine', 'High-Speed Wi-Fi', 'Smart Climate'],
    },
  ];

  private reservations: PMSReservation[] = [
    {
      id: 'RES-89211',
      apartmentId: 'apt-402',
      apartment: {
        id: 'apt-402',
        unitNumber: '402',
        name: 'Penthouse Apartment 402',
        building: 'Ocean Tower',
        floor: 4,
        type: 'penthouse',
        features: ['Panoramic Ocean View', 'Chef Kitchen', 'Terrace Jacuzzi'],
      },
      primaryGuest: {
        id: 'gst-1001',
        firstName: 'Sarah',
        lastName: 'Jenkins',
        fullName: 'Sarah Jenkins',
        email: 'sarah.jenkins@example.com',
        phone: '+1 (555) 234-5678',
        vipStatus: true,
      },
      checkInDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      checkOutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      stayStatus: 'checked_in',
      adultsCount: 2,
      childrenCount: 0,
      specialRequests: 'High floor, hypoallergenic pillows, quiet room requested.',
      createdAt: '2026-11-01T10:00:00Z',
      updatedAt: '2026-11-15T15:00:00Z',
    },
    {
      id: 'RES-89212',
      apartmentId: 'apt-105',
      apartment: {
        id: 'apt-105',
        unitNumber: '105',
        name: 'Deluxe Studio 105',
        building: 'Garden Wing',
        floor: 1,
        type: 'studio',
        features: ['Balcony', 'Kitchenette', 'Garden View'],
      },
      primaryGuest: {
        id: 'gst-1002',
        firstName: 'David',
        lastName: 'Zhao',
        fullName: 'David Zhao',
        email: 'david.zhao@example.com',
        phone: '+1 (555) 345-6789',
        vipStatus: false,
      },
      checkInDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Yesterday
      checkOutDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days later
      stayStatus: 'checked_in',
      adultsCount: 1,
      childrenCount: 0,
      specialRequests: 'Late arrival, ground floor preferred.',
      createdAt: '2026-11-10T14:30:00Z',
      updatedAt: '2026-11-16T18:00:00Z',
    },
    {
      id: 'RES-89213',
      apartmentId: 'apt-304',
      apartment: {
        id: 'apt-304',
        unitNumber: '304',
        name: 'Two Bedroom Residence 304',
        building: 'Harbor Wing',
        floor: 3,
        type: 'two_bedroom',
        features: ['Full Kitchen', 'Harbor View', 'Dishwasher'],
      },
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
      checkOutDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Checkout tomorrow!
      stayStatus: 'checked_in',
      adultsCount: 2,
      childrenCount: 2,
      specialRequests: 'Baby cot needed in second bedroom.',
      createdAt: '2026-11-05T09:15:00Z',
      updatedAt: '2026-11-13T14:00:00Z',
    },
    {
      id: 'RES-89214',
      apartmentId: 'apt-204',
      apartment: {
        id: 'apt-204',
        unitNumber: '204',
        name: 'One Bedroom Suite 204',
        building: 'Courtyard Wing',
        floor: 2,
        type: 'one_bedroom',
        features: ['Full Kitchen', 'City View'],
      },
      primaryGuest: {
        id: 'gst-1004',
        firstName: 'Michael',
        lastName: 'Brown',
        fullName: 'Michael Brown',
        email: 'michael.brown@example.com',
        phone: '+1 (555) 789-0123',
      },
      checkInDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      checkOutDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Checked out yesterday
      stayStatus: 'checked_out',
      adultsCount: 1,
      childrenCount: 0,
      createdAt: '2026-10-25T11:00:00Z',
      updatedAt: '2026-11-16T11:00:00Z',
    },
    {
      id: 'RES-89215',
      apartmentId: 'apt-501',
      apartment: {
        id: 'apt-501',
        unitNumber: '501',
        name: 'Executive Studio 501',
        building: 'Skyline Wing',
        floor: 5,
        type: 'studio',
        features: ['Skyline View', 'Espresso Machine'],
      },
      primaryGuest: {
        id: 'gst-1005',
        firstName: 'Lucas',
        lastName: 'Miller',
        fullName: 'Lucas Miller',
        email: 'lucas.miller@example.com',
        phone: '+1 (555) 890-1234',
      },
      checkInDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Arrives in 2 days
      checkOutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      stayStatus: 'booked',
      adultsCount: 2,
      childrenCount: 0,
      createdAt: '2026-11-12T16:00:00Z',
      updatedAt: '2026-11-12T16:00:00Z',
    },
  ];

  async getReservation(reservationId: string): Promise<PMSReservation | null> {
    const res = this.reservations.find(r => r.id.toLowerCase() === reservationId.toLowerCase());
    return res ? JSON.parse(JSON.stringify(res)) : null;
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

    // Allow check-in day access (even if front desk check-in in PMS is pending within 4 hours of arrival)
    const earlyWindow = new Date(checkIn.getTime() - 4 * 60 * 60 * 1000);
    const lateGracePeriod = new Date(checkOut.getTime() + 2 * 60 * 60 * 1000); // 2 hour grace

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
