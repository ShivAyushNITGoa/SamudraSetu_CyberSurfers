'use client'

import { CitizenReport } from '@/lib/citizen-queries'
import { MapPin, Clock, User, MessageSquare, Eye, ArrowRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface IssueCardProps {
  issue: CitizenReport
}

export default function IssueCard({ issue }: IssueCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'in_progress': return 'text-blue-600 bg-blue-100'
      case 'resolved': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100'
      case 'high': return 'text-orange-600 bg-orange-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending'
      case 'in_progress': return 'In Progress'
      case 'resolved': return 'Resolved'
      default: return status
    }
  }

  const getPriorityLabel = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1)
  }

  const getCategoryLabel = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      infrastructure: 'Infrastructure',
      environment: 'Environment',
      safety: 'Public Safety',
      transport: 'Transport',
      utilities: 'Utilities',
      other: 'Other'
    }
    return categoryMap[category] || category
  }

  return (
    <Link href={`/citizen/issues/${issue.id}`}>
      <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-5 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-3">
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {issue.title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {issue.description}
            </p>
          </div>
          {issue.media_urls && issue.media_urls.length > 0 && (
            <div className="ml-3 flex-shrink-0">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden shadow-sm">
                <img
                  src={issue.media_urls[0]}
                  alt="Issue"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            </div>
          )}
        </div>

        {/* Category and Priority */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200">
            {getCategoryLabel(issue.hazard_type)}
          </span>
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${getPriorityColor(issue.severity)}`}>
            {getPriorityLabel(issue.severity)}
          </span>
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(issue.status)}`}>
            {getStatusLabel(issue.status)}
          </span>
        </div>

        {/* Location and Time */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center flex-1 min-w-0">
            <div className="p-1.5 bg-gray-100 rounded-lg mr-2">
              <MapPin className="h-3.5 w-3.5 text-gray-600" />
            </div>
            <span className="truncate">
              {issue.address || 'Location not specified'}
            </span>
          </div>
          <div className="flex items-center ml-2">
            <div className="p-1.5 bg-gray-100 rounded-lg mr-2">
              <Clock className="h-3.5 w-3.5 text-gray-600" />
            </div>
            <span className="whitespace-nowrap">
              {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            {issue.reporter_name && (
              <div className="flex items-center text-sm text-gray-500">
                <div className="p-1 bg-blue-100 rounded-full mr-2">
                  <User className="h-3 w-3 text-blue-600" />
                </div>
                <span className="font-medium">{issue.reporter_name}</span>
              </div>
            )}
            {issue.comments_count && issue.comments_count > 0 && (
              <div className="flex items-center text-sm text-gray-500">
                <div className="p-1 bg-green-100 rounded-full mr-2">
                  <MessageSquare className="h-3 w-3 text-green-600" />
                </div>
                <span>{issue.comments_count}</span>
              </div>
            )}
          </div>
          <div className="flex items-center text-blue-600 group-hover:text-blue-700 transition-colors">
            <span className="text-sm font-medium mr-1">View</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  )
}
