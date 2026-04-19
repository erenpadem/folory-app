/**
 * Canonical site URL for metadata, sitemap, and JSON-LD.
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://folory.com).
 */
export function getSiteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (explicit) {
    const t = explicit.replace(/\/$/, "")
    const withProto = t.startsWith("http") ? t : `https://${t}`
    try {
      return new URL(withProto)
    } catch {
      return new URL("http://localhost:3000")
    }
  }
  if (process.env.VERCEL_URL) {
    return new URL(`https://${process.env.VERCEL_URL}`)
  }
  return new URL("http://localhost:3000")
}

export function getApiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081").replace(
    /\/$/,
    ""
  )
}

/** Resolve cover/avatar paths from the API to an absolute URL for og:image. */
export function getAbsoluteMediaUrl(
  path: string | null | undefined,
  apiBase: string
): string | undefined {
  if (path == null || path === "") return undefined
  const p = String(path).trim()
  if (/^https?:\/\//i.test(p)) return p
  const base = apiBase.replace(/\/$/, "")
  const normalized = p.startsWith("/") ? p : `/${p}`
  return `${base}${normalized}`
}
