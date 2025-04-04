"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, PlusCircle, LayoutDashboard, Settings } from "lucide-react"
import { getCurrentUser } from "@/lib/api"

export function SidebarNav() {
  const pathname = usePathname()
  const [userName, setUserName] = useState<string>("")
  const [userRole, setUserRole] = useState<string>("")

  useEffect(() => {
    async function getUserInfo() {
      try {
        const user = await getCurrentUser()
        if (user) {
          setUserName(user.name)
          setUserRole(user.role.name)
        }
      } catch (error) {
        console.error("Error fetching user info:", error)
      }
    }

    getUserInfo()
  }, [])

  const items = [
    {
      title: "Tổng quan",
      href: "/author",
      icon: <LayoutDashboard className="mr-2 h-4 w-4" />,
    },
    {
      title: "Bài báo của tôi",
      href: "/author/articles",
      icon: <FileText className="mr-2 h-4 w-4" />,
    },
    {
      title: "Tạo Bài báo mới",
      href: "/author/articles/create",
      icon: <PlusCircle className="mr-2 h-4 w-4" />,
    },
    {
      title: "Tùy chỉnh tài khoản",
      href: "/author/settings",
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
  ]

  return (
    <ScrollArea className="flex-1 px-4">
      <div className="mb-4 px-2">
        <p className="text-sm font-medium">{userName}</p>
        <p className="text-xs text-muted-foreground">{userRole}</p>
      </div>
      <div className="space-y-1">
        {items.map((item) => (
          <Button
            key={item.href}
            variant={pathname === item.href ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "w-full justify-start",
              pathname === item.href
                ? "bg-secondary"
                : "hover:bg-secondary/50"
            )}
            asChild
          >
            <Link href={item.href}>
              {item.icon}
              {item.title}
            </Link>
          </Button>
        ))}
      </div>
    </ScrollArea>
  )
} 