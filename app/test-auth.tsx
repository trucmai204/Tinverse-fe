"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { storage } from "@/lib/storage"

export default function TestAuth() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [result, setResult] = useState<any>(null)
  const [user, setUser] = useState<any>(storage.get("user"))

  const login = async () => {
    try {
      const response = await fetch("https://localhost:5003/api/Users/Login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ Email: email, Password: password }),
      })

      const data = await response.json()
      setResult(data)

      if (response.ok) {
        const user = {
          id: data.Id,
          name: data.Name,
          phoneNumber: data.PhoneNumber || '',
          role: {
            id: data.Role.Id,
            name: data.Role.Name
          }
        }
        storage.set("user", user)
        setUser(user)
      }
    } catch (error) {
      console.error("Error logging in:", error)
      setResult({ error: "Đăng nhập thất bại" })
    }
  }

  const checkStorage = () => {
    const user = storage.get("user")
    setUser(user)
  }

  const clearStorage = () => {
    storage.remove("user")
    setUser(null)
  }

  return (
    <div className="container flex items-center justify-center py-20">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Kiểm tra Xác thực</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input 
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            <Button className="w-full" onClick={login}>Đăng nhập</Button>
            <Button variant="outline" onClick={checkStorage}>Kiểm tra Storage</Button>
            <Button variant="destructive" onClick={clearStorage}>Xóa Storage</Button>
          </div>

          {result && (
            <div className="mt-4 p-3 bg-muted rounded-md">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {user && (
            <div className="mt-4 p-3 bg-primary/10 rounded-md">
              <h3 className="font-semibold mb-2">Thông tin người dùng trong localStorage:</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 