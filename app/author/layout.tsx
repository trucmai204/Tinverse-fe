"use client"

import { useEffect, useState } from "react"
import { Metadata } from "next"
import { SidebarNav } from "@/components/author/sidebar-nav"
import { getCurrentUser } from "@/lib/api"
import { Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { motion } from "framer-motion"

interface AuthorLayoutProps {
  children: React.ReactNode
}

export default function AuthorLayout({ children }: AuthorLayoutProps) {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    async function checkAuthorization() {
      try {
        console.log('Author Layout: Checking authorization')
        setLoading(true)
        
        // Đầu tiên thử lấy từ localStorage trực tiếp
        try {
          if (typeof window !== 'undefined') {
            const { storage } = await import('@/lib/storage')
            const authState = storage.get<{isAuthenticated: boolean, user: any}>('auth_state')
            if (authState?.isAuthenticated && authState?.user) {
              const roleId = authState.user.role?.id
              console.log('Author Layout: Found user in localStorage', { 
                userId: authState.user.id, 
                roleId 
              })
              
              // Role ID 2 is Author, Role ID 1 is Admin
              if (roleId === 2 || roleId === 1) {
                console.log('Author Layout: User is authorized')
                setUser(authState.user)
                setAuthorized(true)
                setLoading(false)
                return
              }
            }
          }
        } catch (localStorageError) {
          console.error('Author Layout: Error reading from localStorage', localStorageError)
        }
        
        // Nếu không lấy được từ localStorage, dùng getCurrentUser API
        const user = await getCurrentUser()
        console.log('Author Layout: User from API', user)
        
        // Role ID 2 is Author, Role ID 1 is Admin
        if (user && (user.role.id === 2 || user.role.id === 1)) {
          console.log('Author Layout: User is authorized', { roleId: user.role.id })
          setUser(user)
          setAuthorized(true)
        } else {
          console.log('Author Layout: User is not authorized', { user })
          // Redirect unauthorized users to home page
          window.location.href = "/"
        }
      } catch (error) {
        console.error("Author Layout: Error checking authorization:", error)
        window.location.href = "/login?from=/author"
      } finally {
        setLoading(false)
      }
    }

    checkAuthorization()
  }, [])

  if (loading) {
    console.log('Author Layout: Showing loading state')
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Đang tải...</p>
        </motion.div>
      </div>
    )
  }

  if (!authorized) {
    console.log('Author Layout: Not authorized, showing access denied')
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

  console.log('Author Layout: Rendering author interface')
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="fixed inset-y-0 z-10 w-64 border-r border-border/40 bg-background">
        <div className="h-full flex flex-col py-4">
          <div className="px-6 py-2">
            <Link href="/" className="text-2xl font-bold text-foreground">
              TinVerse
            </Link>
            <p className="text-sm text-muted-foreground mt-1">
              Quản lý nội dung
            </p>
          </div>
          <Separator className="my-4" />
          <SidebarNav />
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64 w-full">
        <main className="p-6 w-full">{children}</main>
      </div>
    </div>
  )
} 