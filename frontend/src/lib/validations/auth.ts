import { z } from 'zod';

// Login Schema & Type
export const LoginSchema = z.object({
  email: z.string().min(1, 'E-posta alanı zorunludur').email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(1, 'Şifre alanı zorunludur').min(6, 'Şifre en az 6 karakter olmalıdır'),
  remember: z.boolean(),
});

export type LoginCredentials = z.infer<typeof LoginSchema>;

// Register Schema & Type
export const RegisterSchema = z
  .object({
    name: z.string().min(1, 'Ad alanı zorunludur').min(2, 'Ad en az 2 karakter olmalıdır'),
    email: z.string().min(1, 'E-posta alanı zorunludur').email('Geçerli bir e-posta adresi giriniz'),
    password: z.string().min(1, 'Şifre alanı zorunludur').min(6, 'Şifre en az 6 karakter olmalıdır'),
    password_confirmation: z.string().min(1, 'Şifre onayı zorunludur'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Şifre onayı eşleşmiyor',
    path: ['password_confirmation'],
  });

export type RegisterData = z.infer<typeof RegisterSchema>;
export type RegisterType = RegisterData;
export type LoginType = z.infer<typeof LoginSchema>;

// Forgot Password Schema & Type
export const ForgotPasswordSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
});

export type ForgotPasswordType = z.infer<typeof ForgotPasswordSchema>;

// Forgot Email Schema & Type
export const ForgotEmailSchema = z.object({
  phone: z.string().min(10, 'Geçerli bir telefon numarası girin'),
});

export type ForgotEmailType = z.infer<typeof ForgotEmailSchema>;

// Verification Schemas & Types
export const VerifyPhoneSchema = z.object({
  code: z.string().length(6, 'Doğrulama kodu 6 haneli olmalıdır'),
});

export const VerifyEmailSchema = z.object({
  code: z.string().length(6, 'Doğrulama kodu 6 haneli olmalıdır'),
});

// Ortak Verify Schema (Phone ve Email için genel yapı)
export const VerifySchema = z.object({
  code: z.string().length(6, 'Doğrulama kodu 6 haneli olmalıdır'),
});

export type VerifyPhoneType = z.infer<typeof VerifyPhoneSchema>;
export type VerifyEmailType = z.infer<typeof VerifyEmailSchema>;
export type VerifyType = z.infer<typeof VerifySchema>;