import type { Metadata } from "next"
import { JsonLdBook } from "@/components/seo/json-ld"
import { getBookMetaForSeo } from "@/lib/server/book-meta"
import { getAbsoluteMediaUrl, getSiteUrl } from "@/lib/site"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const book = await getBookMetaForSeo(slug)
  const site = getSiteUrl()
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081"

  if (!book) {
    return {
      title: "Kitap bulunamadı",
      robots: { index: false, follow: false },
    }
  }

  const isIndexable = Boolean(book.is_published) && !book.is_draft
  const desc =
    book.short_description?.trim() ||
    `${book.title} — Folory’da okuyun.`
  const cover = getAbsoluteMediaUrl(book.cover, apiBase)
  const path = `/book/${slug}`
  const url = new URL(path, site).toString()
  const defaultOg = new URL("/icon.svg", site).toString()

  return {
    title: book.title,
    description: desc,
    robots: isIndexable
      ? { index: true, follow: true }
      : { index: false, follow: false },
    alternates: { canonical: path },
    openGraph: {
      type: "book",
      url,
      title: book.title,
      description: desc,
      locale: "tr_TR",
      siteName: "Folory",
      images: cover
        ? [{ url: cover, width: 1200, height: 630, alt: book.title }]
        : [{ url: defaultOg, width: 512, height: 512, alt: "Folory" }],
    },
    twitter: {
      card: cover ? "summary_large_image" : "summary",
      title: book.title,
      description: desc,
      images: cover ? [cover] : [defaultOg],
    },
  }
}

export default async function BookSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const book = await getBookMetaForSeo(slug)
  const site = getSiteUrl()
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081"
  const path = `/book/${slug}`
  const url = new URL(path, site).toString()
  const cover = book ? getAbsoluteMediaUrl(book.cover, apiBase) : undefined
  const showBookLd =
    Boolean(book?.is_published) && book && !book.is_draft

  return (
    <>
      {showBookLd && book ? (
        <JsonLdBook
          title={book.title}
          description={book.short_description}
          url={url}
          imageUrl={cover}
          authorName={book.author?.name ?? null}
        />
      ) : null}
      {children}
    </>
  )
}
