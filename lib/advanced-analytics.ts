// Advanced analytics and predictive insights for civic issues management

export interface AnalyticsData {
  overview: OverviewStats;
  trends: TrendData[];
  predictions: PredictiveInsights;
  performance: PerformanceMetrics;
  geographic: GeographicAnalysis;
  temporal: TemporalAnalysis;
}

export interface OverviewStats {
  totalIssues: number;
  resolvedIssues: number;
  pendingIssues: number;
  inProgressIssues: number;
  averageResolutionTime: number;
  citizenSatisfaction: number;
  departmentEfficiency: Record<string, number>;
}

export interface TrendData {
  period: string;
  issues: number;
  resolved: number;
  avgResolutionTime: number;
  categoryBreakdown: Record<string, number>;
}

export interface PredictiveInsights {
  nextWeekPrediction: {
    expectedIssues: number;
    confidence: number;
    topCategories: Array<{category: string, probability: number}>;
  };
  seasonalPatterns: Array<{
    season: string;
    peakCategories: string[];
    expectedVolume: number;
  }>;
  resourceRecommendations: Array<{
    department: string;
    recommendedStaff: number;
    priority: 'high' | 'medium' | 'low';
    reasoning: string;
  }>;
}

export interface PerformanceMetrics {
  resolutionRate: number;
  averageResponseTime: number;
  citizenEngagement: number;
  departmentWorkload: Record<string, {
    current: number;
    capacity: number;
    utilization: number;
  }>;
}

export interface GeographicAnalysis {
  hotspots: Array<{
    location: string;
    coordinates: {lat: number, lng: number};
    issueCount: number;
    severity: 'high' | 'medium' | 'low';
    topCategories: string[];
  }>;
  coverage: {
    totalArea: number;
    coveredArea: number;
    coveragePercentage: number;
  };
}

export interface TemporalAnalysis {
  hourlyDistribution: Record<number, number>;
  dailyDistribution: Record<string, number>;
  monthlyPatterns: Record<string, number>;
  peakTimes: Array<{
    time: string;
    frequency: number;
    category: string;
  }>;
}

// Mock data generator for demonstration
export function generateMockAnalytics(): AnalyticsData {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  
  return {
    overview: {
      totalIssues: 1247,
      resolvedIssues: 892,
      pendingIssues: 203,
      inProgressIssues: 152,
      averageResolutionTime: 5.2, // days
      citizenSatisfaction: 4.2, // out of 5
      departmentEfficiency: {
        'Public Works': 0.85,
        'Environmental Services': 0.78,
        'Public Safety': 0.92,
        'Transportation': 0.73,
        'Utilities': 0.88
      }
    },
    trends: generateTrendData(),
    predictions: {
      nextWeekPrediction: {
        expectedIssues: 45,
        confidence: 0.82,
        topCategories: [
          { category: 'infrastructure', probability: 0.35 },
          { category: 'environment', probability: 0.28 },
          { category: 'utilities', probability: 0.22 },
          { category: 'safety', probability: 0.15 }
        ]
      },
      seasonalPatterns: [
        {
          season: 'Summer',
          peakCategories: ['environment', 'utilities'],
          expectedVolume: 180
        },
        {
          season: 'Winter',
          peakCategories: ['infrastructure', 'utilities'],
          expectedVolume: 220
        },
        {
          season: 'Monsoon',
          peakCategories: ['infrastructure', 'environment', 'safety'],
          expectedVolume: 280
        }
      ],
      resourceRecommendations: [
        {
          department: 'Public Works',
          recommendedStaff: 8,
          priority: 'high',
          reasoning: 'High infrastructure issue volume predicted for next month'
        },
        {
          department: 'Environmental Services',
          recommendedStaff: 5,
          priority: 'medium',
          reasoning: 'Seasonal increase in environmental complaints expected'
        }
      ]
    },
    performance: {
      resolutionRate: 0.72,
      averageResponseTime: 2.1, // hours
      citizenEngagement: 0.68,
      departmentWorkload: {
        'Public Works': { current: 45, capacity: 60, utilization: 0.75 },
        'Environmental Services': { current: 28, capacity: 40, utilization: 0.70 },
        'Public Safety': { current: 15, capacity: 25, utilization: 0.60 },
        'Transportation': { current: 32, capacity: 45, utilization: 0.71 },
        'Utilities': { current: 22, capacity: 30, utilization: 0.73 }
      }
    },
    geographic: {
      hotspots: [
        {
          location: 'Downtown District',
          coordinates: { lat: 15.4989, lng: 73.8278 },
          issueCount: 89,
          severity: 'high',
          topCategories: ['infrastructure', 'environment']
        },
        {
          location: 'Residential Area North',
          coordinates: { lat: 15.5100, lng: 73.8400 },
          issueCount: 67,
          severity: 'medium',
          topCategories: ['utilities', 'safety']
        },
        {
          location: 'Industrial Zone',
          coordinates: { lat: 15.4800, lng: 73.8000 },
          issueCount: 45,
          severity: 'high',
          topCategories: ['environment', 'safety']
        }
      ],
      coverage: {
        totalArea: 100,
        coveredArea: 87,
        coveragePercentage: 87
      }
    },
    temporal: {
      hourlyDistribution: generateHourlyDistribution(),
      dailyDistribution: {
        'Monday': 145,
        'Tuesday': 132,
        'Wednesday': 128,
        'Thursday': 141,
        'Friday': 156,
        'Saturday': 98,
        'Sunday': 67
      },
      monthlyPatterns: {
        'January': 89,
        'February': 92,
        'March': 105,
        'April': 118,
        'May': 134,
        'June': 156,
        'July': 178,
        'August': 165,
        'September': 142,
        'October': 128,
        'November': 98,
        'December': 87
      },
      peakTimes: [
        { time: '09:00-10:00', frequency: 45, category: 'infrastructure' },
        { time: '14:00-15:00', frequency: 38, category: 'environment' },
        { time: '18:00-19:00', frequency: 42, category: 'utilities' }
      ]
    }
  };
}

