"use client"

import { motion } from "framer-motion"
import { UsersManagement } from "@/components/admin/users-management"

export default function UsersPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container py-10"
    >
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
          <p className="text-muted-foreground mt-2">
            Quản lý tài khoản người dùng, phân quyền và trạng thái hoạt động.
          </p>
        </div>
        
        <UsersManagement />
      </div>
    </motion.div>
  )
} 