"use client"

import { AuthorArticleForm } from "@/components/author/article-form"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function CreateArticlePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="mr-2"
        >
          <Link href="/author/articles">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tạo Bài báo mới</h1>
          <p className="text-muted-foreground">
            Tạo một Bài báo mới với đầy đủ thông tin
          </p>
        </div>
      </div>
      
      <Separator />
      
      <AuthorArticleForm 
        isCreate={true} 
        returnPath="/author/articles"
      />
    </div>
  )
} 