"use client"

import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Article } from "@/lib/types"
import { useEffect, useRef } from "react"
import { BookmarkButton } from "@/components/bookmark-button"

function useMouseGradient(ref: React.MutableRefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      element.style.setProperty("--mouse-x", `${x}px`)
      element.style.setProperty("--mouse-y", `${y}px`)
    }

    element.addEventListener("mousemove", handleMouseMove)
    return () => element.removeEventListener("mousemove", handleMouseMove)
  }, [ref])
}

interface ArticleCardProps {
  article: Article
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    console.error('Invalid date:', dateString)
    return 'Invalid date'
  }
  
  try {
    return formatDistanceToNow(date, { addSuffix: true, locale: vi })
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid date'
  }
}

// Use motion.create instead of motion()
const MotionCard = motion.create(Card)
const MotionLink = motion.create(Link)

export function ArticleCard({ article }: ArticleCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  useMouseGradient(cardRef)

  // Handle the case where category is an object
  const categoryName = typeof article.category === 'object' && article.category !== null
    ? article.category.name
    : article.category

  return (
    <div className="group relative h-full perspective-1000">
      <MotionLink
        href={`/articles/${article.id}`}
        className="block h-full"
        whileHover="hover"
        initial="initial"
        animate="animate"
      >
        <MotionCard
          ref={cardRef}
          className="relative h-full overflow-hidden rounded-xl border border-foreground/10
            bg-gradient-to-br from-background/80 via-background/60 to-background/80
            backdrop-blur-xl backdrop-filter 
            transition-all duration-300 ease-out
            hover:border-primary/30 hover:shadow-[0_0_30px_-12px] hover:shadow-primary/30
            dark:from-background/40 dark:via-background/30 dark:to-background/40
            dark:hover:shadow-primary/20"
          variants={{
            initial: { y: 0, rotateX: 0 },
            hover: { 
              y: -8,
              rotateX: 3,
              transition: { duration: 0.3, ease: "easeOut" }
            },
          }}
        >
          <div className="relative aspect-3/2 overflow-hidden rounded-t-xl">
            <Image
              src={article.thumbnailUrl || '/placeholder-image.jpg'} // Thêm fallback cho ảnh
              alt={article.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority
              onError={(e) => {
                // Xử lý lỗi ảnh
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder-image.jpg';
              }}
            />
            <motion.div 
              className="absolute inset-0 bg-gradient-to-t from-background/40 via-background/20 to-transparent
                transition-opacity duration-300"
              variants={{
                initial: { opacity: 0.6 },
                hover: { opacity: 0.8 }
              }}
            />
          </div>
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <motion.span 
                className="rounded-full border border-primary/20 
                  px-3 py-1 text-primary"
                variants={{
                  initial: { scale: 1 },
                  hover: { scale: 1.05 }
                }}
              >
                {categoryName}
              </motion.span>
              <span>•</span>
              <span className="font-normal">
                {getRelativeTime(article.lastUpdatedTime)}
              </span>
            </div>
            <h3 className="line-clamp-2 bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text 
              font-[Be Vietnam Pro] text-xl font-semibold leading-tight tracking-tight text-transparent
              transition-colors duration-300 group-hover:from-primary group-hover:to-primary/80">
              {article.title}
            </h3>
          </CardHeader>
          <CardContent className="pt-0">
            <motion.div 
              className="flex items-center gap-2"
              variants={{
                initial: { opacity: 0.7 },
                hover: { opacity: 1 }
              }}
            >
              <span className="text-sm font-medium text-muted-foreground">
                Tác giả: <span className="text-foreground/90">{article.author}</span>
              </span>
            </motion.div>
            
            {article.summary && (
              <motion.p 
                className="mt-2 text-sm text-muted-foreground line-clamp-2"
                variants={{
                  initial: { opacity: 0.7 },
                  hover: { opacity: 1 }
                }}
              >
                {article.summary}
              </motion.p>
            )}
          </CardContent>
          <motion.div 
            className="absolute inset-0 rounded-xl ring-1 ring-inset ring-foreground/10"
            variants={{
              initial: { 
                opacity: 0.5,
                background: "radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(var(--primary-rgb)/0.06), transparent 40%)"
              },
              hover: { 
                opacity: 1,
                background: "radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(var(--primary-rgb)/0.1), transparent 40%)"
              }
            }}
          />
        </MotionCard>
      </MotionLink>
      
      {/* Bookmark button (absolute positioned) */}
      <div className="absolute right-2 top-2 z-10">
        <BookmarkButton articleId={article.id} />
      </div>
    </div>
  )
}

export function ArticleCardSkeleton() {
  return (
    <Card className="relative h-full overflow-hidden rounded-xl border border-foreground/10
      bg-gradient-to-br from-background/80 via-background/60 to-background/80
      backdrop-blur-xl backdrop-filter">
      <div className="relative aspect-video overflow-hidden rounded-t-xl">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-muted to-muted/80" />
        <div 
          className="absolute inset-0 bg-gradient-to-t from-background/40 via-background/20 to-transparent
          after:absolute after:inset-0 after:animate-shimmer after:bg-gradient-to-r 
          after:from-transparent after:via-white/10 after:to-transparent"
        />
      </div>
      <CardHeader className="space-y-2">
        <div className="space-y-2">
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="h-4 w-full bg-muted rounded animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="px-4">
        <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-foreground/10" />
      </CardContent>
    </Card>
  )
}
