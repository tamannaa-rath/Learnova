import { webcrypto } from 'node:crypto';
import '@testing-library/jest-dom/vitest';

if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = webcrypto;
}

