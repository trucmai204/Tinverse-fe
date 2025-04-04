"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Pagination } from "@/components/ui/pagination"

interface PaginationWrapperProps {
  currentPage: number
  totalPages: number
  className?: string
}

export function PaginationWrapper({ currentPage, totalPages, className }: PaginationWrapperProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", page.toString())
    router.push(`${pathname}?${params.toString()}`)
  }
  
  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={handlePageChange}
      className={className}
    />
  )
} 