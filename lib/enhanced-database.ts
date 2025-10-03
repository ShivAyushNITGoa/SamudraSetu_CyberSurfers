// Enhanced Database Types for SamudraSetu Ocean Hazard Monitoring System
// Based on the comprehensive architecture plan

export interface Profile {
  id: string
  email: string
  name: string
  phone?: string
  role: 'citizen' | 'analyst' | 'admin' | 'dmf_head'
  department?: string
  position?: string
  language_preference: string
  location?: {
    latitude: number
    longitude: number
    address?: string
  }
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface OceanHazardReport {
  id: string
  user_id: string
  title: string
  description: string
  hazard_type: 'tsunami' | 'storm_surge' | 'flooding' | 'erosion' | 'unusual_tides' | 
               'coastal_damage' | 'marine_pollution' | 'weather_anomaly' | 'cyclone' | 
               'storm_track' | 'sea_level_rise' | 'coral_bleaching' | 'oil_spill' | 
               'algal_bloom' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'unverified' | 'verified' | 'false_alarm' | 'resolved'
  location: {
    latitude: number
    longitude: number
  }
  address: string
  media_urls: string[]
  confidence_score: number
  social_media_indicators: {
    tweet_count?: number
    sentiment_score?: number
    trending_keywords?: string[]
  }
  verified_by?: string
  verified_at?: string
  is_public: boolean
  created_at: string
  updated_at: string
  admin_notes?: string
}

export interface SocialMediaFeed {
  id: string
  platform: 'twitter' | 'youtube' | 'facebook' | 'instagram' | 'telegram' | 'whatsapp' | 'news_rss'
  post_id: string
  content: string
  author?: string
  location?: {
    latitude: number
    longitude: number
  }
  sentiment_score?: number
  hazard_keywords: string[]
  relevance_score: number
  language: string
  verified: boolean
  verification_notes?: string
  verified_at?: string
  created_at: string
  processed_at: string
}

export interface HazardHotspot {
  id: string
  center_location: {
    latitude: number
    longitude: number
  }
  radius_meters: number
  report_count: number
  severity_level: 'low' | 'medium' | 'high' | 'critical'
  confidence_score: number
  hazard_types: string[]
  created_at: string
  updated_at: string
}

export interface HazardHotspotML extends HazardHotspot {
  social_media_count: number
  official_data_count: number
  ml_model_version: string
  risk_factors: {
    historical_incidents?: number
    population_density?: number
    infrastructure_vulnerability?: number
    environmental_factors?: Record<string, any>
  }
  predicted_escalation: boolean
  escalation_probability: number
}

export interface OfficialDataFeed {
  id: string
  source: string
  feed_type: string
  data: Record<string, any>
  location?: {
    latitude: number
    longitude: number
  }
  valid_from: string
  valid_until: string
  created_at: string
}

export interface OfficialDataSource {
  id: string
  name: string
  agency: 'INCOIS' | 'IMD' | 'NOAA' | 'ESA' | 'OTHER'
  api_endpoint?: string
  api_key_required: boolean
  data_type: 'tsunami' | 'cyclone' | 'sea_level' | 'weather' | 'ocean_monitoring'
  update_frequency_minutes: number
  is_active: boolean
  last_successful_fetch?: string
  last_error?: string
  configuration: Record<string, any>
  created_at: string
  updated_at: string
}

export interface SocialMediaConfig {
  id: string
  platform: 'twitter' | 'youtube' | 'facebook' | 'instagram' | 'telegram' | 'whatsapp' | 'news_rss'
  api_credentials: Record<string, any> // encrypted
  keywords: string[]
  languages: string[]
  geographic_filters?: {
    bounding_boxes?: Array<{
      min_lat: number
      min_lng: number
      max_lat: number
      max_lng: number
    }>
    regions?: string[]
  }
  update_frequency_minutes: number
  is_active: boolean
  last_successful_fetch?: string
  last_error?: string
  rate_limit_remaining?: number
  rate_limit_reset?: string
  created_at: string
  updated_at: string
}

export interface NLPProcessingResult {
  id: string
  source_type: 'social_media' | 'report' | 'official_feed'
  source_id: string
  content: string
  language: string
  sentiment_score?: number // -1 to 1
  sentiment_label?: 'positive' | 'negative' | 'neutral'
  hazard_classification: {
    [hazard_type: string]: number // confidence score
  }
  location_extracted?: {
    latitude: number
    longitude: number
  }
  keywords_extracted: string[]
  confidence_score: number
  processing_model: string
  processed_at: string
  created_at: string
}

export interface AlertThreshold {
  id: string
  name: string
  description?: string
  hazard_type: string
  conditions: {
    min_reports?: number
    time_window_minutes?: number
    geographic_radius_km?: number
    min_confidence?: number
    sentiment_threshold?: number
  }
  actions: {
    send_notification: boolean
    target_roles: string[]
    notification_type: 'info' | 'warning' | 'urgent' | 'critical'
    auto_verify?: boolean
    escalate_to_dmf?: boolean
  }
  severity_threshold: 'low' | 'medium' | 'high' | 'critical'
  geographic_scope?: {
    regions?: string[]
    bounding_boxes?: Array<{
      min_lat: number
      min_lng: number
      max_lat: number
      max_lng: number
    }>
  }
  time_window_minutes: number
  cooldown_minutes: number
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export interface AlertNotification {
  id: string
  title: string
  message: string
  alert_type: 'tsunami' | 'storm_surge' | 'flooding' | 'cyclone_warning' | 
              'tsunami_warning' | 'storm_surge_warning' | 'flood_warning' | 
              'evacuation_order' | 'general'
  severity: 'low' | 'medium' | 'high' | 'critical'
  target_roles: string[]
  target_locations?: {
    regions?: string[]
    coordinates?: Array<{
      latitude: number
      longitude: number
      radius_km: number
    }>
  }
  sent_at?: string
  created_by?: string
  created_at: string
}

export interface MultilingualContent {
  id: string
  content_type: 'hazard_type' | 'severity' | 'status' | 'ui_text' | 'notification'
  content_key: string
  language_code: string
  translated_text: string
  created_at: string
  updated_at: string
}

export interface SystemAnalytics {
  id: string
  metric_name: string
  metric_value: number
  metric_unit?: string
  dimensions: {
    region?: string
    time_period?: string
    hazard_type?: string
    user_role?: string
    [key: string]: any
  }
  recorded_at: string
}

export interface UserActivityLog {
  id: string
  user_id: string
  activity_type: 'report_created' | 'report_viewed' | 'map_interaction' | 
                 'social_media_viewed' | 'alert_received' | 'profile_updated'
  activity_data: {
    report_id?: string
    map_center?: { lat: number; lng: number }
    zoom_level?: number
    filters_applied?: Record<string, any>
    [key: string]: any
  }
  ip_address?: string
  user_agent?: string
  location?: {
    latitude: number
    longitude: number
  }
  created_at: string
}

export interface ReportComment {
  id: string
  report_id: string
  user_id: string
  content: string
  is_verified: boolean
  created_at: string
}

export interface Department {
  id: string
  name: string
  description?: string
  contact_phone?: string
  contact_email?: string
  jurisdiction?: {
    type: 'polygon'
    coordinates: number[][][]
  }
  responsibilities: string[]
  created_at: string
  updated_at: string
}

// API Response Types
export interface APIResponse<T> {
  data: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

// Dashboard Analytics Types
export interface DashboardAnalytics {
  total_reports: number
  reports_by_status: Record<string, number>
  reports_by_hazard_type: Record<string, number>
  reports_by_severity: Record<string, number>
  social_media_activity: {
    total_posts: number
    sentiment_distribution: Record<string, number>
    trending_keywords: Array<{ keyword: string; count: number }>
  }
  official_data_feeds: {
    active_feeds: number
    last_update: string
    data_quality_score: number
  }
  system_health: {
    uptime_percentage: number
    response_time_ms: number
    error_rate: number
  }
  geographic_distribution: {
    hotspots_count: number
    high_risk_areas: number
    coverage_percentage: number
  }
}

// Map Visualization Types
export interface MapVisualization {
  type: 'markers' | 'clusters' | 'heatmap' | 'hotspots'
  data: Array<{
    id: string
    latitude: number
    longitude: number
    type: string
    severity: string
    confidence?: number
    metadata?: Record<string, any>
  }>
  bounds?: {
    north: number
    south: number
    east: number
    west: number
  }
  zoom?: number
}

// Notification Types
export interface NotificationTemplate {
  id: string
  name: string
  type: 'email' | 'sms' | 'push' | 'in_app'
  subject?: string
  message: string
  language: string
  variables: string[]
  created_at: string
  updated_at: string
}

// Export all types for easy importing
export type {
  Profile,
  OceanHazardReport,
  SocialMediaFeed,
  HazardHotspot,
  HazardHotspotML,
  OfficialDataFeed,
  OfficialDataSource,
  SocialMediaConfig,
  NLPProcessingResult,
  AlertThreshold,
  AlertNotification,
  MultilingualContent,
  SystemAnalytics,
  UserActivityLog,
  ReportComment,
  Department,
  APIResponse,
  PaginatedResponse,
  DashboardAnalytics,
  MapVisualization,
  NotificationTemplate
}

// ------- New data utilities for connected schema -------
import { supabase } from './supabase'

export async function fetchPublicReportsGeoJSON(limit = 500) {
  const { data, error } = await supabase
    .from('view_public_reports_geojson')
    .select('*')
    .limit(limit)
  if (error) throw error
  return data
}

export async function fetchAdminReports(limit = 100, offset = 0) {
  const { data, error } = await supabase
    .from('v_admin_reports')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + Math.max(0, limit - 1))
  if (error) throw error
  return data
}

export async function fetchSocialWithNLP(limit = 200, offset = 0) {
  const { data, error } = await supabase
    .from('v_social_with_nlp')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + Math.max(0, limit - 1))
  if (error) throw error
  return data
}

export async function fetchAlertDeliveries(limit = 200, offset = 0) {
  const { data, error } = await supabase
    .from('v_alert_deliveries')
    .select('*')
    .order('sent_at', { ascending: false })
    .range(offset, offset + Math.max(0, limit - 1))
  if (error) throw error
  return data
}

export async function fetchHotspotsWithCounts() {
  const { data, error } = await supabase
    .from('v_hotspots_with_counts')
    .select('*')
    .order('member_count', { ascending: false })
  if (error) throw error
  return data
}

export async function fetchHotspotsMLWithCounts() {
  const { data, error } = await supabase
    .from('v_hotspots_ml_with_counts')
    .select('*')
    .order('member_count', { ascending: false })
  if (error) throw error
  return data
}

export async function fetchReportsAnalytics(days = 30) {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const { data, error } = await supabase
    .from('v_reports_analytics')
    .select('*')
    .gte('day', since.toISOString())
    .order('day', { ascending: true })
  if (error) throw error
  return data
}

export async function getReportsWithinKm(lat: number, lon: number, km: number) {
  const { data, error } = await supabase
    .rpc('reports_within_km', { lat, lon, km })
  if (error) throw error
  return data
}