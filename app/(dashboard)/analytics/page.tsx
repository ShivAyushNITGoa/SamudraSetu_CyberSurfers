'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsData {
  reportsByType: { type: string; count: number }[];
  reportsBySeverity: { severity: string; count: number }[];
  reportsByStatus: { status: string; count: number }[];
  reportsOverTime: { date: string; count: number }[];
  socialMediaSentiment: { sentiment: string; count: number }[];
  hotspotData: { location: string; count: number; severity: string }[];
  officialFeedsData: { source: string; count: number }[];
}

interface AnalyticsDashboardProps {
  className?: string;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ className = '' }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    reportsByType: [],
    reportsBySeverity: [],
    reportsByStatus: [],
    reportsOverTime: [],
    socialMediaSentiment: [],
    hotspotData: [],
    officialFeedsData: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '24h':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
      }

      // Fetch reports data
      const { data: reports, error: reportsError } = await supabase
        .from('ocean_hazard_reports')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (reportsError) {
        console.error('Error fetching reports:', reportsError);
      }

      // Fetch social media data
      const { data: socialMedia, error: socialError } = await supabase
        .from('social_media_feeds')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (socialError) {
        console.error('Error fetching social media:', socialError);
      }

      // Fetch hotspots data
      const { data: hotspots, error: hotspotsError } = await supabase
        .from('hazard_hotspots')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (hotspotsError) {
        console.error('Error fetching hotspots:', hotspotsError);
      }

      // Fetch official feeds data
      const { data: officialFeeds, error: feedsError } = await supabase
        .from('official_data_feeds')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (feedsError) {
        console.error('Error fetching official feeds:', feedsError);
      }

      // Process data
      const processedData = processAnalyticsData(
        reports || [],
        socialMedia || [],
        hotspots || [],
        officialFeeds || []
      );

      // Ensure processedData matches AnalyticsData type
      setAnalyticsData({
        reportsByType: Object.entries(processedData.reportsByType || {}).map(([type, count]) => ({
          type,
          count: Number(count),
        })),
        reportsBySeverity: Object.entries(processedData.reportsBySeverity || {}).map(([severity, count]) => ({
          severity,
          count: Number(count),
        })),
        reportsByStatus: Object.entries(processedData.reportsByStatus || {}).map(([status, count]) => ({
          status,
          count: Number(count),
        })),
        reportsOverTime: Object.entries(processedData.reportsOverTime || {}).map(([date, count]) => ({
          date,
          count: Number(count),
        })),
        socialMediaSentiment: Object.entries(processedData.socialMediaSentiment || {}).map(([sentiment, count]) => ({
          sentiment,
          count: Number(count),
        })),
        hotspotData: processedData.hotspotData || [],
        officialFeedsData: Object.entries(processedData.officialFeedsData || {}).map(([source, count]) => ({
          source,
          count: Number(count),
        })),
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (reports: any[], socialMedia: any[], hotspots: any[], officialFeeds: any[]) => {
    // Reports by type
    const reportsByType = reports.reduce((acc: any, report: any) => {
      const type = report.hazard_type || 'other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Reports by severity
    const reportsBySeverity = reports.reduce((acc: any, report: any) => {
      const severity = report.severity || 'low';
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    }, {});

    // Reports by status
    const reportsByStatus = reports.reduce((acc: any, report: any) => {
      const status = report.status || 'unverified';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Reports over time
    const reportsOverTime = reports.reduce((acc: any, report: any) => {
      const date = new Date(report.created_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Social media sentiment
    const socialMediaSentiment = socialMedia.reduce((acc: any, post: any) => {
      let sentiment = 'neutral';
      if (post.sentiment_score > 0.1) sentiment = 'positive';
      else if (post.sentiment_score < -0.1) sentiment = 'negative';
      
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, {});

    // Official feeds by source
    const officialFeedsData = officialFeeds.reduce((acc: any, feed: any) => {
      const source = feed.source || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    return {
      reportsByType: Object.entries(reportsByType).map(([type, count]) => ({ type, count })),
      reportsBySeverity: Object.entries(reportsBySeverity).map(([severity, count]) => ({ severity, count })),
      reportsByStatus: Object.entries(reportsByStatus).map(([status, count]) => ({ status, count })),
      reportsOverTime: Object.entries(reportsOverTime).map(([date, count]) => ({ date, count })),
      socialMediaSentiment: Object.entries(socialMediaSentiment).map(([sentiment, count]) => ({ sentiment, count })),
      hotspotData: hotspots.map(hotspot => ({
        location: `Hotspot ${hotspot.id.slice(0, 8)}`,
        count: hotspot.report_count,
        severity: hotspot.severity_level
      })),
      officialFeedsData: Object.entries(officialFeedsData).map(([source, count]) => ({ source, count }))
    };
  };

  const COLORS = {
    tsunami: '#3B82F6',
    storm_surge: '#EF4444',
    flooding: '#10B981',
    erosion: '#F59E0B',
    marine_pollution: '#8B5CF6',
    unusual_tides: '#06B6D4',
    other: '#6B7280'
  };

  const SEVERITY_COLORS = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#EF4444',
    critical: '#DC2626'
  };

  const SENTIMENT_COLORS = {
    positive: '#10B981',
    negative: '#EF4444',
    neutral: '#6B7280'
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="flex items-center space-x-4">
          <label htmlFor="timeRange" className="sr-only">
            Select time range
          </label>
          <select
            id="timeRange"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Select time range"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData.reportsByType.reduce((sum, item) => sum + item.count, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Verified Reports</p>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData.reportsByStatus.find(item => item.status === 'verified')?.count || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 12h6m-6 4h6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Social Media Posts</p>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData.socialMediaSentiment.reduce((sum, item) => sum + item.count, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Hotspots</p>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData.hotspotData.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Reports by Type */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Reports by Hazard Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.reportsByType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Reports by Severity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Reports by Severity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.reportsBySeverity}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ severity, count }) => `${severity}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analyticsData.reportsBySeverity.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={SEVERITY_COLORS[entry.severity as keyof typeof SEVERITY_COLORS] || '#6B7280'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Reports Over Time */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Reports Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.reportsOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Social Media Sentiment */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Social Media Sentiment</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.socialMediaSentiment}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ sentiment, count }) => `${sentiment}: ${count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analyticsData.socialMediaSentiment.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[entry.sentiment as keyof typeof SENTIMENT_COLORS] || '#6B7280'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Official Data Sources */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Official Data Sources</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData.officialFeedsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="source" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;