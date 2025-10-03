'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Smartphone, Globe, Shield, Download, ChevronDown, Moon, Sun } from 'lucide-react'
import { useEffect } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
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
  const pathname = usePathname()

  const navigation = [
    { name: 'Home', href: '/website' },
    { name: 'How It Works', href: '/website/how-it-works' },
    { name: 'Architecture', href: '/website/architecture' },
    { name: 'Official Data', href: '/website/official-data' },
    { name: 'Admin Dashboard', href: '/website/admin-app' },
    { name: 'Citizen Portal', href: '/website/citizen-app' },
    { name: 'Mobile App', href: '/website/mobile-app' },
    { name: 'Downloads', href: '/website/downloads' },
    { name: 'About', href: '/website/about' },
  ]

  const appLinks = [
    { name: 'Admin Dashboard', href: '/website/auth/admin', icon: Shield, description: 'Monitor and verify ocean hazard reports' },
    { name: 'Citizen Portal', href: '/website/auth/citizen', icon: Globe, description: 'Report coastal hazards & track status' },
    { name: 'Mobile App', href: '/website/mobile-app', icon: Smartphone, description: 'Get the Flutter app (Android/iOS)' },
  ]

  return (
    <header className="bg-white/90 dark:bg-slate-900/80 shadow-sm border-b border-gray-200/50 dark:border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-2">
          {/* Logo */}
          <Link href="/website" className="flex items-center space-x-2 flex-none">
            <div className="w-9 h-9 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-sm">SS</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">SamudraSetu</span>
              <span className="text-[11px] text-gray-500 dark:text-slate-400">Coastal Safety Platform</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 flex-1 min-w-0 justify-center overflow-x-hidden whitespace-nowrap no-scrollbar">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors hover:text-blue-600 hover:bg-blue-50/60 dark:hover:bg-slate-800 ${
                  pathname === item.href ? 'text-blue-600 bg-blue-50/60 dark:bg-slate-800' : 'text-gray-700 dark:text-slate-200'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* App Access Buttons */}
          <div className="hidden lg:flex items-center space-x-3 flex-none">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-gray-600 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link
              href="/website/auth/admin"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all text-sm font-medium shadow-sm"
            >
              Admin Login
            </Link>
            <Link
              href="/website/auth/citizen"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Citizen Portal
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors ml-auto"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden py-4 border-t border-gray-200 dark:border-slate-800 transition-all duration-300 ${
          isMenuOpen ? 'block' : 'hidden'
        }`}>
          <div className="space-y-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block text-base font-medium transition-colors hover:text-blue-600 ${
                  pathname === item.href ? 'text-blue-600' : 'text-gray-700 dark:text-slate-200'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            <div className="pt-4 border-t border-gray-200 dark:border-slate-800 space-y-3">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Quick Access</h3>
              {appLinks.map((app) => (
                <Link
                  key={app.name}
                  href={app.href}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <app.icon className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-slate-200">{app.name}</div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">{app.description}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
