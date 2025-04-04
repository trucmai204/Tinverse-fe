"use client"

import { motion } from "framer-motion"
import { Users, Newspaper, Globe, FileText, MessagesSquare, BookMarked } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Hero section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
        <div className="container relative mx-auto px-4 py-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-4xl space-y-6 text-center"
          >
            <h1 className="font-[Be Vietnam Pro] text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              <span className="text-foreground">Về</span>
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"> TinVerse</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Nền tảng tin tức hiện đại, mang đến trải nghiệm đọc tin mới mẻ và thú vị
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid gap-12 md:grid-cols-2 lg:grid-cols-3"
          >
            {/* Feature 1 */}
            <div className="group rounded-2xl border border-primary/10 bg-background/60 p-6 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20">
                <Newspaper className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Tin Tức Đa Dạng</h3>
              <p className="text-muted-foreground">
                Cập nhật tin tức từ nhiều lĩnh vực khác nhau, được tổng hợp và biên tập cẩn thận.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-2xl border border-primary/10 bg-background/60 p-6 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Truy Cập Mọi Lúc</h3>
              <p className="text-muted-foreground">
                Thiết kế thân thiện với người dùng, tương thích trên mọi thiết bị.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-2xl border border-primary/10 bg-background/60 p-6 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20">
                <BookMarked className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Lưu Trữ Bài Viết</h3>
              <p className="text-muted-foreground">
                Dễ dàng lưu lại những bài viết yêu thích để đọc lại sau.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group rounded-2xl border border-primary/10 bg-background/60 p-6 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20">
                <MessagesSquare className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Tương Tác & Thảo Luận</h3>
              <p className="text-muted-foreground">
                Bình luận và thảo luận với cộng đồng người đọc về các bài viết.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group rounded-2xl border border-primary/10 bg-background/60 p-6 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Cộng Đồng Năng Động</h3>
              <p className="text-muted-foreground">
                Kết nối với cộng đồng người đọc và tác giả đam mê tin tức.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group rounded-2xl border border-primary/10 bg-background/60 p-6 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Nội Dung Chất Lượng</h3>
              <p className="text-muted-foreground">
                Bài viết được biên tập kỹ lưỡng, đảm bảo chất lượng và độ tin cậy.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mx-auto max-w-4xl rounded-2xl border border-primary/10 bg-gradient-to-br from-background/80 via-background/60 to-background/80 p-8 text-center backdrop-blur-sm"
          >
            <h2 className="mb-6 text-3xl font-bold">Sứ Mệnh Của Chúng Tôi</h2>
            <p className="text-lg text-muted-foreground">
              TinVerse ra đời với sứ mệnh mang đến một nền tảng tin tức hiện đại, 
              nơi người đọc có thể dễ dàng tiếp cận những thông tin chất lượng và 
              đáng tin cậy. Chúng tôi không chỉ đơn thuần là một trang tin tức, mà 
              còn là một cộng đồng nơi mọi người có thể chia sẻ, thảo luận và học 
              hỏi từ nhau.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}