import { describe, expect, it, beforeEach } from 'vitest'
import { clearAuthToken, getAuthToken, setAuthToken } from './auth-token'

describe('auth-token', () => {
  beforeEach(() => {
    clearAuthToken()
  })

  it('stores persistent token in localStorage when remember is true', () => {
    setAuthToken('abc', true)
    expect(localStorage.getItem('auth_token')).toBe('abc')
    expect(sessionStorage.getItem('auth_token')).toBeNull()
    expect(getAuthToken()).toBe('abc')
  })

  it('stores session token in sessionStorage when remember is false', () => {
    setAuthToken('abc', false)
    expect(sessionStorage.getItem('auth_token')).toBe('abc')
    expect(localStorage.getItem('auth_token')).toBeNull()
    expect(getAuthToken()).toBe('abc')
  })
})
