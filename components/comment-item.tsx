"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { Edit2, Trash2, Send, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Comment, UpdateCommentDto } from "@/lib/types"
import { useAuth } from "@/components/auth-provider"
import { editComment, deleteComment } from "@/lib/api"

interface CommentItemProps {
  comment: Comment
  articleAuthorId?: number
  onCommentUpdated: () => void
}

export function CommentItem({ comment, articleAuthorId, onCommentUpdated }: CommentItemProps) {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(comment.content)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Check if the current user can edit/delete this comment
  const isCommentOwner = user && user.role && user.role.id === comment.user.id
  const isArticleOwner = articleAuthorId && user && user.role && user.role.id === articleAuthorId
  const isAdmin = user && user.role && user.role.name.toLowerCase() === "admin"
  const canEdit = isCommentOwner
  const canDelete = isCommentOwner || isArticleOwner || isAdmin

  const formattedTime = formatDistanceToNow(new Date(comment.lastModifiedTime), {
    addSuffix: true,
    locale: vi
  })

  const handleEdit = () => {
    setIsEditing(true)
    setEditedContent(comment.content)
    setError(null)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedContent(comment.content)
    setError(null)
  }

  const handleSubmitEdit = async () => {
    if (editedContent.trim() === "") {
      setError("Bình luận không được để trống")
      return
    }

    if (editedContent.length > 255) {
      setError("Bình luận không được vượt quá 255 ký tự")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const updateData: UpdateCommentDto = {
        Content: editedContent.trim()
      }
      
      await editComment(comment.id, updateData)
      setIsEditing(false)
      onCommentUpdated()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật bình luận")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      await deleteComment(comment.id)
      setIsDeleting(false)
      onCommentUpdated()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xóa bình luận")
      setIsDeleting(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle pressing Enter to submit edit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitEdit()
    }
  }

  return (
    <div className="relative group mb-6 last:mb-0">
      <div className="flex flex-col space-y-1 bg-card/30 p-4 rounded-lg backdrop-blur-sm border border-border/50">
        {/* Comment Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="font-medium text-foreground/90">{comment.user.name}</div>
            <span className="mx-2 text-foreground/50">•</span>
            <div className="text-xs text-muted-foreground">{formattedTime}</div>
          </div>
          
          {/* Actions */}
          {(canEdit || canDelete) && !isEditing && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {canEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={handleEdit}
                >
                  <Edit2 className="h-4 w-4" />
                  <span className="sr-only">Sửa</span>
                </Button>
              )}
              
              {canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => setIsDeleting(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Xóa</span>
                </Button>
              )}
            </div>
          )}
        </div>
        
        {/* Comment Content */}
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="resize-none bg-background/50 min-h-[80px]"
                placeholder="Sửa bình luận của bạn..."
                disabled={isSubmitting}
                autoFocus
              />
              
              {error && (
                <p className="text-sm text-destructive mt-1">
                  {error}
                </p>
              )}
              
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4 mr-1" />
                  Hủy
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSubmitEdit}
                  disabled={isSubmitting || editedContent.trim() === ""}
                  className="relative overflow-hidden group"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <span className="animate-spin mr-1 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                      Đang lưu...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Send className="h-4 w-4 mr-1" />
                      Lưu
                    </span>
                  )}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-1000" />
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-foreground/80 leading-relaxed whitespace-pre-wrap break-words"
            >
              {comment.content}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent className="bg-background/95 backdrop-blur-lg border-border/50">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bình luận</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {error && (
            <p className="text-sm text-destructive mt-1">
              {error}
            </p>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-1 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Đang xóa...
                </span>
              ) : (
                "Xóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 