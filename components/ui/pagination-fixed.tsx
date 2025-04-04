"use client"

import React, { useMemo } from "react"
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PaginationFixedProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
  minPagesToShow?: number
}

export function PaginationFixed({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
  minPagesToShow = 5, // Mặc định hiển thị ít nhất 5 trang
}: PaginationFixedProps) {
  // Đảm bảo currentPage không vượt quá totalPages
  const effectiveCurrentPage = Math.min(currentPage, Math.max(1, totalPages))
  
  // Đảm bảo luôn hiển thị ít nhất minPagesToShow trang
  const effectiveTotalPages = Math.max(minPagesToShow, totalPages)
  
  // Không ẩn component, ngay cả khi chỉ có 1 trang
  const shouldHide = effectiveTotalPages <= 0
  
  if (shouldHide) {
    return null
  }

  const handlePrevious = () => {
    if (effectiveCurrentPage > 1) {
      onPageChange(effectiveCurrentPage - 1)
    }
  }

  const handleNext = () => {
    if (effectiveCurrentPage < effectiveTotalPages) {
      onPageChange(effectiveCurrentPage + 1)
    }
  }

  // Tạo mảng các trang để hiển thị, sử dụng useMemo để cải thiện hiệu suất
  const pageNumbers = useMemo(() => {
    const result: (number | string)[] = []
    
    // Nếu tổng số trang <= 7, hiển thị tất cả
    if (effectiveTotalPages <= 7) {
      for (let i = 1; i <= effectiveTotalPages; i++) {
        result.push(i)
      }
      return result
    } 
    
    // Luôn hiển thị trang đầu tiên
    result.push(1)
    
    // Xử lý khi trang hiện tại gần đầu
    if (effectiveCurrentPage <= 3) {
      if (effectiveTotalPages > 2) result.push(2)
      if (effectiveTotalPages > 3) result.push(3)  
      if (effectiveTotalPages > 4) result.push(4)
      if (effectiveTotalPages > 5) result.push("...")
      if (effectiveTotalPages > 6) result.push(effectiveTotalPages - 1)
      if (effectiveTotalPages > 1) result.push(effectiveTotalPages)
    } 
    // Xử lý khi trang hiện tại gần cuối
    else if (effectiveCurrentPage >= effectiveTotalPages - 2) {
      result.push("...")
      
      // Thêm tối đa 4 trang cuối
      const startPage = Math.max(2, effectiveTotalPages - 4)
      for (let i = startPage; i < effectiveTotalPages; i++) {
        result.push(i)
      }
      
      result.push(effectiveTotalPages)
    } 
    // Xử lý khi trang hiện tại ở giữa
    else {
      result.push("...")
      result.push(effectiveCurrentPage - 1)
      result.push(effectiveCurrentPage)
      result.push(effectiveCurrentPage + 1)
      result.push("...")
      result.push(effectiveTotalPages)
    }
    
    return result
  }, [effectiveCurrentPage, effectiveTotalPages])

  return (
    <nav
      className={cn("mx-auto flex w-full items-center justify-center space-x-2", className)}
      aria-label="Pagination"
    >
      <Button
        variant="outline"
        size="icon"
        onClick={handlePrevious}
        disabled={effectiveCurrentPage === 1}
        aria-label="Trang trước"
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </Button>
      
      <div className="flex space-x-2">
        {pageNumbers.map((page, index) => {
          if (page === "...") {
            return (
              <Button
                key={`ellipsis-${index}`}
                variant="ghost"
                size="icon"
                disabled
                className="cursor-default"
              >
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            )
          }
          
          const pageNumber = page as number
          const isCurrentPage = pageNumber === effectiveCurrentPage
          
          return (
            <Button
              key={pageNumber}
              variant={isCurrentPage ? "default" : "outline"}
              size="icon"
              onClick={() => onPageChange(pageNumber)}
              aria-current={isCurrentPage ? "page" : undefined}
              aria-label={`Trang ${pageNumber}`}
            >
              {pageNumber}
            </Button>
          )
        })}
      </div>
      
      <Button
        variant="outline"
        size="icon"
        onClick={handleNext}
        disabled={effectiveCurrentPage >= effectiveTotalPages}
        aria-label="Trang sau"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </Button>
    </nav>
  )
} 