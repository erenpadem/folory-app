import Image from "next/image"
import { BetaBadge } from "@/components/brand/beta-badge"
import { BRAND_NAME } from "@/lib/brand"
import { cn } from "@/lib/utils"

type BrandLogoProps = {
  size?: number
  className?: string
}

export function BrandLogo({ size = 32, className }: BrandLogoProps) {
  return (
    <Image
      src="/assets/logo.svg"
      width={size}
      height={size}
      alt=""
      aria-hidden
      priority
      className={cn("shrink-0", className)}
    />
  )
}

/** @deprecated Use BrandLogo — kept for existing imports */
export const LogoWithBetaBadge = BrandLogo

type BrandMarkProps = {
  showLogo?: boolean
  /** When false, only brand name (no Beta badge). Default true. */
  showBeta?: boolean
  className?: string
  logoSize?: number
}

export function BrandMark({
  showLogo = false,
  showBeta = true,
  className,
  logoSize = 32,
}: BrandMarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {showLogo && <BrandLogo size={logoSize} />}
      <span className="inline-flex items-center gap-1.5">
        {BRAND_NAME}
        {showBeta && <BetaBadge />}
      </span>
    </span>
  )
}
