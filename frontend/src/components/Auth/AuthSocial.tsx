import { Button } from '@/components/ui/button'
import { Icons } from '../icons'
import { Separator } from "@/components/ui/separator"

export function AuthSocial() {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <Separator className="my-4" />
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-background px-2 text-muted-foreground">
          Veya şununla devam et
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        <Button variant="ghost" className="w-full">
          <Icons.google className="h-4 w-4 mr-2" />
          Google
        </Button>
        <Button variant="ghost" className="w-full">
          <Icons.apple className="h-4 w-4 mr-2" />
          Apple
        </Button>
      </div>
    </div>
  )
}