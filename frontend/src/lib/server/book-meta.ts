import { cache } from "react"

const getApiUrl = () =>
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081").replace(/\/$/, "")

export type BookMetaPayload = {
  title: string
  slug?: string
  short_description?: string | null
  cover?: string | null
  is_published?: boolean
  is_draft?: boolean
  author?: { name?: string } | null
}

export const getBookMetaForSeo = cache(
  async (slug: string): Promise<BookMetaPayload | null> => {
    const api = getApiUrl()
    try {
      const res = await fetch(
        `${api}/api/books/${encodeURIComponent(slug)}`,
        {
          next: { revalidate: 300 },
          headers: { Accept: "application/json" },
        }
      )
      if (!res.ok) return null
      const json = (await res.json()) as {
        success?: boolean
        data?: BookMetaPayload
      }
      if (!json?.success || !json?.data) return null
      return json.data
    } catch {
      return null
    }
  }
)
