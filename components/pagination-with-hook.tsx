"use client"

import { useState, useEffect } from "react"
import { usePagination } from "@/lib/hooks/use-pagination"
import { Pagination } from "@/components/ui/pagination"
import { PaginationResults } from "@/components/ui/pagination-results"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Interface cho dữ liệu mẫu
interface DataItem {
  id: number
  title: string
  description: string
  category: string
}

// Props cho component
interface PaginationWithHookProps {
  title?: string
  className?: string
}

export function PaginationWithHook({ title = "Phân trang với Hook", className = "" }: PaginationWithHookProps) {
  const [data, setData] = useState<DataItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Tạo dữ liệu mẫu
  useEffect(() => {
    const fetchData = () => {
      setIsLoading(true)
      // Giả lập lấy dữ liệu từ API
      setTimeout(() => {
        const categories = ["Tin tức", "Sự kiện", "Công nghệ", "Giải trí", "Thể thao"]
        
        const mockData: DataItem[] = Array.from({ length: 120 }, (_, i) => ({
          id: i + 1,
          title: `Tiêu đề ${i + 1}`,
          description: `Đây là mô tả chi tiết cho mục ${i + 1}. Mô tả này có thể dài hơn và chứa nhiều thông tin.`,
          category: categories[Math.floor(Math.random() * categories.length)]
        }))
        
        setData(mockData)
        setIsLoading(false)
      }, 500)
    }
    
    fetchData()
  }, [])

  // Lọc dữ liệu theo danh mục nếu có
  const filteredData = selectedCategory 
    ? data.filter(item => item.category === selectedCategory)
    : data

  // Sử dụng hook phân trang
  const {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    currentData,
    setPage,
    setPageSize,
    isFirstPage,
    isLastPage
  } = usePagination({
    data: filteredData,
    initialPage: 1,
    initialPageSize: 10
  })

  // Các danh mục duy nhất để hiển thị bộ lọc
  const uniqueCategories = Array.from(new Set(data.map(item => item.category)))

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="border border-gray-200/20 bg-background/60 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex justify-between items-center flex-wrap gap-4">
            <span>{title}</span>
            
            {/* Bộ lọc danh mục */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Lọc theo:</span>
              <Select
                value={selectedCategory || ""}
                onValueChange={(value) => {
                  setSelectedCategory(value === "" ? null : value)
                  setPage(1) // Reset về trang đầu khi thay đổi bộ lọc
                }}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Tất cả danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả danh mục</SelectItem>
                  {uniqueCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Hiển thị dữ liệu */}
              <div className="space-y-4 mb-6">
                {currentData.length > 0 ? (
                  currentData.map((item) => (
                    <div 
                      key={item.id}
                      className="p-4 rounded-lg border border-foreground/10 hover:border-foreground/20 transition-all bg-background/50"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="font-medium">{item.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        </div>
                        <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Không có dữ liệu phù hợp với bộ lọc
                  </div>
                )}
              </div>

              {/* Hiển thị phân trang */}
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                <PaginationResults
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={pageSize}
                  onItemsPerPageChange={setPageSize}
                  showItemsPerPage={true}
                />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 