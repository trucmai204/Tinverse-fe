"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { motion } from 'framer-motion'
import { Check, Loader2, MoreHorizontal, Trash, UserCog, UserPlus, RefreshCw, Search, Undo } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { getAllUsers, deleteUsers, updateUserRole, undeleteUsers } from '@/lib/api'

interface Role {
  RoleId: number;
  Name: string;
}

interface AdminUser {
  Id: number;
  Name: string;
  Email: string;
  PhoneNumber: string | null;
  Role: Role;
  CreatedTime: string;
  LastModifiedTime: string;
  IsDeleted?: boolean;
}

export function UsersManagement() {
  const { user } = useAuth()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDeleted, setShowDeleted] = useState(false)
  
  // Dialogs state
  const [deleteUsersDialog, setDeleteUsersDialog] = useState(false)
  const [undeleteUsersDialog, setUndeleteUsersDialog] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [changeRoleDialog, setChangeRoleDialog] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  
  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log("Calling getAllUsers")
      const data = await getAllUsers()
      console.log("Users data returned:", data)
      setUsers(data)
    } catch (err) {
      console.error("Error in fetchUsers:", err)
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách người dùng. Vui lòng thử lại.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }
  
  const handleDeleteUsers = async () => {
    if (!selectedUsers.length) return
    
    try {
      await deleteUsers(selectedUsers)
      // Refresh users list
      fetchUsers()
      setDeleteUsersDialog(false)
      setSelectedUsers([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi xóa người dùng. Vui lòng thử lại.')
      console.error(err)
    }
  }
  
  const handleUndeleteUsers = async () => {
    if (!selectedUsers.length) return
    
    try {
      await undeleteUsers(selectedUsers)
      // Refresh users list
      fetchUsers()
      setUndeleteUsersDialog(false)
      setSelectedUsers([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khôi phục người dùng. Vui lòng thử lại.')
      console.error(err)
    }
  }
  
  const handleUpdateRole = async () => {
    if (!selectedUserId || !selectedRoleId) return
    
    try {
      await updateUserRole(selectedUserId, selectedRoleId)
      // Refresh users list
      fetchUsers()
      setChangeRoleDialog(false)
      setSelectedUserId(null)
      setSelectedRoleId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi cập nhật vai trò người dùng. Vui lòng thử lại.')
      console.error(err)
    }
  }
  
  useEffect(() => {
    fetchUsers()
  }, [])
  
  const openChangeRoleDialog = (userId: number, roleId: number) => {
    setSelectedUserId(userId)
    setSelectedRoleId(roleId)
    setChangeRoleDialog(true)
  }

  // Filter users based on search term and deleted status
  const filteredUsers = users.filter(user => 
    (showDeleted || !user.IsDeleted) &&
    (user.Name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.Email.toLowerCase().includes(searchTerm.toLowerCase()))
  )
  
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
        <Button onClick={fetchUsers} variant="outline" size="sm" className="mt-3">
          Thử lại
        </Button>
      </div>
    )
  }
  
  // Available roles to select from
  const roles = [
    { id: 1, name: "Quản trị viên" },
    { id: 2, name: "Tác giả" },
    { id: 3, name: "Người dùng" }
  ]
  
  return (
    <>
      <Card className="overflow-hidden border-border/40 shadow-sm ">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Tìm kiếm người dùng..." 
                  className="pl-9 w-full sm:w-auto max-w-lg" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                {showDeleted ? (
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-1.5"
                    onClick={() => {
                      setSelectedUsers([])
                      setUndeleteUsersDialog(true)
                    }}
                  >
                    <Undo className="h-4 w-4" />
                    <span className="sm:inline hidden">Khôi phục</span>
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-1.5"
                    onClick={() => {
                      setSelectedUsers([])
                      setDeleteUsersDialog(true)
                    }}
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sm:inline hidden">Xóa</span>
                  </Button>
                )}
                <Button
                  variant="default"
                  className="flex items-center gap-1.5"
                  onClick={() => fetchUsers()}
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="sm:inline hidden">Làm mới</span>
                </Button>
                <Button
                  variant={showDeleted ? "default" : "outline"}
                  className="flex items-center gap-1.5"
                  onClick={() => setShowDeleted(!showDeleted)}
                >
                  <span className="sm:inline hidden">
                    {showDeleted ? "Hiện người dùng bị xóa" : "Hiện tất cả người dùng"}
                  </span>
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
                  <th className="text-left py-3 px-4 font-medium">Tên</th>
                  <th className="text-left py-3 px-4 font-medium">Email</th>
                  <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Điện thoại</th>
                  <th className="text-left py-3 px-4 font-medium">Vai trò</th>
                  <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Ngày tạo</th>
                  <th className="text-left py-3 px-4 font-medium">Trạng thái</th>
                  <th className="text-right py-3 px-4 font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-muted-foreground">
                      {searchTerm 
                        ? 'Không tìm thấy người dùng nào phù hợp với tìm kiếm.' 
                        : 'Không có người dùng nào.'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <motion.tr
                      key={user.Id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`border-b hover:bg-muted/20 ${user.IsDeleted ? "bg-red-50/30 dark:bg-red-950/10" : ""}`}
                    >
                      <td className="py-3 px-4">{user.Id}</td>
                      <td className="py-3 px-4 font-medium">{user.Name}</td>
                      <td className="py-3 px-4">{user.Email}</td>
                      <td className="py-3 px-4 hidden md:table-cell">{user.PhoneNumber || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.Role.RoleId === 1 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                            : user.Role.RoleId === 2
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        }`}>
                          {user.Role.Name}
                        </span>
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell">
                        {new Date(user.CreatedTime).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3 px-4">
                        {user.IsDeleted ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                            Đã xóa
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            Hoạt động
                          </span>
                        )}
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
                            {!user.IsDeleted && (
                              <DropdownMenuItem 
                                onClick={() => openChangeRoleDialog(user.Id, user.Role.RoleId)}
                                className="cursor-pointer"
                              >
                                <UserCog className="h-4 w-4 mr-2" />
                                <span>Đổi vai trò</span>
                              </DropdownMenuItem>
                            )}
                            {user.IsDeleted ? (
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedUsers([user.Id])
                                  setUndeleteUsersDialog(true)
                                }}
                                className="cursor-pointer text-success"
                              >
                                <Undo className="h-4 w-4 mr-2" />
                                <span>Khôi phục người dùng</span>
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedUsers([user.Id])
                                  setDeleteUsersDialog(true)
                                }}
                                className="cursor-pointer text-destructive"
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                <span>Xóa người dùng</span>
                              </DropdownMenuItem>
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
      
      {/* Delete Users Dialog */}
      <AlertDialog open={deleteUsersDialog} onOpenChange={setDeleteUsersDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa người dùng đã chọn</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa {selectedUsers.length === 1 ? 'người dùng này' : 'những người dùng này'}? 
              Thao tác này sẽ đánh dấu {selectedUsers.length === 1 ? 'người dùng' : 'những người dùng'} là đã xóa trong hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUsers}
              className="bg-destructive hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Undelete Users Dialog */}
      <AlertDialog open={undeleteUsersDialog} onOpenChange={setUndeleteUsersDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Khôi phục người dùng đã chọn</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn khôi phục {selectedUsers.length === 1 ? 'người dùng này' : 'những người dùng này'}? 
              Thao tác này sẽ đánh dấu {selectedUsers.length === 1 ? 'người dùng' : 'những người dùng'} là hoạt động trong hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleUndeleteUsers}
              className="bg-primary hover:bg-primary/90"
            >
              Khôi phục
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Change Role Dialog */}
      <Dialog open={changeRoleDialog} onOpenChange={setChangeRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thay đổi vai trò người dùng</DialogTitle>
            <DialogDescription>
              Cập nhật vai trò cho người dùng này. Điều này sẽ thay đổi quyền của họ trong hệ thống.
            </DialogDescription>
          </DialogHeader>
          
          <div className="w-full">
            <div className="flex flex-col gap-3">
              <label htmlFor="role" className="text-sm font-medium">
                Chọn vai trò
              </label>
              <Select
                value={selectedRoleId?.toString()}
                onValueChange={(value) => setSelectedRoleId(parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeRoleDialog(false)}>
              Hủy bỏ
            </Button>
            <Button onClick={handleUpdateRole}>
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 