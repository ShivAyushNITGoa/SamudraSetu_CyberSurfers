'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
// import { useTranslation } from '@/lib/i18n' // Disabled for now;
import AdvancedOceanMap from '@/components/AdvancedOceanMap';
import AlertPanel from '@/components/AlertPanel';
import { supabase } from '@/lib/supabase'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Bell, 
  Activity, 
  Globe, 
  AlertTriangle,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Settings,
  Database,
  Server,
  Wifi,
  Shield
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'citizen' | 'analyst' | 'admin' | 'dmf_head';
  department?: string;
  position?: string;
  language_preference: string;
  address?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface AdminPanelProps {
  className?: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ className = '' }) => {
  // Tabs: overview | users | analytics | social | alerts | system
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'analytics' | 'social' | 'alerts' | 'system'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    totalUsers: 0,
    citizens: 0,
    analysts: 0,
    admins: 0,
    dmfHeads: 0
  });

  // Overview data
  const [hotspotCount, setHotspotCount] = useState(0);
  const [reportsToday, setReportsToday] = useState(0);
  const [aiAccuracy, setAiAccuracy] = useState(0.86); // placeholder metric
  const [activeCitizens, setActiveCitizens] = useState(0);
  const [liveFeed, setLiveFeed] = useState<any[]>([]);
  const [systemStatus, setSystemStatus] = useState<'OPERATIONAL' | 'DEGRADED' | 'DOWN'>('OPERATIONAL');

  // Analytics data
  const [analyticsData, setAnalyticsData] = useState({
    reportsByType: {},
    reportsBySeverity: {},
    reportsByLocation: {},
    sentimentTrends: [],
    socialMediaStats: {},
    verificationStats: {}
  });

  // Social monitoring data
  const [socialFeeds, setSocialFeeds] = useState<any[]>([]);
  const [socialStats, setSocialStats] = useState({
    totalPosts: 0,
    platforms: {},
    trendingKeywords: [],
    sentimentScore: 0
  });
  const [alertDeliveries, setAlertDeliveries] = useState<any[]>([]);
  const [mlHotspots, setMlHotspots] = useState<any[]>([]);
  const [deliveriesPage, setDeliveriesPage] = useState(0);
  const deliveriesPageSize = 25;

  // System monitoring data
  const [systemMetrics, setSystemMetrics] = useState({
    databaseStatus: 'healthy',
    apiLatency: 45,
    uptime: '99.9%',
    activeConnections: 127,
    storageUsed: '2.3GB',
    lastBackup: '2 hours ago'
  });

  // const { t } = useTranslation() // Disabled for now;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // No longer need Mapbox token - using free OpenStreetMap

  useEffect(() => {
    // Load all data in parallel
    fetchUsers();
    fetchOverview();
    fetchAnalytics();
    fetchSocialMonitoring();
    fetchAlertDeliveries();
    fetchMlHotspots();
    fetchSystemMetrics();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      fetchOverview();
      fetchSocialMonitoring();
      fetchSystemMetrics();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      setUsers(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOverview = async () => {
    try {
      setLoadingOverview(true);
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const [{ data: hotspots }, { data: reports }, { data: feed }, { data: citizens }] = await Promise.all([
        supabase.from('v_hotspots_with_counts').select('id'),
        supabase
          .from('ocean_hazard_reports')
          .select('id, title, description, created_at')
          .gte('created_at', startOfDay.toISOString()),
        supabase
          .from('view_public_reports_geojson')
          .select('id, title, description, created_at, address, location, hazard_type, severity, status')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase.from('profiles').select('id').gte('updated_at', new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString())
      ]);

      setHotspotCount(hotspots?.length || 0);
      setReportsToday(reports?.length || 0);
      setLiveFeed(feed || []);
      setActiveCitizens(citizens?.length || 0);
      setSystemStatus('OPERATIONAL');
    } catch (e) {
      console.error('Overview load error', e);
      setSystemStatus('DEGRADED');
    } finally {
      setLoadingOverview(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const now = new Date();
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [
        { data: reportsByType },
        { data: reportsBySeverity },
        { data: verificationStats },
        { data: socialMediaStats }
      ] = await Promise.all([
        supabase
          .from('ocean_hazard_reports')
          .select('hazard_type')
          .gte('created_at', last7Days.toISOString()),
        supabase
          .from('ocean_hazard_reports')
          .select('severity')
          .gte('created_at', last7Days.toISOString()),
        supabase
          .from('ocean_hazard_reports')
          .select('status')
          .gte('created_at', last7Days.toISOString()),
        supabase
          .from('v_social_with_nlp')
          .select('nlp_sentiment_score as sentiment_score, platform, created_at')
          .gte('created_at', last7Days.toISOString())
      ]);

      // Process analytics data
      const typeCounts = reportsByType?.reduce((acc: any, report: any) => {
        acc[report.hazard_type] = (acc[report.hazard_type] || 0) + 1;
        return acc;
      }, {}) || {};

      const severityCounts = reportsBySeverity?.reduce((acc: any, report: any) => {
        acc[report.severity] = (acc[report.severity] || 0) + 1;
        return acc;
      }, {}) || {};

      const verificationCounts = verificationStats?.reduce((acc: any, report: any) => {
        acc[report.status] = (acc[report.status] || 0) + 1;
        return acc;
      }, {}) || {};

      const avgSentiment = socialMediaStats?.reduce((sum: number, feed: any) => 
        sum + (feed.sentiment_score || 0), 0) / (socialMediaStats?.length || 1);

      setAnalyticsData({
        reportsByType: typeCounts,
        reportsBySeverity: severityCounts,
        reportsByLocation: {},
        sentimentTrends: [],
        socialMediaStats: { averageSentiment: avgSentiment },
        verificationStats: verificationCounts
      });
    } catch (error) {
      console.error('Analytics fetch error:', error);
    }
  };

  const fetchSocialMonitoring = async () => {
    try {
      const { data: feeds, error } = await supabase
        .from('social_media_feeds')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const platforms = feeds?.reduce((acc: any, feed: any) => {
        acc[feed.platform] = (acc[feed.platform] || 0) + 1;
        return acc;
      }, {}) || {};

      const keywords = feeds?.reduce((acc: any, feed: any) => {
        feed.hazard_keywords?.forEach((keyword: string) => {
          acc[keyword] = (acc[keyword] || 0) + 1;
        });
        return acc;
      }, {}) || {};

      const trendingKeywords = Object.entries(keywords)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([keyword, count]) => ({ keyword, count }));

      const avgSentiment = feeds?.reduce((sum: number, feed: any) => 
        sum + (feed.sentiment_score || 0), 0) / (feeds?.length || 1);

      setSocialFeeds(feeds || []);
      setSocialStats({
        totalPosts: feeds?.length || 0,
        platforms,
        trendingKeywords,
        sentimentScore: avgSentiment
      });
    } catch (error) {
      console.error('Social monitoring fetch error:', error);
    }
  };

  const fetchAlertDeliveries = async () => {
    try {
      const { data, error } = await supabase
        .from('v_alert_deliveries')
        .select('*')
        .order('sent_at', { ascending: false })
        .range(deliveriesPage * deliveriesPageSize, deliveriesPage * deliveriesPageSize + deliveriesPageSize - 1)
      if (!error) {
        if (deliveriesPage === 0) setAlertDeliveries(data || [])
        else setAlertDeliveries(prev => [...prev, ...(data || [])])
      }
    } catch (e) { console.error('alert deliveries load error', e) }
  }

  const fetchMlHotspots = async () => {
    try {
      const { data, error } = await supabase
        .from('v_hotspots_ml_with_counts')
        .select('*')
        .order('member_count', { ascending: false })
        .limit(50)
      if (!error) setMlHotspots(data || [])
    } catch (e) { console.error('ml hotspots load error', e) }
  }

  const createAlert = async () => {
    const { error } = await supabase
      .from('alert_notifications')
      .insert({
        title: 'Test Alert',
        message: 'This is a test alert from admin panel',
        alert_type: 'general',
        severity: 'medium',
        target_roles: ['admin','analyst','citizen'],
        sent_at: new Date().toISOString()
      })
    if (!error) {
      await fetchAlertDeliveries()
      alert('Alert created')
    } else {
      console.error(error)
      alert('Failed to create alert')
    }
  }

  const refreshOneMlHotspot = async (id: string) => {
    const { error } = await supabase.rpc('refresh_hotspot_ml', { hotspot: id })
    if (!error) {
      await fetchMlHotspots()
      alert('ML hotspot refreshed')
    } else {
      console.error(error)
      alert('Failed to refresh ML hotspot')
    }
  }

  const fetchSystemMetrics = async () => {
    try {
      // Simulate system metrics (in real app, these would come from monitoring services)
      const metrics = {
        databaseStatus: Math.random() > 0.1 ? 'healthy' : 'degraded',
        apiLatency: Math.floor(Math.random() * 100) + 20,
        uptime: '99.9%',
        activeConnections: Math.floor(Math.random() * 200) + 50,
        storageUsed: `${(Math.random() * 5 + 1).toFixed(1)}GB`,
        lastBackup: `${Math.floor(Math.random() * 6) + 1} hours ago`
      };

      setSystemMetrics(metrics);
    } catch (error) {
      console.error('System metrics fetch error:', error);
    }
  };

  const calculateStats = (userData: User[]) => {
    const stats = {
      totalUsers: userData.length,
      citizens: userData.filter(u => u.role === 'citizen').length,
      analysts: userData.filter(u => u.role === 'analyst').length,
      admins: userData.filter(u => u.role === 'admin').length,
      dmfHeads: userData.filter(u => u.role === 'dmf_head').length
    };
    setStats(stats);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user role:', error);
        return;
      }

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole as any } : user
      ));

      // Recalculate stats
      const updatedUsers = users.map(user => 
        user.id === userId ? { ...user, role: newRole as any } : user
      );
      calculateStats(updatedUsers);
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Error deleting user:', error);
        return;
      }

      // Update local state
      setUsers(users.filter(user => user.id !== userId));
      calculateStats(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || (user.role && user.role === roleFilter);
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'dmf_head': return 'bg-purple-100 text-purple-800';
      case 'analyst': return 'bg-blue-100 text-blue-800';
      case 'citizen': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'dmf_head': return 'DMF Head';
      case 'analyst': return 'Analyst';
      case 'citizen': return 'Citizen';
      default: return role;
    }
  };

  if (activeTab === 'users' && loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-0 ${className}`}>
      {/* Top status bar */}
      <div className="w-full bg-[#0B1220] text-[#C7D2FE] border-b border-[#1f2937]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-[#60A5FA] font-semibold tracking-wide">SAMUDRASETU</div>
            <div className="text-xs text-[#93C5FD]">STATUS:</div>
            <div className="text-xs">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full ${
                systemStatus === 'OPERATIONAL' ? 'bg-green-900 text-green-300' : systemStatus === 'DEGRADED' ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current mr-1"></span>
                {systemStatus}
              </span>
            </div>
          </div>
          <div className="text-xs text-[#93C5FD]">{new Date().toUTCString()}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <div className="flex space-x-2 mb-4 overflow-x-auto">
          <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-md text-sm whitespace-nowrap flex items-center ${activeTab==='overview' ? 'bg-[#111827] text-white' : 'bg-[#0B1220] text-[#9CA3AF] hover:text-white'}`}>
            <Activity className="w-4 h-4 mr-2" />
            Overview
          </button>
          <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-md text-sm whitespace-nowrap flex items-center ${activeTab==='users' ? 'bg-[#111827] text-white' : 'bg-[#0B1220] text-[#9CA3AF] hover:text-white'}`}>
            <Users className="w-4 h-4 mr-2" />
            Users
          </button>
          <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 rounded-md text-sm whitespace-nowrap flex items-center ${activeTab==='analytics' ? 'bg-[#111827] text-white' : 'bg-[#0B1220] text-[#9CA3AF] hover:text-white'}`}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </button>
          <button onClick={() => setActiveTab('social')} className={`px-4 py-2 rounded-md text-sm whitespace-nowrap flex items-center ${activeTab==='social' ? 'bg-[#111827] text-white' : 'bg-[#0B1220] text-[#9CA3AF] hover:text-white'}`}>
            <Globe className="w-4 h-4 mr-2" />
            Social Monitoring
          </button>
          <button onClick={() => setActiveTab('alerts')} className={`px-4 py-2 rounded-md text-sm whitespace-nowrap flex items-center ${activeTab==='alerts' ? 'bg-[#111827] text-white' : 'bg-[#0B1220] text-[#9CA3AF] hover:text-white'}`}>
            <Bell className="w-4 h-4 mr-2" />
            Alerts
          </button>
          <button onClick={() => setActiveTab('system')} className={`px-4 py-2 rounded-md text-sm whitespace-nowrap flex items-center ${activeTab==='system' ? 'bg-[#111827] text-white' : 'bg-[#0B1220] text-[#9CA3AF] hover:text-white'}`}>
            <Server className="w-4 h-4 mr-2" />
            System
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="max-w-7xl mx-auto px-4 pb-8">
          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left column - Threats + Metrics */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-[#0B1220] rounded-xl border border-[#1f2937] p-4">
                <h3 className="text-[#C7D2FE] text-sm font-semibold mb-3">Threat Levels</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#93C5FD]">Coastal Flooding</span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-red-900 text-red-300">SEVERE</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#93C5FD]">Maritime Traffic</span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-900 text-yellow-300">HIGH</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#93C5FD]">Contamination</span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-green-900 text-green-300">LOW</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#0B1220] rounded-xl border border-[#1f2937] p-4">
                <h3 className="text-[#C7D2FE] text-sm font-semibold mb-3">Key Metrics</h3>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white">{hotspotCount}</div>
                    <div className="text-xs text-[#93C5FD]">Active Hotspots</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{reportsToday}</div>
                    <div className="text-xs text-[#93C5FD]">Reports Today</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{Math.round(aiAccuracy*100)}%</div>
                    <div className="text-xs text-[#93C5FD]">AI Accuracy</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{activeCitizens.toLocaleString()}</div>
                    <div className="text-xs text-[#93C5FD]">Active Citizens</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Center - Map */}
            <div className="lg:col-span-6">
              <div className="bg-[#0B1220] rounded-xl border border-[#1f2937] overflow-hidden h-[540px]">
                {!loadingOverview && (
                  <AdvancedOceanMap />
                )}
                {loadingOverview && (
                  <div className="h-full flex items-center justify-center text-[#93C5FD]">Loading map…</div>
                )}
              </div>
            </div>

            {/* Right - Live Feed */}
            <div className="lg:col-span-3">
              <div className="bg-[#0B1220] rounded-xl border border-[#1f2937] p-4 h-[540px] overflow-y-auto">
                <h3 className="text-[#C7D2FE] text-sm font-semibold mb-3">Live Report Feed</h3>
                <div className="space-y-3">
                  {liveFeed.map((item) => (
                    <div key={item.id} className="bg-[#0F172A] border border-[#1f2937] rounded-lg p-3">
                      <div className="text-white text-sm font-semibold truncate">
                        {item.address || (item.location?.coordinates ? `${item.location.coordinates[1].toFixed(4)}, ${item.location.coordinates[0].toFixed(4)}` : 'Unknown Location')}
                      </div>
                      <div className="text-[#93C5FD] text-xs truncate">{item.title}</div>
                      <div className="text-[#64748B] text-xs mt-1">{new Date(item.created_at).toLocaleTimeString()}</div>
                    </div>
                  ))}
                  {liveFeed.length === 0 && (
                    <div className="text-[#93C5FD] text-sm">No recent reports</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <button
            onClick={() => {
              setSelectedUser(null);
              setShowUserModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add User
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Citizens</p>
              <p className="text-2xl font-bold text-gray-900">{stats.citizens}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Analysts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.analysts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-gray-900">{stats.admins + stats.dmfHeads}</p>
            </div>
          </div>
        </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:w-48">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Filter by user role"
                  aria-label="Filter by user role"
                >
              <option value="all">All Roles</option>
              <option value="citizen">Citizens</option>
              <option value="analyst">Analysts</option>
              <option value="admin">Admins</option>
              <option value="dmf_head">DMF Heads</option>
            </select>
          </div>
        </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.avatar_url ? (
                          <img className="h-10 w-10 rounded-full" src={user.avatar_url} alt="" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role || 'citizen')}`}>
                      {getRoleLabel(user.role || 'citizen')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.department || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                          <select
                            value={user.role || 'citizen'}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                            title="Change user role"
                            aria-label="Change user role"
                          >
                        <option value="citizen">Citizen</option>
                        <option value="analyst">Analyst</option>
                        <option value="admin">Admin</option>
                        <option value="dmf_head">DMF Head</option>
                      </select>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>

        {/* User Modal */}
        {showUserModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedUser ? 'Edit User' : 'Add User'}
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      defaultValue={selectedUser?.name || ''}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      title="User name"
                      aria-label="User name"
                    />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    defaultValue={selectedUser?.email || ''}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    title="User email"
                    aria-label="User email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    defaultValue={selectedUser?.phone || ''}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    title="User phone"
                    aria-label="User phone"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    defaultValue={selectedUser?.role || 'citizen'}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    title="User role"
                    aria-label="User role"
                  >
                    <option value="citizen">Citizen</option>
                    <option value="analyst">Analyst</option>
                    <option value="admin">Admin</option>
                    <option value="dmf_head">DMF Head</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <input
                    type="text"
                    defaultValue={selectedUser?.department || ''}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    title="User department"
                    aria-label="User department"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUserModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {selectedUser ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        )}
      </div>
      )}

      {activeTab === 'analytics' && (
        <div className="max-w-7xl mx-auto px-4 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Reports by Type */}
            <div className="bg-[#0B1220] rounded-xl border border-[#1f2937] p-6">
              <h3 className="text-[#C7D2FE] text-lg font-semibold mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Reports by Type
              </h3>
              <div className="space-y-3">
                {Object.entries(analyticsData.reportsByType).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-[#93C5FD] capitalize">{type.replace('_', ' ')}</span>
                    <span className="text-white font-semibold">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reports by Severity */}
            <div className="bg-[#0B1220] rounded-xl border border-[#1f2937] p-6">
              <h3 className="text-[#C7D2FE] text-lg font-semibold mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Reports by Severity
              </h3>
              <div className="space-y-3">
                {Object.entries(analyticsData.reportsBySeverity).map(([severity, count]) => (
                  <div key={severity} className="flex justify-between items-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      severity === 'critical' ? 'bg-red-900 text-red-300' :
                      severity === 'high' ? 'bg-orange-900 text-orange-300' :
                      severity === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                      'bg-green-900 text-green-300'
                    }`}>
                      {severity}
                    </span>
                    <span className="text-white font-semibold">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Stats */}
            <div className="bg-[#0B1220] rounded-xl border border-[#1f2937] p-6">
              <h3 className="text-[#C7D2FE] text-lg font-semibold mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Verification Status
              </h3>
              <div className="space-y-3">
                {Object.entries(analyticsData.verificationStats).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      status === 'verified' ? 'bg-green-900 text-green-300' :
                      status === 'unverified' ? 'bg-yellow-900 text-yellow-300' :
                      'bg-red-900 text-red-300'
                    }`}>
                      {status}
                    </span>
                    <span className="text-white font-semibold">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'social' && (
        <div className="max-w-7xl mx-auto px-4 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Social Media Stats */}
            <div className="bg-[#0B1220] rounded-xl border border-[#1f2937] p-6">
              <h3 className="text-[#C7D2FE] text-lg font-semibold mb-4 flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Platform Distribution
              </h3>
              <div className="space-y-3">
                {Object.entries(socialStats.platforms).map(([platform, count]) => (
                  <div key={platform} className="flex justify-between items-center">
                    <span className="text-[#93C5FD] capitalize">{platform}</span>
                    <span className="text-white font-semibold">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Keywords */}
            <div className="bg-[#0B1220] rounded-xl border border-[#1f2937] p-6">
              <h3 className="text-[#C7D2FE] text-lg font-semibold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Trending Keywords
              </h3>
              <div className="space-y-3">
                {socialStats.trendingKeywords.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-[#93C5FD]">{item.keyword}</span>
                    <span className="text-white font-semibold">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sentiment Score */}
            <div className="bg-[#0B1220] rounded-xl border border-[#1f2937] p-6">
              <h3 className="text-[#C7D2FE] text-lg font-semibold mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Sentiment Overview
              </h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">
                  {(socialStats.sentimentScore * 100).toFixed(1)}%
                </div>
                <div className="text-[#93C5FD] text-sm mb-4">Overall Sentiment</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="max-w-7xl mx-auto px-4 pb-8">
          <AlertPanel />
          <div className="mt-4">
            <button onClick={createAlert} className="px-3 py-2 bg-blue-600 text-white rounded text-sm">Send Test Alert</button>
          </div>
          <div className="mt-6 bg-white rounded-lg shadow">
            <div className="p-4 border-b"><h3 className="font-semibold">Recent Alert Deliveries</h3></div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Channel</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sent At</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {alertDeliveries.map((row) => (
                    <tr key={row.delivery_id}>
                      <td className="px-4 py-2 text-sm text-gray-900">{row.title}</td>
                      <td className="px-4 py-2 text-sm">{row.severity}</td>
                      <td className="px-4 py-2 text-sm">{row.recipient_name} ({row.recipient_email})</td>
                      <td className="px-4 py-2 text-sm">{row.delivery_channel}</td>
                      <td className="px-4 py-2 text-sm">{row.delivery_status}</td>
                      <td className="px-4 py-2 text-sm">{row.sent_at ? new Date(row.sent_at).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                  {alertDeliveries.length === 0 && (
                    <tr><td className="px-4 py-4 text-sm text-gray-500" colSpan={6}>No deliveries yet</td></tr>
                  )}
                </tbody>
              </table>
              <div className="p-4 flex justify-center">
                <button onClick={() => { setDeliveriesPage(prev => prev + 1); fetchAlertDeliveries() }} className="px-3 py-2 bg-gray-100 rounded text-sm">Load More</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="max-w-7xl mx-auto px-4 pb-8">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex items-center justify-between"><h3 className="font-semibold">ML Hotspots</h3>
              <div className="text-sm text-gray-600">Click refresh on a row to recompute membership</div></div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Report Count</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Social Count</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Official Count</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Members</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Confidence</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mlHotspots.map((h) => (
                    <tr key={h.id}>
                      <td className="px-4 py-2 text-sm">{h.severity_level}</td>
                      <td className="px-4 py-2 text-sm">{h.report_count}</td>
                      <td className="px-4 py-2 text-sm">{h.social_media_count}</td>
                      <td className="px-4 py-2 text-sm">{h.official_data_count}</td>
                      <td className="px-4 py-2 text-sm">{h.member_count}</td>
                      <td className="px-4 py-2 text-sm">{Number(h.confidence_score).toFixed(2)}</td>
                      <td className="px-4 py-2 text-sm"><button onClick={() => refreshOneMlHotspot(h.id)} className="inline-flex items-center px-2 py-1 bg-gray-100 rounded text-xs"><RefreshCw className="w-3 h-3 mr-1"/>Refresh</button></td>
                    </tr>
                  ))}
                  {mlHotspots.length === 0 && (
                    <tr><td className="px-4 py-4 text-sm text-gray-500" colSpan={6}>No ML hotspots</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="max-w-7xl mx-auto px-4 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Database Status */}
            <div className="bg-[#0B1220] rounded-xl border border-[#1f2937] p-6">
              <h3 className="text-[#C7D2FE] text-lg font-semibold mb-4 flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Database Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#93C5FD]">Status</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    systemMetrics.databaseStatus === 'healthy' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                  }`}>
                    {systemMetrics.databaseStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#93C5FD]">Active Connections</span>
                  <span className="text-white font-semibold">{systemMetrics.activeConnections}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#93C5FD]">Storage Used</span>
                  <span className="text-white font-semibold">{systemMetrics.storageUsed}</span>
                </div>
              </div>
            </div>

            {/* API Performance */}
            <div className="bg-[#0B1220] rounded-xl border border-[#1f2937] p-6">
              <h3 className="text-[#C7D2FE] text-lg font-semibold mb-4 flex items-center">
                <Wifi className="w-5 h-5 mr-2" />
                API Performance
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#93C5FD]">Average Latency</span>
                  <span className={`font-semibold ${
                    systemMetrics.apiLatency < 50 ? 'text-green-400' :
                    systemMetrics.apiLatency < 100 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {systemMetrics.apiLatency}ms
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#93C5FD]">Uptime</span>
                  <span className="text-green-400 font-semibold">{systemMetrics.uptime}</span>
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-[#0B1220] rounded-xl border border-[#1f2937] p-6">
              <h3 className="text-[#C7D2FE] text-lg font-semibold mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                System Health
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#93C5FD]">CPU Usage</span>
                  <span className="text-white font-semibold">
                    {Math.floor(Math.random() * 30 + 20)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#93C5FD]">Memory Usage</span>
                  <span className="text-white font-semibold">
                    {Math.floor(Math.random() * 40 + 30)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;