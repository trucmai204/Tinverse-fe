"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/components/auth-provider"
import { addComment } from "@/lib/api"
import { AddCommentDto } from "@/lib/types"

interface CommentFormProps {
  articleId: number
  onCommentAdded: () => void
}

export function CommentForm({ articleId, onCommentAdded }: CommentFormProps) {
  const { user, isAuthenticated } = useAuth()
  const [content, setContent] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (content.trim() === "") {
      setError("Bình luận không được để trống")
      return
    }

    if (content.length > 255) {
      setError("Bình luận không được vượt quá 255 ký tự")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const commentData: AddCommentDto = {
        ArticleId: articleId,
        Content: content.trim()
      }
      
      await addComment(commentData)
      setContent("")
      onCommentAdded()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể thêm bình luận")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle pressing Enter to submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="p-4 rounded-lg bg-card/30 backdrop-blur-sm border border-border/50 text-center text-muted-foreground">
        Vui lòng đăng nhập để thêm bình luận.
      </div>
    )
  }

  return (
    <div className="relative mb-8">
      <div className="flex flex-col space-y-3 p-4 rounded-lg bg-card/30 backdrop-blur-sm border border-border/50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
            {user?.name?.substring(0, 1).toUpperCase() || "U"}
          </div>
          <div className="text-sm font-medium">{user?.name}</div>
        </div>
        
        <Textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            if (error) setError(null)
          }}
          onKeyDown={handleKeyDown}
          placeholder="Thêm bình luận..."
          className="resize-none bg-background/50 min-h-[100px]"
          disabled={isSubmitting}
        />
        
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-destructive"
          >
            {error}
          </motion.p>
        )}
        
        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            {content.length}/255 ký tự
          </div>
          
          <Button
            variant="default"
            size="sm"
            onClick={handleSubmit}
            disabled={isSubmitting || content.trim() === ""}
            className="relative overflow-hidden group"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <span className="animate-spin mr-1 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Đang đăng...
              </span>
            ) : (
              <span className="flex items-center">
                
                Đăng
              </span>
            )}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-1000" />
          </Button>
        </div>
      </div>
    </div>
  )
} 