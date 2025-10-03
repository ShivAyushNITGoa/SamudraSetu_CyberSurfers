'use client';

import { useEffect, useRef, useState } from 'react';
import OceanHazardReportCard from '@/components/OceanHazardReportCard';
import { OceanHazardReport } from '@/lib/database';
import { Search, Filter, Download, Waves, AlertTriangle, MapPin } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import OceanHazardMap from '@/components/OceanHazardMap';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function OceanHazardReportsPage() {
  const [reports, setReports] = useState<OceanHazardReport[]>([]);
  const [pageOffset, setPageOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filteredReports, setFilteredReports] = useState<OceanHazardReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [hazardTypeFilter, setHazardTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    // initial page load
    setReports([]);
    setPageOffset(0);
    setHasMore(true);
    loadNextPage(0);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm), 250);
    return () => clearTimeout(id);
  }, [searchTerm]);

  useEffect(() => {
    filterReports();
  }, [reports, debouncedSearch, statusFilter, hazardTypeFilter, severityFilter]);

  const loadNextPage = async (offset = pageOffset) => {
    try {
      setLoading(true);
      const PAGE_SIZE = 24;
      const { data, error } = await supabase
        .from('ocean_hazard_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (error) throw error;

      const normalizeLocation = (loc: any): { latitude: number; longitude: number } => {
        try {
          if (!loc) return { latitude: 0, longitude: 0 };
          if (typeof loc === 'string' && loc.startsWith('POINT(')) {
            const match = loc.match(/POINT\(([^)]+)\)/);
            if (match) {
              const parts = match[1].split(' ');
              const lng = parseFloat(parts[0]);
              const lat = parseFloat(parts[1]);
              if (isFinite(lat) && isFinite(lng)) return { latitude: lat, longitude: lng };
            }
          }
          const parsed = typeof loc === 'string' ? JSON.parse(loc) : loc;
          if (parsed && Array.isArray(parsed.coordinates) && parsed.coordinates.length >= 2) {
            const lng = Number(parsed.coordinates[0]);
            const lat = Number(parsed.coordinates[1]);
            if (isFinite(lat) && isFinite(lng)) return { latitude: lat, longitude: lng };
          }
          if (typeof parsed?.latitude === 'number' && typeof parsed?.longitude === 'number') {
            return { latitude: parsed.latitude, longitude: parsed.longitude };
          }
          if (typeof parsed?.lat === 'number' && typeof parsed?.lng === 'number') {
            return { latitude: parsed.lat, longitude: parsed.lng };
          }
          return { latitude: 0, longitude: 0 };
        } catch {
          return { latitude: 0, longitude: 0 };
        }
      };

      setReports((prev) => {
        const byId = new Map<string, OceanHazardReport>();
        for (const it of prev) byId.set(it.id, it);
        for (const it of data || []) byId.set(it.id, { ...it, location: normalizeLocation((it as any).location) } as any);
        return Array.from(byId.values());
      });
      setHasMore((data || []).length === PAGE_SIZE);
      setPageOffset(offset + (data || []).length);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast.error('Failed to load ocean hazard reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = [...reports];

    // Search filter
    if (debouncedSearch) {
      filtered = filtered.filter(report =>
        report.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        report.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        report.address.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        report.hazard_type.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    // Hazard type filter
    if (hazardTypeFilter !== 'all') {
      filtered = filtered.filter(report => report.hazard_type === hazardTypeFilter);
    }

    // Severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(report => report.severity === severityFilter);
    }

    // Sort by severity then recency
    filtered.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const aSeverity = severityOrder[a.severity as keyof typeof severityOrder] || 0;
      const bSeverity = severityOrder[b.severity as keyof typeof severityOrder] || 0;
      if (aSeverity !== bSeverity) return bSeverity - aSeverity;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    setFilteredReports(filtered);
  };

  const handleStatusChange = async (id: string, status: OceanHazardReport['status']) => {
    console.log('Status change clicked:', { id, status });
    try {
      const { error } = await supabase
        .from('ocean_hazard_reports')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      setReports(prev => prev.map(report => 
        report.id === id ? { ...report, status } : report
      ));
      toast.success(`Report status updated to ${status.replace('_', ' ')}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update report status: ' + (error as Error).message);
    }
  };

  const handleViewDetails = (id: string) => {
    window.location.href = `/issues/${id}`;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setHazardTypeFilter('all');
    setSeverityFilter('all');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" text="Loading ocean hazard reports..." />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Waves className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Ocean Hazard Reports</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button className="btn btn-secondary flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
            <Link href="/issues/new" className="btn btn-primary">
              <AlertTriangle className="h-4 w-4 mr-2" />
              New Report
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search ocean hazard reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="select"
                aria-label="Filter by status"
                title="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="unverified">Unverified</option>
                <option value="verified">Verified</option>
                <option value="false_alarm">False Alarm</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {/* Hazard Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hazard Type
              </label>
              <select
                value={hazardTypeFilter}
                onChange={(e) => setHazardTypeFilter(e.target.value)}
                className="select"
                aria-label="Filter by hazard type"
                title="Filter by hazard type"
              >
                <option value="all">All Types</option>
                <option value="tsunami">Tsunami</option>
                <option value="storm_surge">Storm Surge</option>
                <option value="flooding">Flooding</option>
                <option value="erosion">Coastal Erosion</option>
                <option value="unusual_tides">Unusual Tides</option>
                <option value="coastal_damage">Coastal Damage</option>
                <option value="marine_pollution">Marine Pollution</option>
                <option value="weather_anomaly">Weather Anomaly</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Severity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity
              </label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="select"
                aria-label="Filter by severity"
                title="Filter by severity"
              >
                <option value="all">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ocean Hazard Map */}
        <div className="mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Ocean Hazard Map
            </h3>
            <div style={{ height: '500px' }}>
              <OceanHazardMap 
                reports={filteredReports as any}
                viewMode={'markers'}
              />
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <OceanHazardReportCard
              key={report.id}
              report={report}
              onStatusChange={handleStatusChange}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>

        {filteredReports.length === 0 && (
          <EmptyState
            icon={<Waves className="h-12 w-12" />}
            title="No ocean hazard reports found"
            description="Try adjusting your filters or search terms."
            action={
              <button
                onClick={clearFilters}
                className="btn btn-primary"
              >
                Clear Filters
              </button>
            }
          />
        )}
      </div>
    </div>
  );
}