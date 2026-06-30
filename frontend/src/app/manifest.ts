import type { MetadataRoute } from "next"

import { BRAND_NAME } from "@/lib/brand"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND_NAME,
    short_name: BRAND_NAME,
    description:
      "Kitap okuma ve yazma platformu — keşfet, oku, yaz ve paylaş.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4C6BFF",
    lang: "tr",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  }
}
