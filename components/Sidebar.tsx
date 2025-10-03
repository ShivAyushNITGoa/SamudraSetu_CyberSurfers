'use client'

import Link from 'next/link'
import { usePathname as usePathnameBase } from 'next/navigation'
// Type fallback for environments without Next.js types
const usePathname: () => string = (usePathnameBase as unknown as (() => string))
import { 
  BarChart3, 
  MapPin, 
  Users, 
  Settings, 
  LogOut,
  Home,
  Building2,
  MessageSquare,
  Map,
  Zap,
  Brain,
  FileText,
  Globe,
  Shield
} from 'lucide-react'
import { useAuth } from './AuthProvider'

export default function Sidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Admin', href: '/admin', icon: Shield },
    { name: 'Issues', href: '/issues', icon: MapPin },
    { name: 'Map View', href: '/map', icon: Map },
    { name: 'Facilities', href: '/facilities', icon: Building2 },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'AI Report Analyst', href: '/ai-report-analuser', icon: Brain },
    { name: 'Workflows', href: '/workflows', icon: Zap },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Departments', href: '/departments', icon: Building2 },
    { name: 'Comments', href: '/comments', icon: MessageSquare },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'API Docs', href: '/api-docs', icon: Globe },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="flex flex-col w-64 gov-surface text-white">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-gray-800">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">SS</span>
        </div>
        <span className="ml-2 text-xl font-bold">SamudraSetu Admin</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-[#1b3552] hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Sign Out */}
      <div className="px-4 py-4 border-t border-gray-800">
        <button
          onClick={handleSignOut}
          className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md gov-btn gov-btn-primary"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  )
}