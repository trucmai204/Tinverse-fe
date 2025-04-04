"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut, Menu, ShieldCheck, User, BookmarkCheck } from "lucide-react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { useAuth } from "./auth-provider"
import { Button } from "@/components/ui/button"
import { ProfileDialog } from "./profile-dialog"
import { PasswordDialog } from "./password-dialog"
import { BookmarkDialog } from "./bookmark-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NavItem {
  title: string
  href: string
  requireAuth?: boolean
  requireAdmin?: boolean
  requireAuthor?: boolean
}

const navItems: NavItem[] = [
  { title: "Home", href: "/" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
  { title: "Quản trị", href: "/admin", requireAuth: true, requireAdmin: true },
  { title: "Trang tác giả", href: "/author", requireAuth: true, requireAuthor: true },
  { title: "Bài viết đã lưu", href: "/bookmarks", requireAuth: true },
  { title: "Login", href: "/login", requireAuth: false },
  { title: "Register", href: "/register", requireAuth: false },
]

export function MainNav() {
  const { user, isAuthenticated, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  // Add debug logs
  console.log('MainNav Debug:', {
    isAuthenticated,
    user,
    pathname,
    timestamp: new Date().toISOString()
  })

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }
  
  // Sửa lại cách kiểm tra role
  const isAdmin = user?.role?.name === 'Quản trị viên' || user?.role?.name === 'Admin'
  const isAuthor = user?.role?.name === 'Tác giả' || user?.role?.name === 'Author' || isAdmin
  
  // Debug logs for role checking and auth state
  console.log('Auth State Debug:', {
    user,
    isAuthenticated,
    roleId: user?.role?.id,
    roleName: user?.role?.name,
    isAdmin,
    isAuthor,
    timestamp: new Date().toISOString()
  })

  // Debug navigation items filtering
  const filteredNavItems = navItems.filter(
    (item) => {
      const shouldShow = (item.requireAuth === undefined) ||
        (item.requireAuth === true && isAuthenticated && 
         ((!item.requireAdmin && !item.requireAuthor) || 
          (item.requireAdmin && isAdmin) || 
          (item.requireAuthor && isAuthor))) ||
        (item.requireAuth === false && !isAuthenticated)

      // Log chi tiết cho từng menu item
      console.log(`Menu item "${item.title}" (${item.href}):`, {
        requireAuth: item.requireAuth,
        requireAdmin: item.requireAdmin,
        requireAuthor: item.requireAuthor,
        isAuthenticated,
        isAdmin,
        isAuthor,
        shouldShow
      })

      return shouldShow
    }
  )

  // Log kết quả lọc menu
  console.log('Navigation Items Debug:', {
    allItems: navItems,
    filteredItems: filteredNavItems.map(item => ({
      title: item.title,
      href: item.href,
      requireAuth: item.requireAuth,
      requireAdmin: item.requireAdmin,
      requireAuthor: item.requireAuthor
    })),
    isAuthenticated,
    isAdmin,
    isAuthor
  })

  return (
    <div className="flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 mr-6">
        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-extrabold text-2xl">
          TinVerse
        </span>
      </Link>


      <Link
        href="/bookmarks"
        className="flex items-center gap-1 md:hidden mr-2 px-3 py-1.5 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
      >
        <BookmarkCheck className="h-4 w-4" />
        <span className="hidden sm:inline">Bài viết đã lưu</span>
      </Link>

      <div className="hidden md:flex items-center gap-6">
        {/* Desktop Navigation */}
        <nav className="flex items-center gap-6">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="active-nav-item"
                    className="absolute inset-0 bg-primary/10 rounded-md -z-10"
                    style={{ borderRadius: 6 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                <span className="relative px-2 py-1">{item.title}</span>
              </Link>
            )
          })}
        </nav>

        {/* Admin & Author Buttons */}
        {isAdmin && (
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground",
              pathname === "/admin" ? "bg-primary/10 text-primary" : ""
            )}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Quản trị</span>
          </Link>
        )}
        
        {isAuthor && (
          <Link
            href="/author"
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground",
              pathname === "/author" ? "bg-primary/10 text-primary" : ""
            )}
          >
            <User className="h-4 w-4" />
            <span>Tác giả</span>
          </Link>
        )}

        {/* Bookmarks Button */}
        {isAuthenticated  && (
          <Link
            href="/bookmarks"
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
          >
            <BookmarkCheck className="h-4 w-4" />
            <span>Bài viết đã lưu</span>
          </Link>
        )}

        {/* User Actions */}
        {isAuthenticated && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-9 w-9 rounded-full"
              >
                <Avatar className="h-9 w-9 transition-all duration-300 hover:shadow-md hover:shadow-primary/20">
                  <AvatarImage
                    src={`https://avataaars.io/?avatarStyle=Transparent&topType=LongHairStraight&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light`}
                    alt={user?.name || "User Avatar"}
                  />
                  <AvatarFallback>
                    {user?.name?.substring(0, 2).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 border border-gray-200/20 bg-background/80 backdrop-blur-xl backdrop-filter shadow-lg dark:border-gray-800/50"
              align="end"
              sideOffset={8}
              alignOffset={8}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col px-2 py-1.5 transition-colors"
              >
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.role?.name}</p>
              </motion.div>
              <DropdownMenuSeparator />
              
              {/* User Profile Items */}
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <ProfileDialog variant="mobile" />
              </DropdownMenuItem>
              
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <PasswordDialog variant="mobile" />
              </DropdownMenuItem>
              
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <BookmarkDialog variant="mobile" />
              </DropdownMenuItem>

              {/* Admin & Author Menu Items */}
              {(isAdmin || isAuthor) && <DropdownMenuSeparator />}
              
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link 
                    href="/admin" 
                    className={cn(
                      "flex items-center gap-2",
                      pathname === "/admin" ? "bg-primary/10 text-primary" : ""
                    )}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Quản trị hệ thống</span>
                  </Link>
                </DropdownMenuItem>
              )}
              
              {isAuthor && (
                <DropdownMenuItem asChild>
                  <Link 
                    href="/author" 
                    className={cn(
                      "flex items-center gap-2",
                      pathname === "/author" ? "bg-primary/10 text-primary" : ""
                    )}
                  >
                    <User className="h-4 w-4" />
                    <span>Trang tác giả</span>
                  </Link>
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 font-semibold hover:text-red-700 focus:text-red-700" 
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Mobile Navigation */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          {filteredNavItems.map((item) => (
            <DropdownMenuItem key={item.href} asChild>
              <Link
                href={item.href}
                className={cn(
                  pathname === item.href ? "bg-primary/10 text-primary" : ""
                )}
              >
                {item.title}
              </Link>
            </DropdownMenuItem>
          ))}
          
          {isAuthenticated && (
            <>
              <DropdownMenuSeparator />
              {/* User Profile Items */}
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <ProfileDialog variant="mobile" />
              </DropdownMenuItem>
              
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <PasswordDialog variant="mobile" />
              </DropdownMenuItem>
              
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <BookmarkDialog variant="mobile" />
              </DropdownMenuItem>

              {/* Admin & Author Links if applicable */}
              {(isAdmin || isAuthor) && <DropdownMenuSeparator />}
              
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link 
                    href="/admin" 
                    className={cn(
                      "flex items-center gap-2",
                      pathname === "/admin" ? "bg-primary/10 text-primary" : ""
                    )}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Quản trị hệ thống</span>
                  </Link>
                </DropdownMenuItem>
              )}
              
              {isAuthor && (
                <DropdownMenuItem asChild>
                  <Link 
                    href="/author" 
                    className={cn(
                      "flex items-center gap-2",
                      pathname === "/author" ? "bg-primary/10 text-primary" : ""
                    )}
                  >
                    <User className="h-4 w-4" />
                    <span>Trang tác giả</span>
                  </Link>
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 