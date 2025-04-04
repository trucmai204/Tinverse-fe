import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getArticle, isAuthenticated, getCurrentUser } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { BookmarkButton } from "@/components/bookmark-button";

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
  searchParams: Record<string, string | string[] | undefined>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) return { title: "Article Not Found" };

    const article = await getArticle(id);

    return {
      title: article.title,
      description: article.content.substring(0, 160),
    };
  } catch {
    return {
      title: "Article Not Found",
    };
  }
}

export default async function ArticleDetailPage({ params }: PageProps) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) notFound();

    const article = await getArticle(id);
    const authenticated = await isAuthenticated();
    const user = await getCurrentUser();

    function getRelativeTime(dateString: string): string {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";

      try {
        return formatDistanceToNow(date, { addSuffix: true, locale: vi });
      } catch {
        return "Invalid date";
      }
    }

    return (
      <main className="container mx-auto max-w-5xl px-4">
        <article className="relative space-y-8">
          {/* Hero section with image and overlay */}
          <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl">
            <Image
              src={article.thumbnailUrl}
              alt={article.title}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-background/30" />
          </div>

          {/* Article header */}
          <div className="relative z-10 -mt-20 px-4">
            <div className="flex flex-wrap gap-3 sm:items-center">
              <span
                className="rounded-full bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 
                px-4 py-1.5 text-sm font-medium text-primary shadow-sm backdrop-blur-sm"
              >
                {typeof article.category === 'object' && article.category !== null
                  ? article.category.name
                  : article.category}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {getRelativeTime(article.lastUpdatedTime)}
              </span>
            </div>
          </div>

          {/* Article content */}
          <div
            className="rounded-lg border border-border/40 dark:border-white bg-gradient-to-br from-background/80 via-background/60 to-background/80 
            p-4 shadow-xl backdrop-blur-sm sm:p-6 space-y-4"
          >
            <div className="flex items-start justify-between">
              <h1
                className="font-[Be Vietnam Pro] text-4xl font-bold leading-tight tracking-tight
                bg-gradient-to-br from-foreground to-foreground/80 bg-clip-text text-transparent
                sm:text-5xl max-w-[90%]"
              >
                {article.title}
              </h1>
              <BookmarkButton articleId={id} />
            </div>

            <hr className="border-t border-gray-300" />
            <MarkdownRenderer content={article.content} className="mx-auto" />

            <p className="text-sm text-muted-foreground text-right italic">
              By{" "}
              <span className="font-medium text-foreground/90">
                {article.author}
              </span>
            </p>
          </div>
        </article>
      </main>
    );
  } catch {
    notFound();
  }
}
