"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, MapPin, Phone } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5
    }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

export function Footer() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setIsSubscribed(true)
      setEmail("")
      // In a real app, you would send this to an API
      setTimeout(() => {
        setIsSubscribed(false)
      }, 3000)
    }
  }
  
  return (
    <footer className="w-full border-t bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-screen-2xl px-4 pt-8 py-4 md:px-8">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
        >
          {/* About Section */}
          <motion.div variants={fadeInUp} className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">TinVerse</h3>
            <p className="text-sm text-muted-foreground">
              Cung cấp thông tin tin tức mới nhất, đa dạng và chính xác từ nhiều lĩnh vực khác nhau.
            </p>
            <div className="flex space-x-4">
              {/* Social Media Icons */}
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1 }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </motion.a>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={fadeInUp} className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Liên kết nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  href="/" 
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 inline-block"
                >
                  <motion.span 
                    whileHover={{ x: 5 }} 
                    transition={{ type: "spring", stiffness: 400 }}
                    className="inline-flex items-center"
                  >
                    Trang chủ
                  </motion.span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/articles" 
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 inline-block"
                >
                  <motion.span 
                    whileHover={{ x: 5 }} 
                    transition={{ type: "spring", stiffness: 400 }}
                    className="inline-flex items-center"
                  >
                    Bài báo
                  </motion.span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/login" 
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 inline-block"
                >
                  <motion.span 
                    whileHover={{ x: 5 }} 
                    transition={{ type: "spring", stiffness: 400 }}
                    className="inline-flex items-center"
                  >
                    Đăng nhập
                  </motion.span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/register" 
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 inline-block"
                >
                  <motion.span 
                    whileHover={{ x: 5 }} 
                    transition={{ type: "spring", stiffness: 400 }}
                    className="inline-flex items-center"
                  >
                    Đăng ký
                  </motion.span>
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={fadeInUp} className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Liên hệ</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">
                18A/1 Cộng Hòa, Phường 4, Quận Tân Bình, TP.HCM
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">0123 456 789</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">contact@tinverse.vn</span>
              </li>
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div variants={fadeInUp} className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Nhận tin tức</h3>
            <p className="text-sm text-muted-foreground">
              Đăng ký để nhận thông tin mới nhất từ chúng tôi.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative overflow-hidden rounded-md border bg-background/50 backdrop-blur-sm shadow-sm">
                <Input
                  type="email"
                  placeholder="Email của bạn"
                  className="border-0 bg-transparent focus-visible:ring-0 pl-3"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-100%] group-hover:translate-x-full transition-all duration-1500" />
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  type="submit" 
                  className="w-full relative overflow-hidden group"
                  disabled={isSubscribed}
                >
                  {isSubscribed ? "Đã đăng ký" : "Đăng ký"}
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-full transition-all duration-500" />
                </Button>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
        <p className="pt-3 text-center text-sm text-muted-foreground">© {new Date().getFullYear()} TinVerse. Tất cả quyền được bảo lưu.</p>
      </div>
    </footer>
  )
} 