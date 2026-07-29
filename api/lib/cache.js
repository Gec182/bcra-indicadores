const store = new Map();

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutos

export function cacheGet(key) {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

export function cacheSet(key, value, ttlMs = DEFAULT_TTL_MS) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

/**
 * Envuelve una función async: si hay valor cacheado para `key` lo devuelve,
 * si no, ejecuta `fn`, cachea el resultado y lo devuelve.
 */
export async function withCache(key, ttlMs, fn) {
  const cached = cacheGet(key);
  if (cached !== undefined) return cached;
  const value = await fn();
  cacheSet(key, value, ttlMs);
  return value;
}
