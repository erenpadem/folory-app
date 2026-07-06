'use client'

import { useRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { useForm, type Resolver } from 'react-hook-form'
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
import { useAuth } from '@/features/auth'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  extractApiFieldErrors,
  extractApiValidationMessage,
} from '@/shared/lib/api-validation'

type AuthFormType = 'login' | 'register' | 'forgot' | 'verify'
type AuthFormValues = LoginType | RegisterType | ForgotPasswordType | VerifyType

const formSchemas = {
  login: LoginSchema,
  register: RegisterSchema,
  forgot: ForgotPasswordSchema,
  verify: VerifySchema
}

const defaultValues: Record<AuthFormType, Partial<AuthFormValues>> = {
  login: { email: '', password: '', remember: false },
  register: { name: '', email: '', password: '', password_confirmation: '' },
  forgot: { email: '' },
  verify: { code: '' }
}

interface AuthFormProps {
  type: AuthFormType
  onSubmit?: (values: AuthFormValues) => Promise<void> | void
  onSuccess?: () => void
  footer?: React.ReactNode
  redirectOnSuccess?: string
  loading?: boolean
}

export function AuthForm({ 
  type, 
  onSubmit,
  onSuccess, 
  footer, 
  redirectOnSuccess,
  loading: externalLoading
}: AuthFormProps) {
  const router = useRouter()
  const { login, register, loading: authLoading } = useAuth()
  const loading = externalLoading ?? authLoading
  const [passwordVisible, setPasswordVisible] = useState<Record<string, boolean>>({})
  const submitInFlight = useRef(false)

  const togglePasswordField = (fieldKey: string) => {
    setPasswordVisible((prev) => ({ ...prev, [fieldKey]: !prev[fieldKey] }))
  }

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(formSchemas[type] as never) as Resolver<AuthFormValues>,
    defaultValues: defaultValues[type],
    shouldUnregister: false,
  })

  const resolveLoginValues = (values: AuthFormValues): LoginType => ({
    email: (values as LoginType).email,
    password: (values as LoginType).password,
    remember: form.getValues('remember') === true,
  })

  const handleSubmit = async (values: AuthFormValues) => {
    if (submitInFlight.current || loading) return
    submitInFlight.current = true

    try {
      const loginValues = type === 'login' ? resolveLoginValues(values) : null

      // If onSubmit prop is provided, use it
      if (onSubmit) {
        await onSubmit(loginValues ?? values)
        onSuccess?.()
        if (redirectOnSuccess) {
          router.push(redirectOnSuccess)
        }
        return
      }

      // Otherwise use default auth methods
      if (type === 'login') {
        await login(loginValues!)
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
    } catch (error: unknown) {
      const fieldErrors = extractApiFieldErrors(error)
      if (fieldErrors) {
        for (const [field, message] of Object.entries(fieldErrors)) {
          if (field in defaultValues[type]) {
            form.setError(field as keyof AuthFormValues, { type: 'server', message })
          }
        }
      }

      const errorMessage =
        extractApiValidationMessage(error) ||
        (error as { message?: string })?.message ||
        'Bir hata oluştu'
      toast.error(errorMessage)
      form.setError('root', {
        type: 'manual',
        message: errorMessage
      })
    } finally {
      submitInFlight.current = false
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
          {name === 'code' ? (
            <FormControl>
              <AuthVerify {...field} disabled={loading} />
            </FormControl>
          ) : name === 'password' || name === 'password_confirmation' ? (
            // Keep the relative wrapper OUTSIDE FormControl so the FormControl's
            // generated id/aria attributes land on the <input> itself (not the
            // wrapper div). This keeps the input correctly associated with its
            // FormLabel for accessibility and label-based queries.
            <div className="relative">
              <FormControl>
                <Input
                  type={passwordVisible[name] ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pr-10"
                  {...field}
                  disabled={loading}
                  {...props}
                />
              </FormControl>
              <button
                type="button"
                onClick={() => togglePasswordField(name)}
                disabled={loading}
                className={cn(
                  'absolute right-0 top-0 flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors',
                  'hover:bg-muted hover:text-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                  'disabled:pointer-events-none disabled:opacity-50'
                )}
                aria-label={passwordVisible[name] ? 'Şifreyi gizle' : 'Şifreyi göster'}
                aria-pressed={passwordVisible[name]}
              >
                {passwordVisible[name] ? (
                  <EyeOff className="h-4 w-4" aria-hidden />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden />
                )}
              </button>
            </div>
          ) : (
            <FormControl>
              <Input
                type="text"
                placeholder={
                  name === 'email' ? 'email@example.com' :
                  name === 'name' ? 'Adınız ve soyadınız' : ''
                }
                {...field}
                disabled={loading}
                {...props}
              />
            </FormControl>
          )}
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
        {type === 'login' && (
          <FormField
            control={form.control}
            name="remember"
            render={({ field }) => (
              <FormItem>
                <label className="flex cursor-pointer select-none items-center gap-3">
                  <Checkbox
                    checked={field.value === true}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                    onBlur={field.onBlur}
                    disabled={loading}
                    aria-label="Beni hatırla"
                  />
                  <span className="text-sm font-normal leading-none">Beni hatırla</span>
                </label>
              </FormItem>
            )}
          />
        )}
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