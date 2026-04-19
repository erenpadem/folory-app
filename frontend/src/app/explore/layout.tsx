import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Keşfet",
  description:
    "Yeni kitapları keşfedin; tür, popülerlik ve güncelliğe göre filtreleyin. Folory’da okumaya başlayın.",
  alternates: { canonical: "/explore" },
  openGraph: {
    title: "Keşfet | Folory",
    description:
      "Yeni kitapları keşfedin; tür, popülerlik ve güncelliğe göre filtreleyin.",
    url: "/explore",
  },
}

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
