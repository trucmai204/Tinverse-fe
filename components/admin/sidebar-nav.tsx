"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  FolderTree, 
  Settings, 
  FileText, 
  LayoutDashboard 
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Người dùng",
    href: "/admin/users",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Danh mục",
    href: "/admin/categories",
    icon: <FolderTree className="h-5 w-5" />,
  },
  {
    title: "Bài báo",
    href: "/admin/articles",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Thiết lập",
    href: "/admin/settings",
    icon: <Settings className="h-5 w-5" />,
  },
]

export function SidebarNav() {
  const pathname = usePathname()
  
  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-extrabold text-xl">
            TinVerse
          </span>
          <span className="text-xs text-muted-foreground">Admin</span>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="grid gap-1 p-4">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href || 
                            (item.href !== "/admin" && pathname?.startsWith(item.href))
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "group relative h-10 w-full justify-start gap-3",
                    isActive ? "font-medium" : "font-normal"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeAdminItem"
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-primary"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                  <span className={cn(
                    "text-muted-foreground group-hover:text-foreground transition-colors",
                    isActive && "text-foreground"
                  )}>
                    {item.icon}
                  </span>
                  {item.title}
                </Button>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
} 