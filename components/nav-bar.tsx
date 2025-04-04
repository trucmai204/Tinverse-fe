"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LogOut, LogIn, UserPlus, Shield, FileText } from "lucide-react"
import { motion } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"
import { ProfileDialog } from "@/components/profile-dialog"
import { PasswordDialog } from "@/components/password-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth-provider"

export function NavBar() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  
  const handleLogout = () => {
    logout()
    router.push("/")
  }
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-8 lg:px-12">
        <div className="flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              TinVerse
            </span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Link href="/" className="mr-6 flex items-center space-x-2 md:hidden">
              <span className="font-bold">TinVerse</span>
            </Link>
          </div>
          <nav className="flex items-center space-x-2">
            <ThemeToggle />
            
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-foreground/80 hover:text-foreground hover:bg-accent"
                  onClick={() => router.push("/login")}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Đăng nhập</span>
                </Button>
                
                <Button 
                  variant="default" 
                  size="sm"
                  className="relative overflow-hidden group"
                  onClick={() => router.push("/register")}
                >
                  <span className="flex items-center">
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Đăng ký</span>
                  </span>
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-1000" />
                </Button>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                  >
                    <Avatar className="h-9 w-9 transition-all duration-300 hover:shadow-md hover:shadow-primary/20">
                      <AvatarImage
                        src={`https://avataaars.io/?avatarStyle=Transparent&topType=LongHairStraight&accessoriesType=Blank&hairColor=BrownDark&facialHairType=Blank&clotheType=BlazerShirt&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Light`}
                        alt={user?.name || "Ảnh đại diện"}
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
                    <div className="flex items-center gap-1.5">
                      {user?.role?.id === 1 ? (
                        <div className="flex items-center gap-1">
                          <Shield className="h-3.5 w-3.5 text-primary" />
                          <p className="text-xs font-medium text-primary">{user.role.name}</p>
                        </div>
                      ) : user?.role?.id === 2 ? (
                        <div className="flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5 text-primary" />
                          <p className="text-xs font-medium text-primary">{user.role.name}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">{user?.role?.name}</p>
                      )}
                    </div>
                  </motion.div>
                  <DropdownMenuSeparator />
                  {user?.role?.id === 1 && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center">
                        <Shield className="mr-2 h-4 w-4" />
                        <span>Quản trị hệ thống</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {(user?.role?.id === 1 || user?.role?.id === 2) && (
                    <DropdownMenuItem asChild>
                      <Link href="/author" className="flex items-center">
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Trang tác giả</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <ProfileDialog variant="mobile" />
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <PasswordDialog variant="mobile" />
                  </DropdownMenuItem>
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
          </nav>
        </div>
      </div>
    </header>
  )
}
