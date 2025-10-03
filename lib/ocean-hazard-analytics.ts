// Ocean Hazard Analytics for SamudraSetu
import { createClient } from '@supabase/supabase-js';
import { OceanHazardReport, HazardHotspot, SocialMediaFeed } from './database';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class OceanHazardAnalytics {
  
  async getDashboardStats() {
    try {
      const [
        totalReports,
        verifiedReports,
        criticalReports,
        recentReports,
        socialMediaActivity,
        hazardDistribution
      ] = await Promise.all([
        this.getTotalReports(),
        this.getVerifiedReports(),
        this.getCriticalReports(),
        this.getRecentReports(24), // Last 24 hours
        this.getSocialMediaActivity(24),
        this.getHazardDistribution()
      ]);

      return {
        total_reports: totalReports,
        verified_reports: verifiedReports,
        critical_reports: criticalReports,
        recent_reports: recentReports,
        social_media_activity: socialMediaActivity,
        hazard_distribution: hazardDistribution,
        verification_rate: totalReports > 0 ? (verifiedReports / totalReports) * 100 : 0,
        critical_rate: totalReports > 0 ? (criticalReports / totalReports) * 100 : 0
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  async getTotalReports(): Promise<number> {
    const { count, error } = await supabase
      .from('ocean_hazard_reports')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    return count || 0;
  }

  async getVerifiedReports(): Promise<number> {
    const { count, error } = await supabase
      .from('ocean_hazard_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'verified');
    
    if (error) throw error;
    return count || 0;
  }

  async getCriticalReports(): Promise<number> {
    const { count, error } = await supabase
      .from('ocean_hazard_reports')
      .select('*', { count: 'exact', head: true })
      .eq('severity', 'critical');
    
    if (error) throw error;
    return count || 0;
  }

  async getRecentReports(hours: number): Promise<number> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const { count, error } = await supabase
      .from('ocean_hazard_reports')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', since.toISOString());
    
    if (error) throw error;
    return count || 0;
  }

  async getSocialMediaActivity(hours: number): Promise<number> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const { count, error } = await supabase
      .from('social_media_feeds')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', since.toISOString())
      .gt('relevance_score', 0.3);
    
    if (error) throw error;
    return count || 0;
  }

  async getHazardDistribution() {
    const { data, error } = await supabase
      .from('ocean_hazard_reports')
      .select('hazard_type, severity')
      .eq('status', 'verified');

    if (error) throw error;

    const distribution = data?.reduce((acc, report) => {
      if (!acc[report.hazard_type]) {
        acc[report.hazard_type] = { total: 0, critical: 0, high: 0, medium: 0, low: 0 };
      }
      acc[report.hazard_type].total++;
      acc[report.hazard_type][report.severity]++;
      return acc;
    }, {} as Record<string, any>) || {};

    return distribution;
  }

  async getTrendAnalysis(days: number = 30) {
    try {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const { data: reports, error } = await supabase
        .from('ocean_hazard_reports')
        .select('created_at, hazard_type, severity, status')
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by day
      const dailyData = reports?.reduce((acc, report) => {
        const date = new Date(report.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = {
            date,
            total: 0,
            verified: 0,
            critical: 0,
            by_type: {} as Record<string, number>
          };
        }
        
        acc[date].total++;
        if (report.status === 'verified') acc[date].verified++;
        if (report.severity === 'critical') acc[date].critical++;
        
        if (!acc[date].by_type[report.hazard_type]) {
          acc[date].by_type[report.hazard_type] = 0;
        }
        acc[date].by_type[report.hazard_type]++;

        return acc;
      }, {} as Record<string, any>) || {};

      return Object.values(dailyData);
    } catch (error) {
      console.error('Error getting trend analysis:', error);
      throw error;
    }
  }

  async getGeographicDistribution() {
    try {
      const { data, error } = await supabase
        .from('ocean_hazard_reports')
        .select('location, hazard_type, severity, status')
        .eq('is_public', true);

      if (error) throw error;

      return data?.map(report => ({
        id: report.id,
        latitude: report.location.latitude,
        longitude: report.location.longitude,
        hazard_type: report.hazard_type,
        severity: report.severity,
        status: report.status
      })) || [];
    } catch (error) {
      console.error('Error getting geographic distribution:', error);
      throw error;
    }
  }

  async getHazardHotspots() {
    try {
      // Calculate hotspots using the database function
      await supabase.rpc('calculate_hazard_hotspots');
      
      const { data, error } = await supabase
        .from('hazard_hotspots')
        .select('*')
        .order('confidence_score', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting hazard hotspots:', error);
      throw error;
    }
  }

  async getNearbyReports(latitude: number, longitude: number, radiusKm: number = 10) {
    try {
      const { data, error } = await supabase
        .rpc('get_nearby_reports', {
          user_lat: latitude,
          user_lon: longitude,
          radius_km: radiusKm
        });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting nearby reports:', error);
      throw error;
    }
  }

  async getSocialMediaTrends(hours: number = 24) {
    try {
      const since = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      const { data, error } = await supabase
        .from('social_media_feeds')
        .select('created_at, platform, sentiment_score, relevance_score, hazard_keywords, language')
        .gte('created_at', since.toISOString())
        .gt('relevance_score', 0.3)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by hour
      const hourlyData = data?.reduce((acc, feed) => {
        const hour = new Date(feed.created_at).getHours();
        if (!acc[hour]) {
          acc[hour] = {
            hour,
            count: 0,
            total_sentiment: 0,
            platforms: {} as Record<string, number>,
            languages: {} as Record<string, number>
          };
        }
        
        acc[hour].count++;
        acc[hour].total_sentiment += feed.sentiment_score || 0;
        acc[hour].platforms[feed.platform] = (acc[hour].platforms[feed.platform] || 0) + 1;
        acc[hour].languages[feed.language] = (acc[hour].languages[feed.language] || 0) + 1;

        return acc;
      }, {} as Record<number, any>) || {};

      return Object.values(hourlyData).map((data: any) => ({
        ...data,
        average_sentiment: data.count > 0 ? data.total_sentiment / data.count : 0
      }));
    } catch (error) {
      console.error('Error getting social media trends:', error);
      throw error;
    }
  }

  async getVerificationQueue() {
    try {
      const { data, error } = await supabase
        .from('ocean_hazard_reports')
        .select(`
          *,
          profiles!ocean_hazard_reports_user_id_fkey(name, email)
        `)
        .eq('status', 'unverified')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting verification queue:', error);
      throw error;
    }
  }

  async verifyReport(reportId: string, verifiedBy: string, notes?: string) {
    try {
      const { error } = await supabase
        .from('ocean_hazard_reports')
        .update({
          status: 'verified',
          verified_by: verifiedBy,
          verified_at: new Date().toISOString(),
          admin_notes: notes
        })
        .eq('id', reportId);

      if (error) throw error;

      // Recalculate hotspots after verification
      await this.getHazardHotspots();

      return { success: true };
    } catch (error) {
      console.error('Error verifying report:', error);
      throw error;
    }
  }

  async markAsFalseAlarm(reportId: string, verifiedBy: string, notes?: string) {
    try {
      const { error } = await supabase
        .from('ocean_hazard_reports')
        .update({
          status: 'false_alarm',
          verified_by: verifiedBy,
          verified_at: new Date().toISOString(),
          admin_notes: notes
        })
        .eq('id', reportId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error marking report as false alarm:', error);
      throw error;
    }
  }

  async getAlertRecommendations() {
    try {
      const criticalReports = await this.getCriticalReports();
      const recentReports = await this.getRecentReports(1); // Last hour
      const socialActivity = await this.getSocialMediaActivity(1); // Last hour

      const recommendations = [];

      // Check for critical report threshold
      if (criticalReports > 5) {
        recommendations.push({
          type: 'critical_reports',
          severity: 'high',
          message: `${criticalReports} critical ocean hazard reports detected`,
          action: 'Issue immediate alert to coastal communities'
        });
      }

      // Check for rapid increase in reports
      if (recentReports > 10) {
        recommendations.push({
          type: 'rapid_increase',
          severity: 'medium',
          message: `${recentReports} reports in the last hour - potential event developing`,
          action: 'Monitor closely and prepare for alert escalation'
        });
      }

      // Check for high social media activity
      if (socialActivity > 50) {
        recommendations.push({
          type: 'social_media_spike',
          severity: 'medium',
          message: `High social media activity (${socialActivity} posts) related to ocean hazards`,
          action: 'Verify social media reports and cross-reference with official data'
        });
      }

      return recommendations;
    } catch (error) {
      console.error('Error getting alert recommendations:', error);
      throw error;
    }
  }

  async exportData(format: 'json' | 'csv' = 'json', filters?: {
    startDate?: string;
    endDate?: string;
    hazardType?: string;
    status?: string;
  }) {
    try {
      let query = supabase
        .from('ocean_hazard_reports')
        .select(`
          *,
          profiles!ocean_hazard_reports_user_id_fkey(name, email),
          profiles!ocean_hazard_reports_verified_by_fkey(name, email)
        `);

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      if (filters?.hazardType) {
        query = query.eq('hazard_type', filters.hazardType);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      if (format === 'csv') {
        return this.convertToCSV(data || []);
      }

      return data || [];
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = [
      'ID', 'Title', 'Description', 'Hazard Type', 'Severity', 'Status',
      'Latitude', 'Longitude', 'Address', 'Reporter Name', 'Reporter Email',
      'Created At', 'Verified At', 'Admin Notes'
    ];

    const rows = data.map(report => [
      report.id,
      report.title,
      report.description,
      report.hazard_type,
      report.severity,
      report.status,
      report.location?.latitude || '',
      report.location?.longitude || '',
      report.address,
      report.profiles?.name || '',
      report.profiles?.email || '',
      report.created_at,
      report.verified_at || '',
      report.admin_notes || ''
    ]);

    return [headers, ...rows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');
  }
}

export const oceanHazardAnalytics = new OceanHazardAnalytics();
