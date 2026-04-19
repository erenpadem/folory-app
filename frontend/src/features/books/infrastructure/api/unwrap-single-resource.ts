/**
 * Laravel JsonResource often returns `{ data: { id, ... } }` while some endpoints
 * return the resource flat. Unwrap so callers always get the inner object with `id`.
 */
export function unwrapSingleResource<T extends Record<string, unknown> = Record<string, unknown>>(
  raw: unknown,
  resourceLabel = 'Kaynak'
): T {
  if (raw == null || typeof raw !== 'object') {
    throw new Error(`${resourceLabel}: boş yanıt`);
  }
  const o = raw as Record<string, unknown>;
  if ('data' in o && o.data !== null && typeof o.data === 'object') {
    const inner = o.data as Record<string, unknown>;
    if (!Array.isArray(inner) && 'id' in inner) {
      return inner as T;
    }
  }
  if ('id' in o) return o as T;
  throw new Error(`${resourceLabel}: beklenen id alanı yok`);
}
