class CacheManager {
  private cache = new Map<string, { data: unknown; expires: number }>();

  set(key: string, data: unknown, ttlSeconds = 300) {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttlSeconds * 1000
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }
}

export const cache = new CacheManager();

// Usage wrapper for cached queries
export async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl = 300
): Promise<T> {
  const cached = cache.get<T>(key);
  if (cached !== null) return cached;

  const data = await queryFn();
  cache.set(key, data, ttl);
  return data;
}

// Invalidate cache by prefix
export function invalidateCacheByPrefix(prefix: string) {
  // Note: This is a simplified implementation
  // In a real app, you'd want to track keys by prefix
  cache.clear();
}
