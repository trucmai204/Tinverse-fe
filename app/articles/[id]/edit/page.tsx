"use client"

import { useEffect, useState } from "react"
import { notFound, useRouter } from "next/navigation"
import { getArticle, getCurrentUser } from "@/lib/api"
import { ArticleForm } from "@/components/admin/article-form"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import AccessDenied from "@/components/access-denied"

interface EditArticlePageProps {
  params: {
    id: string
  }
}

export default function EditArticlePage({ params }: EditArticlePageProps) {
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [userLoading, setUserLoading] = useState(true)
  const router = useRouter()
  
  // Add warning when user tries to leave the page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const message = "Bạn có những thay đổi chưa được lưu. Bạn có chắc chắn muốn rời khỏi trang này?";
      e.preventDefault();
      e.returnValue = message;
      return message;
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
  
  // Check user permissions
  useEffect(() => {
    const checkUser = async () => {
      try {
        setUserLoading(true)
        const userData = await getCurrentUser()
        setUser(userData)
      } catch (error) {
        console.error("Error checking user:", error)
      } finally {
        setUserLoading(false)
      }
    }
    
    checkUser()
  }, [])
  
  // Load article data
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true)
        const articleId = parseInt(params.id);
        
        if (isNaN(articleId)) {
          notFound();
        }
        
        const data = await getArticle(articleId);
        
        if (!data) {
          notFound();
        }
        
        setArticle(data);
      } catch (error) {
        console.error("Error fetching article:", error);
        setError("Không thể tải Bài báo. Vui lòng thử lại sau.");
        toast.error("Không thể tải Bài báo");
      } finally {
        setLoading(false);
      }
    }
    
    fetchArticle();
  }, [params.id]);
  
  // Check if user is not authorized (must be admin or editor with roleId 1 or 2)
  if (!userLoading && (!user || user.roleId < 2)) {
    return <AccessDenied />
  }
  
  if (loading || userLoading) {
    return (
      <div className="h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Đang tải Bài báo...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.back()}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Lỗi tải Bài báo</h1>
        </div>
        <Separator className="mb-6" />
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      </div>
    )
  }
  
  const initialData = article ? {
    title: article.title,
    content: article.content,
    thumbnailUrl: article.thumbnailUrl,
    category: article.category,
    categoryId: article.categoryId
  } : undefined;
  
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center mb-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => router.back()}
          className="mr-2"
          title="Quay lại"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Chỉnh sửa Bài báo</h1>
      </div>
      
      <Separator className="mb-6" />
      
      <ArticleForm 
        articleId={parseInt(params.id)} 
        initialData={initialData}
      />
    </div>
  )
} 