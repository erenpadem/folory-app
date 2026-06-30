import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "Fo-lory ile iletişime geçin; destek, iş birliği ve geri bildirim için bize yazın.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "İletişim | Fo-lory",
    description: "Fo-lory destek ve iletişim bilgileri.",
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
