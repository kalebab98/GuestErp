// Editable Property & Stay Manager (PMS Adapter Implementation)
// 16-Apartment Building: 1A, 1B, 2A, 2B, 3A, 3B, 4A, 4B, 5A, 5B, 6A, 6B, 7A, 7B, 8A, 8B
// + Ground Floor Medical Store
// All apartment labels, guest names, contact details, dates, and stay statuses are editable
// from the Staff Command Center and synced live to Supabase `guestcare.settings`.

import { IPMSAdapter, PMSApartment, PMSReservation, PMSEligibilityResult, PMSStayStatus } from '@/types/pms';
import {
  fetchAllSettingsFromSupabase,
  upsertSettingToSupabase,
  subscribeToGuestCareRealtime,
} from '@/lib/supabaseSync';

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

function createDefaultReservations(apartments: PMSApartment[]): PMSReservation[] {
  const findApt = (unit: string) => apartments.find(a => a.unitNumber === unit)!;
  return [
    {
      id: 'RES-89211',
      apartmentId: 'apt-1a',
      apartment: findApt('1A'),
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
      apartment: findApt('1B'),
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
      apartment: findApt('2A'),
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
      apartment: findApt('2B'),
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
      apartment: findApt('8B'),
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
    ...apartments
      .filter(a => !['1A', '1B', '2A', '2B', '8B'].includes(a.unitNumber))
      .map((apt, index) => ({
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
}

const STORAGE_KEY_APARTMENTS = 'guestcare_pms_apartments_v1';
const STORAGE_KEY_RESERVATIONS = 'guestcare_pms_reservations_v1';

function loadLocal<T>(key: string, fallback: T): T {
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

function saveLocal<T>(key: string, value: T): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // Ignore
  }
}

export interface ApartmentStayUpdateInput {
  apartmentName?: string;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  stayStatus?: PMSStayStatus;
  checkInDate?: string;
  checkOutDate?: string;
}

export class MockPMSAdapter implements IPMSAdapter {
  readonly adapterName = 'GuestCare Building PMS (16 Apartments: 1A–8B)';
  readonly isMock = true;

  private apartments: PMSApartment[] = loadLocal(
    STORAGE_KEY_APARTMENTS,
    BUILDING_16_APARTMENTS.map(a => ({ ...a }))
  );

  private reservations: PMSReservation[] = loadLocal(
    STORAGE_KEY_RESERVATIONS,
    createDefaultReservations(this.apartments)
  );

  private listeners: Array<() => void> = [];

  constructor() {
    void this.syncFromSupabase();
    subscribeToGuestCareRealtime(() => {
      void this.syncFromSupabase();
    });
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private emit(): void {
    saveLocal(STORAGE_KEY_APARTMENTS, this.apartments);
    saveLocal(STORAGE_KEY_RESERVATIONS, this.reservations);
    void upsertSettingToSupabase(
      'building_apartments_stays',
      { apartments: this.apartments, reservations: this.reservations },
      'Editable 16-apartment directory and guest stay assignments'
    );
    this.listeners.forEach(l => l());
  }

  async syncFromSupabase(): Promise<void> {
    const remote = await fetchAllSettingsFromSupabase();
    if (!remote || !remote.building_apartments_stays) return;
    const payload = remote.building_apartments_stays;
    let changed = false;
    if (Array.isArray(payload.apartments) && payload.apartments.length > 0) {
      this.apartments = payload.apartments;
      changed = true;
    }
    if (Array.isArray(payload.reservations) && payload.reservations.length > 0) {
      this.reservations = payload.reservations;
      changed = true;
    }
    if (changed) {
      saveLocal(STORAGE_KEY_APARTMENTS, this.apartments);
      saveLocal(STORAGE_KEY_RESERVATIONS, this.reservations);
      this.listeners.forEach(l => l());
    }
  }

  /**
   * Allows Staff Command Center to edit any apartment name, guest name/phone/email,
   * stay status, and check-in/check-out dates — immediately synced to Supabase.
   */
  updateApartmentStay(unitNumber: string, patch: ApartmentStayUpdateInput): void {
    const normalized = unitNumber.trim().toUpperCase();
    const aptIdx = this.apartments.findIndex(a => a.unitNumber.toUpperCase() === normalized);
    if (aptIdx === -1) return;

    if (patch.apartmentName && patch.apartmentName.trim()) {
      this.apartments[aptIdx] = {
        ...this.apartments[aptIdx],
        name: patch.apartmentName.trim(),
      };
    }

    const updatedApt = this.apartments[aptIdx];
    const resIdx = this.reservations.findIndex(
      r => r.apartment.unitNumber.toUpperCase() === normalized
    );

    const now = new Date().toISOString();
    const fullName = patch.guestName?.trim();
    const [firstName, ...rest] = (fullName || `Apartment ${normalized} Guest`).split(' ');
    const lastName = rest.join(' ') || '';

    if (resIdx >= 0) {
      const existing = this.reservations[resIdx];
      this.reservations[resIdx] = {
        ...existing,
        apartment: updatedApt,
        primaryGuest: {
          ...existing.primaryGuest,
          firstName: fullName ? firstName : existing.primaryGuest.firstName,
          lastName: fullName ? lastName : existing.primaryGuest.lastName,
          fullName: fullName || existing.primaryGuest.fullName,
          email: patch.guestEmail !== undefined ? patch.guestEmail.trim() : existing.primaryGuest.email,
          phone: patch.guestPhone !== undefined ? patch.guestPhone.trim() : existing.primaryGuest.phone,
        },
        stayStatus: patch.stayStatus || existing.stayStatus,
        checkInDate: patch.checkInDate || existing.checkInDate,
        checkOutDate: patch.checkOutDate || existing.checkOutDate,
        updatedAt: now,
      };
    } else {
      this.reservations.push({
        id: `RES-APT-${normalized}`,
        apartmentId: updatedApt.id,
        apartment: updatedApt,
        primaryGuest: {
          id: `gst-apt-${normalized}`,
          firstName,
          lastName,
          fullName: fullName || `Apartment ${normalized} Guest`,
          email: patch.guestEmail?.trim() || '',
          phone: patch.guestPhone?.trim() || '',
        },
        checkInDate: patch.checkInDate || now,
        checkOutDate: patch.checkOutDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        stayStatus: patch.stayStatus || 'checked_in',
        adultsCount: 2,
        childrenCount: 0,
        createdAt: now,
        updatedAt: now,
      });
    }

    this.emit();
  }

  listAllBuildingApartments(): PMSApartment[] {
    return this.apartments.map(a => ({ ...a }));
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
