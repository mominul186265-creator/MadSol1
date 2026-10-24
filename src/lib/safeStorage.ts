// Safe storage wrapper for browsers, PWAs, and Android WebViews (Web2apk, Cordova, Capacitor)
// Prevents DOMException: SecurityError when DOM Storage is disabled or restricted in Android WebViews

const memoryFallback: Record<string, string> = {};

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = window.localStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch {
      // WebView DOM Storage disabled or origin is null
    }
    return memoryFallback[key] ?? null;
  },

  setItem(key: string, value: string): void {
    memoryFallback[key] = value;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch {
      // Silently fall back to in-memory store
    }
  },

  removeItem(key: string): void {
    delete memoryFallback[key];
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Silently ignore
    }
  },

  clear(): void {
    Object.keys(memoryFallback).forEach((k) => delete memoryFallback[k]);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
    } catch {
      // Silently ignore
    }
  },

  isAvailable(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      const testKey = '__storage_probe__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  },
};
