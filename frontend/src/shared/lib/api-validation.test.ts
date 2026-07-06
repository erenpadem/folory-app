import { describe, expect, it } from 'vitest'
import {
  extractApiFieldErrors,
  extractApiValidationMessage,
} from './api-validation'

describe('extractApiValidationMessage', () => {
  it('returns first field error message', () => {
    const message = extractApiValidationMessage({
      response: {
        data: {
          message: 'Doğrulama hatası.',
          errors: {
            email: ['Bu e-posta adresi zaten kullanılıyor.'],
          },
        },
      },
    })
    expect(message).toBe('Bu e-posta adresi zaten kullanılıyor.')
  })
})

describe('extractApiFieldErrors', () => {
  it('maps Laravel errors to field keys', () => {
    const fields = extractApiFieldErrors({
      response: {
        data: {
          errors: {
            password: ['Şifre onayı eşleşmiyor.'],
          },
        },
      },
    })
    expect(fields).toEqual({ password: 'Şifre onayı eşleşmiyor.' })
  })
})
