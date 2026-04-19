import type { MetadataRoute } from "next"
import { getSiteUrl } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl().origin
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard/",
        "/settings",
        "/notifications",
        "/auth/",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  }
}
