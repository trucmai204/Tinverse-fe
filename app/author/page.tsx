"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Eye,
  FileText,
  PlusCircle,
  BookOpen,
  FileCheck,
  FileX,
  Check,
  RotateCcw,
  Pencil,
} from "lucide-react";
import { getCurrentUser, searchArticles } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

export default function AuthorDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    unpublished: 0,
    deleted: 0,
  });
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);

        // Get current user
        const userData = await getCurrentUser();
        if (!userData) {
          router.push("/login");
          return;
        }
        setUser(userData);

        // Get all user's articles
        const allArticles = await searchArticles(
          { keyword: "" },
          { page: 1, itemsPerPage: 100 }
        );

        // Filter by current user's articles
        const userArticles = allArticles.items.filter(
          (article) => article.author === userData.name
        );

        // Get published articles
        const published = await searchArticles(
          { keyword: "" },
          { page: 1, itemsPerPage: 100 }
        );
        const userPublished = published.items.filter(
          (article) => article.author === userData.name
        );

        // Get recent articles
        setRecentArticles(userArticles.slice(0, 5));

        // Calculate stats
        setStats({
          total: userArticles.length,
          published: userPublished.length,
          unpublished: userArticles.length - userPublished.length,
          deleted: 0, // Not available from the standard API, could be added later
        });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [router]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Trang tác giả</h1>
        <Button asChild>
          <Link href="/author/articles/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Tạo Bài báo mới
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="recent">Bài báo gần đây</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tổng số Bài báo
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  <div className="text-2xl font-bold">{stats.total}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Đã xuất bản
                </CardTitle>
                <FileCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  <div className="text-2xl font-bold">{stats.published}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Chưa xuất bản
                </CardTitle>
                <FileX className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  <div className="text-2xl font-bold">{stats.unpublished}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đã xóa</CardTitle>
                <FileX className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-7 w-12" />
                ) : (
                  <div className="text-2xl font-bold">{stats.deleted}</div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Bài báo gần đây</CardTitle>
                <CardDescription>
                  {loading
                    ? "Đang tải Bài báo..."
                    : `Bạn có ${stats.total} Bài báo, trong đó ${stats.published} bài đã được xuất bản.`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array(3)
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-12 w-12 rounded-md" />
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                          </div>
                        </div>
                      ))}
                  </div>
                ) : recentArticles.length > 0 ? (
                  <div className="space-y-4">
                    {recentArticles.map((article) => (
                      <div
                        key={article.id}
                        className="flex items-center justify-between space-x-4"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 rounded-md overflow-hidden bg-muted">
                            {article.thumbnailUrl ? (
                              <img
                                src={article.thumbnailUrl}
                                alt={article.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center bg-muted">
                                <FileText className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium leading-none truncate max-w-[300px]">
                              {article.title}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {article.category}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/articles/${article.id}`}>
                              <Eye className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/edit/articles/${article.id}`}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <BookOpen className="h-10 w-10 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Bạn chưa có Bài báo nào.
                    </p>
                    <Button className="mt-4" asChild>
                      <Link href="/author/articles/create">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tạo Bài báo mới
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-5 w-2/3" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : recentArticles.length > 0 ? (
            <div className="space-y-4">
              {recentArticles.map((article) => (
                <Card key={article.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="truncate">
                        {article.title}
                      </CardTitle>
                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mr-2"
                          asChild
                        >
                          <Link href={`/articles/${article.id}`}>
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Xem
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/edit/articles/${article.id}`}>
                            Chỉnh sửa
                          </Link>
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      Danh mục: {article.category} | Cập nhật:{" "}
                      {new Date(article.lastUpdatedTime).toLocaleDateString(
                        "vi-VN"
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-24 rounded-md overflow-hidden bg-muted">
                        {article.thumbnailUrl ? (
                          <img
                            src={article.thumbnailUrl}
                            alt={article.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-muted">
                            <FileText className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {article.summary || "Không có tóm tắt Bài báo."}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground mb-6" />
              <p className="text-xl font-medium mb-2">
                Bạn chưa có Bài báo nào
              </p>
              <p className="text-muted-foreground mb-6">
                Hãy bắt đầu viết bài đầu tiên của bạn!
              </p>
              <Button size="lg" asChild>
                <Link href="/author/articles/create">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Tạo Bài báo mới
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add a new section with feature highlights */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-800 dark:text-green-300 flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              Tạo Bài báo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Tạo và chỉnh sửa Bài báo.
            </p>
            <Button asChild className="w-full" variant="outline">
              <Link href="/author/articles/create">Tạo Bài báo mới</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-blue-800 dark:text-blue-300 flex items-center gap-2">
              <Check className="h-5 w-5" />
              Xuất bản
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Xuất bản hoặc hủy xuất bản Bài báo bất cứ lúc nào.
            </p>
            <Button asChild className="w-full" variant="outline">
              <Link href="/author/articles">Quản lý Bài báo</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Khôi phục
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Xóa và khôi phục Bài báo đã xóa khi cần thiết.
            </p>
            <Button asChild className="w-full" variant="outline">
              <Link href="/author/articles?includeDeleted=true">
                Xem Bài báo đã xóa
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
