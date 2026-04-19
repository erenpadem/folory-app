import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Folory",
    short_name: "Folory",
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
