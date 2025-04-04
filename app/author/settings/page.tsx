"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getCurrentUser, updateUserProfile, changePassword } from "@/lib/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Tên phải có ít nhất 2 ký tự",
  }),
  phoneNumber: z.string().optional(),
})

const passwordFormSchema = z.object({
  oldPassword: z.string().min(6, {
    message: "Mật khẩu cũ phải có ít nhất 6 ký tự",
  }),
  newPassword: z.string().min(6, {
    message: "Mật khẩu mới phải có ít nhất 6 ký tự",
  }),
  confirmPassword: z.string().min(6, {
    message: "Xác nhận mật khẩu phải có ít nhất 6 ký tự",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu mới và xác nhận mật khẩu không khớp",
  path: ["confirmPassword"],
})

export default function AuthorSettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
    },
  })
  
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })
  
  useEffect(() => {
    async function loadUserData() {
      try {
        setLoading(true)
        const userData = await getCurrentUser()
        if (userData) {
          setUser(userData)
          profileForm.reset({
            name: userData.name || "",
            phoneNumber: userData.phoneNumber || "",
          })
        }
      } catch (error) {
        console.error("Error loading user data:", error)
        toast.error("Không thể tải thông tin người dùng")
      } finally {
        setLoading(false)
      }
    }
    
    loadUserData()
  }, [profileForm])
  
  async function onSubmitProfile(data: z.infer<typeof profileFormSchema>) {
    setIsSubmitting(true)
    
    try {
      await updateUserProfile({
        Name: data.name,
        PhoneNumber: data.phoneNumber || undefined,
      })
      
      toast.success("Cập nhật thông tin thành công")
      
      // Refresh user data
      const userData = await getCurrentUser()
      if (userData) {
        setUser(userData)
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error(error instanceof Error ? error.message : "Không thể cập nhật thông tin")
    } finally {
      setIsSubmitting(false)
    }
  }
  
  async function onSubmitPassword(data: z.infer<typeof passwordFormSchema>) {
    setIsChangingPassword(true)
    
    try {
      await changePassword({
        OldPassword: data.oldPassword,
        NewPassword: data.newPassword,
      })
      
      toast.success("Đổi mật khẩu thành công")
      passwordForm.reset()
    } catch (error) {
      console.error("Error changing password:", error)
      toast.error(error instanceof Error ? error.message : "Không thể đổi mật khẩu")
    } finally {
      setIsChangingPassword(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tùy chỉnh tài khoản</h1>
        <p className="text-muted-foreground">
          Quản lý thông tin cá nhân và thay đổi mật khẩu
        </p>
      </div>
      
      <Separator />
      
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="password">Đổi mật khẩu</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>
                Cập nhật thông tin cá nhân của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-6">
                  <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ tên</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={profileForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số điện thoại</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          Số điện thoại là tùy chọn
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang cập nhật...
                        </>
                      ) : (
                        "Cập nhật thông tin"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Đổi mật khẩu</CardTitle>
              <CardDescription>
                Cập nhật mật khẩu để bảo vệ tài khoản của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-6">
                  <FormField
                    control={passwordForm.control}
                    name="oldPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mật khẩu hiện tại</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mật khẩu mới</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormDescription>
                          Mật khẩu phải có ít nhất 6 ký tự
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Xác nhận mật khẩu</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isChangingPassword}>
                      {isChangingPassword ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang cập nhật...
                        </>
                      ) : (
                        "Đổi mật khẩu"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 