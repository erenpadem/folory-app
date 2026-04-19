import { getSiteUrl } from "@/lib/site"

export function JsonLdSiteAndOrganization() {
  const site = getSiteUrl().origin
  const graph = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${site}/#organization`,
      name: "Folory",
      url: site,
      logo: {
        "@type": "ImageObject",
        url: `${site}/icon.svg`,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${site}/#website`,
      url: site,
      name: "Folory",
      description:
        "Folory ile kitap okuyun, yazın ve toplulukla paylaşın. Dijital okuma ve yaratıcı yazarlık platformu.",
      inLanguage: "tr-TR",
      publisher: { "@id": `${site}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${site}/explore?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ]

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  )
}

type BookJsonLdProps = {
  title: string
  description?: string | null
  url: string
  imageUrl?: string
  authorName?: string | null
}

export function JsonLdBook({
  title,
  description,
  url,
  imageUrl,
  authorName,
}: BookJsonLdProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: title,
    url,
    ...(description ? { description } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
    ...(authorName
      ? {
          author: {
            "@type": "Person",
            name: authorName,
          },
        }
      : {}),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
