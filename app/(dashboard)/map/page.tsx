'use client';

import { useState, useEffect } from 'react';
import IssuesMap from '@/components/IssuesMap';
import { MapPin, Filter, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase'

export default function MapPage() {
  const [selectedStatus, setSelectedStatus] = useState('all' as 'all' | 'pending' | 'in_progress' | 'resolved' | 'closed');
  const [reports, setReports] = useState<any[]>([])

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('view_public_reports_geojson')
        .select('*')
        .limit(500)
      setReports((data || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        hazard_type: r.hazard_type,
        severity: r.severity,
        status: r.status,
        location: { latitude: r.location.coordinates[1], longitude: r.location.coordinates[0] },
        created_at: r.created_at,
      })))
    })()

    const channel = supabase
      .channel('ocean_hazard_reports_public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ocean_hazard_reports' }, async () => {
        const { data } = await supabase
          .from('view_public_reports_geojson')
          .select('*')
          .limit(500)
        setReports((data || []).map((r: any) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          hazard_type: r.hazard_type,
          severity: r.severity,
          status: r.status,
          location: { latitude: r.location.coordinates[1], longitude: r.location.coordinates[0] },
          created_at: r.created_at,
        })))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Issues Map</h1>
          <p className="text-gray-600">View all civic issues on an interactive map</p>
        </div>

        {/* Map Controls */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-500" />
              <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
                Filter by Status:
              </label>
              <select
                id="status-filter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Filter by Status"
              >
                <option value="all">All Issues</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>Click markers to view issue details</span>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <IssuesMap 
            height="600px"
            reports={reports}
            filterStatus={selectedStatus}
            onIssueClick={(issue) => {
              // Navigate to issue details
              window.location.href = `/issues/${issue.id}`;
            }}
          />
        </div>

        {/* Map Information */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <MapPin className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Pending Issues</p>
                <p className="text-lg font-semibold text-gray-900">Yellow Markers</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-lg font-semibold text-gray-900">Blue Markers</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Resolved Issues</p>
                <p className="text-lg font-semibold text-gray-900">Green Markers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