function generateTrendData(): TrendData[] {
  const trends = [];
  const now = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    
    trends.push({
      period: month,
      issues: Math.floor(Math.random() * 50) + 80,
      resolved: Math.floor(Math.random() * 40) + 60,
      avgResolutionTime: Math.random() * 3 + 3,
      categoryBreakdown: {
        infrastructure: Math.floor(Math.random() * 20) + 15,
        environment: Math.floor(Math.random() * 15) + 10,
        utilities: Math.floor(Math.random() * 12) + 8,
        safety: Math.floor(Math.random() * 8) + 5,
        transportation: Math.floor(Math.random() * 10) + 6
      }
    });
  }
  
  return trends;
}

function generateHourlyDistribution(): Record<number, number> {
  const distribution: Record<number, number> = {};
  
  for (let hour = 0; hour < 24; hour++) {
    let base = 2;
    
    // Peak hours (9-11 AM, 2-4 PM, 6-8 PM)
    if ((hour >= 9 && hour <= 11) || (hour >= 14 && hour <= 16) || (hour >= 18 && hour <= 20)) {
      base = 8;
    }
    // Night hours (11 PM - 6 AM)
    else if (hour >= 23 || hour <= 6) {
      base = 1;
    }
    // Regular hours
    else {
      base = 4;
    }
    
    distribution[hour] = base + Math.floor(Math.random() * 3);
  }
  
  return distribution;
}

// Real-time analytics calculations
export function calculateRealTimeMetrics(issues: any[]): Partial<OverviewStats> {
  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  const recentIssues = issues.filter(issue => 
    new Date(issue.created_at) > last24Hours
  );
  
  const resolvedIssues = issues.filter(issue => issue.status === 'resolved');
  const pendingIssues = issues.filter(issue => issue.status === 'pending');
  const inProgressIssues = issues.filter(issue => issue.status === 'in_progress');
  
  // Calculate average resolution time
  const resolvedWithTime = resolvedIssues.filter(issue => issue.resolved_at);
  const totalResolutionTime = resolvedWithTime.reduce((sum, issue) => {
    const created = new Date(issue.created_at);
    const resolved = new Date(issue.resolved_at);
    return sum + (resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
  }, 0);
  
  const averageResolutionTime = resolvedWithTime.length > 0 
    ? totalResolutionTime / resolvedWithTime.length 
    : 0;
  
  return {
    totalIssues: issues.length,
    resolvedIssues: resolvedIssues.length,
    pendingIssues: pendingIssues.length,
    inProgressIssues: inProgressIssues.length,
    averageResolutionTime: Math.round(averageResolutionTime * 10) / 10
  };
}

// Export analytics data
export function exportAnalyticsData(data: AnalyticsData, format: 'json' | 'csv' | 'pdf' = 'json') {
  switch (format) {
    case 'json':
      return JSON.stringify(data, null, 2);
    case 'csv':
      return convertToCSV(data);
    case 'pdf':
      // In a real implementation, you'd use a PDF generation library
      return 'PDF export not implemented in this demo';
    default:
      return JSON.stringify(data, null, 2);
  }
}

function convertToCSV(data: AnalyticsData): string {
  const lines = [];
  
  // Overview stats
  lines.push('Metric,Value');
  lines.push(`Total Issues,${data.overview.totalIssues}`);
  lines.push(`Resolved Issues,${data.overview.resolvedIssues}`);
  lines.push(`Pending Issues,${data.overview.pendingIssues}`);
  lines.push(`In Progress Issues,${data.overview.inProgressIssues}`);
  lines.push(`Average Resolution Time,${data.overview.averageResolutionTime}`);
  lines.push(`Citizen Satisfaction,${data.overview.citizenSatisfaction}`);
  
  return lines.join('\n');
}
