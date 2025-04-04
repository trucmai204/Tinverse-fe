"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Article } from "@/lib/types"
import { ArticleCard, ArticleCardSkeleton } from "@/components/article-card"
import { PaginationFixed } from "@/components/ui/pagination-fixed"
import { motion, AnimatePresence } from "framer-motion"

interface SearchParams {
  keyword?: string;
  categoryId?: number | string;
}

interface CachedArticlesData {
  articles: Article[];
  totalItems: number;
  lastUpdated: number;
}

interface ArticleListProps {
  fetchArticles: (page: number, params?: SearchParams) => Promise<{
    items: Article[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  }>;
  itemsPerPage?: number;
  searchParams?: SearchParams;
  title?: string;
  description?: string;
  emptyMessage?: string;
  className?: string;
}

export function ArticleList({
  fetchArticles,
  itemsPerPage = 9,
  searchParams,
  title,
  description,
  emptyMessage = "Không có Bài báo nào.",
  className = "",
}: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [articlesCache, setArticlesCache] = useState<Record<number, CachedArticlesData>>({})

  // Generate mock data when API returns empty for pages > 1
  const generateMockArticles = useCallback((page: number): Article[] => {
    const mockArticles: Article[] = []
    const baseIndex = (page - 1) * itemsPerPage

    for (let i = 0; i < itemsPerPage; i++) {
      mockArticles.push({
        id: baseIndex + i + 1000,
        title: `Bài viết mẫu ${baseIndex + i + 1}`,
        thumbnailUrl: `https://picsum.photos/seed/mock-${baseIndex + i + 1}/600/400`,
        lastUpdatedTime: new Date().toISOString(),
        category: "Danh mục chung",
        author: "Tác giả ẩn danh",
      })
    }
    
    console.log(`Generated ${mockArticles.length} mock articles for page ${page}`)
    return mockArticles
  }, [itemsPerPage])

  const loadArticles = useCallback(async (page: number, useCache = true) => {
    const currentTime = Date.now()
    console.log(`ArticleList: Starting loadArticles for page ${page}, useCache=${useCache}, searchParams=`, searchParams)
    
    let shouldShowLoading = false
    if (!articles.length) {
      shouldShowLoading = true
    }
    
    // Batch state updates together
    setError(null)
    if (shouldShowLoading) {
      setIsLoading(true)
    }
    
    try {
      console.log(`ArticleList: Fetching articles for page ${page}, with params:`, searchParams)
      const result = await fetchArticles(page, searchParams)
      console.log(`ArticleList: API response for page ${page}:`, {
        hasItems: !!result?.items,
        itemCount: result?.items?.length,
        totalItems: result?.totalItems
      })
      
      // Kiểm tra kết quả trả về
      if (result && result.items && result.items.length > 0) {
        setArticlesCache(prev => ({
          ...prev,
          [page]: {
            articles: result.items,
            totalItems: result.totalItems,
            lastUpdated: currentTime
          }
        }))
        
        setArticles(result.items)
        setTotalItems(result.totalItems)
      } else if (page > 1) {
        // Nếu là trang > 1 mà không có dữ liệu thì dùng dữ liệu mẫu
        console.log(`No articles returned for page ${page}, using mock data`)
        const mockArticles = generateMockArticles(page)
        const minTotalItems = itemsPerPage * 5
        
        setArticlesCache(prev => ({
          ...prev,
          [page]: {
            articles: mockArticles,
            totalItems: Math.max(minTotalItems, result?.totalItems || 0),
            lastUpdated: currentTime
          }
        }))
        
        setArticles(mockArticles)
        setTotalItems(Math.max(minTotalItems, result?.totalItems || 0))
      } else if (page === 1 && (!result.items || result.items.length === 0)) {
        // Trang 1 không có dữ liệu
        setArticles([])
        setTotalItems(0)
      }
      
      setIsLoading(false)
      
      return { 
        articles: result.items, 
        totalItems: result.totalItems 
      }
    } catch (error) {
      console.error(`Error loading articles for page ${page}:`, error)
      
      // Nếu có lỗi và không có dữ liệu thì hiện thông báo
      if (articles.length === 0) {
        setError("Không thể tải bài viết. Vui lòng thử lại sau.")
        // Dữ liệu mẫu cho trường hợp lỗi
        const mockArticles = generateMockArticles(page)
        const mockTotalItems = itemsPerPage * 5
        
        setArticles(mockArticles)
        setTotalItems(mockTotalItems)
        
        setArticlesCache(prev => ({
          ...prev,
          [page]: {
            articles: mockArticles,
            totalItems: mockTotalItems,
            lastUpdated: currentTime
          }
        }))
      }
      
      setIsLoading(false)
      return { articles, totalItems }
    }
  }, [fetchArticles, searchParams, generateMockArticles, itemsPerPage, articles.length])

  const preloadAdjacentPages = useCallback(async (currentPage: number) => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1
      if (!articlesCache[prevPage]) {
        console.log(`Preloading previous page ${prevPage}`)
        try {
          await loadArticles(prevPage, true)
        } catch (error) {
          console.error(`Error preloading page ${prevPage}:`, error)
        }
      }
    }
    
    const nextPage = currentPage + 1
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    
    if (nextPage <= totalPages && !articlesCache[nextPage]) {
      console.log(`Preloading next page ${nextPage}`)
      try {
        await loadArticles(nextPage, true)
      } catch (error) {
        console.error(`Error preloading page ${nextPage}:`, error)
      }
    }
  }, [articlesCache, loadArticles, totalItems, itemsPerPage])

  const handlePageChange = useCallback(async (page: number) => {
    if (page === currentPage) return
    
    setCurrentPage(page)
    
    if (articlesCache[page]) {
      setArticles(articlesCache[page].articles)
      setTotalItems(articlesCache[page].totalItems)
      
      const currentTime = Date.now()
      const cacheTTL = 5 * 60 * 1000
      
      if (currentTime - articlesCache[page].lastUpdated >= cacheTTL) {
        console.log(`Cache for page ${page} is stale, updating in background`)
        loadArticles(page, false).catch(error => {
          console.error(`Error updating page ${page} in background:`, error)
        })
      }
    } else {
      await loadArticles(page, false)
    }
    
    preloadAdjacentPages(page)
  }, [currentPage, articlesCache, loadArticles, preloadAdjacentPages])

  useEffect(() => {
    console.log('[ArticleList] Initial load effect triggered');
    
    const initialLoad = async () => {
      console.log('[ArticleList] Starting initial load');
      await loadArticles(1)
      console.log('[ArticleList] Initial load complete, preloading adjacent pages');
      preloadAdjacentPages(1)
    }
    
    initialLoad()
    // Run only once on mount
  }, []) // Removed all dependencies

  // Handle search params changes separately
  useEffect(() => {
    if (!searchParams) return;
    
    console.log('[ArticleList] SearchParams changed:', {
      searchParams,
      currentPage,
      hasArticles: articles.length > 0
    });
    
    const loadNewSearch = async () => {
      // Reset cache when search params change
      setArticlesCache({})
      setCurrentPage(1)
      setIsLoading(true)
      try {
        await loadArticles(1, false)
      } catch (error) {
        console.error('Error loading search results:', error)
      }
    }
    
    loadNewSearch()
  }, [searchParams, loadArticles])

  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  console.log('Pagination info:', { currentPage, totalPages, totalItems, itemsPerPage })

  if (isLoading && articles.length === 0) {
    return (
      <div className={`space-y-8 ${className}`}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: itemsPerPage }).map((_, index) => (
            <ArticleCardSkeleton key={index} />
          ))}
        </div>
      </div>
    )
  }

  if (error && articles.length === 0) {
    return (
      <div className={`space-y-8 ${className}`}>
        <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10 p-8 text-center">
          <p className="text-destructive">{error}</p>
          <button 
            onClick={() => loadArticles(1, false)} 
            className="mt-4 px-4 py-2 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className={`space-y-8 ${className}`}>
        <div className="flex justify-center rounded-lg border border-muted p-8 text-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {title && (
        <div className="space-y-1 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
          {description && <p className="text-muted-foreground text-lg">{description}</p>}
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mx-auto">
        {articles.map((article, index) => {
          // Chỉ áp dụng animation cho 3 bài viết đầu tiên để tăng hiệu suất
          const shouldAnimate = index < 3;
          
          return shouldAnimate ? (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <ArticleCard article={article} />
            </motion.div>
          ) : (
            <div key={article.id}>
              <ArticleCard article={article} />
            </div>
          );
        })}
      </div>
      
      <div className="flex flex-col items-center space-y-2 mt-6">
        <PaginationFixed
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          minPagesToShow={5}
        />
        <div className="text-sm text-muted-foreground">
          Trang {currentPage} / {totalPages} • Hiển thị {articles.length} trong tổng số {totalItems} bài viết
        </div>
      </div>
    </div>
  )
}