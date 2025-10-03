'use client'

import Link from 'next/link'
import { RefreshCw, Plus } from 'lucide-react'

interface HeaderBarProps {
  title: string
  subtitle?: string
  onRefresh?: () => void
  refreshing?: boolean
}

export default function HeaderBar({ title, subtitle, onRefresh, refreshing }: HeaderBarProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 sticky top-0 z-10">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1 truncate">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={!!refreshing}
                className={`p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ${
                  refreshing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title="Refresh"
                aria-label="Refresh"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            )}
            <Link
              href="/citizen/report"
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Report Issue</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}


