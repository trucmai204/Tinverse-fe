"use client"

import React, { useState, useEffect } from "react"
import { Bookmark, BookmarkCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { addBookmark, removeBookmark } from "@/lib/api"
import { cn } from "@/lib/utils"
import { isAuthenticated } from "@/lib/api"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface BookmarkButtonProps {
  articleId: number
  initialIsBookmarked?: boolean
  className?: string
  variant?: "default" | "ghost" | "outline" | "icon"
  userId?: number
}

export function BookmarkButton({
  articleId,
  initialIsBookmarked = false,
  className,
  variant = "icon",
  userId,
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked || false)
  const [isLoading, setIsLoading] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  
  // Check authentication status on initialization
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        console.log('BookmarkButton: Checking initial state', {
          articleId,
          initialIsBookmarked,
          userId,
          timestamp: new Date().toISOString()
        });

        const authenticated = await isAuthenticated()
        console.log('BookmarkButton: Auth check result', {
          authenticated,
          timestamp: new Date().toISOString()
        });

        if (!authenticated) {
          setIsBookmarked(false)
          return
        }
        
        // Use the initialIsBookmarked prop directly, with fallback to false
        setIsBookmarked(initialIsBookmarked || false)
      } catch (error) {
        console.error('BookmarkButton: Error checking status', {
          articleId,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
        setIsBookmarked(false)
      }
    }
    
    checkAuthStatus()
  }, [articleId, initialIsBookmarked, userId])

  const handleBookmarkToggle = async () => {
    console.log('BookmarkButton: Toggle initiated', {
      articleId,
      currentState: isBookmarked,
      userId,
      timestamp: new Date().toISOString()
    });
    
    setIsLoading(true)
    try {
      // Check if user is authenticated
      const authenticated = await isAuthenticated()
      console.log('BookmarkButton: Auth check for toggle', {
        authenticated,
        timestamp: new Date().toISOString()
      });
      
      if (!authenticated) {
        // Instead of showing login dialog, just show a toast message
        toast.info("Thông báo", {
          description: "Bạn cần đăng nhập để lưu bài viết.",
        })
        setIsLoading(false)
        return
      }

      const previousState = isBookmarked;
      // Optimistic update
      setIsBookmarked(!isBookmarked)
      
      try {
        if (previousState) {
          await removeBookmark(articleId, userId)
          toast.success("Bookmark đã xóa", {
            description: "Bài báo đã được xóa khỏi danh sách bookmark của bạn.",
          })
        } else {
          await addBookmark(articleId, userId)
          toast.success("Đã thêm bookmark", {
            description: "Bài báo đã được lưu vào bookmark của bạn.",
          })
        }
        
        console.log('BookmarkButton: Toggle succeeded', {
          articleId,
          newState: !previousState,
          userId,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        // Rollback on failure
        console.error('BookmarkButton: Toggle failed', {
          articleId,
          error: error instanceof Error ? error.message : 'Unknown error',
          userId,
          timestamp: new Date().toISOString()
        });
        setIsBookmarked(previousState)
        throw error;
      }
    } catch (error) {
      toast.error("Lỗi", {
        description: error instanceof Error ? error.message : "Có lỗi xảy ra khi thao tác bookmark.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {variant === "icon" ? (
        <Button
          variant="ghost"
          size="icon"
          className={cn("group relative", className)}
          onClick={handleBookmarkToggle}
          disabled={isLoading}
          aria-label={isBookmarked ? "Xóa bookmark" : "Thêm bookmark"}
        >
          {isBookmarked ? (
            <BookmarkCheck className="h-5 w-5 text-primary transition-colors" />
          ) : (
            <Bookmark className="h-5 w-5 transition-colors group-hover:text-primary" />
          )}
          <span className="sr-only">{isBookmarked ? "Xóa bookmark" : "Thêm bookmark"}</span>
        </Button>
      ) : (
        <Button
          variant={variant}
          className={cn("gap-2", className)}
          onClick={handleBookmarkToggle}
          disabled={isLoading}
        >
          {isBookmarked ? (
            <BookmarkCheck className="h-4 w-4" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
          {isBookmarked ? "Đã lưu" : "Lưu Bài báo"}
        </Button>
      )}

      <AlertDialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Đăng nhập để sử dụng bookmark</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn cần đăng nhập để có thể lưu Bài báo vào bookmark.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="default"
                onClick={() => {
                  window.location.href = "/login?redirect=" + encodeURIComponent(window.location.pathname)
                }}
              >
                Đăng nhập
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 