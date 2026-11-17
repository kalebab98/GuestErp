// Token Service & Session Management
// Cryptographic token validation, SHA-256 hashing, cross-device Supabase sync, expiration, and revocation

import { generateSecureToken, hashToken } from './crypto';
import { pmsService } from '@/features/pms/pmsService';
import { rateLimiter } from './rateLimit';
import { PortalSession } from '@/types/guestcare';
import {
  insertPortalSessionToSupabase,
  findPortalSessionByHashInSupabase,
  updatePortalSessionLastActiveInSupabase,
  revokePortalSessionInSupabase,
  revokeReservationSessionsInSupabase,
} from './supabaseSync';

export interface TokenValidationResult {
  valid: boolean;
  error?: string;
  session?: PortalSession;
}

export interface GeneratedTokenResult {
  rawToken: string;
  tokenHash: string;
  portalUrl: string;
  session: PortalSession;
}

const STORAGE_KEY = 'guestcare_portal_sessions';
const UNIT_TOKENS_KEY = 'guestcare_unit_qr_tokens_v1';

function loadStoredSessions(): PortalSession[] {
  try {
    if (typeof localStorage !== 'undefined') {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    }
  } catch {
    // Ignore in test runner
  }
  return [];
}

function saveStoredSessions(sessions: PortalSession[]): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  } catch {
    // Ignore in test runner
  }
}

function loadUnitTokenMap(): Record<string, GeneratedTokenResult> {
  try {
    if (typeof localStorage !== 'undefined') {
      const data = localStorage.getItem(UNIT_TOKENS_KEY);
      if (data) return JSON.parse(data);
    }
  } catch {
    // Ignore
  }
  return {};
}

function saveUnitTokenMap(map: Record<string, GeneratedTokenResult>): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(UNIT_TOKENS_KEY, JSON.stringify(map));
    }
  } catch {
    // Ignore
  }
}

class TokenService {
  private inMemorySessions: PortalSession[] = loadStoredSessions();

