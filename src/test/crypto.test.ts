import { describe, it, expect } from 'vitest';
import { generateSecureToken, hashToken, generateQRCodeDataUrl } from '../lib/crypto';

describe('Cryptographic Utilities', () => {
  it('generates 32-byte (64 hex characters) secure random tokens', () => {
    const token1 = generateSecureToken();
    const token2 = generateSecureToken();

    expect(token1).toHaveLength(64);
    expect(token2).toHaveLength(64);
    expect(token1).toMatch(/^[0-9a-f]{64}$/);
    expect(token1).not.toBe(token2);
  });

  it('computes deterministic SHA-256 hashes', async () => {
    const token = 'a8f5b49320e8b2098d7a12b4e5f67890a8f5b49320e8b2098d7a12b4e5f67890';
    const hash1 = await hashToken(token);
    const hash2 = await hashToken(token);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
    expect(hash1).not.toBe(token);
  });

  it('generates valid QR code data URLs', async () => {
    const url = 'https://guestcare.example.com/portal?token=test1234';
    const dataUrl = await generateQRCodeDataUrl(url);

    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
  });
});
