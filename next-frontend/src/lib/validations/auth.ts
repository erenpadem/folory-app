import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır'),
})

export const RegisterSchema = z
  .object({
    name: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
    email: z.string().email('Geçerli bir e-posta adresi girin'),
    password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  })

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
})

export const ForgotEmailSchema = z.object({
  phone: z.string().min(10, 'Geçerli bir telefon numarası girin'),
})

export const VerifyPhoneSchema = z.object({
  code: z.string().length(6, 'Doğrulama kodu 6 haneli olmalıdır'),
})

export const VerifyEmailSchema = z.object({
  code: z.string().length(6, 'Doğrulama kodu 6 haneli olmalıdır'),
})

// Ortak Verify Schema (Phone ve Email için genel yapı)
export const VerifySchema = z.object({
  code: z.string().length(6, 'Doğrulama kodu 6 haneli olmalıdır'),
})

export type LoginType = z.infer<typeof LoginSchema>
export type RegisterType = z.infer<typeof RegisterSchema>
export type ForgotPasswordType = z.infer<typeof ForgotPasswordSchema>
export type ForgotEmailType = z.infer<typeof ForgotEmailSchema>
export type VerifyPhoneType = z.infer<typeof VerifyPhoneSchema>
export type VerifyEmailType = z.infer<typeof VerifyEmailSchema>
export type VerifyType = z.infer<typeof VerifySchema>