  /**
   * Generates a new cryptographic portal token for an eligible PMS reservation
   * and persists the SHA-256 hash to Supabase `guestcare.portal_sessions` for cross-device scanning.
   */
  async createPortalSession(reservationId: string, gracePeriodHours = 2): Promise<GeneratedTokenResult> {
    const pms = pmsService.getAdapter();
    const eligibility = await pms.verifyStayEligibility(reservationId);

    if (!eligibility.isEligible || !eligibility.reservation) {
      throw new Error(eligibility.reason || 'Reservation is not eligible for portal access');
    }

    const res = eligibility.reservation;
    const rawToken = generateSecureToken();
    const tokenHash = await hashToken(rawToken);

    const checkIn = new Date(res.checkInDate);
    const checkOut = new Date(res.checkOutDate);
    const expiresAt = new Date(checkOut.getTime() + gracePeriodHours * 60 * 60 * 1000);

    const newSession: PortalSession = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sess-${Date.now()}`,
      reservationRef: res.id,
      apartmentRef: `${res.apartment.unitNumber} - ${res.apartment.name}`,
      guestName: res.primaryGuest.fullName,
      guestEmail: res.primaryGuest.email,
      guestPhone: res.primaryGuest.phone,
      tokenHash,
      checkInDate: checkIn.toISOString(),
      checkOutDate: checkOut.toISOString(),
      expiresAt: expiresAt.toISOString(),
      lastActiveAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // Persist locally AND to live Supabase database so ANY mobile device can scan the QR
    this.inMemorySessions.push(newSession);
    saveStoredSessions(this.inMemorySessions);
    await insertPortalSessionToSupabase(newSession);

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const portalUrl = `${baseUrl}/portal?token=${rawToken}&unit=${encodeURIComponent(res.apartment.unitNumber)}`;

    return {
      rawToken,
      tokenHash,
      portalUrl,
      session: newSession,
    };
  }

  /**
   * Returns a stable reusable QR session for a unit so printed QR codes remain valid across reloads,
   * unless forceRotate is true (when staff clicks Reset).
   */
  async getOrCreateUnitSession(
    unitNumber: string,
    reservationId: string,
    forceRotate = false
  ): Promise<GeneratedTokenResult> {
    const map = loadUnitTokenMap();
    const existing = map[unitNumber];
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

    if (
      !forceRotate &&
      existing &&
      existing.session.reservationRef === reservationId &&
      !existing.session.revokedAt &&
      new Date(existing.session.expiresAt) > new Date()
    ) {
      // Ensure portalUrl reflects current origin (e.g. https://guest-erp.vercel.app) and unit code
      const syncedUrl = `${baseUrl}/portal?token=${existing.rawToken}&unit=${encodeURIComponent(unitNumber)}`;
      // Ensure session exists in Supabase as well
      const inDb = await findPortalSessionByHashInSupabase(existing.tokenHash);
      if (!inDb) {
        await insertPortalSessionToSupabase(existing.session);
      }
      return { ...existing, portalUrl: syncedUrl };
    }

    const created = await this.createPortalSession(reservationId);
    map[unitNumber] = created;
    saveUnitTokenMap(map);
    return created;
  }

  /**
   * Validates a raw token from the QR code across both local cache and live Supabase:
   */
  async validateToken(rawToken: string, clientIp = 'client'): Promise<TokenValidationResult> {
    if (!rawToken || rawToken.trim().length < 32) {
      return { valid: false, error: 'Invalid or missing QR access token.' };
    }

    const allowed = rateLimiter.isAllowed(`auth:${clientIp}`, 10, 60 * 1000);
    if (!allowed) {
      const waitSec = rateLimiter.getResetSeconds(`auth:${clientIp}`, 60 * 1000);
      return {
        valid: false,
        error: `Too many validation attempts. Please wait ${waitSec} seconds.`,
      };
    }

    const calculatedHash = await hashToken(rawToken.trim());

    // 1. Check local cache first, 2. Fall back to live Supabase (for cross-device mobile QR scans!)
    let session: PortalSession | null | undefined = this.inMemorySessions.find(
      s => s.tokenHash === calculatedHash
    );
    if (!session) {
      session = await findPortalSessionByHashInSupabase(calculatedHash);
      if (session) {
        this.inMemorySessions.push(session);
        saveStoredSessions(this.inMemorySessions);
      }
    }

    if (!session) {
      return { valid: false, error: 'Access token not recognized or already expired.' };
    }

    if (session.revokedAt) {
      return {
        valid: false,
        error: `This access pass was revoked on ${new Date(session.revokedAt).toLocaleDateString()}. Reason: ${session.revocationReason || 'Manual revocation'}.`,
      };
    }

    const now = new Date();
    const expiresAt = new Date(session.expiresAt);
    if (now > expiresAt) {
      return {
        valid: false,
        error: 'Your stay access pass has expired following checkout. Please contact reception.',
      };
    }

    // PMS verification
    const pms = pmsService.getAdapter();
    const eligibility = await pms.verifyStayEligibility(session.reservationRef);
    if (!eligibility.isEligible) {
      return {
        valid: false,
        error: eligibility.reason || 'Reservation is no longer active in the property system.',
      };
    }

    session.lastActiveAt = now.toISOString();
    saveStoredSessions(this.inMemorySessions);
    void updatePortalSessionLastActiveInSupabase(session.id);

    return {
      valid: true,
      session,
    };
  }

  /**
   * Manually revokes a session
   */
  async revokeSession(sessionId: string, reason: string): Promise<boolean> {
    const session = this.inMemorySessions.find(s => s.id === sessionId);
    if (!session) return false;

    session.revokedAt = new Date().toISOString();
    session.revocationReason = reason;
    saveStoredSessions(this.inMemorySessions);
    await revokePortalSessionInSupabase(sessionId, reason);
    return true;
  }

  /**
   * Revoke all sessions for a reservation
   */
  async revokeAllForReservation(reservationRef: string, reason: string): Promise<number> {
    let count = 0;
    const now = new Date().toISOString();
    this.inMemorySessions.forEach(s => {
      if (s.reservationRef === reservationRef && !s.revokedAt) {
        s.revokedAt = now;
        s.revocationReason = reason;
        count++;
      }
    });
    if (count > 0) {
      saveStoredSessions(this.inMemorySessions);
    }

    // Also clear unit QR cache for this reservation
    const map = loadUnitTokenMap();
    Object.keys(map).forEach(unit => {
      if (map[unit]?.session?.reservationRef === reservationRef) {
        delete map[unit];
      }
    });
    saveUnitTokenMap(map);

    await revokeReservationSessionsInSupabase(reservationRef, reason);
    return count;
  }

  async listSessions(): Promise<PortalSession[]> {
    return [...this.inMemorySessions];
  }
}

export const tokenService = new TokenService();
