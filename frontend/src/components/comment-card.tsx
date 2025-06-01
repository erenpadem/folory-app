import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'

export function CommentCard({
  comment,
  onDelete
}: {
  comment: any
  onDelete?: () => void
}) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">{comment.storyTitle}</h4>
          <p className="text-muted-foreground text-sm mt-1">
            {new Date(comment.createdAt).toLocaleDateString('tr-TR')}
          </p>
        </div>
        {onDelete && (
          <Button variant="ghost" size="sm" onClick={onDelete}>
            <Icons.trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <p className="mt-2">{comment.content}</p>
    </div>
  )
}