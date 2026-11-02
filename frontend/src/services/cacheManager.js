/**
 * Offline-First Client Cache Manager
 * In-memory LRU + LocalStorage backing with TTL expiration for tariff & trade data.
 */

class CacheManager {
  constructor(defaultTTLMs = 1000 * 60 * 30) {
    this.memoryCache = new Map();
    this.defaultTTLMs = defaultTTLMs;
  }

  set(key, value, ttlMs = this.defaultTTLMs) {
    const entry = {
      value,
      expiresAt: Date.now() + ttlMs
    };
    this.memoryCache.set(key, entry);
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(`exportease_cache_${key}`, JSON.stringify(entry));
      }
    } catch (e) {
      console.warn('LocalStorage cache write error:', e);
    }
  }

  get(key) {
    const memEntry = this.memoryCache.get(key);
    if (memEntry) {
      if (Date.now() < memEntry.expiresAt) {
        return memEntry.value;
      }
      this.memoryCache.delete(key);
    }

    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(`exportease_cache_${key}`);
        if (item) {
          const entry = JSON.parse(item);
          if (Date.now() < entry.expiresAt) {
            this.memoryCache.set(key, entry);
            return entry.value;
          }
          window.localStorage.removeItem(`exportease_cache_${key}`);
        }
      }
    } catch (e) {
      console.warn('LocalStorage cache read error:', e);
    }

    return null;
  }

  clear(prefix = '') {
    this.memoryCache.clear();
    try {
      if (typeof window !== 'undefined') {
        Object.keys(window.localStorage)
          .filter(k => k.startsWith(`exportease_cache_${prefix}`))
          .forEach(k => window.localStorage.removeItem(k));
      }
    } catch (e) {
      console.warn('LocalStorage clear error:', e);
    }
  }
}

export const cacheManager = new CacheManager();
export default cacheManager;
