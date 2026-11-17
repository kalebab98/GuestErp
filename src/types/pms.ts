// PMS Types & Contract Models
// Source of truth remains external PMS

export type PMSStayStatus = 'booked' | 'checked_in' | 'checked_out' | 'cancelled';

export interface PMSApartment {
  id: string;
  unitNumber: string;
  name: string;
  building: string;
  floor: number;
  type: 'studio' | 'one_bedroom' | 'two_bedroom' | 'penthouse';
  features: string[];
}

export interface PMSGuest {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  preferredLanguage?: string;
  vipStatus?: boolean;
}

export interface PMSReservation {
  id: string; // PMS Reservation Code e.g. "RES-2026-8921"
  apartmentId: string;
  apartment: PMSApartment;
  primaryGuest: PMSGuest;
  additionalGuests?: PMSGuest[];
  checkInDate: string; // ISO 8601
  checkOutDate: string; // ISO 8601
  stayStatus: PMSStayStatus;
  adultsCount: number;
  childrenCount: number;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PMSEligibilityResult {
  isEligible: boolean;
  reason?: string;
  reservation?: PMSReservation;
}

export interface IPMSAdapter {
  readonly adapterName: string;
  readonly isMock: boolean;

  getReservation(reservationId: string): Promise<PMSReservation | null>;
  getApartment(apartmentId: string): Promise<PMSApartment | null>;
  verifyStayEligibility(reservationId: string): Promise<PMSEligibilityResult>;
  listActiveReservations(): Promise<PMSReservation[]>;
  searchReservations(query: string): Promise<PMSReservation[]>;
}

