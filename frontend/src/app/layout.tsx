// app/layout.tsx
import type { Metadata, Viewport } from "next"
import { Suspense } from "react"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import { Providers } from "./providers"
import { JsonLdSiteAndOrganization } from "@/components/seo/json-ld"
import { getSiteUrl } from "@/lib/site"
import { BRAND_NAME } from "@/lib/brand"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const site = getSiteUrl()
const siteOrigin = site.origin

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  metadataBase: site,
  title: {
    default: `${BRAND_NAME} — Kitap okuma ve yazma platformu`,
    template: `%s | ${BRAND_NAME}`,
  },
  description:
    `${BRAND_NAME} ile kitaplarınızı okuyun, yazın ve paylaşın. Keşfet, okuma deneyimi ve topluluk — dijital okuma ve yaratıcı yazarlık.`,
  applicationName: BRAND_NAME,
  keywords: [
    BRAND_NAME,
    "Fo-lory",
    "fo-lory",
    "kitap okuma",
    "online kitap",
    "dijital kitap",
    "yazarlık",
    "hikaye",
    "roman",
    "Türkçe kitap",
    "okuma uygulaması",
  ],
  authors: [{ name: BRAND_NAME, url: siteOrigin }],
  creator: BRAND_NAME,
  publisher: BRAND_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: siteOrigin,
    siteName: BRAND_NAME,
    title: `${BRAND_NAME} — Kitap okuma ve yazma platformu`,
    description:
      `${BRAND_NAME} ile kitaplarınızı okuyun, yazın ve paylaşın. Keşfet ve toplulukla dijital okuma deneyimi.`,
    images: [
      {
        url: "/icon.svg",
        width: 512,
        height: 512,
        alt: BRAND_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND_NAME} — Kitap okuma ve yazma platformu`,
    description:
      `${BRAND_NAME} ile kitaplarınızı okuyun, yazın ve paylaşın.`,
    images: ["/icon.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
    languages: {
      "tr-TR": "/",
    },
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? {
        google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
      }
    : undefined,
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#4C6BFF" },
    { media: "(prefers-color-scheme: dark)", color: "#110f19" },
  ],
  colorScheme: "dark light",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased px-8`}
        suppressHydrationWarning
      >
        <JsonLdSiteAndOrganization />
        <Providers>
          <div className="max-w-5xl w-full mx-auto py-10 flex flex-col min-h-screen">
            <Suspense fallback={<div className="h-10 shrink-0" aria-hidden />}>
              <Navbar />
            </Suspense>
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}