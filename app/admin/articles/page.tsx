"use client"

import { useEffect, useState } from "react"
import { getCurrentUser } from "@/lib/api"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArticlesTable } from "@/components/admin/articles-table"
import AccessDenied from "@/components/access-denied"

export default function AdminArticlesPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Error authenticating user:", error)
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [])
  
  if (loading) {
    return (
      <div className="container py-10">
        <div className="h-screen flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-32 bg-muted rounded-md mb-4"></div>
            <div className="h-64 w-full max-w-4xl bg-muted rounded-md"></div>
          </div>
        </div>
      </div>
    )
  }
  
  // Allow both admins and editors to access this page
  if (!user || (user.role.id !== 1 && user.role.id !== 2)) {
    return <AccessDenied />
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container py-10"
    >
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Bài báo</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý tất cả Bài báo trên hệ thống - xuất bản, hủy xuất bản, và xóa.
          </p>
        </div>
        
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">Tất cả Bài báo</TabsTrigger>
            <TabsTrigger value="published">Đã xuất bản</TabsTrigger>
            <TabsTrigger value="unpublished">Chưa xuất bản</TabsTrigger>
            <TabsTrigger value="deleted">Đã xóa</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <ArticlesTable />
          </TabsContent>
          
          <TabsContent value="published" className="mt-0">
            <ArticlesTable />
          </TabsContent>
          
          <TabsContent value="unpublished" className="mt-0">
            <ArticlesTable />
          </TabsContent>
          
          <TabsContent value="deleted" className="mt-0">
            <ArticlesTable />
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  )
} 