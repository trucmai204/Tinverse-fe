import { PaginatedData } from "@/components/paginated-data"
import { PaginatedTable } from "@/components/paginated-table"
import { PaginationWithHook } from "@/components/pagination-with-hook"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Demo Phân Trang",
  description: "Ví dụ về cách sử dụng phân trang trong ứng dụng",
}

export default function PaginationDemoPage() {
  return (
    <div className="container py-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          Demo Phân Trang
        </h1>
        <p className="text-muted-foreground text-lg">
          Trang này hiển thị các loại phân trang khác nhau trong ứng dụng
        </p>
      </div>
      
      {/* Phân trang với danh sách */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">1. Phân trang với danh sách</h2>
        <PaginatedData title="Danh sách các mục" />
      </div>
      
      {/* Phân trang với bảng */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">2. Phân trang với bảng</h2>
        <PaginatedTable title="Bảng người dùng" />
      </div>
      
      {/* Phân trang sử dụng hook */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">3. Phân trang sử dụng Hook và có bộ lọc</h2>
        <PaginationWithHook title="Danh sách tin tức" />
      </div>
    </div>
  )
} 