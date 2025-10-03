// Enhanced Mapping and Visualization Service for SamudraSetu
// Provides advanced mapping features including clustering, heatmaps, and hotspot detection

import { supabase } from './supabase'
import { HazardHotspotML, MapVisualization, OceanHazardReport, SocialMediaFeed } from './enhanced-database'

export class EnhancedMappingService {
  
  // Get map visualization data with clustering and heatmap support
  public async getMapVisualization(
    type: 'markers' | 'clusters' | 'heatmap' | 'hotspots' = 'markers',
    bounds?: { north: number; south: number; east: number; west: number },
    filters?: {
      hazard_types?: string[]
      severity_levels?: string[]
      time_range?: { start: string; end: string }
      verified_only?: boolean
    }
  ): Promise<MapVisualization> {
    try {
      switch (type) {
        case 'markers':
          return await this.getMarkerVisualization(bounds, filters)
        case 'clusters':
          return await this.getClusterVisualization(bounds, filters)
        case 'heatmap':
          return await this.getHeatmapVisualization(bounds, filters)
        case 'hotspots':
          return await this.getHotspotVisualization(bounds, filters)
        default:
          return await this.getMarkerVisualization(bounds, filters)
      }
    } catch (error) {
      console.error('❌ Error getting map visualization:', error)
      throw error
    }
  }

  // Get marker-based visualization
  private async getMarkerVisualization(
    bounds?: { north: number; south: number; east: number; west: number },
    filters?: any
  ): Promise<MapVisualization> {
    let query = supabase
      .from('ocean_hazard_reports')
      .select('id, title, hazard_type, severity, status, location, confidence_score, created_at')
      .eq('is_public', true)

    if (bounds) {
      query = query.within('location', bounds)
    }

    if (filters?.hazard_types?.length) {
      query = query.in('hazard_type', filters.hazard_types)
    }

    if (filters?.severity_levels?.length) {
      query = query.in('severity', filters.severity_levels)
    }

    if (filters?.verified_only) {
      query = query.eq('status', 'verified')
    }

    if (filters?.time_range) {
      query = query
        .gte('created_at', filters.time_range.start)
        .lte('created_at', filters.time_range.end)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error

    const markers = (data || []).map(report => ({
      id: report.id,
      latitude: this.parseLocation(report.location).latitude,
      longitude: this.parseLocation(report.location).longitude,
      type: report.hazard_type,
      severity: report.severity,
      confidence: report.confidence_score,
      metadata: {
        title: report.title,
        status: report.status,
        created_at: report.created_at
      }
    }))

    return {
      type: 'markers',
      data: markers,
      bounds: bounds,
      zoom: this.calculateOptimalZoom(markers)
    }
  }

  // Get cluster-based visualization
  private async getClusterVisualization(
    bounds?: { north: number; south: number; east: number; west: number },
    filters?: any
  ): Promise<MapVisualization> {
    // Use PostGIS clustering function
    const { data, error } = await supabase.rpc('calculate_hazard_hotspots_ml', {
      min_confidence: 0.5,
      max_radius_km: 10
    })

    if (error) throw error

    const clusters = (data || []).map((cluster: any) => ({
      id: cluster.id,
      latitude: this.parseLocation(cluster.center_location).latitude,
      longitude: this.parseLocation(cluster.center_location).longitude,
      type: 'cluster',
      severity: cluster.severity_level,
      confidence: cluster.confidence_score,
      metadata: {
        report_count: cluster.report_count,
        radius_meters: cluster.radius_meters,
        hazard_types: cluster.hazard_types
      }
    }))

    return {
      type: 'clusters',
      data: clusters,
      bounds: bounds,
      zoom: this.calculateOptimalZoom(clusters)
    }
  }

  // Get heatmap visualization
  private async getHeatmapVisualization(
    bounds?: { north: number; south: number; east: number; west: number },
    filters?: any
  ): Promise<MapVisualization> {
    // Generate heatmap data points
    const { data, error } = await supabase
      .from('ocean_hazard_reports')
      .select('location, severity, confidence_score')
      .eq('is_public', true)

    if (error) throw error

    const heatmapPoints = (data || []).map(report => {
      const location = this.parseLocation(report.location)
      const intensity = this.calculateHeatmapIntensity(report.severity, report.confidence_score)
      
      return {
        id: `heat_${report.location}`,
        latitude: location.latitude,
        longitude: location.longitude,
        type: 'heatmap',
        severity: report.severity,
        confidence: intensity,
        metadata: {
          intensity: intensity
        }
      }
    })

    return {
      type: 'heatmap',
      data: heatmapPoints,
      bounds: bounds,
      zoom: this.calculateOptimalZoom(heatmapPoints)
    }
  }

  // Get hotspot visualization
  private async getHotspotVisualization(
    bounds?: { north: number; south: number; east: number; west: number },
    filters?: any
  ): Promise<MapVisualization> {
    const { data, error } = await supabase
      .from('hazard_hotspots_ml')
      .select('*')
      .order('confidence_score', { ascending: false })

    if (error) throw error

    const hotspots = (data || []).map((hotspot: HazardHotspotML) => ({
      id: hotspot.id,
      latitude: this.parseLocation(hotspot.center_location).latitude,
      longitude: this.parseLocation(hotspot.center_location).longitude,
      type: 'hotspot',
      severity: hotspot.severity_level,
      confidence: hotspot.confidence_score,
      metadata: {
        report_count: hotspot.report_count,
        social_media_count: hotspot.social_media_count,
        official_data_count: hotspot.official_data_count,
        radius_meters: hotspot.radius_meters,
        hazard_types: hotspot.hazard_types,
        predicted_escalation: hotspot.predicted_escalation,
        escalation_probability: hotspot.escalation_probability,
        risk_factors: hotspot.risk_factors
      }
    }))

    return {
      type: 'hotspots',
      data: hotspots,
      bounds: bounds,
      zoom: this.calculateOptimalZoom(hotspots)
    }
  }

  // Calculate hazard hotspots using machine learning
  public async calculateHazardHotspots(): Promise<HazardHotspotML[]> {
    try {
      const { data, error } = await supabase.rpc('calculate_hazard_hotspots_ml', {
        min_confidence: 0.7,
        max_radius_km: 25
      })

      if (error) throw error

      // Store calculated hotspots
      const hotspots = (data || []).map((hotspot: any) => ({
        center_location: hotspot.center_location,
        radius_meters: hotspot.radius_meters,
        report_count: hotspot.report_count,
        social_media_count: 0, // TODO: Calculate from social media data
        official_data_count: 0, // TODO: Calculate from official data
        severity_level: hotspot.severity_level,
        confidence_score: hotspot.confidence_score,
        ml_model_version: 'v1.0',
        hazard_types: hotspot.hazard_types,
        risk_factors: {
          historical_incidents: 0,
          population_density: 0,
          infrastructure_vulnerability: 0
        },
        predicted_escalation: hotspot.predicted_escalation,
        escalation_probability: hotspot.predicted_escalation ? 0.8 : 0.2
      }))

      // Store in database
      for (const hotspot of hotspots) {
        await supabase
          .from('hazard_hotspots_ml')
          .upsert(hotspot, { onConflict: 'center_location' })
      }

      return hotspots
    } catch (error) {
      console.error('❌ Error calculating hazard hotspots:', error)
      throw error
    }
  }

  // Get nearby reports for a location
  public async getNearbyReports(
    latitude: number,
    longitude: number,
    radiusKm: number = 10
  ): Promise<OceanHazardReport[]> {
    try {
      const { data, error } = await supabase.rpc('get_nearby_reports', {
        user_lat: latitude,
        user_lon: longitude,
        radius_km: radiusKm
      })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Error getting nearby reports:', error)
      throw error
    }
  }

  // Get sentiment analysis summary for a geographic area
  public async getSentimentSummary(
    bounds: { north: number; south: number; east: number; west: number },
    timeWindowHours: number = 24
  ): Promise<any> {
    try {
      const { data, error } = await supabase.rpc('get_sentiment_summary', {
        time_window_hours: timeWindowHours,
        geographic_bounds: {
          min_lat: bounds.south,
          min_lng: bounds.west,
          max_lat: bounds.north,
          max_lng: bounds.east
        }
      })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Error getting sentiment summary:', error)
      throw error
    }
  }

  // Get map statistics for dashboard
  public async getMapStatistics(): Promise<{
    total_reports: number
    active_hotspots: number
    high_risk_areas: number
    coverage_percentage: number
    recent_activity: number
  }> {
    try {
      const [
        { count: totalReports },
        { count: activeHotspots },
        { count: highRiskAreas },
        { count: recentActivity }
      ] = await Promise.all([
        supabase.from('ocean_hazard_reports').select('*', { count: 'exact', head: true }),
        supabase.from('hazard_hotspots_ml').select('*', { count: 'exact', head: true }),
        supabase.from('hazard_hotspots_ml').select('*', { count: 'exact', head: true }).eq('severity_level', 'high'),
        supabase.from('ocean_hazard_reports').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ])

      return {
        total_reports: totalReports || 0,
        active_hotspots: activeHotspots || 0,
        high_risk_areas: highRiskAreas || 0,
        coverage_percentage: 85, // TODO: Calculate actual coverage
        recent_activity: recentActivity || 0
      }
    } catch (error) {
      console.error('❌ Error getting map statistics:', error)
      throw error
    }
  }

  // Helper methods
  private parseLocation(location: any): { latitude: number; longitude: number } {
    if (typeof location === 'string') {
      // PostGIS POINT format: "POINT(lng lat)"
      const match = location.match(/POINT\(([^)]+)\)/)
      if (match) {
        const coords = match[1].split(' ')
        return {
          longitude: parseFloat(coords[0]),
          latitude: parseFloat(coords[1])
        }
      }
    } else if (location?.latitude && location?.longitude) {
      return {
        latitude: location.latitude,
        longitude: location.longitude
      }
    }
    
    return { latitude: 0, longitude: 0 }
  }

