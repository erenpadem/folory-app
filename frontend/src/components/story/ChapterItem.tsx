import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { Chapter } from "@/types/story"

interface ChapterItemProps {
  chapter: Chapter
}

export function ChapterItem({ chapter }: ChapterItemProps) {
  return (
    <div
      className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
        chapter.status === 'read' 
          ? 'bg-primary/5 dark:bg-primary/10 border-primary/10 hover:bg-primary/10 dark:hover:bg-primary/20' 
          : chapter.status === 'in-progress' 
            ? 'bg-secondary/5 dark:bg-secondary/10 border-secondary/10 hover:bg-secondary/10 dark:hover:bg-secondary/20' 
            : 'bg-muted/20 dark:bg-muted/30 border-border hover:bg-muted/30 dark:hover:bg-muted/40'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Durum göstergesi */}
        <div className={`w-7 h-7 flex items-center justify-center rounded-full ${
          chapter.status === 'read' 
            ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground' 
            : chapter.status === 'in-progress' 
              ? 'bg-secondary/10 dark:bg-secondary/20 text-secondary dark:text-secondary-foreground' 
              : 'bg-muted text-muted-foreground'
        }`}>
          {chapter.status === 'read' ? (
            <Check className="h-4 w-4" />
          ) : chapter.status === 'in-progress' ? (
            <span className="text-sm font-medium">%</span>
          ) : (
            <span className="text-sm font-medium">{chapter.number}</span>
          )}
        </div>

        {/* Bölüm bilgileri */}
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{chapter.title}</p>
          <div className="flex gap-3 text-sm text-muted-foreground">
            <span>Yayınlanma: {chapter.publishedDate}</span>
            <span>•</span>
            <span>~{Math.round(chapter.wordCount / 200)} dakika</span>
          </div>
        </div>
      </div>

      {/* Okuma butonu */}
      <Button 
        variant={chapter.status === 'read' ? 'outline' : 'default'}
        size="sm"
        className={
          chapter.status === 'read' 
            ? 'border-primary/30 text-primary hover:bg-primary/5 dark:hover:bg-primary/20' 
            : chapter.status === 'in-progress' 
              ? 'bg-secondary hover:bg-secondary/90' 
              : ''
        }
      >
        {chapter.status === 'read' ? 'Tekrar Oku' : 'Oku'}
      </Button>
    </div>
  )
}