"use client"

import { useCallback } from "react"
import Link from "next/link"
import { SearchForm } from "@/components/search/search-form"
import { ArticleList } from "@/components/article-list"
import { useAuth } from "@/components/auth-provider"
import { fetchFeaturedArticles } from "./actions"
import { motion } from "framer-motion"
import { Newspaper, Bookmark, Users, ArrowRight, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { SearchFormData } from "@/lib/types"

export default function HomePage() {
  console.log('[HomePage] Component rendering');
  const { isAuthenticated, user } = useAuth()
  console.log('[HomePage] Auth state:', { isAuthenticated, userId: user?.id });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Hero section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
        <div className="container relative mx-auto px-4 py-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-4xl space-y-6 text-center"
          >
            <h1 className="font-[Be Vietnam Pro] text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                TinVerse
              </span>
              <br />
              <span className="text-foreground">Khám phá thế giới tin tức</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Nền tảng tin tức hiện đại với giao diện đẹp mắt và trải nghiệm người dùng tuyệt vời
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/articles"
                className="group flex w-full max-w-xs items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-white shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl sm:w-auto"
              >
                <Newspaper className="h-5 w-5 transition-transform group-hover:scale-110" />
                <span className="font-medium">Xem tất cả bài viết</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              
              {isAuthenticated && user?.id && (
                <>
                  <Link
                    href={`/bookmarks?userId=${user.id}`}
                    className="group flex w-full max-w-xs items-center justify-center gap-2 rounded-lg bg-primary/90 px-6 py-3 text-white shadow-lg transition-all hover:bg-primary hover:shadow-xl sm:w-auto"
                  >
                    <Bookmark className="h-5 w-5 transition-transform group-hover:scale-110" />
                    <span className="font-medium">Xem bài viết đã lưu</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>

                  {/* Admin Link */}
                  {user.role?.id === 1 && (
                    <Link
                      href="/admin"
                      className="group flex w-full max-w-xs items-center justify-center gap-2 rounded-lg bg-primary/80 px-6 py-3 text-white shadow-lg transition-all hover:bg-primary hover:shadow-xl sm:w-auto"
                    >
                      <Users className="h-5 w-5 transition-transform group-hover:scale-110" />
                      <span className="font-medium">Quản trị hệ thống</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  )}

                  {/* Author Link - visible to both admins and authors */}
                  {(user.role?.id === 1 || user.role?.id === 2) && (
                    <Link
                      href="/author"
                      className="group flex w-full max-w-xs items-center justify-center gap-2 rounded-lg bg-primary/80 px-6 py-3 text-white shadow-lg transition-all hover:bg-primary hover:shadow-xl sm:w-auto"
                    >
                      <FileText className="h-5 w-5 transition-transform group-hover:scale-110" />
                      <span className="font-medium">Trang tác giả</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  )}
                </>
              )}
              <Link
                href="/about"
                className="group flex w-full max-w-xs items-center justify-center gap-2 rounded-lg border border-primary/20 bg-background/80 px-6 py-3 text-primary shadow-lg backdrop-blur-sm transition-all hover:bg-primary/10 hover:shadow-xl sm:w-auto"
              >
                <Users className="h-5 w-5 transition-transform group-hover:scale-110" />
                <span className="font-medium">Giới thiệu</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search section */}
      <section className="container mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-background/80 via-background/70 to-background/90 p-8 shadow-lg backdrop-blur-md">
            <h2 className="mb-6 text-center text-2xl font-semibold">Tìm kiếm bài viết</h2>
            <HomeSearchForm />
          </div>
        </motion.div>
      </section>

      {/* Featured articles */}
      <section className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <FeaturedArticles />
        </motion.div>
      </section>
    </div>
  )
}

function FeaturedArticles() {
  console.log('[FeaturedArticles] Component rendering');
  
  const handleFetch = useCallback(async (page: number) => {
    console.log('[FeaturedArticles] Fetching page:', page);
    const result = await fetchFeaturedArticles(page);
    console.log('[FeaturedArticles] Fetch result:', {
      hasData: !!result,
      itemCount: result?.items?.length || 0
    });
    return result;
  }, []); // No dependencies since fetchFeaturedArticles is stable

  return (
    <ArticleList
      fetchArticles={handleFetch}
      title="Bài báo nổi bật"
      description="Các bài báo được đọc nhiều nhất trong thời gian gần đây"
      emptyMessage="Chưa có bài viết nào"
    />
  )
}

function HomeSearchForm() {
  const router = useRouter()
  
  const handleSearch = (data: SearchFormData) => {
    console.log('HomePage: Search form submitted with data:', data);
    
    // Tạo query string từ dữ liệu tìm kiếm
    const params = new URLSearchParams();
    if (data.keyword) params.append('keyword', data.keyword);
    if (data.categoryId !== undefined) params.append('categoryId', data.categoryId.toString());
    
    // Chuyển hướng đến trang articles với các tham số tìm kiếm
    const queryString = params.toString();
    const url = `/articles${queryString ? `?${queryString}` : ''}`;
    
    console.log('HomePage: Redirecting to:', url);
    router.push(url);
  }
  
  return <SearchForm onSearch={handleSearch} showReset />
}
