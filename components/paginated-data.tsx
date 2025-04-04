"use client"

import { useState, useEffect } from "react"
import { PaginationFixed } from "@/components/ui/pagination-fixed"
import { PaginationResultsFixed } from "@/components/ui/pagination-results-fixed"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Interface cho dữ liệu mẫu
interface DataItem {
  id: number
  title: string
  description: string
}

// Props cho component
interface PaginatedDataProps {
  title?: string
  className?: string
}

export function PaginatedData({ title = "Dữ liệu của bạn", className = "" }: PaginatedDataProps) {
  // State quản lý phân trang
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [data, setData] = useState<DataItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Tạo dữ liệu mẫu - trong thực tế, bạn sẽ lấy dữ liệu từ API
  useEffect(() => {
    const fetchData = () => {
      setIsLoading(true)
      // Giả lập lấy dữ liệu từ API
      setTimeout(() => {
        const mockData: DataItem[] = Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          title: `Mục ${i + 1}`,
          description: `Đây là mô tả chi tiết cho mục ${i + 1}`
        }))
        setData(mockData)
        setIsLoading(false)
      }, 500)
    }
    
    fetchData()
  }, [])

  // Tính toán số trang và dữ liệu hiện tại
  const totalItems = data.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  
  // Lấy dữ liệu cho trang hiện tại
  const currentData = data.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Xử lý khi thay đổi trang
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Trong thực tế, bạn có thể gọi API để lấy dữ liệu cho trang mới
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Xử lý khi thay đổi số lượng items mỗi trang
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value)
    setCurrentPage(1) // Reset về trang đầu tiên
    // Trong thực tế, bạn có thể gọi API để lấy dữ liệu mới
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <Card className="border border-gray-200/20 bg-background/60 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{title}</span>
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
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Không có dữ liệu để hiển thị
                  </div>
                )}
              </div>

              {/* Hiển thị phân trang */}
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                <PaginationResultsFixed
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  showItemsPerPage={true}
                />
                <PaginationFixed
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  alwaysShow={true}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 