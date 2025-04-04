"use client"

import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ErrorDialogProps {
  title?: string
  message?: string
}

export function ErrorDialog({ 
  title = "Đã xảy ra lỗi", 
  message = "Đã xảy ra lỗi khi tải nội dung. Vui lòng thử lại sau."
}: ErrorDialogProps) {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="relative w-full max-w-md mx-auto rounded-xl overflow-hidden">
        {/* Background gradient effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-md" />
        <div className="absolute inset-0 bg-gradient-to-r from-destructive/5 via-destructive/10 to-destructive/5" />
        
        {/* Border glow effect */}
        <div className="absolute inset-0 rounded-xl border border-destructive/30 shadow-[0_0_15px_rgba(0,0,0,0.1)]" />
        
        {/* Content */}
        <div className="relative z-10 p-8 flex flex-col items-center text-center space-y-6">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-foreground">
              {title}
            </h2>
            
            <p className="text-muted-foreground">
              {message}
            </p>
          </div>
          
          <div className="pt-4">
            <Button asChild className="relative overflow-hidden group px-6">
              <Link href="/">
                <span className="relative z-10">Trở về trang chủ</span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-1000" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 