// Token Service & Session Management
// Cryptographic token validation, hashing, expiration, and revocation logic

import { generateSecureToken, hashToken } from './crypto';
import { pmsService } from '@/features/pms/pmsService';
import { rateLimiter } from './rateLimit';
import { PortalSession } from '@/types/guestcare';

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

// In-memory / persistent mock session store for robust local development & testing
const STORAGE_KEY = 'guestcare_portal_sessions';

function loadStoredSessions(): PortalSession[] {
  try {
    if (typeof localStorage !== 'undefined') {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) return JSON.parse(data);
    }
  } catch (e) {
    // Ignore storage errors in test runner
  }
  return [];
}

function saveStoredSessions(sessions: PortalSession[]): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  } catch (e) {
    // Ignore storage errors in test runner
  }
}

class TokenService {
  private inMemorySessions: PortalSession[] = loadStoredSessions();

  /**
   * Generates a new cryptographic portal token for an eligible PMS reservation
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

    // Store in session repository
    this.inMemorySessions.push(newSession);
    saveStoredSessions(this.inMemorySessions);

    // Build user-facing portal URL without exposing any guest PII
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const portalUrl = `${baseUrl}/portal?token=${rawToken}`;

    return {
      rawToken,
      tokenHash,
      portalUrl,
      session: newSession,
    };
  }

  /**
   * Validates a raw token from the QR code:
   * 1. Rate-limit validation attempts
   * 2. Hash computation
   * 3. Database lookup by token_hash
   * 4. Revocation verification
   * 5. Expiration check
   * 6. PMS stay eligibility check
   */
  async validateToken(rawToken: string, clientIp = 'client'): Promise<TokenValidationResult> {
    if (!rawToken || rawToken.trim().length < 32) {
      return { valid: false, error: 'Invalid or missing QR access token.' };
    }

    // Rate limiting: 10 attempts per minute per client
    const allowed = rateLimiter.isAllowed(`auth:${clientIp}`, 10, 60 * 1000);
    if (!allowed) {
      const waitSec = rateLimiter.getResetSeconds(`auth:${clientIp}`, 60 * 1000);
      return {
        valid: false,
        error: `Too many validation attempts. Please wait ${waitSec} seconds.`,
      };
    }

    const calculatedHash = await hashToken(rawToken.trim());
    const session = this.inMemorySessions.find(s => s.tokenHash === calculatedHash);

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

    // Update last active
    session.lastActiveAt = now.toISOString();
    saveStoredSessions(this.inMemorySessions);

    return {
      valid: true,
      session,
    };
  }

  /**
   * Manually revokes a session (e.g. staff intervention or room move)
   */
  async revokeSession(sessionId: string, reason: string): Promise<boolean> {
    const session = this.inMemorySessions.find(s => s.id === sessionId);
    if (!session) return false;

    session.revokedAt = new Date().toISOString();
    session.revocationReason = reason;
    saveStoredSessions(this.inMemorySessions);
    return true;
  }

  /**
   * Revoke all sessions for a reservation (e.g. on early checkout)
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
    return count;
  }

  /**
   * List all sessions (for Staff Dashboard QR & Session Management)
   */
  async listSessions(): Promise<PortalSession[]> {
    return [...this.inMemorySessions];
  }
}

export const tokenService = new TokenService();

