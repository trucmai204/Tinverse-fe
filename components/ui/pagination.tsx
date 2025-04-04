"use client"

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}: PaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 7 // Tăng số lượng nút hiển thị
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if there are fewer than maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Always show first page
      pageNumbers.push(1)
      
      // Calculate start and end of pages to show
      let startPage = Math.max(2, currentPage - 2) // Tăng số lượng nút trước trang hiện tại
      let endPage = Math.min(totalPages - 1, currentPage + 2) // Tăng số lượng nút sau trang hiện tại
      
      // Adjust if current page is close to start or end
      if (currentPage <= 4) {
        startPage = 2
        endPage = Math.min(totalPages - 1, maxPagesToShow - 2)
      } else if (currentPage >= totalPages - 3) {
        startPage = Math.max(2, totalPages - (maxPagesToShow - 3))
        endPage = totalPages - 1
      }
      
      // Add ellipsis before middle pages if needed
      if (startPage > 2) {
        pageNumbers.push("ellipsis-start")
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }
      
      // Add ellipsis after middle pages if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push("ellipsis-end")
      }
      
      // Always show last page
      if (totalPages > 1) {
        pageNumbers.push(totalPages)
      }
    }
    
    return pageNumbers
  }
  
  if (totalPages <= 1) return null
  
  const pageNumbers = getPageNumbers()
  
  return (
    <nav className={cn("flex flex-wrap items-center justify-center gap-1", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 px-2"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        <span>Trước</span>
      </Button>
      
      <AnimatePresence initial={false} mode="wait">
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === "ellipsis-start" || page === "ellipsis-end") {
              return (
                <div key={`ellipsis-${index}`} className="flex items-center justify-center h-8 w-8">
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </div>
              )
            }
            
            const isActive = page === currentPage
            
            return (
              <motion.div 
                key={page} 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
              >
                <Button
                  variant={isActive ? "default" : "outline"}
                  onClick={() => onPageChange(Number(page))}
                  className={`h-8 min-w-[32px] ${
                    isActive ? "bg-primary text-primary-foreground" : ""
                  }`}
                >
                  {page}
                </Button>
              </motion.div>
            )
          })}
        </div>
      </AnimatePresence>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 px-2"
      >
        <span>Sau</span>
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </nav>
  )
} 