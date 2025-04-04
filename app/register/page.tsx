"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { motion } from "framer-motion"
import { RegisterUserDto } from "@/lib/types"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { AlertCircle, Loader2 } from "lucide-react"

const registerSchema = z.object({
  Name: z.string().min(2, "Name must be at least 2 characters"),
  Email: z.string().email("Invalid email address"),
  Password: z.string().min(6, "Password must be at least 6 characters"),
  Address: z.string().optional(),
  PhoneNumber: z.string().optional(),
})

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<RegisterUserDto>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      Name: "",
      Email: "",
      Password: "",
      Address: "",
      PhoneNumber: "",
    },
  })

  async function onSubmit(data: RegisterUserDto) {
    setIsLoading(true)
    setError(null)
    
    try {
      await register(data)
      setIsSuccess(true)
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border border-gray-200/20 bg-background/60 backdrop-blur-xl backdrop-filter shadow-lg dark:border-gray-800/50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl" />
          
          <CardHeader className="relative pb-6">
            <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Đăng ký
            </CardTitle>
            <CardDescription className="text-muted-foreground/80">
              Đăng ký để bắt đầu sử dụng dịch vụ của chúng tôi
            </CardDescription>
          </CardHeader>
          
          <CardContent className="relative">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500"
              >
                <AlertCircle className="h-4 w-4" />
                <p>{error}</p>
              </motion.div>
            )}
            
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-4 flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-500"
              >
                <AlertCircle className="h-4 w-4" />
                <p>Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...</p>
              </motion.div>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="Name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/90">Full Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-background/50 border-foreground/10 focus-visible:ring-primary/30"
                          placeholder="John Doe"
                          disabled={isLoading || isSuccess}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="Email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/90">Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-background/50 border-foreground/10 focus-visible:ring-primary/30"
                          type="email"
                          placeholder="your.email@example.com"
                          disabled={isLoading || isSuccess}
                          autoComplete="email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="Password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/90">Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-background/50 border-foreground/10 focus-visible:ring-primary/30"
                          type="password"
                          placeholder="••••••••"
                          disabled={isLoading || isSuccess}
                          autoComplete="new-password"
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
                      <FormLabel className="text-foreground/90">Số điện thoại (Tùy chọn)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-background/50 border-foreground/10 focus-visible:ring-primary/30"
                          placeholder="+1 (123) 456-7890"
                          disabled={isLoading || isSuccess}
                          autoComplete="tel"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="Address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground/90">Địa chỉ (Tùy chọn)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="bg-background/50 border-foreground/10 focus-visible:ring-primary/30"
                          placeholder="123 Main St, City, Country"
                          disabled={isLoading || isSuccess}
                          autoComplete="street-address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  disabled={isLoading || isSuccess}
                  className="w-full relative overflow-hidden group transition-all duration-300 hover:bg-primary/90"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang tạo tài khoản...
                    </span>
                  ) : (
                    <span>Đăng ký</span>
                  )}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-1000" />
                </Button>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="relative flex justify-center border-t border-foreground/5 pt-6 pb-4 mt-6">
            <p className="text-sm text-muted-foreground">
              Đã có tài khoản?{" "}
              <Link 
                href="/login" 
                className="font-medium text-primary hover:text-primary/90 transition-colors"
              >
                Đăng nhập tại đây
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
} 