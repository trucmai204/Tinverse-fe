import { useState, useEffect, useCallback } from "react"

interface PaginationOptions<T> {
  data: T[]
  initialPage?: number
  initialPageSize?: number
}

interface PaginationResult<T> {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
  currentData: T[]
  setPage: (page: number) => void
  setPageSize: (size: number) => void
  nextPage: () => void
  prevPage: () => void
  firstPage: () => void
  lastPage: () => void
  isFirstPage: boolean
  isLastPage: boolean
}

export function usePagination<T>({
  data,
  initialPage = 1,
  initialPageSize = 10,
}: PaginationOptions<T>): PaginationResult<T> {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize, setPageSizeState] = useState(initialPageSize)

  // Đảm bảo trang hiện tại không vượt quá tổng số trang
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(data.length / pageSize))
    if (currentPage > maxPage) {
      setCurrentPage(maxPage)
    }
  }, [data, pageSize, currentPage])

  // Tính toán các giá trị phân trang
  const totalItems = data.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages

  // Lấy dữ liệu cho trang hiện tại
  const currentData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // Các hàm điều hướng trang
  const setPage = useCallback((page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(pageNumber)
  }, [totalPages])

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size)
    setCurrentPage(1) // Reset về trang đầu tiên khi thay đổi kích thước trang
  }, [])

  const nextPage = useCallback(() => {
    if (!isLastPage) {
      setCurrentPage(prev => prev + 1)
    }
  }, [isLastPage])

  const prevPage = useCallback(() => {
    if (!isFirstPage) {
      setCurrentPage(prev => prev - 1)
    }
  }, [isFirstPage])

  const firstPage = useCallback(() => {
    setCurrentPage(1)
  }, [])

  const lastPage = useCallback(() => {
    setCurrentPage(totalPages)
  }, [totalPages])

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    currentData,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    isFirstPage,
    isLastPage,
  }
} 