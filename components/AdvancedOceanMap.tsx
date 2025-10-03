'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { createClient } from '@supabase/supabase-js';

const OpenStreetMap = dynamic(() => import('./OpenStreetMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full" />
});

interface OceanHazardReport {
  id: string;
  title: string;
  description: string;
  hazard_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'unverified' | 'verified' | 'false_alarm' | 'resolved';
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  media_urls: string[];
  confidence_score: number;
  social_media_indicators: any;
  verified_by: string;
  verified_at: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

interface HazardHotspot {
  id: string;
  center_location: {
    lat: number;
    lng: number;
  };
  radius_meters: number;
  report_count: number;
  severity_level: 'low' | 'medium' | 'high' | 'critical';
  confidence_score: number;
  hazard_types: string[];
  created_at: string;
  updated_at: string;
}

interface OfficialDataFeed {
  id: string;
  source: string;
  feed_type: string;
  data: any;
  location?: {
    lat: number;
    lng: number;
  };
  valid_from: string;
  valid_until: string;
  created_at: string;
}

interface AdvancedOceanMapProps {
  initialViewState?: {
    longitude: number;
    latitude: number;
    zoom: number;
  };
  onReportClick?: (report: OceanHazardReport) => void;
  onHotspotClick?: (hotspot: HazardHotspot) => void;
  filters?: {
    hazardTypes?: string[];
    severityLevels?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
    verifiedOnly?: boolean;
  };
}

const AdvancedOceanMap: React.FC<AdvancedOceanMapProps> = ({
  initialViewState = {
    longitude: 73.8278,
    latitude: 15.4989,
    zoom: 10
  },
  onReportClick,
  onHotspotClick,
  filters = {}
}) => {
  const [reports, setReports] = useState<OceanHazardReport[]>([]);
  const [hotspots, setHotspots] = useState<HazardHotspot[]>([]);
  const [officialFeeds, setOfficialFeeds] = useState<OfficialDataFeed[]>([]);
  const [viewMode, setViewMode] = useState<'reports' | 'heatmap' | 'clusters' | 'hotspots'>('reports');
  const [loading, setLoading] = useState(true);

  // Use window object to access env vars in client components
  const supabaseUrl = typeof window !== 'undefined' 
    ? (window as any).__NEXT_DATA__?.props?.env?.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    : process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  const supabaseAnonKey = typeof window !== 'undefined'
    ? (window as any).__NEXT_DATA__?.props?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
  );

  useEffect(() => {
    fetchData();
  }, [filters]);

  // Normalize various location representations from DB (PostGIS point, JSON, or object)
  function normalizeLocation(input: any): { latitude: number; longitude: number } | null {
    if (!input) return null
    // If already in desired shape
    if (typeof input.latitude === 'number' && typeof input.longitude === 'number') {
      return { latitude: input.latitude, longitude: input.longitude }
    }
    // GeoJSON Point { type: 'Point', coordinates: [lon, lat] }
    if (typeof input === 'object' && input.type === 'Point' && Array.isArray(input.coordinates)) {
      const lon = Number(input.coordinates[0])
      const lat = Number(input.coordinates[1])
      if (Number.isFinite(lat) && Number.isFinite(lon)) return { latitude: lat, longitude: lon }
    }
    // If lat/lng keys
    if (typeof input.lat === 'number' && typeof input.lng === 'number') {
      return { latitude: input.lat, longitude: input.lng }
    }
    // If string 'POINT(lon lat)'
    if (typeof input === 'string' && input.startsWith('POINT(')) {
      const parts = input.replace('POINT(', '').replace(')', '').trim().split(/\s+/)
      const lon = parseFloat(parts[0])
      const lat = parseFloat(parts[1])
      if (Number.isFinite(lat) && Number.isFinite(lon)) return { latitude: lat, longitude: lon }
    }
    // If JSON string
    if (typeof input === 'string') {
      try {
        const obj = JSON.parse(input)
        return normalizeLocation(obj)
      } catch {}
    }
    return null
  }

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching data from Supabase...');
  
      // Fetch public ocean hazard reports via view to get GeoJSON locations
      let reportsQuery = supabase
        .from('view_public_reports_geojson')
        .select('*')
        .order('created_at', { ascending: false });
  
      if (filters.hazardTypes && filters.hazardTypes.length > 0) {
        reportsQuery = reportsQuery.in('hazard_type', filters.hazardTypes);
      }
  
      if (filters.severityLevels && filters.severityLevels.length > 0) {
        reportsQuery = reportsQuery.in('severity', filters.severityLevels);
      }
  
      if (filters.verifiedOnly) {
        reportsQuery = reportsQuery.eq('status', 'verified');
      }
  
      if (filters.dateRange) {
        reportsQuery = reportsQuery
          .gte('created_at', filters.dateRange.start)
          .lte('created_at', filters.dateRange.end);
      }
  
      const { data: reportsData, error: reportsError } = await reportsQuery;
  
