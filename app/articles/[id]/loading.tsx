import { Skeleton } from "@/components/ui/skeleton"

export default function ArticleDetailLoading() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      <article className="relative space-y-8">
        {/* Hero skeleton */}
        <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl">
          <Skeleton className="absolute inset-0 h-full w-full" />
        </div>
        
        {/* Header skeleton */}
        <div className="relative z-10 -mt-20 space-y-6 px-4">
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-8 w-32 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
          
          <Skeleton className="h-12 w-full sm:h-16" />
          <Skeleton className="h-8 w-48" />
        </div>
        
        {/* Content skeleton */}
        <div className="rounded-xl border border-border/40 bg-gradient-to-br from-background/80 via-background/60 to-background/80 
          p-6 shadow-lg backdrop-blur-sm sm:p-8 space-y-4">
          <div className="space-y-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-11/12" />
            <Skeleton className="h-5 w-4/5" />
          </div>
          
          <div className="space-y-4 pt-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-11/12" />
            <Skeleton className="h-5 w-3/4" />
          </div>
          
          <div className="space-y-4 pt-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-10/12" />
            <Skeleton className="h-5 w-4/5" />
          </div>
        </div>
      </article>
    </main>
  )
} 