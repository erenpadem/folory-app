// components/story/CommentItem.tsx
'use client'

import { useState } from "react"
import { ChevronDown, ChevronUp, Heart, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useStoryEditorStore } from "@/stores/story.store"

interface CommentItemProps {
  comment: {
    id: string
    user: string
    avatar: string
    text: string
    date: string
    likes: number
    replies?: any[]
    isExpanded?: boolean
  }
  depth: number
}

export function CommentItem({
  comment,
  depth
}: CommentItemProps) {
  const [isExpanded, setIsExpanded] = useState(comment.isExpanded ?? true)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const { addReply } = useStoryEditorStore()

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyContent.trim()) return
    
    addReply(comment.id, {
      id: `reply-${Date.now()}`,
      user: "You",
      avatar: "/placeholder-avatar-new.jpg",
      text: replyContent,
      date: new Date().toLocaleDateString(),
      likes: 0
    })
    setReplyingTo(null)
    setReplyContent('')
  }

  return (
    <div className="space-y-3">
      <div
        className={`relative ${depth > 0 ? 'pl-6' : ''}`}
        style={{ marginLeft: depth > 0 ? '1.5rem' : '0' }}
      >
        {/* Comment connection line */}
        {depth > 0 && (
          <div className="absolute left-0 top-0 bottom-0 w-px bg-border transform -translate-x-1/2"></div>
        )}

        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={comment.avatar} />
            <AvatarFallback>{comment.user.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{comment.user}</p>
            <p className="text-sm text-muted-foreground">{comment.date}</p>
          </div>
        </div>

        <p className={`pl-12 ${depth > 0 ? 'pl-6' : ''}`}>{comment.text}</p>

        <div className="pl-12 flex items-center gap-4">
          <Button variant="ghost" size="sm" className="gap-2">
            <Heart className="h-4 w-4" />
            {comment.likes}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
          >
            <MessageSquare className="h-4 w-4" />
            Yanıtla
          </Button>
          {comment.replies?.length ? (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Cevapları gizle
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  {comment.replies.length} cevap
                </>
              )}
            </Button>
          ) : null}
        </div>

        {/* Reply form */}
        {replyingTo === comment.id && (
          <form
            onSubmit={handleReplySubmit}
            className="pl-12 mt-2 space-y-2"
          >
            <Input
              placeholder="Yanıtınızı yazın..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="bg-background"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReplyingTo(null)}
              >
                İptal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!replyContent.trim()}
              >
                Gönder
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Nested replies */}
      {comment.replies?.length && isExpanded && (
        <div className="pl-6">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}

      <Separator className={`${depth > 0 ? 'ml-6' : ''}`} />
    </div>
  )
}