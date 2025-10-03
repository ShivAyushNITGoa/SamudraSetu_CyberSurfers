'use client'

import CitizenAuthGuard from '@/components/citizen/CitizenAuthGuard'
import CitizenNavigation from '@/components/citizen/CitizenNavigation'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function CitizenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith('/citizen/auth')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light'
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <CitizenAuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        {isAuthPage ? (
          <main className="min-h-screen">
            <div className="flex justify-end pt-3 pr-3">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="px-3 py-1 text-xs rounded-full border border-slate-200/60 bg-white/70 hover:bg-white dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                aria-label="Toggle theme"
                title="Toggle theme"
              >
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
            {children}
          </main>
        ) : (
          <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
            <div className="flex justify-end pt-3">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="px-3 py-1 text-xs rounded-full border border-slate-200/60 bg-white/70 hover:bg-white dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                aria-label="Toggle theme"
                title="Toggle theme"
              >
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
            <main className="pb-24 pt-2">
              <div className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-sm dark:bg-slate-900/60 dark:border-slate-800">
                {children}
              </div>
            </main>
          </div>
        )}
        {!isAuthPage && <CitizenNavigation />}
      </div>
    </CitizenAuthGuard>
  )
}
