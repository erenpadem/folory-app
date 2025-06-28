import { getUserByUsername } from '@/services/user.service'
import { ProfileView } from '@/components/profile/ProfileView'
import { notFound } from 'next/navigation'

export default async function PublicProfile({
  params,
}: {
  params: { username: string }
}) {
  const user = await getUserByUsername(params.username)
  
  if (!user) {
    return notFound()
  }

  return <ProfileView user={user} isOwnProfile={false} />
}