  private calculateHeatmapIntensity(severity: string, confidence: number): number {
    const severityWeights = {
      low: 0.2,
      medium: 0.5,
      high: 0.8,
      critical: 1.0
    }
    
    return (severityWeights[severity as keyof typeof severityWeights] || 0.5) * confidence
  }

  private calculateOptimalZoom(points: any[]): number {
    if (points.length === 0) return 10
    
    // Calculate bounding box
    const latitudes = points.map(p => p.latitude)
    const longitudes = points.map(p => p.longitude)
    
    const minLat = Math.min(...latitudes)
    const maxLat = Math.max(...latitudes)
    const minLng = Math.min(...longitudes)
    const maxLng = Math.max(...longitudes)
    
    const latDiff = maxLat - minLat
    const lngDiff = maxLng - minLng
    const maxDiff = Math.max(latDiff, lngDiff)
    
    // Calculate zoom level based on the maximum difference
    if (maxDiff > 10) return 5
    if (maxDiff > 5) return 6
    if (maxDiff > 2) return 7
    if (maxDiff > 1) return 8
    if (maxDiff > 0.5) return 9
    if (maxDiff > 0.2) return 10
    if (maxDiff > 0.1) return 11
    if (maxDiff > 0.05) return 12
    return 13
  }
}

export const enhancedMapping = new EnhancedMappingService()
