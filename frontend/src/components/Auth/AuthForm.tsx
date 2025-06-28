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
import { useAuthStore } from '@/stores/auth.store'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type AuthFormType = 'login' | 'register' | 'forgot' | 'verify'
type AuthFormValues = LoginType | RegisterType | ForgotPasswordType | VerifyType

const formSchemas = {
  login: LoginSchema,
  register: RegisterSchema,
  forgot: ForgotPasswordSchema,
  verify: VerifySchema
}

const defaultValues: Record<AuthFormType, Partial<AuthFormValues>> = {
  login: { email: '', password: '' },
  register: { name: '', email: '', password: '', password_confirmation: '' },
  forgot: { email: '' },
  verify: { code: '' }
}

interface AuthFormProps {
  type: AuthFormType
  onSuccess?: () => void
  footer?: React.ReactNode
  redirectOnSuccess?: string
}

export function AuthForm({ 
  type, 
  onSuccess, 
  footer, 
  redirectOnSuccess 
}: AuthFormProps) {
  const router = useRouter()
  const { login, register, loading } = useAuthStore()
  
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(formSchemas[type]),
    defaultValues: defaultValues[type]
  })

  const handleSubmit = async (values: AuthFormValues) => {
    try {
      if (type === 'login') {
        await login(values as LoginType)
        toast.success('Giriş başarılı!')
      } 
      else if (type === 'register') {
        await register(values as RegisterType)
        toast.success('Kayıt başarılı! Giriş yapabilirsiniz')
      }
      // Handle other auth types if needed

      onSuccess?.()
      if (redirectOnSuccess) {
        router.push(redirectOnSuccess)
      }
    } catch (error: any) {
      toast.error(error?.message || 'Bir hata oluştu')
      form.setError('root', {
        type: 'manual',
        message: error?.response?.data?.message || 'Authentication failed'
      })
    }
  }

  const renderFormField = (name: keyof AuthFormValues, props?: any) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {name === 'name' ? 'Ad Soyad' :
             name === 'email' ? 'E-posta' :
             name === 'password' ? 'Şifre' :
             name === 'password_confirmation' ? 'Şifre Tekrar' :
             'Doğrulama Kodu'}
          </FormLabel>
          <FormControl>
            {name === 'code' ? (
              <AuthVerify {...field} disabled={loading} />
            ) : (
              <Input
                type={name.includes('password') ? 'password' : 'text'}
                placeholder={
                  name === 'email' ? 'email@example.com' :
                  name.includes('password') ? '••••••••' :
                  name === 'name' ? 'Adınız ve soyadınız' : ''
                }
                {...field}
                disabled={loading}
                {...props}
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {type === 'register' && renderFormField('name')}
        {(type === 'login' || type === 'register' || type === 'forgot') && renderFormField('email')}
        {(type === 'login' || type === 'register') && renderFormField('password')}
        {type === 'register' && renderFormField('password_confirmation')}
        {type === 'verify' && renderFormField('code')}

        {form.formState.errors.root && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}

        <Button 
          type="submit" 
          className="w-full" 
          disabled={loading}
          aria-disabled={loading}
        >
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