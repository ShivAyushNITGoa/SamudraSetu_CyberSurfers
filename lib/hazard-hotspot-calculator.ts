/**
 * Hazard Hotspot Calculation System
 * Calculates and manages hazard hotspots based on report density and severity
 */

import { createClient } from '@supabase/supabase-js';

export interface HazardHotspot {
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

export interface HotspotCalculationConfig {
  minReports: number;
  maxRadius: number;
  clusterThreshold: number;
  severityWeights: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

class HazardHotspotCalculator {
  private supabase: any;
  private config: HotspotCalculationConfig;

  constructor(supabaseUrl: string, supabaseKey: string, config?: Partial<HotspotCalculationConfig>) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.config = {
      minReports: 3,
      maxRadius: 10000, // 10km
      clusterThreshold: 0.5,
      severityWeights: {
        low: 1,
        medium: 2,
        high: 4,
        critical: 8
      },
      ...config
    };
  }

  /**
   * Calculate hazard hotspots based on recent reports
   */
  async calculateHotspots(timeWindowHours: number = 24): Promise<HazardHotspot[]> {
    try {
      // Get recent reports
      const cutoffTime = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000);
      
      const { data: reports, error } = await this.supabase
        .from('ocean_hazard_reports')
        .select('*')
        .gte('created_at', cutoffTime.toISOString())
        .eq('is_public', true);

      if (error) {
        console.error('Error fetching reports for hotspot calculation:', error);
        return [];
      }

      if (!reports || reports.length === 0) {
        return [];
      }

      // Group reports by location clusters
      const clusters = this.clusterReportsByLocation(reports);
      
      // Calculate hotspots from clusters
      const hotspots = await this.calculateHotspotsFromClusters(clusters);
      
      // Save hotspots to database
      await this.saveHotspots(hotspots);
      
      return hotspots;
    } catch (error) {
      console.error('Error calculating hotspots:', error);
      return [];
    }
  }

  /**
   * Cluster reports by geographic proximity
   */
  private clusterReportsByLocation(reports: any[]): any[][] {
    const clusters: any[][] = [];
    const processed = new Set<string>();

    for (const report of reports) {
      if (processed.has(report.id)) continue;

      const cluster = [report];
      processed.add(report.id);

      // Find nearby reports
      for (const otherReport of reports) {
        if (processed.has(otherReport.id)) continue;

        const distance = this.calculateDistance(
          report.location.lat,
          report.location.lng,
          otherReport.location.lat,
          otherReport.location.lng
        );

        if (distance <= this.config.maxRadius) {
          cluster.push(otherReport);
          processed.add(otherReport.id);
        }
      }

      if (cluster.length >= this.config.minReports) {
        clusters.push(cluster);
      }
    }

    return clusters;
  }

  /**
   * Calculate hotspots from report clusters
   */
  private async calculateHotspotsFromClusters(clusters: any[][]): Promise<HazardHotspot[]> {
    const hotspots: HazardHotspot[] = [];

    for (const cluster of clusters) {
      const hotspot = await this.createHotspotFromCluster(cluster);
      if (hotspot) {
        hotspots.push(hotspot);
      }
    }

    return hotspots;
  }

