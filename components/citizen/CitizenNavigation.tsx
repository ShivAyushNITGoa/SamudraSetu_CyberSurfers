'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Home, 
  Plus, 
  Map, 
  User,
  MapPin,
  Bell
} from 'lucide-react'

export default function CitizenNavigation() {
  const pathname = usePathname()

  const navigation = [
    { 
      name: 'Issues', 
      href: '/citizen', 
      icon: Home,
      label: 'Issues',
      shortLabel: 'Home'
    },
    { 
      name: 'Report', 
      href: '/citizen/report', 
      icon: Plus,
      label: 'Report',
      shortLabel: 'Add',
      isPrimary: true
    },
    { 
      name: 'Facilities', 
      href: '/citizen/facilities', 
      icon: MapPin,
      label: 'Facilities',
      shortLabel: 'Nearby'
    },
    { 
      name: 'Map', 
      href: '/citizen/map', 
      icon: Map,
      label: 'Map',
      shortLabel: 'Map'
    },
    { 
      name: 'Profile', 
      href: '/citizen/profile', 
      icon: User,
      label: 'Profile',
      shortLabel: 'Me'
    },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/50 px-4 py-2 z-50 shadow-lg">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-blue-600 bg-blue-50/80'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50/50'
              }`}
            >
              {item.isPrimary && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></div>
              )}
              <div className={`p-2 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg' 
                  : 'hover:bg-blue-50'
              }`}>
                <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
              </div>
              <span className={`text-xs font-medium mt-1 ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                {item.shortLabel}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
