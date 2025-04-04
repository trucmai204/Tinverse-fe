"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MoreHorizontal, Pencil, Trash, Eye, RotateCcw, Check, X, ImageIcon, PlusCircle } from "lucide-react"
import { Pagination } from "@/components/ui/pagination"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { deleteArticle, getCategories, getCurrentUser, publishArticle, searchAuthorArticles, undeleteArticle, unpublishArticle } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"

export function ArticlesTable() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const [includeUnpublished, setIncludeUnpublished] = useState(false)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState<any>(null)
  const [actionType, setActionType] = useState<"publish" | "unpublish" | "delete" | "undelete" | null>(null)
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()
  
  // Function to safely format dates
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return null;
      }
      
      return formatDistanceToNow(date, { addSuffix: true, locale: vi });
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return null;
    }
  };

  // Get current user
  useEffect(() => {
    const getUserData = async () => {
      try {
        const user = await getCurrentUser();
        console.log("Current user from storage:", user);
        setCurrentUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    getUserData();
  }, []);

  // Load articles
  useEffect(() => {
    const fetchArticles = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);

        console.log("Fetching articles with params:", {
          searchTerm,
          currentPage,
          selectedCategory,
          includeDeleted,
          includeUnpublished
        });

        // Use the centralized API function
        const response = await searchAuthorArticles({
          searchTerm,
          page: currentPage,
          itemsPerPage: 10,
          categoryId: selectedCategory,
          includeDeleted,
          includeUnpublished
        });
        
        console.log("Articles response:", response);

        setArticles(response.items || []);
        setTotalItems(response.totalItems || 0);
        setTotalPages(response.totalPages || 1);
        setCurrentPage(response.currentPage || 1);
      } catch (error) {
        console.error("Error fetching articles:", error);
        toast.error("Không thể tải danh sách Bài báo");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [
    currentPage,
    searchTerm,
    selectedCategory,
    includeDeleted,
    includeUnpublished,
    currentUser,
  ]);
  
  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (error) {
        console.error("Error fetching categories:", error)
      }
    }
    
    fetchCategories()
  }, [])
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Reset to page 1 when searching
    setCurrentPage(1)
  }
  
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === "all" ? null : value)
    // Reset to page 1 when changing category
    setCurrentPage(1)
  }
  
  const handleEditArticle = (articleId: number) => {
    router.push(`/edit/articles/${articleId}`)
  }
  
  const handleViewArticle = (articleId: number) => {
    router.push(`/articles/${articleId}`)
  }
  
  const openDeleteDialog = (article: any) => {
    setSelectedArticle(article)
    setActionType("delete")
    setActionDialogOpen(true)
  }
  
  const openUndeleteDialog = (article: any) => {
    setSelectedArticle(article)
    setActionType("undelete")
    setActionDialogOpen(true)
  }
  
  const openPublishDialog = (article: any) => {
    setSelectedArticle(article)
    setActionType("publish")
    setActionDialogOpen(true)
  }
  
  const openUnpublishDialog = (article: any) => {
    setSelectedArticle(article)
    setActionType("unpublish")
    setActionDialogOpen(true)
  }

  const handleArticleAction = async () => {
    if (!selectedArticle) return;

    try {
      switch (actionType) {
        case "delete":
          await deleteArticle(selectedArticle.Id);
          toast.success("Đã xóa Bài báo thành công");
          break;
        case "undelete":
          await undeleteArticle(selectedArticle.Id);
          toast.success("Đã khôi phục Bài báo thành công");
          break;
        case "publish":
          await publishArticle(selectedArticle.Id);
          toast.success("Đã xuất bản Bài báo thành công");
          break;
        case "unpublish":
          await unpublishArticle(selectedArticle.Id);
          toast.success("Đã hủy xuất bản Bài báo thành công");
          break;
      }

      // Refresh articles after action
      if (currentUser) {
        const response = await searchAuthorArticles({
          searchTerm,
          page: currentPage,
          itemsPerPage: 10,
          categoryId: selectedCategory,
          includeDeleted,
          includeUnpublished
        });
        
        setArticles(response.items || []);
        setTotalItems(response.totalItems || 0);
        setTotalPages(response.totalPages || 1);
      }
    } catch (error) {
      console.error(`Error ${actionType} article:`, error);
      toast.error(
        `Không thể ${getActionText(actionType).toLowerCase()} Bài báo`
      );
    } finally {
      setActionDialogOpen(false);
      setSelectedArticle(null);
      setActionType(null);
    }
  };
  
  const getActionText = (action: "publish" | "unpublish" | "delete" | "undelete" | null) => {
    switch (action) {
      case "delete": return "Xóa"
      case "undelete": return "Khôi phục"
      case "publish": return "Xuất bản"
      case "unpublish": return "Hủy xuất bản"
      default: return ""
    }
  }
  
  const getActionIcon = (action: "publish" | "unpublish" | "delete" | "undelete" | null) => {
    switch (action) {
      case "delete": return <Trash className="h-4 w-4 mr-2 text-destructive" />
      case "undelete": return <RotateCcw className="h-4 w-4 mr-2 text-blue-500" />
      case "publish": return <Check className="h-4 w-4 mr-2 text-green-500" />
      case "unpublish": return <X className="h-4 w-4 mr-2 text-amber-500" />
      default: return null
    }
  }
  
  const getArticleStatus = (article: any) => {
    if (article.IsDeleted) {
      return <Badge variant="destructive">Đã xóa</Badge>
    } else if (!article.IsPublished) {
      return <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900 border-amber-200 dark:border-amber-800">Chưa xuất bản</Badge>
    } else {
      return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900 border-green-200 dark:border-green-800">Đã xuất bản</Badge>
    }
  }

  const getArticleThumbnail = (article: any) => {
    return article.ThumbnailUrl || article.ThumbnailUrl;
  }
  
  const getArticleTitle = (article: any) => {
    return article.Title || "Untitled Article";
  }
  
  const getArticleCategory = (article: any) => {
    return article.Category || "Uncategorized";
  }
  
  const getArticleId = (article: any) => {
    return article.Id;
  }
  
  const getArticleUpdateTime = (article: any) => {
    // Try different date fields in priority order
    if (article.LastUpdatedTime && formatDate(article.LastUpdatedTime)) {
      return formatDate(article.LastUpdatedTime);
    } else if (article.createdAt && formatDate(article.createdAt)) {
      return formatDate(article.createdAt);
    } else {
      return null;
    }
  }

  return (
    <Card>
      <CardContent>
        <div className="mb-6 space-y-4">
          <form onSubmit={handleSearch} className="flex space-x-3">
            <Input
              placeholder="Tìm kiếm Bài báo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-xl"
            />
            <Button type="submit">Tìm kiếm</Button>
          </form>
          
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Select value={selectedCategory || "all"} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeDeleted"
                checked={includeDeleted}
                onCheckedChange={(value) => setIncludeDeleted(!!value)}
              />
              <label
                htmlFor="includeDeleted"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Hiển thị Bài báo đã xóa
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeUnpublished"
                checked={includeUnpublished}
                onCheckedChange={(value) => setIncludeUnpublished(!!value)}
              />
              <label
                htmlFor="includeUnpublished"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Hiển thị Bài báo chưa xuất bản
              </label>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="rounded-md border px-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Hình ảnh</TableHead>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Cập nhật</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center py-4">
                          <p className="text-muted-foreground">
                            {loading ? "Đang tải..." : "Không có Bài báo nào"}
                          </p>
                          {!loading && (
                            <pre className="text-xs text-muted-foreground mt-2">
                              Đã tìm kiếm với: {searchTerm || "(trống)"}, 
                              Danh mục: {selectedCategory || "tất cả"}, 
                              Hiển thị đã xóa: {includeDeleted ? "có" : "không"}, 
                              Hiển thị chưa xuất bản: {includeUnpublished ? "có" : "không"}
                            </pre>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    articles.map((article) => (
                      <TableRow key={article.Id}>
                        <TableCell>
                          <div 
                            className="h-12 w-16 rounded overflow-hidden border cursor-pointer relative bg-muted"
                            onClick={() => setPreviewImageUrl(article.ThumbnailUrl || "")}
                          >
                            {article.ThumbnailUrl ? (
                              <img
                                src={article.ThumbnailUrl}
                                alt={article.Title || "Article thumbnail"}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  // Replace with fallback image
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (e.target as HTMLImageElement).parentElement!.classList.add('flex', 'items-center', 'justify-center');
                                  const icon = document.createElement('div');
                                  icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-image h-6 w-6 opacity-50"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                                  (e.target as HTMLImageElement).parentElement!.appendChild(icon);
                                }}
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <ImageIcon className="h-6 w-6 opacity-50" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black opacity-0 hover:opacity-20 transition-opacity duration-200"></div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium truncate max-w-[300px]" title={article.Title || ""}>
                            {article.Title || "Untitled Article"}
                          </div>
                        </TableCell>
                        <TableCell>{article.Category || "Uncategorized"}</TableCell>
                        <TableCell>{getArticleStatus(article)}</TableCell>
                        <TableCell>
                          {article.LastUpdatedTime &&
                          formatDate(article.LastUpdatedTime) ? (
                            <span
                              title={new Date(
                                article.LastUpdatedTime
                              ).toLocaleString()}
                            >
                              {formatDate(article.LastUpdatedTime)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              Không có thông tin
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Mở menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleViewArticle(article.Id)} className="flex items-center">
                                <Eye className="mr-2 h-4 w-4" /> Xem Bài báo
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditArticle(article.Id)} className="flex items-center">
                                <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {!article.IsDeleted && (
                                <>
                                  {article.IsPublished ? (
                                    <DropdownMenuItem 
                                      onClick={() => openUnpublishDialog(article)}
                                      className="flex items-center text-amber-600 dark:text-amber-400"
                                    >
                                      <X className="mr-2 h-4 w-4" /> Hủy xuất bản
                                    </DropdownMenuItem>
                                  ) : (
                                    <DropdownMenuItem 
                                      onClick={() => openPublishDialog(article)}
                                      className="flex items-center text-green-600 dark:text-green-400"
                                    >
                                      <Check className="mr-2 h-4 w-4" /> Xuất bản
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem 
                                    onClick={() => openDeleteDialog(article)}
                                    className="flex items-center text-destructive focus:text-destructive"
                                  >
                                    <Trash className="mr-2 h-4 w-4" /> Xóa Bài báo
                                  </DropdownMenuItem>
                                </>
                              )}
                              {article.IsDeleted && (
                                <DropdownMenuItem 
                                  onClick={() => openUndeleteDialog(article)}
                                  className="flex items-center text-blue-600 dark:text-blue-400"
                                >
                                  <RotateCcw className="mr-2 h-4 w-4" /> Khôi phục
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {totalPages > 1 && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  className="justify-center"
                />
                <div className="text-sm text-muted-foreground text-center mt-2">
                  Hiển thị {articles.length} / {totalItems} Bài báo
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
      
      {/* Action Confirmation Dialog */}
      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              {getActionIcon(actionType)}
              {getActionText(actionType)} Bài báo
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "delete" && "Bài báo sẽ bị xóa khỏi hệ thống, nhưng vẫn có thể được khôi phục sau này."}
              {actionType === "undelete" && "Bài báo sẽ được khôi phục và chuyển về trạng thái chưa xuất bản."}
              {actionType === "publish" && "Bài báo sẽ được xuất bản và hiển thị cho người dùng."}
              {actionType === "unpublish" && "Bài báo sẽ bị ẩn khỏi người dùng, nhưng vẫn có thể được xuất bản lại sau này."}
            </AlertDialogDescription>
            {selectedArticle && (
              <div className="mt-2 p-3 bg-muted rounded-md">
                <p className="font-medium">{selectedArticle.Title}</p>
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleArticleAction}
              className={
                actionType === "delete" 
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" 
                  : actionType === "undelete"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : actionType === "publish"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-amber-600 text-white hover:bg-amber-700"
              }
            >
              {getActionText(actionType)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Image Preview Dialog */}
      <Dialog open={!!previewImageUrl} onOpenChange={() => setPreviewImageUrl(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Xem ảnh Bài báo</DialogTitle>
            <DialogDescription>
              Ảnh thu nhỏ của Bài báo
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-hidden rounded-md border">
            {previewImageUrl ? (
              <img 
                src={previewImageUrl} 
                alt="Thumbnail preview" 
                className="w-full h-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const container = (e.target as HTMLImageElement).parentElement!;
                  container.classList.add('flex', 'items-center', 'justify-center', 'h-[400px]', 'bg-muted');
                  
                  const errorElement = document.createElement('div');
                  errorElement.className = 'text-center p-4';
                  errorElement.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mx-auto mb-4 opacity-50"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                    <p class="text-base font-medium">Không thể tải hình ảnh</p>
                    <p class="text-sm text-muted-foreground mt-1">URL ảnh không hợp lệ hoặc bị lỗi</p>
                    <p class="text-xs text-muted-foreground mt-4 break-all">${previewImageUrl}</p>
                  `;
                  container.appendChild(errorElement);
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-[400px] bg-muted">
                <ImageIcon className="h-16 w-16 opacity-30" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewImageUrl(null)}>
              Đóng
            </Button>
            {previewImageUrl && (
              <Button asChild>
                <a href={previewImageUrl} target="_blank" rel="noopener noreferrer">
                  Xem ảnh gốc
                </a>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
} 