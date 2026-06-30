import { cache } from "react"
import type { Metadata } from "next"
import { getUserByUsername } from "@/services/user.service"
import { ProfileView } from "@/components/profile/ProfileView"
import { notFound } from "next/navigation"
import { getAbsoluteMediaUrl, getSiteUrl } from "@/lib/site"
import { BRAND_NAME } from "@/lib/brand"

const getCachedUserByUsername = cache(getUserByUsername)

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const { username } = await params
  const user = await getCachedUserByUsername(username)
  if (!user) {
    return { title: "Profil bulunamadı", robots: { index: false, follow: false } }
  }

  const site = getSiteUrl()
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081"
  const path = `/profile/${encodeURIComponent(username)}`
  const desc =
    user.bio?.trim() ||
    `${user.name} — ${BRAND_NAME}’da yazar ve okur profili.`
  const ogImage = getAbsoluteMediaUrl(user.avatar, apiBase)
  const title = `${user.name} (@${user.username ?? username})`

  return {
    title,
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      type: "profile",
      url: new URL(path, site).toString(),
      title,
      description: desc,
      locale: "tr_TR",
      siteName: BRAND_NAME,
      ...(ogImage
        ? {
            images: [
              { url: ogImage, width: 512, height: 512, alt: user.name },
            ],
          }
        : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description: desc,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  }
}

export default async function PublicProfile({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const user = await getCachedUserByUsername(username)
  
  if (!user) {
    return notFound()
  }

  return <ProfileView user={user} isOwnProfile={false} />
}