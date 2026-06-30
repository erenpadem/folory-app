import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "Fo-lory kimdir? Yazarlar ve okurlar için dijital okuma ve yazarlık platformu hakkında bilgi.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Hakkımızda | Fo-lory",
    description:
      "Fo-lory, yazarlar ve okurlar için modern bir kitap ve hikaye platformudur.",
    url: "/about",
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
