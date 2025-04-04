"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Article } from "@/lib/types"
import { getRelatedArticles } from "@/lib/api"

interface RelatedArticlesProps {
  articleId: number
}

export function RelatedArticles({ articleId }: RelatedArticlesProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 3 // Show 3 related articles per page

  const fetchRelatedArticles = async (page = 1) => {
    if (!articleId) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      console.log(`Fetching related articles for article ID ${articleId}, page ${page}`)
      const response = await getRelatedArticles(articleId, { page, itemsPerPage })
      
      console.log('Related articles response:', {
        hasItems: !!response.items,
        itemCount: response.items?.length || 0,
        totalPages: response.totalPages,
        currentPage: response.currentPage,
        items: response.items
      })
      
      // Ensure we have valid data
      if (response.items && Array.isArray(response.items)) {
        setArticles(response.items)
        setTotalPages(response.totalPages || 1)
        setCurrentPage(response.currentPage || page)
        
        // If we got an empty response, show a message
        if (response.items.length === 0) {
          console.log('No related articles found')
        }
      } else {
        console.warn('Invalid response format:', response)
        setArticles([])
        setTotalPages(1)
        setCurrentPage(page)
      }
    } catch (err) {
      console.error('Error fetching related articles:', err)
      setError("Không thể tải Bài báo liên quan.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRelatedArticles(1)
  }, [articleId])
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      fetchRelatedArticles(currentPage + 1)
    }
  }
  
  const goToPrevPage = () => {
    if (currentPage > 1) {
      fetchRelatedArticles(currentPage - 1)
    }
  }

  return (
    <div className="py-4 space-y-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg">Bài báo liên quan</h3>
        
        {totalPages > 1 && (
          <div className="flex space-x-1">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1 || isLoading}
              className={`p-1 rounded-full ${
                currentPage === 1 
                  ? "text-muted-foreground cursor-not-allowed" 
                  : "text-foreground hover:bg-background/80 hover:text-primary"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Trước</span>
            </button>
            
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages || isLoading}
              className={`p-1 rounded-full ${
                currentPage === totalPages 
                  ? "text-muted-foreground cursor-not-allowed" 
                  : "text-foreground hover:bg-background/80 hover:text-primary"
              }`}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Sau</span>
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="h-40 flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : error ? (
        <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
          {error}
        </div>
      ) : articles.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
          Không có Bài báo liên quan.
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`related-articles-page-${currentPage}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.id}`}
                className="group block"
              >
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative flex gap-3 p-2 rounded-lg hover:bg-background/60 transition-colors"
                >
                  <div className="relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden">
                    <Image
                      src={article.thumbnailUrl}
                      alt={article.title}
                      fill
                      sizes="64px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {typeof article.category === 'object' && article.category !== null
                          ? article.category.name
                          : article.category}
                      </motion.span>
                      <span>•</span>
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="h-3.5 w-3.5 text-primary" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
} 