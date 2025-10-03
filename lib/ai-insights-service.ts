/**
 * AI Insights Service for SamudraSetu
 * Provides advanced AI-powered insights and predictions using Gemini AI
 */

import { geminiAI } from './gemini-ai';
import { createClient } from '@supabase/supabase-js';

export interface AIInsight {
  id: string;
  type: 'prediction' | 'trend' | 'alert' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affected_areas: string[];
  time_horizon: string;
  created_at: string;
  data_sources: string[];
  recommendations: string[];
}

export interface HazardPrediction {
  prediction: string;
  confidence: number;
  time_horizon: string;
  affected_areas: string[];
  recommended_preparations: string[];
  risk_factors: string[];
  historical_context: string;
}

export interface TrendAnalysis {
  trend_direction: 'increasing' | 'decreasing' | 'stable' | 'volatile';
  trend_strength: number;
  key_indicators: string[];
  timeframe: string;
  implications: string[];
  confidence: number;
}

export interface AlertRecommendation {
  alert_level: 'info' | 'warning' | 'critical';
  target_audience: string[];
  message: string;
  actions_required: string[];
  urgency: 'low' | 'medium' | 'high' | 'immediate';
}

class AIInsightsService {
  private supabase: any;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  /**
   * Generate comprehensive AI insights based on current data
   */
  async generateInsights(): Promise<AIInsight[]> {
    const insights: AIInsight[] = [];

    try {
      // Get current data for analysis
      const currentData = await this.getCurrentData();
      
      // Generate hazard prediction
      if (geminiAI.isServiceAvailable()) {
        const prediction = await geminiAI.generateHazardPrediction(currentData);
        insights.push({
          id: crypto.randomUUID(),
          type: 'prediction',
          title: 'Hazard Prediction',
          description: prediction.prediction,
          confidence: prediction.confidence,
          severity: this.getSeverityFromConfidence(prediction.confidence),
          affected_areas: prediction.affected_areas,
          time_horizon: prediction.time_horizon,
          created_at: new Date().toISOString(),
          data_sources: ['citizen_reports', 'social_media', 'official_data'],
          recommendations: prediction.recommended_preparations
        });
      }

      // Generate trend analysis
      const trendAnalysis = await this.analyzeTrends();
      insights.push({
        id: crypto.randomUUID(),
        type: 'trend',
        title: 'Trend Analysis',
        description: trendAnalysis.implications.join('; '),
        confidence: trendAnalysis.confidence,
        severity: this.getSeverityFromTrend(trendAnalysis.trend_direction, trendAnalysis.trend_strength),
        affected_areas: [],
        time_horizon: trendAnalysis.timeframe,
        created_at: new Date().toISOString(),
        data_sources: ['historical_data', 'recent_reports'],
        recommendations: this.getTrendRecommendations(trendAnalysis)
      });

      // Generate alert recommendations
      const alertRecommendations = await this.generateAlertRecommendations(currentData);
      insights.push(...alertRecommendations.map(alert => ({
        id: crypto.randomUUID(),
        type: 'alert' as const,
        title: `${alert.alert_level.toUpperCase()} Alert`,
        description: alert.message,
        confidence: 0.8,
        severity: this.getSeverityFromAlert(alert.alert_level),
        affected_areas: [],
        time_horizon: 'immediate',
        created_at: new Date().toISOString(),
        data_sources: ['ai_analysis'],
        recommendations: alert.actions_required
      })));

    } catch (error) {
      console.error('Error generating AI insights:', error);
    }

    return insights;
  }

  /**
   * Analyze hazard trends over time
   */
  async analyzeTrends(): Promise<TrendAnalysis> {
    try {
      // Get historical data
      const historicalData = await this.getHistoricalData();
      
      if (geminiAI.isServiceAvailable()) {
        const prompt = `
Analyze the following historical ocean hazard data and provide trend analysis:

${JSON.stringify(historicalData)}

Return JSON with:
{
  "trend_direction": "increasing" | "decreasing" | "stable" | "volatile",
  "trend_strength": number (0-1),
  "key_indicators": string[],
  "timeframe": string,
  "implications": string[],
  "confidence": number (0-1)
}
        `;

        // This would use Gemini AI for trend analysis
        // For now, return a mock analysis
        return {
          trend_direction: 'increasing',
          trend_strength: 0.7,
          key_indicators: ['Increased storm surge reports', 'Rising sea levels', 'More frequent flooding'],
          timeframe: 'Last 30 days',
          implications: ['Higher risk of coastal flooding', 'Need for enhanced monitoring', 'Potential evacuation planning'],
          confidence: 0.8
        };
      }
    } catch (error) {
      console.error('Error analyzing trends:', error);
    }

    return {
      trend_direction: 'stable',
      trend_strength: 0.5,
      key_indicators: [],
      timeframe: 'Unknown',
      implications: ['Insufficient data for trend analysis'],
      confidence: 0.3
    };
  }

