'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { AuthVerify } from './AuthVerify'
import { 
  ForgotPasswordSchema, 
  LoginSchema, 
  RegisterSchema, 
  VerifySchema,
  type LoginType,
  type RegisterType,
  type ForgotPasswordType,
  type VerifyType
} from '@/lib/validations/auth'

type AuthFormProps = {
  type: 'login' | 'register' | 'forgot' | 'verify'
  onSubmit: (data: LoginType | RegisterType | ForgotPasswordType | VerifyType) => void
  footer?: React.ReactNode
  loading?: boolean  // yeni eklendi
}

export function AuthForm({ type, onSubmit, footer, loading = false }: AuthFormProps) {
  const form = useForm<LoginType | RegisterType | ForgotPasswordType | VerifyType>({
    resolver: zodResolver(
      type === 'login' ? LoginSchema :
      type === 'register' ? RegisterSchema :
      type === 'forgot' ? ForgotPasswordSchema :
      VerifySchema
    ),
    defaultValues: {
      ...(type === 'login' && { email: '', password: '' }),
      ...(type === 'register' && { name: '', email: '', password: '', password_confirmation: '' }),
      ...(type === 'forgot' && { email: '' }),
      ...(type === 'verify' && { code: '' }),
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {type === 'register' && (
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ad Soyad</FormLabel>
                <FormControl>
                  <Input placeholder="Adınız ve soyadınız" {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {(type === 'login' || type === 'register' || type === 'forgot') && (
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-posta</FormLabel>
                <FormControl>
                  <Input placeholder="email@example.com" {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {(type === 'login' || type === 'register') && (
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Şifre</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {type === 'register' && (
          <FormField
            control={form.control}
            name="password_confirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Şifre Tekrar</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {type === 'verify' && (
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Doğrulama Kodu</FormLabel>
                <FormControl>
                  <AuthVerify {...field} disabled={loading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <span>Yükleniyor...</span>
          ) : (
            <>
              {type === 'login' && 'Giriş Yap'}
              {type === 'register' && 'Kayıt Ol'}
              {type === 'forgot' && 'Şifre Sıfırlama Bağlantısı Gönder'}
              {type === 'verify' && 'Doğrula'}
            </>
          )}
        </Button>

        {footer && footer}
      </form>
    </Form>
  )
}
