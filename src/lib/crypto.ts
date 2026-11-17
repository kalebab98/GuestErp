// Cryptographic Utilities for GuestCare
// Token Generation, SHA-256 Hashing, and QR Code Encoding

import QRCode from 'qrcode';

/**
 * Generates a cryptographically secure random token (32 bytes = 64 hex characters)
 * Uses standard Web Crypto API (standard in all modern browsers and Node 18+)
 */
export function generateSecureToken(): string {
  const bytes = new Uint8Array(32);
  const cryptoObj = typeof window !== 'undefined' ? window.crypto : globalThis.crypto;

  if (cryptoObj && cryptoObj.getRandomValues) {
    cryptoObj.getRandomValues(bytes);
  } else {
    // Fallback pseudo-random for legacy edge test environments
    for (let i = 0; i < 32; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Computes the SHA-256 hash of a string using Web Crypto Subtle API.
 * Used to store only hashed tokens in the database.
 */
export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const cryptoObj = typeof window !== 'undefined' ? window.crypto : globalThis.crypto;

  if (cryptoObj && cryptoObj.subtle) {
    const hashBuffer = await cryptoObj.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  throw new Error('Cryptographic subtle digest is unavailable in this environment');
}

/**
 * Generates a data URL for a QR code targeting the Guest Portal URL
 */
export async function generateQRCodeDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    width: 300,
    margin: 2,
    color: {
      dark: '#0f172a', // Deep slate/navy
      light: '#ffffff',
    },
    errorCorrectionLevel: 'H',
  });
}
