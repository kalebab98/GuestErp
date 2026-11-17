import { describe, it, expect, beforeEach } from 'vitest';
import { tokenService } from '../lib/tokenService';
import { rateLimiter } from '../lib/rateLimit';

describe('Token Service & Authentication', () => {
  beforeEach(() => {
    rateLimiter.reset('auth:test-client');
  });

  it('creates a cryptographic session for an eligible checked-in reservation', async () => {
    const result = await tokenService.createPortalSession('RES-89211');

    expect(result.rawToken).toHaveLength(64);
    expect(result.tokenHash).toHaveLength(64);
    expect(result.portalUrl).toContain(result.rawToken);
    expect(result.session.guestName).toBe('Sarah Jenkins');
    expect(result.session.reservationRef).toBe('RES-89211');
  });

  it('successfully validates a legitimate raw token', async () => {
    const generated = await tokenService.createPortalSession('RES-89212');
    const validation = await tokenService.validateToken(generated.rawToken, 'test-client');

    expect(validation.valid).toBe(true);
    expect(validation.session?.reservationRef).toBe('RES-89212');
    expect(validation.session?.guestName).toBe('David Zhao');
  });

  it('rejects an unrecognized or altered token', async () => {
    const invalidToken = '0000000000000000000000000000000000000000000000000000000000000000';
    const validation = await tokenService.validateToken(invalidToken, 'test-client');

    expect(validation.valid).toBe(false);
    expect(validation.error).toContain('not recognized');
  });

  it('rejects access after a token has been manually revoked', async () => {
    const generated = await tokenService.createPortalSession('RES-89211');
    const sessionId = generated.session.id;

    // Revoke
    const revoked = await tokenService.revokeSession(sessionId, 'Room transfer to 501');
    expect(revoked).toBe(true);

    // Validate again
    const validation = await tokenService.validateToken(generated.rawToken, 'test-client');
    expect(validation.valid).toBe(false);
    expect(validation.error).toContain('revoked');
    expect(validation.error).toContain('Room transfer to 501');
  });

  it('enforces rate limiting on repeated failed attempts', async () => {
    const invalidToken = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    const clientKey = 'test-client-ratelimit';

    // Simulate 10 attempts
    for (let i = 0; i < 10; i++) {
      await tokenService.validateToken(invalidToken, clientKey);
    }

    // 11th attempt must be throttled
    const throttled = await tokenService.validateToken(invalidToken, clientKey);
    expect(throttled.valid).toBe(false);
    expect(throttled.error).toContain('Too many validation attempts');
  });

  it('rejects token creation for past checkout reservation in PMS', async () => {
    // RES-89214 is checked out in mock PMS
    await expect(tokenService.createPortalSession('RES-89214')).rejects.toThrow(
      /already completed checkout/i
    );
  });

  it('reuses a stable unit QR token until forceRotate is requested and encodes unit code in URL', async () => {
    const first = await tokenService.getOrCreateUnitSession('1A', 'RES-89211', false);
    const second = await tokenService.getOrCreateUnitSession('1A', 'RES-89211', false);

    expect(first.portalUrl).toContain('token=');
    expect(first.portalUrl).toContain('unit=1A');
    expect(second.rawToken).toBe(first.rawToken);

    const rotated = await tokenService.getOrCreateUnitSession('1A', 'RES-89211', true);
    expect(rotated.rawToken).not.toBe(first.rawToken);
    expect(rotated.portalUrl).toContain('unit=1A');
  });
});

