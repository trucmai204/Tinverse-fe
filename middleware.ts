import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  console.log('Middleware Debug:', {
    path: request.nextUrl.pathname,
    method: request.method,
    hasToken: !!request.cookies.get('tinverse_token'),
    hasUser: !!request.cookies.get('tinverse_user')
  })

  // Tạm thời bỏ qua kiểm tra quyền và chuyển hướng
  // Đã bị vô hiệu hóa để sử dụng AuthProvider client-side

  // Luôn cho phép tiếp tục
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ]
} 