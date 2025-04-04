import type { Metadata } from "next"
import { ClientLayout } from "./client-layout"

export const metadata: Metadata = {
  title: {
    template: "%s | TinVerse",
    default: "Article | TinVerse",
  },
  description: "Read the latest articles from our community.",
}

export default function ArticleDetailLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <ClientLayout>{children}</ClientLayout>
} 