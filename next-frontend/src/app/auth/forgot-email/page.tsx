'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ForgotEmailSchema, ForgotEmailType } from '@/lib/validations/auth'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import MeshBackground from '@/components/Styling/MeshBackground'

export default function ForgotEmailPage() {
  const router = useRouter()
  const form = useForm<ForgotEmailType>({
    resolver: zodResolver(ForgotEmailSchema),
    defaultValues: {
      phone: '',
    },
  })

  const onSubmit = (data: ForgotEmailType) => {
    console.log(data)
    // Handle forgot email logic here
    router.push('/auth/verify-phone?type=email-recovery')
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6 relative">
       <MeshBackground/>
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">E-postamı Unuttum</h1>
        <p className="text-muted-foreground">
          E-posta adresinizi öğrenmek için telefon numaranızı girin
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefon Numarası</FormLabel>
                <FormControl>
                  <Input placeholder="+90 555 123 45 67" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Doğrulama Kodu Gönder
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm">
        <Link href="/auth/login" className="font-medium text-primary hover:underline">
          Giriş sayfasına dön
        </Link>
      </div>
    </div>
  )
}