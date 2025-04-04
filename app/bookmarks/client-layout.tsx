"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"

interface BookmarksClientLayoutProps {
  children: React.ReactNode
  userId?: number
}

export function BookmarksClientLayout({
  children,
  userId,
}: BookmarksClientLayoutProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAuth()
  const [isAuthorized, setIsAuthorized] = useState(true) // Default to true to allow access
  
  useEffect(() => {
    // No need to check authentication, just set authorized to true
    if (!isLoading) {
      setIsAuthorized(true)
    }
  }, [isLoading])

  if (isLoading) {
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
  
  // If userId is provided, pass it to children
  if (userId) {
    return (
      <div data-user-id={userId}>
        {children}
      </div>
    )
  }
  
  return <>{children}</>
} 