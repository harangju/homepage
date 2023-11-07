import Link from "next/link"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Analytics } from "@/components/analytics"
import { ModeToggle } from "@/components/mode-toggle"
import Logo from "@/components/icons/logo"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Harang Ju",
  description: "",
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body
        className={`antialiased min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 ${inter.className}`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="max-w-2xl mx-auto py-10 px-4">
            <header>
              <div className="flex items-center justify-between mb-6">
                <Link href="/" className="hover:scale-95 transition-all duration-100">
                  <Logo className="w-7 h-12"/>
                </Link>
                <nav className="flex items-center ml-auto text-sm font-medium space-x-4">
                  <Link href="/blog">Blog</Link>
                  <ModeToggle />
                </nav>
              </div>
            </header>
            <main>{children}</main>
          </div>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
