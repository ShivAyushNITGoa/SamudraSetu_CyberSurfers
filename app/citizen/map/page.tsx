'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { getCitizenReports, CitizenReport } from '@/lib/citizen-queries'
import { fetchNearbyFacilities, type FacilityRecord, type FacilityType } from '@/lib/facilities'
import { MapPin, Filter, RefreshCw, AlertCircle, Clock, CheckCircle, X, Layers } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '@/components/LoadingSpinner'
const Map = dynamic(() => import('@/components/OpenStreetMap'), { ssr: false })

type FilterStatus = 'all' | 'pending' | 'in_progress' | 'resolved'

type FacilityMarker = { lat: number; lng: number; title: string; description?: string; status?: string; facility?: FacilityRecord }

enum LayersMode { Issues = 'issues', Facilities = 'facilities', Both = 'both' }

export default function MapPage() {
  const router = useRouter()
  const [issues, setIssues] = useState<CitizenReport[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('all')
  const [selectedIssue, setSelectedIssue] = useState<CitizenReport | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [distanceKm, setDistanceKm] = useState<number>(0)

  const [showFacilities, setShowFacilities] = useState<boolean>(true)
  const [facilityTypes, setFacilityTypes] = useState<FacilityType[]>(['hospital','police'])
  const [nearbyFacilities, setNearbyFacilities] = useState<FacilityRecord[]>([])

  useEffect(() => {
    loadIssues()
    getUserLocation()
  }, [])

  useEffect(() => {
    if (userLocation) loadFacilities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation, facilityTypes])

  const loadIssues = async () => {
    setLoading(true)
    try {
      const data = await getCitizenReports()
      setIssues(data)
    } catch (error) {
      console.error('Error loading issues:', error)
      toast.error('Failed to load issues')
    } finally {
      setLoading(false)
    }
  }

  const loadFacilities = async () => {
    if (!userLocation) return
    try {
      const data = await fetchNearbyFacilities({ latitude: userLocation.lat, longitude: userLocation.lng, radiusMeters: 6000, types: facilityTypes })
      setNearbyFacilities(data)
    } catch (e) {
      console.error('Error loading facilities:', e)
    }
  }

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }

  const filteredIssues = issues.filter(issue => {
    const statusOk = selectedStatus === 'all' || issue.status === selectedStatus
    if (!statusOk) return false
    if (distanceKm && userLocation && issue.latitude && issue.longitude) {
      const d = calculateDistance(userLocation.lat, userLocation.lng, issue.latitude, issue.longitude)
      return d <= distanceKm
    }
    return true
  })

  const issueMarkers = useMemo(() => (
    filteredIssues
      .filter(i => typeof i.latitude === 'number' && typeof i.longitude === 'number')
      .map(i => ({
        lat: i.latitude as number,
        lng: i.longitude as number,
        title: i.title,
        description: i.description,
        status: i.status,
        issue: i,
      }))
  ), [filteredIssues])

  const facilityMarkers: FacilityMarker[] = useMemo(() => (
    nearbyFacilities.map(f => ({
      lat: f.latitude,
      lng: f.longitude,
      title: `${f.name} (${f.type})`,
      description: f.address,
      status: f.type === 'hospital' ? 'resolved' : (f.type === 'police' ? 'in_progress' : 'pending'),
      facility: f
    }))
  ), [nearbyFacilities])

  const center = useMemo(() => {
    const base = issueMarkers.length > 0 ? issueMarkers : facilityMarkers
    if (base.length > 0) {
      const lat = base.reduce((s, m) => s + m.lat, 0) / base.length
      const lng = base.reduce((s, m) => s + m.lng, 0) / base.length
      return { lat, lng }
    }
    return { lat: 15.4989, lng: 73.8278 } // Goa default
  }, [issueMarkers, facilityMarkers])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500'
      case 'in_progress': return 'bg-blue-500'
      case 'resolved': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock
      case 'in_progress': return AlertCircle
      case 'resolved': return CheckCircle
      default: return MapPin
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Civic Map
              </h1>
              <p className="text-sm text-gray-600 mt-1">Explore issues and facilities in your area</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadIssues}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                title="Refresh"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowFacilities(v => !v)}
                className={`p-2 rounded-xl transition-colors ${showFacilities ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                title="Toggle facilities layer"
              >
                <Layers className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Status Filter and Facility Types */}
          <div className="flex flex-col gap-2">
            <div className="flex space-x-1 bg-gray-100/80 backdrop-blur-sm p-1 rounded-xl">
              {[
                { value: 'all', label: 'All', icon: MapPin },
                { value: 'pending', label: 'Pending', icon: Clock },
                { value: 'in_progress', label: 'In Progress', icon: AlertCircle },
                { value: 'resolved', label: 'Resolved', icon: CheckCircle },
              ].map((tab) => {
                const isActive = selectedStatus === tab.value
                return (
                  <button
                    key={tab.value}
                    onClick={() => setSelectedStatus(tab.value as FilterStatus)}
                    className={`flex-1 flex items-center justify-center py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <tab.icon className="h-4 w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                )
              })}
            </div>

            {showFacilities && (
              <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                {(['hospital','police','water','electricity','municipal','school','transport'] as FacilityType[]).map(t => (
                  <label key={t} className="inline-flex items-center gap-2 bg-gray-100 px-2 py-1 rounded">
                    <input type="checkbox" checked={facilityTypes.includes(t)} onChange={(e) => {
                      setFacilityTypes(prev => e.target.checked ? [...prev, t] : prev.filter(x => x !== t))
                    }} />
                    <span className="capitalize">{t}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Distance Filter */}
            <div className="flex items-center gap-3">
              <label htmlFor="distance-filter" className="text-xs text-gray-600">Within (km)</label>
              <input 
                id="distance-filter"
                type="range" 
                min={0} 
                max={20} 
                step={1} 
                value={distanceKm} 
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                title="Distance filter in kilometers"
                aria-label="Distance filter in kilometers"
              />
              <span className="text-xs text-gray-700 w-8">{distanceKm || 'Any'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative m-4 sm:m-6 rounded-2xl shadow-lg overflow-hidden bg-white">
        <Map
          center={userLocation || center}
          zoom={(issueMarkers.length + (showFacilities ? facilityMarkers.length : 0)) === 1 ? 16 : 12}
          markers={
            (userLocation
              ? [{ lat: userLocation.lat, lng: userLocation.lng, title: 'You are here', status: 'resolved' } as any]
              : []
            ).concat(issueMarkers as any).concat(showFacilities ? (facilityMarkers as any) : [])
          }
          height="400px"
          showControls
          onMarkerClick={(m: any) => {
            const issue = m.issue as CitizenReport | undefined
            if (issue?.id) {
              router.push(`/citizen/issues/${issue.id}`)
              return
            }
            const facility = m.facility as FacilityRecord | undefined
            if (facility?.id) {
              router.push(`/citizen/facilities/${facility.id}`)
              return
            }
          }}
        />
      </div>

      {/* Issues List */}
      <div className="px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Issues in Your Area ({filteredIssues.length})
        </h2>
        {filteredIssues.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No issues found</h3>
              <p className="text-gray-600">
                {selectedStatus === 'all' 
                  ? 'No issues have been reported in your area yet'
                  : `No ${selectedStatus} issues found`
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => setSelectedIssue(issue)}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
                      {issue.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">
                      {issue.description}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(issue.status)} text-white`}>
                        {issue.status.replace('_', ' ')}
                      </span>
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                        {issue.hazard_type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50">
          <div className="bg-white/95 backdrop-blur-md rounded-t-3xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Issue Details</h2>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                  title="Close"
                  aria-label="Close issue details"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{selectedIssue.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{selectedIssue.description}</p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(selectedIssue.status)} text-white`}>
                    {selectedIssue.status.replace('_', ' ')}
                  </span>
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200">
                    {selectedIssue.hazard_type}
                  </span>
                </div>
                
                {selectedIssue.address && (
                  <div className="flex items-start p-4 bg-gray-50/50 rounded-xl">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Location</p>
                      <span className="text-gray-600">{selectedIssue.address}</span>
                    </div>
                  </div>
                )}
                
                {selectedIssue.media_urls && selectedIssue.media_urls.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-900 mb-4">Photos</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedIssue.media_urls.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Issue photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-xl shadow-sm"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}
