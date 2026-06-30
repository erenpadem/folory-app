import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Keşfet",
  description:
    "Yeni kitapları keşfedin; tür, popülerlik ve güncelliğe göre filtreleyin. Fo-lory’da okumaya başlayın.",
  alternates: { canonical: "/explore" },
  openGraph: {
    title: "Keşfet | Fo-lory",
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
