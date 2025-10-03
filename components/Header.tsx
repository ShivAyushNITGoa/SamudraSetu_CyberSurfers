'use client'

import { useAuth } from './AuthProvider'
import Link from 'next/link'
import { Bell, Search, User, Settings, ChevronRight } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Header() {
  const { user } = useAuth()
  const pathname = usePathname()
  const [role, setRole] = useState<string>('')
  const [statusOk, setStatusOk] = useState<boolean>(true)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        if (user?.id) {
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
          if (!mounted) return
          if (!error) setRole(data?.role || '')
          setStatusOk(true)
        }
      } catch {
        if (mounted) setStatusOk(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [user?.id])

  const crumbs = useMemo(() => {
    const parts = (pathname || '/').split('/').filter(Boolean)
    return parts
  }, [pathname])

  return (
    <header className="gov-topbar">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Logo and Status */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SS</span>
            </div>
            <h1 className="text-xl font-bold text-white">SAMUDRASETU</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${statusOk ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={`text-sm font-medium ${statusOk ? 'text-green-400' : 'text-red-400'}`}>{statusOk ? 'Operational' : 'Degraded'}</span>
            </div>
            {role && (
              <span className="px-2 py-0.5 text-xs rounded-md bg-blue-600 text-white">{role}</span>
            )}
          </div>
          <div className="text-xs text-gray-300">
            {new Date().toLocaleString('en-US', { 
              weekday: 'short', 
              day: '2-digit', 
              month: 'short', 
              year: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit', 
              second: '2-digit',
              timeZoneName: 'short'
            })}
          </div>
        </div>

        {/* Breadcrumbs */}
        <nav className="hidden md:flex items-center text-sm text-gray-300">
          <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
          {crumbs.slice(1).map((c, i) => (
            <span key={i} className="flex items-center">
              <ChevronRight className="h-4 w-4 mx-2 text-gray-500" />
              <span className="capitalize">{c.replace(/\(|\)/g, '')}</span>
            </span>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-64 pl-10 pr-4 py-2 bg-[#12283e] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Notifications */}
          <button 
            className="p-2 text-gray-400 hover:text-white relative transition-colors"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings */}
          <button 
            className="p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Settings"
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>

          {/* User menu */}
          <Link href="/profile" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
            <div className="text-right">
              <p className="text-sm font-medium text-white">
                {user?.user_metadata?.name || 'Admin User'}
              </p>
              <p className="text-xs text-gray-300">{user?.email}</p>
            </div>
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Avatar" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}