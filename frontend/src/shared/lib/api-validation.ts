type ApiErrorBody = {
  message?: string
  errors?: Record<string, string[]>
}

export function extractApiValidationMessage(error: unknown): string | null {
  const body = (error as { response?: { data?: ApiErrorBody } })?.response?.data
  if (!body) return null

  const fieldErrors = body.errors
  if (fieldErrors && typeof fieldErrors === 'object') {
    for (const messages of Object.values(fieldErrors)) {
      const first = messages?.[0]
      if (first) return first
    }
  }

  return body.message ?? null
}

export function extractApiFieldErrors(
  error: unknown
): Record<string, string> | null {
  const fieldErrors = (error as { response?: { data?: ApiErrorBody } })?.response
    ?.data?.errors
  if (!fieldErrors || typeof fieldErrors !== 'object') return null

  const mapped: Record<string, string> = {}
  for (const [field, messages] of Object.entries(fieldErrors)) {
    if (messages?.[0]) mapped[field] = messages[0]
  }
  return Object.keys(mapped).length > 0 ? mapped : null
}
