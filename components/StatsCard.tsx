'use client'

import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number
  icon: LucideIcon
  color: 'blue' | 'green' | 'red' | 'purple' | 'yellow' | 'gray'
  change?: string
  trend?: 'up' | 'down' | 'neutral'
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    value: 'text-blue-900'
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    value: 'text-green-900'
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    value: 'text-red-900'
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    value: 'text-purple-900'
  },
  yellow: {
    bg: 'bg-yellow-50',
    icon: 'text-yellow-600',
    value: 'text-yellow-900'
  },
  gray: {
    bg: 'bg-gray-50',
    icon: 'text-gray-600',
    value: 'text-gray-900'
  }
}

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  change, 
  trend = 'neutral' 
}: StatsCardProps) {
  const colors = colorClasses[color]

  return (
    <div className={`gov-card p-6`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-300 mb-1">{title}</p>
          <p className={`text-3xl font-bold text-white mb-2`}>
            {value.toLocaleString()}
          </p>
          {change && (
            <div className="flex items-center">
              <span className={`text-sm ${
                trend === 'up' ? 'text-green-600' :
                trend === 'down' ? 'text-red-600' :
                'text-gray-400'
              }`}>
                {change}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-[#12283e]`}>
          <Icon className={`h-6 w-6 text-blue-400`} />
        </div>
      </div>
    </div>
  )
}