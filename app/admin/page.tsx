"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { 
  Users, 
  FileText, 
  FolderTree, 
  Settings, 
  TrendingUp, 
  Eye,
  ThumbsUp
} from "lucide-react"

const cards = [
  {
    title: "Người dùng",
    description: "Quản lý tài khoản người dùng trong hệ thống",
    icon: <Users className="h-12 w-12 text-primary/80" />,
    link: "/admin/users",
    color: "from-blue-500/20 to-cyan-400/20",
  },
  {
    title: "Bài báo",
    description: "Quản lý Bài báo và xuất bản nội dung",
    icon: <FileText className="h-12 w-12 text-primary/80" />,
    link: "/admin/articles",
    color: "from-violet-500/20 to-purple-500/20",
  },
  {
    title: "Danh mục",
    description: "Quản lý danh mục và phân loại nội dung",
    icon: <FolderTree className="h-12 w-12 text-primary/80" />,
    link: "/admin/categories",
    color: "from-emerald-500/20 to-green-500/20",
  },
  {
    title: "Thiết lập",
    description: "Cấu hình và thiết lập hệ thống",
    icon: <Settings className="h-12 w-12 text-primary/80" />,
    link: "/admin/settings",
    color: "from-amber-500/20 to-yellow-500/20",
  }
]

const stats = [
  {
    title: "Lượt xem",
    value: "12.5K",
    change: "+15%",
    increasing: true, 
    icon: <Eye className="h-4 w-4" />,
  },
  {
    title: "Bài báo",
    value: "324",
    change: "+32",
    increasing: true,
    icon: <FileText className="h-4 w-4" />,
  },
  {
    title: "Tương tác",
    value: "8.2K",
    change: "+43%",
    increasing: true,
    icon: <ThumbsUp className="h-4 w-4" />,
  },
  {
    title: "Người dùng",
    value: "1.2K",
    change: "+82",
    increasing: true,
    icon: <Users className="h-4 w-4" />,
  },
]

export default function AdminPage() {
  const router = useRouter()
  
  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Bảng điều khiển</h1>
        <p className="text-muted-foreground">
          Xem tổng quan và quản lý hệ thống của bạn
        </p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
                      {stat.icon}
                      {stat.title}
                    </p>
                    <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  </div>
                  <div className={`flex items-center ${stat.increasing ? 'text-emerald-500' : 'text-red-500'}`}>
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">{stat.change}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="cursor-pointer"
            onClick={() => router.push(card.link)}
          >
            <Card className="overflow-hidden">
              <CardHeader className="relative">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{card.title}</CardTitle>
                    <CardDescription className="mt-1.5">
                      {card.description}
                    </CardDescription>
                  </div>
                  <div className="p-2">{card.icon}</div>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 