"use client"

import { BookmarkCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface BookmarkDialogProps {
  variant?: "default" | "mobile"
  userId?: number
}

export function BookmarkDialog({ variant = "default", userId }: BookmarkDialogProps) {
  const router = useRouter()

  const handleClick = () => {
    if (userId) {
      router.push(`/bookmarks?userId=${userId}`)
    } else {
      router.push("/bookmarks")
    }
  }

  return variant === "default" ? (
    <Button 
      variant="ghost" 
      size="sm"
      className="relative group overflow-hidden"
      onClick={handleClick}
    >
      <BookmarkCheck className="h-4 w-4 mr-2 text-primary" />
      Bài báo đã lưu
      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-full transition-all duration-500" />
    </Button>
  ) : (
    <div className="flex items-center w-full cursor-pointer" onClick={handleClick}>
      <BookmarkCheck className="h-4 w-4 mr-2 text-primary" />
      <span>Bài báo đã lưu</span>
    </div>
  )
} 