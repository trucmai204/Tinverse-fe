"use client"

import { useState, useEffect } from "react"
import { Pagination } from "@/components/ui/pagination"
import { PaginationResults } from "@/components/ui/pagination-results"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Interface cho dữ liệu mẫu
interface TableItem {
  id: number
  name: string
  email: string
  role: string
  status: "active" | "inactive" | "pending"
}

// Props cho component
interface PaginatedTableProps {
  title?: string
  className?: string
}

export function PaginatedTable({ title = "Bảng dữ liệu", className = "" }: PaginatedTableProps) {
  // State quản lý phân trang
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [data, setData] = useState<TableItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Tạo dữ liệu mẫu - trong thực tế, bạn sẽ lấy dữ liệu từ API
  useEffect(() => {
    const fetchData = () => {
      setIsLoading(true)
      // Giả lập lấy dữ liệu từ API
      setTimeout(() => {
        const roles = ["Admin", "Editor", "User", "Guest"]
        const statuses: Array<"active" | "inactive" | "pending"> = ["active", "inactive", "pending"]
        
        const mockData: TableItem[] = Array.from({ length: 50 }, (_, i) => ({
          id: i + 1,
          name: `Người dùng ${i + 1}`,
          email: `user${i + 1}@example.com`,
          role: roles[Math.floor(Math.random() * roles.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)]
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
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Xử lý khi thay đổi số lượng items mỗi trang
  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value)
    setCurrentPage(1) // Reset về trang đầu tiên
  }

  // Hiển thị badge status
  const getStatusBadge = (status: "active" | "inactive" | "pending") => {
    const classes = {
      active: "bg-green-500/10 text-green-500 border-green-500/20",
      inactive: "bg-red-500/10 text-red-500 border-red-500/20",
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
    }

    const labels = {
      active: "Hoạt động",
      inactive: "Không hoạt động",
      pending: "Đang chờ"
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${classes[status]}`}>
        {labels[status]}
      </span>
    )
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
              {/* Bảng dữ liệu */}
              <div className="rounded-md border overflow-hidden mb-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead>Tên</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Trạng thái</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentData.length > 0 ? (
                      currentData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.id}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.email}</TableCell>
                          <TableCell>{item.role}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          Không có dữ liệu để hiển thị
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Phân trang */}
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
                <PaginationResults
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={handleItemsPerPageChange}
                  showItemsPerPage={true}
                />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 