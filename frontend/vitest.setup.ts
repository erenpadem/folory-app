import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';

const storage: Record<string, string> = {};

const localStorageMock: Storage = {
  get length() {
    return Object.keys(storage).length;
  },
  clear: () => {
    Object.keys(storage).forEach((k) => delete storage[k]);
  },
  getItem: (key: string) => (key in storage ? storage[key] : null),
  setItem: (key: string, value: string) => {
    storage[key] = value;
  },
  removeItem: (key: string) => {
    delete storage[key];
  },
  key: (index: number) => Object.keys(storage)[index] ?? null,
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

afterEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});