      if (reportsError) {
        console.error('❌ Error fetching reports:', reportsError);
      } else {
        console.log(`✅ Fetched ${reportsData?.length || 0} reports from Supabase`);
        console.log('📊 Sample report:', reportsData?.[0]);
        
        // Transform data to match OpenStreetMap component interface
        const transformedReports = (reportsData || []).map((report: any) => {
          const loc = normalizeLocation(report.location)
          console.log(`🗺️ Report "${report.title}" location:`, { 
            raw: report.location, 
            normalized: loc 
          });
          return {
            ...report,
            location: {
              latitude: loc?.latitude ?? 0,
              longitude: loc?.longitude ?? 0,
            }
          }
        });
        
        const validReports = transformedReports.filter(r => 
          r.location.latitude !== 0 && r.location.longitude !== 0
        );
        
        console.log(`✅ ${validReports.length} reports have valid locations`);
        setReports(transformedReports);
      }
  
      // Fetch hazard hotspots via API (will optionally trigger calculation)
      try {
        const res = await fetch('/api/analytics/hotspots')
        if (res.ok) {
          const json = await res.json()
          console.log(`✅ Fetched ${json.data?.length || 0} hotspots`);
          setHotspots(json.data || [])
        } else {
          console.warn('⚠️ Hotspots API returned error:', res.status);
          setHotspots([])
        }
      } catch (e) {
        console.error('❌ Error fetching hotspots:', e)
        setHotspots([])
      }
  
      // Fetch official data feeds
      const { data: feedsData, error: feedsError } = await supabase
        .from('official_data_feeds')
        .select('*')
        .gte('valid_until', new Date().toISOString())
        .order('created_at', { ascending: false });
  
      if (feedsError) {
        console.error('❌ Error fetching official feeds:', feedsError);
      } else {
        console.log(`✅ Fetched ${feedsData?.length || 0} official feeds`);
        setOfficialFeeds(feedsData || []);
      }
  
    } catch (error) {
      console.error('❌ Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Convert viewMode to OpenStreetMap compatible mode
  const getOpenStreetMapViewMode = () => {
    switch (viewMode) {
      case 'reports': return 'markers';
      case 'heatmap': return 'heatmap';
      case 'clusters': return 'clusters';
      case 'hotspots': return 'markers'; // Show hotspots as markers
      default: return 'markers';
    }
  };

  // Map simplified report type for child map component
  type SimpleReport = {
    id: string;
    title: string;
    description: string;
    hazard_type: string;
    severity: any;
    status: any;
    location: { latitude: number; longitude: number };
    created_at: string;
    confidence_score: number;
    social_media_indicators: any;
  };

  const simpleReports: SimpleReport[] = viewMode === 'hotspots'
    ? hotspots.map(h => ({
        id: h.id,
        title: 'Hotspot',
        description: `${h.report_count} reports, confidence ${(h.confidence_score * 100).toFixed(0)}%`,
        hazard_type: 'hotspot',
        severity: (h.severity_level as any) || 'medium',
        status: 'verified',
        location: {
          latitude: (h.center_location as any)?.lat,
          longitude: (h.center_location as any)?.lng,
        },
        created_at: h.created_at,
        confidence_score: h.confidence_score,
        social_media_indicators: {},
      }))
    : reports.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        hazard_type: r.hazard_type,
        severity: r.severity,
        status: r.status,
        location: r.location,
        created_at: r.created_at,
        confidence_score: r.confidence_score,
        social_media_indicators: r.social_media_indicators,
      }))

      return (
        <div className="relative w-full h-full" style={{ minHeight: '500px', height: '100%' }}>
          {/* Map Controls */}
          <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4">
            <div className="flex flex-col space-y-2">
              <h3 className="font-semibold text-sm">View Mode</h3>
              <div className="flex flex-col space-y-1">
                {[
                  { key: 'reports', label: 'Reports', icon: '📍' },
                  { key: 'heatmap', label: 'Heatmap', icon: '🔥' },
                  { key: 'clusters', label: 'Clusters', icon: '🔗' },
                  { key: 'hotspots', label: 'Hotspots', icon: '🎯' }
                ].map(mode => (
                  <button
                    key={mode.key}
                    onClick={() => setViewMode(mode.key as any)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded text-sm ${
                      viewMode === mode.key
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{mode.icon}</span>
                    <span>{mode.label}</span>
                  </button>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-600">
                {reports.length} reports loaded
              </div>
            </div>
          </div>
      
          {/* Legend */}
          <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4">
            <h3 className="font-semibold text-sm mb-2">Severity Levels</h3>
            <div className="flex flex-col space-y-1">
              {[
                { level: 'critical', color: '#dc2626', label: 'Critical' },
                { level: 'high', color: '#ea580c', label: 'High' },
                { level: 'medium', color: '#d97706', label: 'Medium' },
                { level: 'low', color: '#16a34a', label: 'Low' }
              ].map(item => (
                <div key={item.level} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
      
          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-[999]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading map data...</p>
              </div>
            </div>
          )}
      
          {/* OpenStreetMap Component */}
          <div className="absolute inset-0 w-full h-full" style={{ height: '100%' }}>
            <OpenStreetMap
              reports={simpleReports as any}
              viewMode={getOpenStreetMapViewMode()}
              onReportClick={onReportClick as any}
              className="w-full h-full"
            />
          </div>
        </div>
      );
};

export default AdvancedOceanMap;