'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Home page error:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })
  }, [error])

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero section stays visible during error */}
      <section className="mx-auto max-w-4xl space-y-4 text-center">
        <h1 className="font-[Be Vietnam Pro] text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          <span className="text-primary">TinVerse</span> - Khám phá thế giới tin tức
        </h1>
        <p className="text-xl text-muted-foreground">
          Nền tảng tin tức hiện đại với giao diện đẹp mắt và trải nghiệm người dùng tuyệt vời
        </p>
      </section>

      {/* Error message */}
      <section className="mx-auto mt-12 max-w-xl">
        <div className="overflow-hidden rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
          <h2 className="mb-4 text-lg font-semibold text-destructive">
            Rất tiếc, đã có lỗi xảy ra
          </h2>
          <p className="text-sm text-destructive/90 mb-6">
            Không thể tải dữ liệu. Vui lòng thử lại sau vài giây.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => reset()}
              className="rounded-lg border border-primary/20 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10"
            >
              Thử lại
            </button>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}