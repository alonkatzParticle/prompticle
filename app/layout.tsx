'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'
import { Toaster } from 'sonner'
import { ThemeProvider } from 'next-themes'
import {
  Library,
  PlusCircle,
  Tag,
  Heart,
  Menu,
  X,
  Zap,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

const navItems = [
  { href: '/', label: 'Library', icon: Library },
  { href: '/add', label: 'Add Prompt', icon: PlusCircle },
  { href: '/categories', label: 'Categories', icon: Tag },
  { href: '/favorites', label: 'Favorites', icon: Heart },
]

function LogoutButton({ className }: { className?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = useCallback(async () => {
    setLoading(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }, [router])

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      title="Sign out"
      className={cn(
        'flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50',
        className
      )}
    >
      <LogOut className="w-4 h-4" />
      <span className="text-xs">Sign out</span>
    </button>
  )
}

function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-800">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="text-xl font-bold text-gray-100">Prompticle</span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto text-gray-400 hover:text-gray-100 md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="px-4 py-4 border-t border-gray-800 flex items-center justify-between">
        <p className="text-xs text-gray-600">Prompticle v0.1.0</p>
        <LogoutButton />
      </div>
    </div>
  )
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Render bare page for login (no sidebar)
  if (pathname === '/login') {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 flex-shrink-0 bg-gray-900 border-r border-gray-800">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative flex flex-col w-64 h-full bg-gray-900 border-r border-gray-800 shadow-xl">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-gray-900 border-b border-gray-800 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="flex items-center justify-center w-6 h-6 rounded bg-indigo-600">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-gray-100">Prompticle</span>
          </div>
          <LogoutButton />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            border: '1px solid #374151',
            color: '#f9fafb',
          },
        }}
      />
    </div>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark">
          <AppLayout>{children}</AppLayout>
        </ThemeProvider>
      </body>
    </html>
  )
}
