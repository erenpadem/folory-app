/** Resolve API-relative avatar/cover paths to absolute URLs for <img>. */
export function resolveMediaUrl(path: string | null | undefined): string | undefined {
  if (path == null || path === '') return undefined
  const p = String(path).trim()
  if (/^https?:\/\//i.test(p) || p.startsWith('data:')) return p
  const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081').replace(/\/$/, '')
  const normalized = p.startsWith('/') ? p : `/${p}`
  return `${base}${normalized}`
}
