import { Metadata } from "next"
import { getBookmarkedArticles, getCurrentUser } from "@/lib/api"
import { ArticleCard, ArticleCardSkeleton } from "@/components/article-card"
import { Suspense } from "react"
import { PaginationWrapper } from "@/components/pagination-wrapper"

export const metadata: Metadata = {
  title: "Bookmarks | TinVerse",
  description: "Xem danh sách các Bài báo bạn đã lưu vào bookmark",
}

interface BookmarksPageProps {
  searchParams: {
    page?: string
    itemsPerPage?: string
    userId?: string
  }
}

export default async function BookmarksPage({
  searchParams,
}: BookmarksPageProps) {
  // Extract and provide default values
  const page = searchParams?.page || "1"
  const itemsPerPage = searchParams?.itemsPerPage || "9"
  const userId = searchParams?.userId ? parseInt(searchParams.userId) : undefined
  
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-2">
        <h1 className="font-[Be Vietnam Pro] text-4xl font-bold tracking-tight">
          Bookmark của bạn
        </h1>
        <p className="text-muted-foreground">
          Danh sách các Bài báo bạn đã lưu để đọc sau
        </p>
      </div>

      <Suspense fallback={<BookmarkedArticlesLoading />}>
        <BookmarkedArticles 
          page={parseInt(page)} 
          itemsPerPage={parseInt(itemsPerPage)} 
          userId={userId}
        />
      </Suspense>
    </main>
  )
}

async function BookmarkedArticles({ 
  page, 
  itemsPerPage,
  userId
}: { 
  page: number; 
  itemsPerPage: number;
  userId?: number;
}) {
  try {
    // Get current user if userId is not provided
    let user = null;
    
    if (userId) {
      user = { id: userId };
    } else {
      user = await getCurrentUser();
    }
    
    if (!user) {
      return (
        <div className="my-16 flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold">Bạn chưa đăng nhập</h2>
          <p className="mt-2 text-muted-foreground">
            Vui lòng đăng nhập để xem danh sách bookmark của bạn
          </p>
        </div>
      );
    }
    
    const { items: articles, totalPages, currentPage, totalItems } = await getBookmarkedArticles({
      page,
      itemsPerPage,
    }, user.id);
    
    console.log('Bookmarked articles:', {
      count: articles.length,
      userId: user.id,
      page,
      itemsPerPage
    });

    if (!articles.length) {
      return (
        <div className="my-16 flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-semibold">Bạn chưa có Bài báo nào trong bookmark</h2>
          <p className="mt-2 text-muted-foreground">
            Hãy lưu các Bài báo để đọc sau bằng cách nhấn vào nút bookmark ở trang chi tiết Bài báo
          </p>
        </div>
      )
    }

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
      <>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
        
        <div className="mt-6 mb-4 text-sm text-muted-foreground text-center">
          Hiển thị {startItem}-{endItem} trong tổng số {totalItems} Bài báo
        </div>

        <PaginationWrapper 
          className="my-4" 
          currentPage={currentPage} 
          totalPages={totalPages} 
        />
      </>
    )
  } catch (error) {
    console.error('Error fetching bookmarked articles:', error)
    return (
      <div className="my-16 text-center">
        <h2 className="text-xl font-semibold text-destructive">Có lỗi xảy ra</h2>
        <p className="text-muted-foreground">
          {error instanceof Error ? error.message : "Không thể tải danh sách bookmark"}
        </p>
      </div>
    )
  }
}

function BookmarkedArticlesLoading() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <ArticleCardSkeleton key={i} />
      ))}
    </div>
  )
} 