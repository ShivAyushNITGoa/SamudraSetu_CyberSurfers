'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { 
  MapPin, 
  Plus, 
  Bell, 
  User, 
  Settings,
  Waves,
  AlertTriangle,
  TrendingUp,
  Eye,
  Filter,
  RefreshCw,
  Search,
  Menu,
  X
} from 'lucide-react'

// Dynamic imports for better performance
const Map = dynamic(() => import('@/components/OceanHazardMap'), { 
  ssr: false,
  loading: () => <div className="h-96 bg-gray-200 animate-pulse rounded-lg" />
})

const StatsCard = dynamic(() => import('@/components/StatsCard'), { ssr: false })
import HeaderBar from '@/components/citizen/HeaderBar'
import FloatingReportButton from '@/components/citizen/FloatingReportButton'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface OceanHazardReport {
  id: string
  title: string
  description: string
  hazard_type: string
  severity: string
  status: string
  location: {
    latitude: number
    longitude: number
  }
  created_at: string
  confidence_score: number
  social_media_indicators: {
    tweet_count?: number
    sentiment_score?: number
    trending_keywords?: string[]
  }
}

interface DashboardStats {
  total_reports: number
  my_reports: number
  nearby_reports: number
  alerts_count: number
}

export default function CitizenDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [reports, setReports] = useState<OceanHazardReport[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mapView, setMapView] = useState<'markers' | 'heatmap' | 'clusters'>('markers')
  const [selectedHazardType, setSelectedHazardType] = useState<string>('all')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [searchText, setSearchText] = useState<string>('')
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null)

  // Check authentication
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/citizen/auth')
        return
      }
      setUser(user)
    }
    checkUser()
  }, [router])

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }, [])

  // Fetch data (server-filtered)
  const fetchData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedHazardType !== 'all') params.set('type', selectedHazardType)
      if (selectedSeverity !== 'all') params.set('severity', selectedSeverity)
      if (searchText.trim()) params.set('q', searchText.trim())
      params.set('limit', '100')
      const res = await fetch(`/api/reports?${params.toString()}`)
      const resJson = await res.json()
      if (!res.ok || !resJson.success) throw new Error(resJson.error || 'Failed to fetch reports')
      const reportsData = resJson.data

      // Fetch user's own reports
      const { data: myReportsData, error: myReportsError } = await supabase
        .from('ocean_hazard_reports')
        .select('*', { count: 'exact' })
        .eq('user_id', user?.id)

      if (myReportsError) throw myReportsError

      // Fetch nearby reports if location available
      let nearbyReports = 0
      if (userLocation) {
        const { data: nearbyData, error: nearbyError } = await supabase
          .rpc('get_nearby_reports', {
            user_lat: userLocation.latitude,
            user_lon: userLocation.longitude,
            radius_km: 10
          })

        if (!nearbyError) {
          nearbyReports = nearbyData?.length || 0
        }
      }

      // Fetch alerts count
      const { data: alertsData, error: alertsError } = await supabase
        .from('alert_notifications')
        .select('*', { count: 'exact' })
        .contains('target_roles', ['citizen', 'all'])
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      if (alertsError) throw alertsError

      setReports(reportsData || [])
      setStats({
        total_reports: reportsData?.length || 0,
        my_reports: myReportsData?.length || 0,
        nearby_reports: nearbyReports,
        alerts_count: alertsData?.length || 0
      })
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Refetch when filters change (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      if (user) fetchData()
    }, 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHazardType, selectedSeverity, searchText])

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('ocean_hazard_reports')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ocean_hazard_reports'
      }, (payload) => {
        console.log('Real-time update:', payload)
        fetchData()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  // Filter reports
  const filteredReports = reports.filter(report => {
    const matchesHazardType = selectedHazardType === 'all' || report.hazard_type === selectedHazardType
    const matchesSeverity = selectedSeverity === 'all' || report.severity === selectedSeverity
    return matchesHazardType && matchesSeverity
  })

  const hazardTypes = [
    { value: 'all', label: 'All Hazards' },
    { value: 'tsunami', label: 'Tsunami' },
    { value: 'storm_surge', label: 'Storm Surge' },
    { value: 'flooding', label: 'Flooding' },
    { value: 'erosion', label: 'Coastal Erosion' },
    { value: 'unusual_tides', label: 'Unusual Tides' },
    { value: 'coastal_damage', label: 'Coastal Damage' },
    { value: 'marine_pollution', label: 'Marine Pollution' },
    { value: 'weather_anomaly', label: 'Weather Anomaly' }
  ]

  const severityLevels = [
    { value: 'all', label: 'All Severities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ]

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-transparent">
      <HeaderBar title="SamudraSetu" subtitle="Ocean Hazard Monitoring" onRefresh={fetchData} />

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Mobile filter bar */}
        <div className="lg:hidden mb-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-3 flex flex-col gap-3">
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search title or description"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Search"
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={selectedHazardType}
                onChange={(e) => setSelectedHazardType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Hazard Type"
              >
                {hazardTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Severity Level"
              >
                {severityLevels.map((severity) => (
                  <option key={severity.value} value={severity.value}>
                    {severity.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Reports"
              value={stats.total_reports}
              icon={MapPin}
              color="blue"
              change="Public reports"
            />
            <StatsCard
              title="My Reports"
              value={stats.my_reports}
              icon={User}
              color="green"
              change="Your submissions"
            />
            <StatsCard
              title="Nearby Reports"
              value={stats.nearby_reports}
              icon={Waves}
              color="purple"
              change="Within 10km"
            />
            <StatsCard
              title="Active Alerts"
              value={stats.alerts_count}
              icon={Bell}
              color="red"
              change="Last 24h"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Map */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Ocean Hazard Map</h2>
                  <div className="flex items-center space-x-4">
                    {/* View Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setMapView('markers')}
                        className={`px-3 py-1 rounded-full text-sm ${
                          mapView === 'markers' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        Markers
                      </button>
                      <button
                        onClick={() => setMapView('clusters')}
                        className={`px-3 py-1 rounded-full text-sm ${
                          mapView === 'clusters' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        Clusters
                      </button>
                      <button
                        onClick={() => setMapView('heatmap')}
                        className={`px-3 py-1 rounded-full text-sm ${
                          mapView === 'heatmap' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        Heatmap
                      </button>
                    </div>
                    <button
                      onClick={fetchData}
                      className="flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
              <div className="h-96">
                <Map 
                  reports={filteredReports}
                  viewMode={mapView}
                  onReportClick={(report) => console.log('Report clicked:', report)}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/citizen/report')}
                  className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Report Hazard
                </button>
                <button
                  onClick={() => router.push('/citizen/alerts')}
                  className="w-full flex items-center justify-center px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
                >
                  <Bell className="h-5 w-5 mr-2" />
                  View Alerts
                </button>
                <button
                  onClick={() => router.push('/citizen/profile')}
                  className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <User className="h-5 w-5 mr-2" />
                  My Profile
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4 hidden lg:block">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hazard Type
                  </label>
                  <select
                    value={selectedHazardType}
                    onChange={(e) => setSelectedHazardType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Hazard Type"
                  >
                    {hazardTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Severity Level
                  </label>
                  <select
                    value={selectedSeverity}
                    onChange={(e) => setSelectedSeverity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Severity Level"
                  >
                    {severityLevels.map((severity) => (
                      <option key={severity.value} value={severity.value}>
                        {severity.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Recent Reports */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Loading...</p>
                  </div>
                ) : filteredReports.length === 0 ? (
                  <div className="text-center py-4">
                    <AlertTriangle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No reports found</p>
                  </div>
                ) : (
                  filteredReports.slice(0, 5).map((report) => (
                    <div
                      key={report.id}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {report.title}
                          </h4>
                          <p className="text-xs text-gray-600 mt-1">
                            {report.hazard_type.replace('_', ' ')} • {report.severity}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(report.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className={`${
                          report.severity === 'critical' ? 'bg-red-500' :
                          report.severity === 'high' ? 'bg-orange-500' :
                          report.severity === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        } w-3 h-3 rounded-full`} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <FloatingReportButton />
    </div>
  )
}