  /**
   * Create a hotspot from a cluster of reports
   */
  private async createHotspotFromCluster(cluster: any[]): Promise<HazardHotspot | null> {
    if (cluster.length < this.config.minReports) {
      return null;
    }

    // Calculate center point
    const centerLat = cluster.reduce((sum, report) => sum + report.location.lat, 0) / cluster.length;
    const centerLng = cluster.reduce((sum, report) => sum + report.location.lng, 0) / cluster.length;

    // Calculate radius (distance to farthest report)
    let maxRadius = 0;
    for (const report of cluster) {
      const distance = this.calculateDistance(
        centerLat,
        centerLng,
        report.location.lat,
        report.location.lng
      );
      maxRadius = Math.max(maxRadius, distance);
    }

    // Calculate severity level
    const severityLevel = this.calculateSeverityLevel(cluster);

    // Calculate confidence score
    const confidenceScore = this.calculateConfidenceScore(cluster, severityLevel);

    // Get hazard types
    const hazardTypes = [...new Set(cluster.map(report => report.hazard_type))];

    const hotspot: HazardHotspot = {
      id: crypto.randomUUID(),
      center_location: {
        lat: centerLat,
        lng: centerLng
      },
      radius_meters: Math.min(maxRadius, this.config.maxRadius),
      report_count: cluster.length,
      severity_level: severityLevel,
      confidence_score: confidenceScore,
      hazard_types: hazardTypes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return hotspot;
  }

  /**
   * Calculate severity level based on cluster reports
   */
  private calculateSeverityLevel(cluster: any[]): 'low' | 'medium' | 'high' | 'critical' {
    const severityCounts = cluster.reduce((acc, report) => {
      acc[report.severity] = (acc[report.severity] || 0) + 1;
      return acc;
    }, {});

    // Calculate weighted severity score
    let weightedScore = 0;
    let totalWeight = 0;

    for (const [severity, count] of Object.entries(severityCounts)) {
      const weight = this.config.severityWeights[severity as keyof typeof this.config.severityWeights] || 1;
      weightedScore += weight * count;
      totalWeight += count;
    }

    const averageScore = weightedScore / totalWeight;

    if (averageScore >= 6) return 'critical';
    if (averageScore >= 3) return 'high';
    if (averageScore >= 1.5) return 'medium';
    return 'low';
  }

  /**
   * Calculate confidence score for hotspot
   */
  private calculateConfidenceScore(cluster: any[], severityLevel: string): number {
    const reportCount = cluster.length;
    const severityWeight = this.config.severityWeights[severityLevel as keyof typeof this.config.severityWeights] || 1;
    
    // Base confidence on report count and severity
    let confidence = Math.min(reportCount / 10, 1.0) * 0.6;
    confidence += (severityWeight / 8) * 0.4;

    // Boost confidence for verified reports
    const verifiedCount = cluster.filter(report => report.status === 'verified').length;
    if (verifiedCount > 0) {
      confidence += (verifiedCount / cluster.length) * 0.2;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Calculate distance between two points in meters
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Save hotspots to database
   */
  private async saveHotspots(hotspots: HazardHotspot[]): Promise<void> {
    try {
      // Clear existing hotspots
      await this.supabase
        .from('hazard_hotspots')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      // Insert new hotspots
      if (hotspots.length > 0) {
        const { error } = await this.supabase
          .from('hazard_hotspots')
          .insert(hotspots);

        if (error) {
          console.error('Error saving hotspots:', error);
        } else {
          console.log(`Saved ${hotspots.length} hazard hotspots`);
        }
      }
    } catch (error) {
      console.error('Database error saving hotspots:', error);
    }
  }

  /**
   * Get existing hotspots
   */
  async getHotspots(): Promise<HazardHotspot[]> {
    try {
      const { data, error } = await this.supabase
        .from('hazard_hotspots')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching hotspots:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Database error fetching hotspots:', error);
      return [];
    }
  }

  /**
   * Get hotspots within a radius of a point
   */
  async getHotspotsNearby(lat: number, lng: number, radiusKm: number): Promise<HazardHotspot[]> {
    try {
      const { data, error } = await this.supabase
        .from('hazard_hotspots')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching nearby hotspots:', error);
        return [];
      }

      // Filter by distance
      const nearbyHotspots = (data || []).filter((hotspot: HazardHotspot) => {
        const distance = this.calculateDistance(
          lat,
          lng,
          hotspot.center_location.lat,
          hotspot.center_location.lng
        );
        return distance <= radiusKm * 1000;
      });

      return nearbyHotspots;
    } catch (error) {
      console.error('Database error fetching nearby hotspots:', error);
      return [];
    }
  }

  /**
   * Start automatic hotspot calculation
   */
  startAutomaticCalculation(intervalMinutes: number = 30): void {
    // Calculate hotspots immediately
    this.calculateHotspots();

    // Set up interval
    setInterval(() => {
      this.calculateHotspots();
    }, intervalMinutes * 60 * 1000);

    console.log(`Started automatic hotspot calculation every ${intervalMinutes} minutes`);
  }

  /**
   * Update hotspot calculation configuration
   */
  updateConfig(newConfig: Partial<HotspotCalculationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

export default HazardHotspotCalculator;
