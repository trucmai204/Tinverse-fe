"use client"

import { MyArticlesTable } from "@/components/author/my-articles-table"

export default function AuthorArticlesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bài báo của tôi</h1>
        <p className="text-muted-foreground">
          Quản lý tất cả Bài báo mà bạn đã tạo trong hệ thống
        </p>
      </div>
      
      <MyArticlesTable />
    </div>
  )
} 