"use client"

import { useState, useEffect } from "react"
import { ArticleList } from "@/components/article-list"
import { searchArticles } from "@/lib/api"
import { SearchForm } from "@/components/search/search-form"
import { SearchFormData } from "@/lib/types"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useSearchParams } from "next/navigation"

export default function ArticlesPage() {
  const searchParamsUrl = useSearchParams()
  
  // Lấy tham số tìm kiếm từ URL
  const keywordFromUrl = searchParamsUrl.get('keyword') || ""
  const categoryIdFromUrl = searchParamsUrl.get('categoryId')
  
  const [searchParams, setSearchParams] = useState<SearchFormData>({
    keyword: keywordFromUrl,
    categoryId: categoryIdFromUrl ? parseInt(categoryIdFromUrl) : undefined
  })
  
  // State để lưu tên danh mục đang được lọc
  const [categoryName, setCategoryName] = useState<string>("")
  
  // Cập nhật state khi URL thay đổi
  useEffect(() => {
    console.log('ArticlesPage: URL params changed:', { keyword: keywordFromUrl, categoryId: categoryIdFromUrl });
    setSearchParams({
      keyword: keywordFromUrl,
      categoryId: categoryIdFromUrl ? parseInt(categoryIdFromUrl) : undefined
    })
  }, [keywordFromUrl, categoryIdFromUrl])
  
  // Lấy tên danh mục nếu tìm kiếm theo categoryId
  useEffect(() => {
    const getCategoryName = async () => {
      if (searchParams.categoryId !== undefined) {
        try {
          console.log('ArticlesPage: Fetching category name for ID:', searchParams.categoryId, typeof searchParams.categoryId);
          const categories = await import('@/lib/api').then(m => m.getCategories());
          console.log('ArticlesPage: Found categories:', categories.map(c => ({ id: c.id, name: c.name })));
          
          // Convert to numbers to ensure a proper comparison
          const categoryIdNum = Number(searchParams.categoryId);
          const category = categories.find(c => c.id === categoryIdNum);
          
          console.log('ArticlesPage: Found category match:', category);
          if (category) {
            setCategoryName(category.name);
            console.log('ArticlesPage: Set category name to:', category.name);
          }
        } catch (error) {
          console.error('Error fetching category name:', error);
        }
      } else {
        setCategoryName("");
      }
    };
    
    getCategoryName();
  }, [searchParams.categoryId]);

  const handleSearch = (formData: SearchFormData) => {
    console.log('ArticlesPage: Search form submitted with data:', formData);
    console.log('ArticlesPage: Previous searchParams:', searchParams);
    
    // Kiểm tra xem có sự thay đổi trong dữ liệu tìm kiếm
    const isSameSearch = 
      formData.keyword === searchParams.keyword && 
      formData.categoryId === searchParams.categoryId;
      
    if (isSameSearch) {
      console.log('ArticlesPage: Skipping update - search parameters unchanged');
      return;
    }
    
    // Chỉ cập nhật khi có thay đổi
    setSearchParams(formData)
    console.log('ArticlesPage: Updated searchParams:', formData);
  }
  
  // Xác định tiêu đề và mô tả dựa trên điều kiện tìm kiếm
  const getTitle = () => {
    if (searchParams.keyword && searchParams.categoryId !== undefined && categoryName) {
      return `Kết quả tìm kiếm "${searchParams.keyword}" trong danh mục "${categoryName}"`;
    } else if (searchParams.keyword) {
      return `Kết quả tìm kiếm cho "${searchParams.keyword}"`;
    } else if (searchParams.categoryId !== undefined && categoryName) {
      return `Bài viết trong danh mục "${categoryName}"`;
    } else {
      return "Danh sách bài viết";
    }
  };
  
  const getDescription = () => {
    if (searchParams.keyword && searchParams.categoryId !== undefined && categoryName) {
      return `Tìm thấy các bài viết về "${searchParams.keyword}" trong danh mục "${categoryName}"`;
    } else if (searchParams.keyword) {
      return `Tìm thấy các bài viết liên quan đến "${searchParams.keyword}"`;
    } else if (searchParams.categoryId !== undefined && categoryName) {
      return `Hiển thị tất cả bài viết thuộc danh mục "${categoryName}"`;
    } else {
      return "Tất cả bài viết mới nhất";
    }
  };
  
  const getEmptyMessage = () => {
    if (searchParams.keyword && searchParams.categoryId !== undefined && categoryName) {
      return `Không tìm thấy bài viết nào về "${searchParams.keyword}" trong danh mục "${categoryName}"`;
    } else if (searchParams.keyword) {
      return `Không tìm thấy bài viết phù hợp với từ khóa "${searchParams.keyword}"`;
    } else if (searchParams.categoryId !== undefined && categoryName) {
      return `Không có bài viết nào trong danh mục "${categoryName}"`;
    } else {
      return "Chưa có bài viết nào";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex justify-center w-full bg-gradient-to-b from-background/80 to-background"
    >
      <div className="container max-w-screen-xl px-4 sm:px-6 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Tất cả bài viết</h1>
            <p className="text-muted-foreground text-lg">
              Khám phá tất cả bài viết mới nhất trên hệ thống
            </p>
          </div>
          
          <Separator className="max-w-md mx-auto" />
          
          <Card className="bg-card/50 backdrop-blur-sm border border-border/40 shadow-sm">
            <CardContent className="pt-6">
              <SearchForm 
                onSearch={handleSearch}
                showReset
                initialValues={{
                  keyword: searchParams.keyword,
                  categoryId: searchParams.categoryId?.toString(),
                }}
              />
            </CardContent>
          </Card>
          
          <ArticleList
            key={`${searchParams.keyword || ""}-${searchParams.categoryId || "all"}`}
            fetchArticles={async (page: number) => {
              console.log(`Articles page: Fetching page ${page} with params:`, searchParams);
              try {
                const result = await searchArticles(
                  {
                    keyword: searchParams.keyword,
                    categoryId: searchParams.categoryId
                  },
                  { page, itemsPerPage: 9 }
                );
                console.log(`Articles page: API response for page ${page}:`, result);
                return result;
              } catch (error) {
                console.error('Error fetching articles:', error);
                throw error;
              }
            }}
            title={getTitle()}
            description={getDescription()}
            emptyMessage={getEmptyMessage()}
            searchParams={searchParams}
            className="mt-6"
          />
        </div>
      </div>
    </motion.div>
  )
} 