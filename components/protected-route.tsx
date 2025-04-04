"use client"

import { useEffect, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"

interface ProtectedRouteProps {
  children: ReactNode
}

const authRoutes = ["/login", "/register", "/login-admin"]
const adminRoutes = ["/admin"]
const protectedRoutes = ["/author", "/bookmarks", "/edit"]

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading, user } = useAuth()
  const isAdmin = user?.role?.id === 1
  
  // Debug logging
  useEffect(() => {
    console.log('[ProtectedRoute] Auth state:', {
      pathname,
      isAuthenticated,
      isLoading,
      isAdmin,
      userRole: user?.role,
      isAuthRoute: authRoutes.includes(pathname),
      isAdminRoute: adminRoutes.some(route => pathname.startsWith(route)),
      isProtectedRoute: protectedRoutes.some(route => pathname.startsWith(route))
    })
    if (!isLoading) {
      // If the user is on an auth route (login/register) but is already authenticated, 
      // redirect to home page
      if (isAuthenticated && authRoutes.includes(pathname)) {
        router.push("/")
      }
      
      // If the user is trying to access an admin route but is not an admin,
      // redirect to home page
      if (adminRoutes.some(route => pathname.startsWith(route))) {
        if (!isAuthenticated || !isAdmin) {
          console.log('[ProtectedRoute] Redirecting from admin route - not authorized')
          router.push("/")
        }
      }
      
      // If the user is trying to access a protected route but is not authenticated,
      // redirect to login page
      if (protectedRoutes.some(route => pathname.startsWith(route))) {
        if (!isAuthenticated) {
          console.log('[ProtectedRoute] Redirecting to login - not authenticated')
          router.push("/login")
        }
      }
    }
  }, [isAuthenticated, isLoading, pathname, router, isAdmin])
  
  // Show loading state while redirecting or checking auth
  if (isLoading || 
      (isAuthenticated && authRoutes.includes(pathname)) ||
      (adminRoutes.some(route => pathname.startsWith(route)) && (!isAuthenticated || !isAdmin)) ||
      (protectedRoutes.some(route => pathname.startsWith(route)) && !isAuthenticated)) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">
            {isLoading ? 'Loading...' : 'Redirecting...'}
          </p>
        </motion.div>
      </div>
    )
  }
  
  return <>{children}</>
} 