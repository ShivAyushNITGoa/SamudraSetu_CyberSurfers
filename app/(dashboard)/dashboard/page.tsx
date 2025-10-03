'use client'

import { useState, useEffect } from 'react'
import DashboardLeafletMap from '@/components/DashboardLeafletMap'
import { supabase } from '@/lib/supabase'

export default function Dashboard() {
  const [mapView, setMapView] = useState<'markers' | 'clusters' | 'heatmap'>('markers')
  const [stats, setStats] = useState({ total: 0, verified: 0 })

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('v_reports_analytics')
        .select('total, verified')
        .order('day', { ascending: false })
        .limit(1)
      if (!error && data && data.length) {
        setStats({ total: data[0].total as number, verified: data[0].verified as number })
      }
    })()
  }, [])

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-white">Ocean Hazard Dashboard</h1>
                </div>
            
            {/* Map View Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setMapView('markers')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    mapView === 'markers' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Markers
                </button>
                <button
                  onClick={() => setMapView('clusters')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    mapView === 'clusters' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Clusters
                </button>
                <button
                  onClick={() => setMapView('heatmap')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    mapView === 'heatmap' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Heatmap
                </button>
              </div>
            </div>
          </div>
            </div>
          </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Ocean Hazard Map</h2>
                <p className="text-sm text-gray-600">Interactive map view</p>
              </div>
              <div className="h-96">
                <DashboardLeafletMap 
                  className="w-full h-full"
                  height="100%"
                  viewMode={mapView}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Reports</span>
                  <span className="font-semibold">{stats.total}</span>
              </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Alerts</span>
                  <span className="font-semibold">0</span>
              </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Verified Reports</span>
                  <span className="font-semibold">{stats.verified}</span>
            </div>
          </div>
        </div>

            {/* Map Controls */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Map Controls</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    View Mode
                  </label>
                  <select 
                    value={mapView}
                    onChange={(e) => setMapView(e.target.value as 'markers' | 'clusters' | 'heatmap')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Select map view mode"
                  >
                    <option value="markers">Markers</option>
                    <option value="clusters">Clusters</option>
                    <option value="heatmap">Heatmap</option>
                  </select>
                    </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}