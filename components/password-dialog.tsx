"use client"

import { useState } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { AlertCircle, Key, Loader2 } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "./auth-provider"

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mật khẩu hiện tại là bắt buộc"),
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(6, "Xác nhận mật khẩu là bắt buộc"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  })

type PasswordFormValues = z.infer<typeof passwordSchema>

interface PasswordDialogProps {
  variant?: "default" | "mobile"
}

export function PasswordDialog({ variant = "default" }: PasswordDialogProps) {
  const { changePassword } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(data: PasswordFormValues) {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await changePassword(data.currentPassword, data.newPassword)
      setSuccess(true)
      
      // Reset form
      form.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      
      // Close dialog after 2 seconds
      setTimeout(() => {
        setIsOpen(false)
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể thay đổi mật khẩu")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {variant === "default" ? (
          <Button 
            variant="ghost" 
            size="sm"
            className="relative group overflow-hidden"
          >
            <Key className="h-4 w-4 mr-2" />
            Mật khẩu
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-full transition-all duration-500" />
          </Button>
        ) : (
          <div className="flex items-center w-full">
            <Key className="h-4 w-4 mr-2" />
            <span>Mật khẩu</span>
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border border-gray-200/20 bg-background/60 backdrop-blur-xl backdrop-filter shadow-lg dark:border-gray-800/50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg pointer-events-none" />
        
        <DialogHeader className="relative">
          <DialogTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Đổi mật khẩu
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/80">
            Cập nhật mật khẩu để giữ an toàn cho tài khoản của bạn
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500"
              >
                <AlertCircle className="h-4 w-4" />
                <p>{error}</p>
              </motion.div>
            )}
            
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-500"
              >
                <AlertCircle className="h-4 w-4" />
                <p>Đổi mật khẩu thành công!</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="relative space-y-4">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/90">Mật khẩu hiện tại</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        className="bg-background/50 border-foreground/10 focus-visible:ring-primary/30"
                        placeholder="••••••••"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/90">Mật khẩu mới</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        className="bg-background/50 border-foreground/10 focus-visible:ring-primary/30"
                        placeholder="••••••••"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/90">Xác nhận mật khẩu mới</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        className="bg-background/50 border-foreground/10 focus-visible:ring-primary/30"
                        placeholder="••••••••"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-3 justify-end pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="border-foreground/10 bg-background/50 hover:bg-background/80"
                >
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="relative overflow-hidden group transition-all duration-300 hover:bg-primary/90"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang cập nhật...
                    </span>
                  ) : (
                    <span>Đổi mật khẩu</span>
                  )}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-1000" />
                </Button>
              </div>
            </form>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 