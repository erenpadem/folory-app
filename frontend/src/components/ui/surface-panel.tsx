'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const variants = {
  default:
    'rounded-xl border border-border/45 bg-muted/55 p-5 shadow-sm md:p-6 dark:border-border/55 dark:bg-muted/35',
  /** Daha düz: iç içe satırlar veya ikincil bloklar */
  inset:
    'rounded-lg border border-border/35 bg-background/55 p-4 dark:border-border/40 dark:bg-background/20',
  /** Sadece çerçeve, çok hafif */
  flat: 'rounded-xl border border-dashed border-border/45 bg-muted/25 p-5 md:p-6 dark:bg-muted/20',
} as const

export type SurfacePanelVariant = keyof typeof variants

/**
 * Sayfa / sekme içi içerik blokları — arka plandan hafif ayrışır (light & dark).
 */
export function SurfacePanel({
  className,
  children,
  variant = 'default',
}: {
  className?: string
  children: ReactNode
  variant?: SurfacePanelVariant
}) {
  return (
    <div className={cn(variants[variant], className)}>{children}</div>
  )
}
