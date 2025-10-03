'use client'

import { useState } from 'react'
import { OceanHazardReport } from '@/lib/database'
import { MapPin, Clock, CheckCircle, XCircle, AlertTriangle, User, Calendar, Eye, Waves, CloudRain, Wind, Droplets, Sun, Cloud, Navigation } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface OceanHazardReportCardProps {
  report: OceanHazardReport
  onStatusChange: (id: string, status: OceanHazardReport['status']) => void
  onViewDetails: (id: string) => void
}

const getHazardIcon = (hazardType: string) => {
  switch (hazardType) {
    case 'tsunami':
      return <Waves className="h-4 w-4 text-red-500" />
    case 'storm_surge':
      return <CloudRain className="h-4 w-4 text-orange-500" />
    case 'flooding':
      return <Droplets className="h-4 w-4 text-blue-500" />
    case 'erosion':
      return <Wind className="h-4 w-4 text-yellow-500" />
    case 'unusual_tides':
      return <Sun className="h-4 w-4 text-purple-500" />
    case 'coastal_damage':
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    case 'marine_pollution':
      return <Cloud className="h-4 w-4 text-gray-500" />
    case 'weather_anomaly':
      return <Navigation className="h-4 w-4 text-indigo-500" />
    default:
      return <AlertTriangle className="h-4 w-4 text-gray-500" />
  }
}

const getHazardColor = (hazardType: string) => {
  switch (hazardType) {
    case 'tsunami':
      return 'bg-red-100 text-red-800'
    case 'storm_surge':
      return 'bg-orange-100 text-orange-800'
    case 'flooding':
      return 'bg-blue-100 text-blue-800'
    case 'erosion':
      return 'bg-yellow-100 text-yellow-800'
    case 'unusual_tides':
      return 'bg-purple-100 text-purple-800'
    case 'coastal_damage':
      return 'bg-red-100 text-red-800'
    case 'marine_pollution':
      return 'bg-gray-100 text-gray-800'
    case 'weather_anomaly':
      return 'bg-indigo-100 text-indigo-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function OceanHazardReportCard({ report, onStatusChange, onViewDetails }: OceanHazardReportCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unverified':
        return 'bg-yellow-100 text-yellow-800'
      case 'verified':
        return 'bg-green-100 text-green-800'
      case 'false_alarm':
        return 'bg-red-100 text-red-800'
      case 'resolved':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unverified':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'false_alarm':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'critical':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleStatusChange = async (newStatus: OceanHazardReport['status']) => {
    if (isUpdating) return
    
    setIsUpdating(true)
    try {
      await onStatusChange(report.id, newStatus)
      toast.success(`Report status updated to ${newStatus.replace('_', ' ')}`)
    } catch (error) {
      toast.error('Failed to update report status')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {report.title}
          </h3>
          <div className="flex items-center space-x-2 mb-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
              {getStatusIcon(report.status)}
              <span className="ml-1">{report.status.replace('_', ' ')}</span>
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(report.severity)}`}>
              {report.severity}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getHazardIcon(report.hazard_type)}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHazardColor(report.hazard_type)}`}>
            {report.hazard_type.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {report.description}
      </p>

      {/* Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <MapPin className="h-4 w-4 mr-2" />
          <span className="truncate">{report.address}</span>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{format(new Date(report.created_at), 'MMM dd, yyyy HH:mm')}</span>
        </div>
        {report.confidence_score && (
          <div className="flex items-center text-sm text-gray-500">
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              Confidence: {Math.round(report.confidence_score * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Media indicator */}
      {report.media_urls && report.media_urls.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <span className="bg-gray-100 px-2 py-1 rounded text-xs">
              {report.media_urls.length} media file{report.media_urls.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Social Media Indicators */}
      {report.social_media_indicators && Object.keys(report.social_media_indicators).length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-700 font-medium mb-1">Social Media Activity</div>
          <div className="flex items-center space-x-4 text-xs text-blue-600">
            {report.social_media_indicators.tweet_count && (
              <span>{report.social_media_indicators.tweet_count} tweets</span>
            )}
            {report.social_media_indicators.sentiment_score && (
              <span>Sentiment: {report.social_media_indicators.sentiment_score > 0 ? 'Positive' : report.social_media_indicators.sentiment_score < 0 ? 'Negative' : 'Neutral'}</span>
            )}
            {report.social_media_indicators.trending_keywords && report.social_media_indicators.trending_keywords.length > 0 && (
              <span>Keywords: {report.social_media_indicators.trending_keywords.slice(0, 2).join(', ')}</span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          {report.status === 'unverified' && (
            <>
              <button
                onClick={() => handleStatusChange('verified')}
                disabled={isUpdating}
                className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors disabled:opacity-50"
              >
                Verify
              </button>
              <button
                onClick={() => handleStatusChange('false_alarm')}
                disabled={isUpdating}
                className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors disabled:opacity-50"
              >
                False Alarm
              </button>
            </>
          )}
          {report.status === 'verified' && (
            <button
              onClick={() => handleStatusChange('resolved')}
              disabled={isUpdating}
              className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors disabled:opacity-50"
            >
              Mark Resolved
            </button>
          )}
        </div>
        <button
          onClick={() => onViewDetails(report.id)}
          className="flex items-center text-sm text-blue-600 hover:text-blue-700"
        >
          <Eye className="h-4 w-4 mr-1" />
          View Details
        </button>
      </div>
    </div>
  )
}
