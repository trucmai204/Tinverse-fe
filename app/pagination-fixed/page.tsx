import { PaginatedData } from "@/components/paginated-data"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Demo Phân Trang (Đã Sửa)",
  description: "Ví dụ về cách sử dụng phân trang đã sửa lỗi trong ứng dụng",
}

export default function PaginationFixedDemoPage() {
  return (
    <div className="container py-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          Demo Phân Trang (Đã Sửa)
        </h1>
        <p className="text-muted-foreground text-lg">
          Trang này hiển thị phân trang đã sửa để luôn hiển thị ngay cả với ít dữ liệu
        </p>
        <div className="mt-4 p-4 border border-amber-500/20 bg-amber-500/10 rounded-lg text-amber-500">
          <p className="font-medium">Lưu ý:</p>
          <ul className="list-disc pl-5 mt-2 text-sm space-y-1">
            <li>Component phân trang đã được sửa để hiển thị ngay cả khi chỉ có 1 trang</li>
            <li>Số lượng dữ liệu được giảm xuống còn 5 item để chỉ tạo 1 trang duy nhất</li>
            <li>Đã thêm prop <code className="bg-amber-500/20 px-1 rounded">alwaysShow</code> để kiểm soát hiển thị</li>
          </ul>
        </div>
      </div>
      
      {/* Phân trang với danh sách */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Phân trang luôn hiển thị (dữ liệu ít)</h2>
        <PaginatedData title="Danh sách các mục" />
      </div>
    </div>
  )
} 