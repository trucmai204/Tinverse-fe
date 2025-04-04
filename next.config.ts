import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Add server configuration
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    
    // Chỉ trả về rewrite khi biến môi trường tồn tại
    if (apiUrl) {
      return [
        {
          source: '/api/:path*',
          destination: `${apiUrl}/:path*`,
        },
      ];
    }
    
    // Trả về mảng rỗng nếu không có biến môi trường
    return [];
  },
};

export default nextConfig;
