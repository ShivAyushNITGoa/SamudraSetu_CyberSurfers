'use client'

import { useEffect, useState } from 'react'
import { Report } from '@/lib/database'
import { getReportsPage } from '@/lib/queries'
import dynamic from 'next/dynamic'
const Map = dynamic(() => import('./Map'), { ssr: false })
import { Crosshair } from 'lucide-react'
import { MapPin, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface IssuesMapProps {
  height?: string
  className?: string
  onIssueClick?: (issue: Report) => void
  filterStatus?: 'all' | 'pending' | 'in_progress' | 'resolved' | 'closed'
}

export default function IssuesMap({ 
  height = '500px', 
  className = '',
  onIssueClick,
  filterStatus = 'all'
}: IssuesMapProps) {
  const [issues, setIssues] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [useSimpleMap, setUseSimpleMap] = useState(false)
  const [userLocation, setUserLocation] = useState<{lat:number; lng:number} | null>(null)

  useEffect(() => {
    loadIssues()
  }, [filterStatus])

  const loadIssues = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const allIssues = await getReportsPage(100, 0)
      
      // Filter issues based on status
      const filteredIssues = filterStatus === 'all' 
        ? allIssues 
        : allIssues.filter(issue => issue.status === filterStatus)
      
      setIssues(filteredIssues)
    } catch (err) {
      console.error('Error loading issues for map:', err)
      setError('Failed to load issues for map')
      toast.error('Failed to load issues for map')
    } finally {
      setLoading(false)
    }
  }

  // Convert issues to map markers
  const markers = issues
    .filter(issue => Number.isFinite(issue.location?.latitude as any) && Number.isFinite(issue.location?.longitude as any))
    .map(issue => ({
      lat: issue.location.latitude,
      lng: issue.location.longitude,
      title: issue.title,
      description: issue.description,
      status: issue.status,
      issue: issue // Store the full issue object
    }))

  // Calculate center point (average of all markers)
  const center = markers.length > 0 
    ? {
        lat: markers.reduce((sum, marker) => sum + marker.lat, 0) / markers.length,
        lng: markers.reduce((sum, marker) => sum + marker.lng, 0) / markers.length
      }
    : { lat: 15.4989, lng: 73.8278 } // Default to Goa, India

  const handleMarkerClick = (marker: any) => {
    if (onIssueClick && marker.issue) {
      onIssueClick(marker.issue)
    }
  }

  const locateMe = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    })
  }

  // No API key needed with OpenLayers + OSM
  useEffect(() => {
    setUseSimpleMap(false)
  }, [])

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading map...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Map Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Issues Map</h3>
          <p className="text-sm text-gray-600">
            {markers.length} issue{markers.length !== 1 ? 's' : ''} shown on map
          </p>
        </div>
        
        <div className="flex items-center justify-between gap-2">
          {/* Legend */}
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Pending</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span>In Progress</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span>Resolved</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Closed</span>
            </div>
          </div>

          {/* Map Toggle Button (for debugging) */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={() => setUseSimpleMap(!useSimpleMap)}
              className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
            >
              {useSimpleMap ? 'Use Google Maps' : 'Use Simple Map'}
            </button>
          )}
          <button onClick={locateMe} className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded inline-flex items-center">
            <Crosshair className="h-3 w-3 mr-1" />
            My Location
          </button>
        </div>
      </div>

      {/* Map */}
      <Map
        center={center}
        zoom={markers.length === 1 ? 16 : 12}
        markers={userLocation ? ([{ lat: userLocation.lat, lng: userLocation.lng, title: 'You are here', description: '', status: 'resolved' }] as any).concat(markers as any) : markers}
        height={height}
        onMarkerClick={handleMarkerClick}
        showControls={true}
      />

      {/* Density hint removed to avoid layout issues */}

      {/* Map Footer */}
      {markers.length === 0 && (
        <div className="mt-4 text-center py-8 bg-gray-50 rounded-lg">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">No issues with location data found</p>
          <p className="text-gray-500 text-sm mt-1">
            {filterStatus === 'all' 
              ? 'Issues need to have valid location coordinates to appear on the map'
              : `No ${filterStatus} issues with location data found`
            }
          </p>
        </div>
      )}
    </div>
  )
}
