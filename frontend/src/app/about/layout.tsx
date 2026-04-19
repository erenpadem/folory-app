import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "Folory kimdir? Yazarlar ve okurlar için dijital okuma ve yazarlık platformu hakkında bilgi.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Hakkımızda | Folory",
    description:
      "Folory, yazarlar ve okurlar için modern bir kitap ve hikaye platformudur.",
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
