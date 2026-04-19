import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "Folory ile iletişime geçin; destek, iş birliği ve geri bildirim için bize yazın.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "İletişim | Folory",
    description: "Folory destek ve iletişim bilgileri.",
    url: "/contact",
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
