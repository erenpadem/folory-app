// components/empty-state.tsx
import { BookOpen, PenSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
      <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">Henüz kitap yok</h3>
      <p className="text-muted-foreground mb-4 text-center max-w-md">
        Yeni bir kitap oluşturarak yazmaya başlayabilirsin
      </p>
      <Button asChild>
        <Link href="/dashboard/books/new" className="gap-2">
          <PenSquare className="h-4 w-4" />
          Yeni Kitap Oluştur
        </Link>
      </Button>
    </div>
  )
}