import { Be_Vietnam_Pro } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { NavBar } from "@/components/nav-bar";
import { Footer } from "@/components/footer";
import { ProtectedRoute } from "@/components/protected-route";
import { Toaster } from "@/components/ui/sonner";
import { metadata } from "./metadata";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
  preload: true,
  variable: "--font-be-vietnam-pro",
});

export { metadata };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${beVietnamPro.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
          storageKey="tinverse-theme"
        >
          <AuthProvider>
            <NavBar />
            <div className="relative mx-auto flex min-h-screen w-full flex-col lg:max-w-screen-2xl">
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
