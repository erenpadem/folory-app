import { Badge } from "@/components/ui/badge"
import { IS_BETA } from "@/lib/env"
import { cn } from "@/lib/utils"

type BetaBadgeProps = {
  className?: string
}

export function BetaBadge({ className }: BetaBadgeProps) {
  if (!IS_BETA) return null

  return (
    <Badge
      variant="outline"
      className={cn(
        "h-4 px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wide",
        "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400",
        className
      )}
    >
      Beta
    </Badge>
  )
}
