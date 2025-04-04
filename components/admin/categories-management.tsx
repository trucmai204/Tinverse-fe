"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { motion } from 'framer-motion'
import { 
  FileEdit, 
  FolderPlus, 
  Loader2, 
  MoreHorizontal, 
  RefreshCw, 
  Trash, 
  Undo2, 
  Search 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { getCategories, createCategory, deleteCategory, undeleteCategory, updateCategory } from '@/lib/api'

interface Category {
  Id: number
  Name: string
  Description: string
  CreatedTime: string
  IsDeleted?: boolean
}

export function CategoriesManagement() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleted, setShowDeleted] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Dialogs state
  const [addCategoryDialog, setAddCategoryDialog] = useState(false)
  const [updateCategoryDialog, setUpdateCategoryDialog] = useState(false)
  const [deleteCategoryDialog, setDeleteCategoryDialog] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null)
  const [categoryToUpdate, setCategoryToUpdate] = useState<Category | null>(null)
  
  // Form state
  const [categoryName, setCategoryName] = useState('')
  const [categoryDescription, setCategoryDescription] = useState('')
  
  // Add Category Form
  const resetCategoryForm = () => {
    setCategoryName('')
    setCategoryDescription('')
  }
  
  const fetchCategories = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // We'll use the standard getCategories function, which might need to be enhanced
      // to include deleted categories for admin view
      const data = await getCategories()
      // Convert to expected format if needed
      const formattedCategories = data.map(cat => ({
        Id: cat.id,
        Name: cat.name,
        Description: cat.description || '',
        CreatedTime: new Date().toISOString(), // This might need to be adjusted
        IsDeleted: false // This might need to be gotten from elsewhere
      }))
      setCategories(formattedCategories)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh mục. Vui lòng thử lại.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  
  const handleAddCategory = async () => {
    if (!categoryName) return
    
    try {
      await createCategory({
        Name: categoryName,
        Description: categoryDescription
      })
      
      fetchCategories()
      setAddCategoryDialog(false)
      resetCategoryForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tạo danh mục. Vui lòng thử lại.')
      console.error(err)
    }
  }
  
  const handleUpdateCategory = async () => {
    if (!categoryToUpdate || !categoryName) return
    
    try {
      await updateCategory(categoryToUpdate.Id, {
        Name: categoryName,
        Description: categoryDescription
      })
      
      fetchCategories()
      setUpdateCategoryDialog(false)
      setCategoryToUpdate(null)
      resetCategoryForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi cập nhật danh mục. Vui lòng thử lại.')
      console.error(err)
    }
  }
  
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return
    
    try {
      await deleteCategory(categoryToDelete)
      
      fetchCategories()
      setDeleteCategoryDialog(false)
      setCategoryToDelete(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi xóa danh mục. Vui lòng thử lại.')
      console.error(err)
    }
  }
  
  const handleUndeleteCategory = async (id: number) => {
    try {
      await undeleteCategory(id)
      
      fetchCategories()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khôi phục danh mục. Vui lòng thử lại.')
      console.error(err)
    }
  }
  
  useEffect(() => {
    fetchCategories()
  }, [])
  
  const openUpdateCategoryDialog = (category: Category) => {
    setCategoryToUpdate(category)
    setCategoryName(category.Name)
    setCategoryDescription(category.Description || '')
    setUpdateCategoryDialog(true)
  }

  // Filter categories based on search term
  const filteredCategories = categories
    .filter(category => 
      category.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.Description && category.Description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(category => showDeleted ? true : !category.IsDeleted)
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="bg-destructive/10 p-6 rounded-lg text-destructive">
        <p>{error}</p>
        <Button onClick={fetchCategories} variant="outline" size="sm" className="mt-3">
          Thử lại
        </Button>
      </div>
    )
  }
  
  return (
    <>
      <Card className="overflow-hidden border-border/40 shadow-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Tìm kiếm danh mục..." 
                  className="pl-9 w-full sm:w-auto max-w-xs" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex items-center gap-1.5"
                  onClick={() => setShowDeleted(!showDeleted)}
                >
                  {showDeleted ? (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      <span className="sm:inline hidden">Ẩn đã xóa</span>
                    </>
                  ) : (
                    <>
                      <Undo2 className="h-4 w-4" />
                      <span className="sm:inline hidden">Hiện đã xóa</span>
                    </>
                  )}
                </Button>
                <Button
                  variant="default"
                  className="flex items-center gap-1.5"
                  onClick={() => {
                    resetCategoryForm()
                    setAddCategoryDialog(true)
                  }}
                >
                  <FolderPlus className="h-4 w-4" />
                  <span className="sm:inline hidden">Thêm mới</span>
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/40 border-b">
                  <th className="text-left py-3 px-4 font-medium">ID</th>
                  <th className="text-left py-3 px-4 font-medium">Tên danh mục</th>
                  <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Mô tả</th>
                  <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Ngày tạo</th>
                  <th className="text-right py-3 px-4 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">
                      {searchTerm 
                        ? 'Không tìm thấy danh mục nào phù hợp với tìm kiếm.' 
                        : 'Không có danh mục nào.'}
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
                    <motion.tr
                      key={category.Id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`border-b hover:bg-muted/20 ${
                        category.IsDeleted ? 'bg-muted/10 text-muted-foreground' : ''
                      }`}
                    >
                      <td className="py-3 px-4">{category.Id}</td>
                      <td className="py-3 px-4 font-medium">
                        {category.Name}
                        {category.IsDeleted && (
                          <span className="ml-2 text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded">
                            Đã xóa
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        {category.Description || '-'}
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell">
                        {new Date(category.CreatedTime).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Mở menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuLabel>Tùy chọn</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            {category.IsDeleted ? (
                              <DropdownMenuItem 
                                onClick={() => handleUndeleteCategory(category.Id)}
                                className="cursor-pointer"
                              >
                                <Undo2 className="h-4 w-4 mr-2" />
                                <span>Khôi phục</span>
                              </DropdownMenuItem>
                            ) : (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => openUpdateCategoryDialog(category)}
                                  className="cursor-pointer"
                                >
                                  <FileEdit className="h-4 w-4 mr-2" />
                                  <span>Chỉnh sửa</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => {
                                    setCategoryToDelete(category.Id)
                                    setDeleteCategoryDialog(true)
                                  }}
                                  className="cursor-pointer text-destructive"
                                >
                                  <Trash className="h-4 w-4 mr-2" />
                                  <span>Xóa danh mục</span>
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Add Category Dialog */}
      <Dialog open={addCategoryDialog} onOpenChange={setAddCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm danh mục mới</DialogTitle>
            <DialogDescription>
              Tạo danh mục mới để phân loại nội dung
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Tên danh mục
              </label>
              <Input
                id="name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Nhập tên danh mục"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Mô tả (Tùy chọn)
              </label>
              <Textarea
                id="description"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                placeholder="Nhập mô tả danh mục"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCategoryDialog(false)}>
              Hủy bỏ
            </Button>
            <Button onClick={handleAddCategory} disabled={!categoryName.trim()}>
              Tạo danh mục
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Update Category Dialog */}
      <Dialog open={updateCategoryDialog} onOpenChange={setUpdateCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật danh mục</DialogTitle>
            <DialogDescription>
              Chỉnh sửa thông tin của danh mục này
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name-edit" className="text-sm font-medium">
                Tên danh mục
              </label>
              <Input
                id="name-edit"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Nhập tên danh mục"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description-edit" className="text-sm font-medium">
                Mô tả (Tùy chọn)
              </label>
              <Textarea
                id="description-edit"
                value={categoryDescription}
                onChange={(e) => setCategoryDescription(e.target.value)}
                placeholder="Nhập mô tả danh mục"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateCategoryDialog(false)}>
              Hủy bỏ
            </Button>
            <Button onClick={handleUpdateCategory} disabled={!categoryName.trim()}>
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Category Dialog */}
      <AlertDialog open={deleteCategoryDialog} onOpenChange={setDeleteCategoryDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa danh mục</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa danh mục này? 
              Các Bài báo trong danh mục này sẽ không còn được gán với danh mục này nữa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCategory}
              className="bg-destructive hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 