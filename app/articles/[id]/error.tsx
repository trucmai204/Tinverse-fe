"use client"

import { useEffect } from "react"
import { ErrorDialog } from "@/components/error-dialog"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export default function ArticleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Lỗi Bài báo:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <ErrorDialog 
        title="Không thể tải Bài báo" 
        message="Chúng tôi không thể tải Bài báo này. Bài báo có thể không tồn tại hoặc có vấn đề tạm thời với máy chủ của chúng tôi." 
      />
      
      <div className="mt-6">
        <Button 
          onClick={reset}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Thử lại
        </Button>
      </div>
    </div>
  )
} 