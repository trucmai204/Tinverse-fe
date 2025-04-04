import { Metadata } from "next"

export const metadata: Metadata = {
  title: "TinVerse",
  description: "Trung tâm kiến thức số",
  keywords: ["tinverse", "tin tức", "kiến thức", "chia sẻ", "cộng đồng"],
  authors: [
    {
      name: "TinVerse Team",
    },
  ],
  creator: "TinVerse",
  publisher: "TinVerse",
  applicationName: "TinVerse",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://tinverse.app",
    title: "TinVerse",
    description: "Trung tâm kiến thức số",
    siteName: "TinVerse",
  },
  twitter: {
    card: "summary_large_image",
    title: "TinVerse",
    description: "Trung tâm kiến thức số",
    creator: "@tinverse",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
} 