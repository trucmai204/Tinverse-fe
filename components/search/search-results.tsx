"use client"

import { useState, useEffect } from "react"
import { AlertCircle } from "lucide-react"
import { ArticleCard, ArticleCardSkeleton } from "@/components/article-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Article, PaginationParams, SearchFormData } from "@/lib/types"
import { searchArticles } from "@/lib/api"
import { ArticleList } from "@/components/article-list"

interface SearchResultsProps {
  searchData: SearchFormData
  className?: string
}

export function SearchResults({ searchData, className = "" }: SearchResultsProps) {
  // Track if this is the initial search
  const [isInitialSearch, setIsInitialSearch] = useState(true)
  
  // Fetch articles with pagination
  const fetchArticles = async (pagination: PaginationParams) => {
    if (isInitialSearch) {
      setIsInitialSearch(false)
    }
    
    return await searchArticles(searchData, pagination)
  }
  
  // Reset when search data changes
  useEffect(() => {
    setIsInitialSearch(true)
  }, [searchData.keyword, searchData.categoryId])
  
  // If it's the initial search and there's no search keyword or category, don't display anything
  if (isInitialSearch && !searchData.keyword && !searchData.categoryId) {
    return (
      <div className={`p-12 text-center rounded-xl border border-border/30 ${className}`}>
        <p className="text-muted-foreground">Nhập từ khóa để tìm kiếm hoặc chọn danh mục.</p>
      </div>
    )
  }
  
  return (
    <div className={className}>
      <h2 className="mb-6 text-xl font-semibold">
        {searchData.keyword 
          ? `Kết quả tìm kiếm cho "${searchData.keyword}"` 
          : "Kết quả tìm kiếm"}
      </h2>
      
      <ArticleList
        fetchArticles={async (page: number) => {
          const result = await searchArticles(searchData, { page, itemsPerPage: 9 })
          return {
            items: result.items,
            totalItems: result.totalItems,
            totalPages: result.totalPages,
            currentPage: result.currentPage
          }
        }}
        emptyMessage={
          searchData.keyword
            ? `Không tìm thấy kết quả nào cho "${searchData.keyword}"`
            : "Không tìm thấy Bài báo nào."
        }
      />
    </div>
  )
}
