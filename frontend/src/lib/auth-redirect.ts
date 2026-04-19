/**
 * Build login URL with optional return path and tab (login | register).
 */
export function buildLoginUrl(options?: {
  returnTo?: string
  tab?: 'login' | 'register'
}): string {
  const params = new URLSearchParams()
  if (options?.returnTo) {
    params.set('returnTo', options.returnTo)
  }
  if (options?.tab === 'register') {
    params.set('tab', 'register')
  }
  const q = params.toString()
  return q ? `/auth/login?${q}` : '/auth/login'
}

export function getCurrentReturnTo(): string {
  if (typeof window === 'undefined') return '/'
  return window.location.pathname + window.location.search
}
