/** In-memory TTL cache stored on globalThis so it survives hot-reloads in dev. */

interface CacheEntry { data: unknown; expires: number }

const g = globalThis as unknown as { __appCache?: Map<string, CacheEntry> };
if (!g.__appCache) g.__appCache = new Map();
const store = g.__appCache;

export function cached<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const entry = store.get(key);
  if (entry && entry.expires > now) return Promise.resolve(entry.data as T);
  return fn().then((data) => {
    store.set(key, { data, expires: now + ttlMs });
    return data;
  });
}

export function invalidateCache(prefix?: string) {
  if (!prefix) { store.clear(); return; }
  for (const key of store.keys()) if (key.startsWith(prefix)) store.delete(key);
}
