/**
 * Laravel JsonResource collections nested in `{ data: ResourceCollection }`
 * often serialize as `{ data: { data: [...] } }`. Normalize to a plain array.
 */
export function unwrapResourceCollection<T = unknown>(raw: unknown): T[] {
  if (raw == null) return []
  if (Array.isArray(raw)) return raw as T[]

  if (typeof raw === 'object') {
    const outer = raw as Record<string, unknown>
    const first = outer.data

    if (Array.isArray(first)) return first as T[]

    if (first != null && typeof first === 'object' && !Array.isArray(first)) {
      const inner = first as Record<string, unknown>
      if (Array.isArray(inner.data)) return inner.data as T[]
    }
  }

  return []
}
