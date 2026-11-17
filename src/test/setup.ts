import '@testing-library/jest-dom';

// Mock Web Crypto API for jsdom if needed
if (!globalThis.crypto) {
  const nodeCrypto = require('crypto');
  globalThis.crypto = {
    getRandomValues: (buffer: any) => nodeCrypto.randomFillSync(buffer),
    subtle: {
      digest: async (algorithm: string, data: any) => {
        const hash = nodeCrypto.createHash('sha256').update(Buffer.from(data)).digest();
        return hash.buffer.slice(hash.byteOffset, hash.byteOffset + hash.byteLength);
      },
    },
    randomUUID: () => nodeCrypto.randomUUID(),
  } as unknown as Crypto;
}

// Mock window.matchMedia
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
