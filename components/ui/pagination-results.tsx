"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PaginationResultsProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onItemsPerPageChange?: (value: number) => void
  showItemsPerPage?: boolean
  className?: string
}

export function PaginationResults({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onItemsPerPageChange,
  showItemsPerPage = true,
  className = "",
}: PaginationResultsProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)
  
  // Check if there are no items
  if (totalItems === 0) {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        Không có kết quả nào
      </div>
    )
  }
  
  return (
    <div className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-sm ${className}`}>
      <div className="text-muted-foreground">
        Hiển thị <span className="font-medium text-foreground">{startItem}-{endItem}</span> trên <span className="font-medium text-foreground">{totalItems}</span> kết quả
      </div>
      
      {showItemsPerPage && onItemsPerPageChange && (
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Hiển thị</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={itemsPerPage.toString()} />
            </SelectTrigger>
            <SelectContent align="center">
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-muted-foreground">mỗi trang</span>
        </div>
      )}
    </div>
  )
} 