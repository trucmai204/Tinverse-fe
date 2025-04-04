"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle } from "lucide-react"
import { getCommentsByArticle } from "@/lib/api"
import { Comment, PaginationParams } from "@/lib/types"
import { CommentForm } from "@/components/comment-form"
import { CommentItem } from "@/components/comment-item"
import { Pagination } from "@/components/ui/pagination"

interface CommentSectionProps {
  articleId: number
  articleAuthorId?: number
}

export function CommentSection({ articleId, articleAuthorId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalComments, setTotalComments] = useState(0)
  const itemsPerPage = 5 // Show 5 comments per page

  const fetchComments = async (page = 1) => {
    // Skip if articleId is not valid
    if (!articleId) {
      setComments([])
      setIsLoading(false)
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const paginationParams: PaginationParams = {
        page,
        itemsPerPage
      }
      
      const response = await getCommentsByArticle(articleId, paginationParams)
      setComments(response.items)
      setTotalPages(response.totalPages)
      setTotalComments(response.totalItems)
      setCurrentPage(response.currentPage)
    } catch (err) {
      setError("Không thể tải bình luận. Vui lòng thử lại sau.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Reset state when article changes
    setComments([])
    setIsLoading(true)
    setError(null)
    setCurrentPage(1)
    
    // Add a small delay for UI purposes
    const timer = setTimeout(() => {
      fetchComments(1)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [articleId])

  const handleCommentUpdated = () => {
    fetchComments(currentPage)
  }
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchComments(page)
    
    // Scroll to comments section
    const commentsSection = document.getElementById('comments-section')
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section id="comments-section" className="py-8 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">Bình luận</h2>
        <div className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
          {totalComments}
        </div>
      </div>

      <CommentForm 
        articleId={articleId} 
        onCommentAdded={handleCommentUpdated} 
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : error ? (
        <div className="p-6 rounded-lg bg-destructive/10 text-destructive text-center">
          {error}
        </div>
      ) : comments.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-lg bg-card/30 backdrop-blur-sm border border-border/50 text-center text-muted-foreground"
        >
          Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
        </motion.div>
      ) : (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <AnimatePresence>
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <CommentItem
                    comment={comment}
                    articleAuthorId={articleAuthorId}
                    onCommentUpdated={handleCommentUpdated}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          
          {totalPages > 1 && (
            <div className="mt-8 pt-4 border-t border-border/30">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                className="mt-4"
              />
            </div>
          )}
        </>
      )}
    </section>
  )
} 