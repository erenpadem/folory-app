import Image from "next/image"
import { BetaBadge } from "@/components/brand/beta-badge"
import { BRAND_NAME } from "@/lib/brand"
import { cn } from "@/lib/utils"

type LogoWithBetaBadgeProps = {
  size?: number
  className?: string
}

export function LogoWithBetaBadge({ size = 32, className }: LogoWithBetaBadgeProps) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <Image
        src="/assets/logo.svg"
        width={size}
        height={size}
        alt=""
        aria-hidden
        priority
      />
      <BetaBadge className="absolute -right-2 -top-1.5 scale-[0.85]" />
    </span>
  )
}

type BrandMarkProps = {
  showLogo?: boolean
  className?: string
  logoSize?: number
}

export function BrandMark({
  showLogo = false,
  className,
  logoSize = 32,
}: BrandMarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {showLogo && <LogoWithBetaBadge size={logoSize} />}
      <span className="inline-flex items-center gap-1.5">
        {BRAND_NAME}
        <BetaBadge />
      </span>
    </span>
  )
}
