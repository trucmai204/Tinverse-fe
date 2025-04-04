"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { AnimatePresence, motion } from "framer-motion"
import { AlertCircle, Loader2, User } from "lucide-react"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "./auth-provider"

const profileSchema = z.object({
  Name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  Email: z.string(),
  Address: z.string().optional(),
  PhoneNumber: z.string().optional(),
})

interface ProfileDialogProps {
  variant?: "default" | "mobile"
}

export function ProfileDialog({ variant = "default" }: ProfileDialogProps) {
  const { user, updateProfile } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      Name: "",
      Email: "",
      Address: "",
      PhoneNumber: "",
    },
  })

  // Update form when user data changes or dialog opens
  useEffect(() => {
    if (user && isOpen) {
      form.reset({
        Name: user.name || "",
        Email: user.role?.name || "",
        Address: "",
        PhoneNumber: user.phoneNumber || "",
      })
    }
  }, [user, form, isOpen])

  async function onSubmit(data: z.infer<typeof profileSchema>) {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await updateProfile({
        name: data.Name,
        phoneNumber: data.PhoneNumber
      })
      setSuccess(true)
      
      // Reset form with new values
      form.reset({
        Name: data.Name,
        Email: data.Email,
        Address: data.Address || "",
        PhoneNumber: data.PhoneNumber || "",
      })
      
      // Close dialog after 2 seconds
      setTimeout(() => {
        setIsOpen(false)
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật hồ sơ")
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
            <User className="h-4 w-4 mr-2" />
            Hồ sơ
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-full transition-all duration-500" />
          </Button>
        ) : (
          <div className="flex items-center w-full">
            <User className="h-4 w-4 mr-2" />
            <span>Hồ sơ</span>
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border border-gray-200/20 bg-background/60 backdrop-blur-xl backdrop-filter shadow-lg dark:border-gray-800/50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg pointer-events-none" />
        
        <DialogHeader className="relative">
          <DialogTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            Thông tin cá nhân
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/80">
            Cập nhật thông tin cá nhân của bạn
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
                <p>Cập nhật hồ sơ thành công!</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="relative space-y-4">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="Name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/90">Tên</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-background/50 border-foreground/10 focus-visible:ring-primary/30"
                        placeholder="Nhập tên của bạn"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="PhoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/90">Số điện thoại</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-background/50 border-foreground/10 focus-visible:ring-primary/30"
                        placeholder="Số điện thoại (tùy chọn)"
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
                    <span>Cập nhật</span>
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