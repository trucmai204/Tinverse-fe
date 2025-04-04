"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { storage } from "@/lib/storage"

export default function LoginAdmin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("https://localhost:5003/api/Users/Login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Email: email, Password: password }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error)
      }

      const data = await response.json()
      
      // Tạo thông tin người dùng
      const user = {
        id: data.Id,
        name: data.Name,
        phoneNumber: data.PhoneNumber || "",
        role: {
          id: data.Role.Id,
          name: data.Role.Name
        }
      }

      // Xóa dữ liệu cũ
      storage.clear()
      
      // Lưu thông tin người dùng và token giả
      storage.set("user", user)
      storage.set("token", "fake-auth-token-" + Date.now())
      storage.set("auth_state", {
        isAuthenticated: true,
        user: user
      })

      // Log thông tin đã lưu
      console.log("Auth data saved:", {
        user: storage.get("user"),
        token: storage.get("token"),
        auth_state: storage.get("auth_state")
      })

      // Làm mới trang
      window.location.href = user.role.id === 1 
        ? "/admin" 
        : user.role.id === 2 
          ? "/author" 
          : "/"
    } catch (error) {
      console.error("Login error:", error)
      setError("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Đăng nhập Quản trị</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={login} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                required
              />
            </div>
            {error && (
              <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 