"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, FileText, Loader2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RelatedArticles } from "@/components/related-articles"
import { CommentSection } from "@/components/comment-section"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { summarizeArticle, isAuthenticated, getCurrentUser } from "@/lib/api"

export function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const params = useParams()
  const router = useRouter()
  const articleId = params.id ? parseInt(params.id as string) : 0
  const [showSummary, setShowSummary] = useState(false)
  const [summary, setSummary] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userCanEdit, setUserCanEdit] = useState(false)
  
  const fetchSummary = async () => {
    if (summary) {
      setShowSummary(!showSummary)
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      const data = await summarizeArticle(articleId)
      setSummary(data)
      setShowSummary(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi tóm tắt Bài báo')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleEditArticle = () => {
    router.push(`/edit/articles/${articleId}`)
  }

  useEffect(() => {
    const loadData = async () => {
      if (!articleId) return;
      
      try {
        // Check if the current user is an editor or admin
        const currentUser = await getCurrentUser();
        setUserCanEdit(
          currentUser?.role?.id === 2 || currentUser?.role?.id === 1
        );
        
        // Fetch article summary
        // ... rest of the effect ...
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    
    loadData();
  }, [articleId]);

  return (
    <div className="bg-gradient-to-b from-background to-background/95 px-1 pb-3">
      <div className="container mx-auto px-1 py-3">
        <div className="flex justify-between items-center">
          <Button
            asChild
            variant="ghost"
            className="group flex items-center gap-1 rounded-full hover:bg-background/80 hover:text-primary"
          >
            <Link href="/">
              <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              <span>Về trang chủ</span>
            </Link>
          </Button>
          
          {userCanEdit && (
            <Button 
              onClick={handleEditArticle}
              variant="outline" 
              className="flex items-center gap-1.5"
            >
              <Edit className="h-4 w-4" />
              <span>Chỉnh sửa</span>
            </Button>
          )}
        </div>
        
        <div className="flex flex-col lg:flex-row mt-4">
          <div className="w-full lg:w-3/4">
            {children}
            
            {/* Comment Section */}
            {articleId > 0 && (
              <div className="mt-10 border-t border-border/40 pt-6">
                <CommentSection articleId={articleId} />
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          {articleId > 0 && (
            <div className="w-full lg:w-1/4 space-y-6 mt-8 lg:mt-0 lg:pl-6">
              <div className="sticky top-24 space-y-6">
                {/* Article Summary */}
                <Card className="border border-border/40 shadow-sm overflow-hidden">
                  <CardHeader className="bg-gradient-to-r ">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5 text-primary" />
                      Tóm tắt Bài báo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={fetchSummary}
                      disabled={isLoading}
                      className="w-full"
                      variant={showSummary ? "outline" : "default"}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Đang tóm tắt...
                        </>
                      ) : (
                        showSummary ? "Ẩn tóm tắt" : "Tóm tắt Bài báo"
                      )}
                    </Button>
                    
                    <AnimatePresence>
                      {showSummary && summary && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-4 text-sm leading-relaxed"
                        >
                          {summary}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {error && (
                      <div className="mt-4 text-sm text-destructive">
                        {error}
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Related Articles */}
                <div className="rounded-lg px-4 backdrop-blur-sm bg-background/30">
                  <RelatedArticles articleId={articleId} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 