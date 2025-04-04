"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { SidebarNav } from "@/components/admin/sidebar-nav"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [isAuthorized, setIsAuthorized] = useState(false)
  
  useEffect(() => {
    console.log('Admin Layout: Auth state changed', { 
      isLoading, 
      isAuthenticated, 
      user: user ? { id: user.id, role: user.role } : null 
    })
    
    // Only check if user is logged in and has admin role after loading completes
    if (!isLoading) {
      if (!isAuthenticated) {
        console.log('Admin Layout: Not authenticated, redirecting to login')
        window.location.href = '/login'
      } else if (!user?.role?.id || (user.role.id !== 1 && user.role.id !== 2)) {
        // Only allow admin (1) and editor (2) roles
        console.log('Admin Layout: Not authorized, redirecting to home', user?.role)
        window.location.href = '/'
      } else {
        console.log('Admin Layout: User authorized', { role: user.role })
        setIsAuthorized(true)
      }
    }
  }, [isAuthenticated, isLoading, user])

  if (isLoading) {
    console.log('Admin Layout: Showing loading state')
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">
            Đang tải...
          </p>
        </motion.div>
      </div>
    )
  }
  
  if (!isAuthorized) {
    console.log('Admin Layout: Not authorized, access denied')
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4 text-center px-4"
        >
          <p className="text-xl font-semibold text-destructive">Không có quyền truy cập</p>
          <p className="text-muted-foreground mb-4">Bạn không có quyền truy cập vào trang này</p>
          <button 
            onClick={() => window.location.href = '/login'} 
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            Đăng nhập
          </button>
        </motion.div>
      </div>
    )
  }
  
  console.log('Admin Layout: Rendering admin interface')
  return (
    <div className="flex h-screen bg-background">
      <div className="hidden md:block md:w-64 border-r">
        <SidebarNav />
      </div>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  )
} 