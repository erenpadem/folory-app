import { useState } from "react"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CommentItem } from "./CommentItem"
import { Story } from "@/types/story"

interface StoryCommentsTabProps {
  story: Story
}

export function StoryCommentsTab({ story }: StoryCommentsTabProps) {
  const [comment, setComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return

    // In a real app, you would handle this with an API call
    setComment('')
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Yorumlar ({story.comments.length})</h3>

      <form onSubmit={handleCommentSubmit} className="space-y-4">
        <div className="flex gap-3">
          <Avatar>
            <AvatarImage src="/placeholder-avatar-new.jpg" />
            <AvatarFallback>K</AvatarFallback>
          </Avatar>
          <Input
            placeholder="Yorumunuzu yazın..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={!comment.trim()}>
            Gönder
          </Button>
        </div>
      </form>

      <Separator />

      <div className="space-y-6">
        {story.comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            depth={0}
            replyingTo={replyingTo}
            onReplyToggle={setReplyingTo}
            replyContent={replyContent}
            onReplyContentChange={setReplyContent}
            onReplySubmit={(e) => {
              e.preventDefault()
              if (!replyContent.trim()) return
              // Handle reply submission
              setReplyingTo(null)
              setReplyContent('')
            }}
          />
        ))}
      </div>
    </div>
  )
}