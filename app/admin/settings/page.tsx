"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Shield, Server, Globe } from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container py-10"
    >
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thiết lập hệ thống</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý cấu hình và thiết lập cho hệ thống.
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Chung</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Bảo mật</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              <span>API</span>
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>SEO</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Thiết lập chung</CardTitle>
                <CardDescription>
                  Quản lý các cài đặt chung của hệ thống
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Tính năng đang trong quá trình phát triển.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Bảo mật</CardTitle>
                <CardDescription>
                  Quản lý cài đặt bảo mật và quyền truy cập
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Tính năng đang trong quá trình phát triển.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>API Endpoints</CardTitle>
                <CardDescription>
                  Quản lý API và tích hợp hệ thống
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Tính năng đang trong quá trình phát triển.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt SEO</CardTitle>
                <CardDescription>
                  Quản lý cài đặt SEO và tối ưu hóa công cụ tìm kiếm
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Tính năng đang trong quá trình phát triển.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  )
}