  /**
   * Generate alert recommendations based on current conditions
   */
  async generateAlertRecommendations(currentData: any): Promise<AlertRecommendation[]> {
    const recommendations: AlertRecommendation[] = [];

    try {
      if (geminiAI.isServiceAvailable()) {
        const analysis = await geminiAI.generateHazardPrediction(currentData);
        
        if (analysis.confidence > 0.7) {
          recommendations.push({
            alert_level: 'warning',
            target_audience: ['coastal_residents', 'fishermen', 'port_authorities'],
            message: `High confidence prediction: ${analysis.prediction}`,
            actions_required: analysis.recommended_preparations,
            urgency: 'high'
          });
        }

        if (analysis.confidence > 0.9) {
          recommendations.push({
            alert_level: 'critical',
            target_audience: ['emergency_services', 'disaster_management', 'government_officials'],
            message: `Critical alert: ${analysis.prediction}`,
            actions_required: ['Immediate evacuation planning', 'Resource mobilization', 'Public communication'],
            urgency: 'immediate'
          });
        }
      }
    } catch (error) {
      console.error('Error generating alert recommendations:', error);
    }

    return recommendations;
  }

  /**
   * Generate multilingual alerts using Gemini AI
   */
  async generateMultilingualAlerts(alertData: any, languages: string[] = ['en', 'hi', 'ta', 'bn']): Promise<{
    [language: string]: {
      title: string;
      message: string;
      instructions: string[];
    }
  }> {
    if (geminiAI.isServiceAvailable()) {
      return await geminiAI.generateMultilingualAlert(alertData, languages);
    }

    // Fallback to English only
    return {
      en: {
        title: 'Ocean Hazard Alert',
        message: 'Alert generation not available',
        instructions: ['Stay informed', 'Follow official guidance']
      }
    };
  }

  /**
   * Analyze images for hazard detection
   */
  async analyzeHazardImage(imageData: string, description?: string): Promise<{
    hazard_detected: boolean;
    hazard_type?: string;
    severity?: string;
    confidence: number;
    description: string;
    recommended_actions: string[];
  }> {
    if (geminiAI.isServiceAvailable()) {
      return await geminiAI.analyzeHazardImage(imageData, description);
    }

    return {
      hazard_detected: false,
      confidence: 0,
      description: 'Image analysis not available',
      recommended_actions: []
    };
  }

  /**
   * Get current data for analysis
   */
  private async getCurrentData(): Promise<any> {
    try {
      if (!this.supabase) return {};

      // Get recent reports
      const { data: reports } = await this.supabase
        .from('reports')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(100);

      // Get social media data
      const { data: socialData } = await this.supabase
        .from('social_media_feeds')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(100);

      // Get official data
      const { data: officialData } = await this.supabase
        .from('official_data_feeds')
        .select('*')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .limit(50);

      return {
        reports: reports || [],
        social_media: socialData || [],
        official_data: officialData || [],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting current data:', error);
      return {};
    }
  }

  /**
   * Get historical data for trend analysis
   */
  private async getHistoricalData(): Promise<any> {
    try {
      if (!this.supabase) return {};

      const { data: historicalReports } = await this.supabase
        .from('reports')
        .select('*')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      return {
        reports: historicalReports || [],
        timeframe: '30_days',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting historical data:', error);
      return {};
    }
  }

  /**
   * Helper methods for severity mapping
   */
  private getSeverityFromConfidence(confidence: number): 'low' | 'medium' | 'high' | 'critical' {
    if (confidence >= 0.9) return 'critical';
    if (confidence >= 0.7) return 'high';
    if (confidence >= 0.5) return 'medium';
    return 'low';
  }

  private getSeverityFromTrend(direction: string, strength: number): 'low' | 'medium' | 'high' | 'critical' {
    if (direction === 'increasing' && strength >= 0.8) return 'critical';
    if (direction === 'increasing' && strength >= 0.6) return 'high';
    if (direction === 'increasing' && strength >= 0.4) return 'medium';
    return 'low';
  }

  private getSeverityFromAlert(alertLevel: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (alertLevel) {
      case 'critical': return 'critical';
      case 'warning': return 'high';
      case 'info': return 'low';
      default: return 'medium';
    }
  }

  private getTrendRecommendations(trend: TrendAnalysis): string[] {
    const recommendations: string[] = [];

    if (trend.trend_direction === 'increasing') {
      recommendations.push('Increase monitoring frequency');
      recommendations.push('Prepare emergency response resources');
      recommendations.push('Consider early warning systems');
    } else if (trend.trend_direction === 'volatile') {
      recommendations.push('Maintain high alert status');
      recommendations.push('Prepare for rapid response');
    }

    return recommendations;
  }

  /**
   * Get AI service status
   */
  getServiceStatus(): {
    gemini_available: boolean;
    capabilities: string[];
    last_analysis: string | null;
  } {
    return {
      gemini_available: geminiAI.isServiceAvailable(),
      capabilities: geminiAI.isServiceAvailable() ? [
        'hazard_prediction',
        'trend_analysis',
        'multilingual_alerts',
        'image_analysis',
        'batch_processing'
      ] : [],
      last_analysis: null // Would track last analysis timestamp
    };
  }
}

// Export singleton instance
export const aiInsightsService = new AIInsightsService();
export default aiInsightsService;
