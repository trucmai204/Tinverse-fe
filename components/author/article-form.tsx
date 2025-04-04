"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, ImageIcon, AlertTriangle, Eye, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { getCategories, updateArticle, createArticle } from "@/lib/api"
import { Category } from "@/lib/types"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import axios from "axios"
import { motion } from "framer-motion"

const formSchema = z.object({
  Title: z.string().min(10, "Tiêu đề phải có ít nhất 10 ký tự"),
  Content: z.string().min(50, "Nội dung phải có ít nhất 50 ký tự"),
  ThumbnailUrl: z.string().url("URL hình ảnh không hợp lệ"),
  CategoryId: z.string().min(1, "Vui lòng chọn danh mục"),
})

interface AuthorArticleFormProps {
  articleId?: number
  initialData?: {
    title: string
    content: string
    thumbnailUrl: string
    category: string
    categoryId?: number
  }
  returnPath?: string
  isCreate?: boolean
}

export function AuthorArticleForm({ articleId, initialData, returnPath, isCreate = false }: AuthorArticleFormProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [categoryLoading, setCategoryLoading] = useState(true)
  const [formChanged, setFormChanged] = useState(false)
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit")
  const router = useRouter()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      Title: initialData?.title || "",
      Content: initialData?.content || "",
      ThumbnailUrl: initialData?.thumbnailUrl || "https://placehold.co/800x400.jpg",
      CategoryId: initialData?.categoryId ? initialData.categoryId.toString() : "",
    },
  })
  
  // Watch form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      setFormChanged(true)
    })
    return () => subscription.unsubscribe()
  }, [form])
  
  // Handle back button and navigation
  const handleCancel = () => {
    if (formChanged) {
      setShowDiscardDialog(true)
    } else {
      router.push(returnPath || (isCreate ? "/author/articles" : `/articles/${articleId}`))
    }
  }
  
  // Load categories directly from API
  const fetchCategories = useCallback(async () => {
    try {
      setCategoryLoading(true)
      // Direct API call to get categories
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "https://localhost:5001/api"}/Categories`, {
        httpsAgent: new (require('https').Agent)({
          rejectUnauthorized: false
        })
      })
      
      const categories = response.data.map((cat: any) => ({
        id: cat.Id,
        name: cat.Name
      }))
      
      setCategories(categories)
      
      // Set initial category if provided
      if (initialData?.categoryId && initialData.categoryId > 0) {
        form.setValue("CategoryId", initialData.categoryId.toString())
      }
      // Otherwise try to find matching category by name
      else if (initialData?.category && categories.length > 0) {
        const category = categories.find(c => c.name === initialData.category)
        if (category) {
          form.setValue("CategoryId", category.id.toString())
        }
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error("Không thể tải danh mục Bài báo")
      // Fallback to getCategories API if direct call fails
      try {
        const data = await getCategories()
        setCategories(data)
        
        if (initialData?.categoryId && initialData.categoryId > 0) {
          form.setValue("CategoryId", initialData.categoryId.toString())
        } else if (initialData?.category && data.length > 0) {
          const category = data.find(c => c.name === initialData.category)
          if (category) {
            form.setValue("CategoryId", category.id.toString())
          }
        }
      } catch (secondError) {
        console.error("Fallback category fetch failed:", secondError)
      }
    } finally {
      setCategoryLoading(false)
    }
  }, [initialData, form])
  
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)
    
    try {
      if (isCreate) {
        // Creating a new article
        const result = await createArticle({
          Title: values.Title,
          Content: values.Content,
          ThumbnailUrl: values.ThumbnailUrl,
          CategoryId: parseInt(values.CategoryId),
        })
        
        toast.success("Bài báo mới đã được tạo")
        setFormChanged(false)
        
        // Redirect to article page or the specified returnPath
        router.push(returnPath || `/articles/${result.id}`)
      } else if (articleId) {
        // Updating an existing article
        await updateArticle(articleId, {
          Title: values.Title,
          Content: values.Content,
          ThumbnailUrl: values.ThumbnailUrl,
          CategoryId: parseInt(values.CategoryId),
        })
        
        toast.success("Bài báo đã được cập nhật")
        setFormChanged(false)
        
        // Redirect to the returnPath or to the article page
        router.push(returnPath || `/articles/${articleId}`)
      } else {
        toast.error("Thiếu thông tin cần thiết để lưu Bài báo")
      }
    } catch (error) {
      console.error("Error saving article:", error)
      toast.error(error instanceof Error ? error.message : "Không thể lưu Bài báo")
    } finally {
      setIsLoading(false)
    }
  }
  
  // Track thumbnail URL to handle image loading errors
  const thumbnailUrl = form.watch("ThumbnailUrl")
  
  // Track content for preview
  const contentValue = form.watch("Content")
  const titleValue = form.watch("Title")
  
  return (
    <>
      <Card className="border shadow-sm">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="Title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề Bài báo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tiêu đề Bài báo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="CategoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Danh mục</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className={categoryLoading ? "opacity-70" : ""}>
                          {categoryLoading ? (
                            <div className="flex items-center">
                              <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                              <span>Đang tải danh mục...</span>
                            </div>
                          ) : (
                            <SelectValue placeholder="Chọn danh mục" />
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="ThumbnailUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hình ảnh</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="URL hình ảnh cho Bài báo" 
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          setImgError(false)
                        }} 
                      />
                    </FormControl>
                    <FormMessage />
                    <div className="mt-3 rounded-md overflow-hidden h-48 relative border">
                      {field.value ? (
                        <>
                          <img 
                            src={field.value}
                            alt="Thumbnail preview"
                            className={`w-full h-full object-cover transition-opacity duration-300 ${imgError ? 'opacity-0' : 'opacity-100'}`}
                            onError={() => setImgError(true)}
                          />
                          {imgError && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted text-muted-foreground p-4 text-center">
                              <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
                              <p>Không thể tải hình ảnh. Vui lòng kiểm tra URL.</p>
                              <p className="text-sm mt-2 text-destructive">URL không hợp lệ hoặc ảnh không tồn tại</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
                          <ImageIcon className="h-10 w-10 opacity-50" />
                        </div>
                      )}
                    </div>
                  </FormItem>
                )}
              />
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <FormLabel>Nội dung</FormLabel>
                  <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "edit" | "preview")} className="w-auto">
                    <TabsList className="grid w-[200px] grid-cols-2">
                      <TabsTrigger value="edit" className="flex items-center gap-1">
                        <Edit className="h-4 w-4" />
                        <span>Chỉnh sửa</span>
                      </TabsTrigger>
                      <TabsTrigger value="preview" className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>Xem trước</span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                <FormField
                  control={form.control}
                  name="Content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        {activeTab === "edit" ? (
                          <Textarea
                            placeholder="Nội dung Bài báo (hỗ trợ Markdown)"
                            className="min-h-[400px] font-mono"
                            {...field}
                          />
                        ) : (
                          <div className="min-h-[400px] border rounded-md p-4 overflow-y-auto bg-card">
                            <div className="mb-5">
                              <h1 className="text-2xl font-bold">{titleValue || "Tiêu đề Bài báo"}</h1>
                            </div>
                            {contentValue ? (
                              <MarkdownRenderer content={contentValue} />
                            ) : (
                              <div className="text-muted-foreground italic">
                                Chưa có nội dung để xem trước. Vui lòng nhập nội dung vào tab chỉnh sửa.
                              </div>
                            )}
                          </div>
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {formChanged && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 p-3 rounded-md border border-amber-200 dark:border-amber-800 flex items-start gap-2"
                >
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-sm">
                    Bài báo có thay đổi chưa được lưu. Nhấn "{isCreate ? 'Tạo Bài báo' : 'Lưu Bài báo'}" để {isCreate ? 'tạo' : 'cập nhật'} Bài báo.
                  </span>
                </motion.div>
              )}
              
              <div className="flex justify-end pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="mr-2"
                  onClick={handleCancel}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang {isCreate ? 'tạo' : 'lưu'}...
                    </>
                  ) : isCreate ? (
                    "Tạo Bài báo"
                  ) : (
                    "Lưu Bài báo"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hủy thay đổi?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có thay đổi chưa được lưu. Nếu rời khỏi trang này, những thay đổi đó sẽ bị mất.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tiếp tục chỉnh sửa</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push(returnPath || (isCreate ? "/author/articles" : `/articles/${articleId}`))}>
              Hủy thay đổi
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 