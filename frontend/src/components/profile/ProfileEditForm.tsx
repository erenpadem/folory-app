// components/profile/ProfileEditForm.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import axios from 'axios'
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import type { User } from '@/types/auth'

// Validation Schema
const profileFormSchema = z.object({
  name: z.string()
    .min(2, 'Ad en az 2 karakter olmalıdır')
    .max(50, 'Ad en fazla 50 karakter olabilir'),
  username: z.string()
    .min(3, 'Kullanıcı adı en az 3 karakter olmalıdır')
    .max(20, 'Kullanıcı adı en fazla 20 karakter olabilir')
    .regex(/^[a-z0-9_]+$/, 'Sadece küçük harf, sayı ve alt çizgi kullanabilirsiniz'),
  bio: z.string()
    .max(160, 'Biyografi en fazla 160 karakter olabilir')
    .optional(),
  email: z.string()
    .email('Geçerli bir e-posta adresi girin')
    .optional(),
})

export type ProfileFormValues = z.infer<typeof profileFormSchema>

interface ProfileEditFormProps {
  user: User
  onSave: (values: ProfileFormValues) => Promise<void>
  onCancel: () => void
}

export const ProfileEditForm = ({ user, onSave, onCancel }: ProfileEditFormProps) => {
  let base = user.username?.trim() || user.email.split('@')[0] || 'user'
  if (base.length < 3) {
    base = `u_${base}`
  }
  const defaultUsername = base.slice(0, 20)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name,
      username: defaultUsername,
      bio: user.bio || '',
      email: user.email
    },
    mode: 'onChange'
  })

  const { isSubmitting, isValid } = form.formState

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      await onSave(values)
      toast.success('Profil başarıyla güncellendi')
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.errors) {
        const errs = error.response.data.errors as Record<string, string[]>
        const keys = ['name', 'username', 'bio', 'email'] as const
        for (const key of keys) {
          const msg = errs[key]?.[0]
          if (msg) {
            form.setError(key, { message: msg })
          }
        }
        return
      }
      toast.error('Profil güncellenirken bir hata oluştu')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full mt-4 space-y-4">
        {/* Ad Soyad */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ad Soyad</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Adınız ve soyadınız" 
                  {...field} 
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Kullanıcı Adı */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kullanıcı Adı</FormLabel>
              <FormControl>
                <Input 
                  placeholder="benzersiz_kullanici_adi" 
                  {...field} 
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                Bu adres profilinizde görünecek: storyharbor.com/@{form.watch('username')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Biyografi */}
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Biyografi</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Kendinizden bahsedin..."
                  className="resize-none"
                  rows={4}
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                {160 - (form.watch('bio')?.length || 0)} karakter kaldı
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* E-posta (sadece okunabilir) */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-posta</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  disabled 
                  className="opacity-70 cursor-not-allowed"
                />
              </FormControl>
              <FormDescription>
                E-posta değiştirmek için profilinizde Ayarlar sekmesindeki &quot;E-posta değiştir&quot; bölümünü kullanın.
              </FormDescription>
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X className="mr-2 h-4 w-4" />
            İptal
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              'Değişiklikleri Kaydet'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}