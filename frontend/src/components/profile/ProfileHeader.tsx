'use client'

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Calendar, Edit } from 'lucide-react'
import { useState } from 'react'
import { ProfileEditForm } from './ProfileEditForm'

export const ProfileHeader = ({ 
  user, 
  isOwnProfile 
}: {
  user: User
  isOwnProfile: boolean
}) => {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <>
      <div className="h-48 w-full bg-muted relative">
        <img 
          src={user.coverImage} 
          alt="Cover" 
          className="w-full h-full object-cover"
        />
        {isOwnProfile && (
          <Button 
            variant="outline" 
            className="absolute top-4 right-4"
            onClick={() => console.log('Change cover')}
          >
            <Edit className="mr-2 h-4 w-4" />
            Kapak Resmini Değiştir
          </Button>
        )}
      </div>

      <div className="container relative">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/4 flex flex-col items-center md:items-start -mt-16">
            <Avatar className="h-32 w-32 border-4 border-background">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            
            {isEditing ? (
              <ProfileEditForm 
                user={user}
                onSave={() => setIsEditing(false)}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <div className="mt-4 text-center md:text-left">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-muted-foreground">@{user.username}</p>
                <p className="mt-2">{user.bio}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  <Calendar className="inline mr-1 h-4 w-4" />
                  {new Date(user.joinDate).toLocaleDateString('tr-TR')} tarihinden beri üye
                </p>
                {isOwnProfile && (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Profili Düzenle
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}