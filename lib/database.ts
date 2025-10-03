// SamudraSetu Database types and interfaces
export interface Profile {
  id: string
  email: string
  name: string
  role: 'citizen' | 'admin' | 'analyst' | 'dmf_head'
  phone?: string
  department?: string
  avatar_url?: string
  language_preference: string
  location?: {
    latitude: number
    longitude: number
    address?: string
  }
  created_at: string
  updated_at: string
}

export interface OceanHazardReport {
  id: string
  title: string
  description: string
  hazard_type: 'tsunami' | 'storm_surge' | 'flooding' | 'erosion' | 'unusual_tides' | 'coastal_damage' | 'marine_pollution' | 'weather_anomaly' | 'other'
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'unverified' | 'verified' | 'false_alarm' | 'resolved'
  location: {
    latitude: number
    longitude: number
  }
  address: string
  media_urls: string[]
  user_id: string
  verified_by?: string
  is_public: boolean
  confidence_score: number
  social_media_indicators: {
    tweet_count?: number
    sentiment_score?: number
    trending_keywords?: string[]
  }
  created_at: string
  updated_at: string
  verified_at?: string
  admin_notes?: string
}

export interface SocialMediaFeed {
  id: string
  platform: 'twitter' | 'youtube' | 'facebook' | 'instagram'
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
  created_at: string
  processed_at?: string
}

export interface HazardHotspot {
  id: string
  center_location: {
    latitude: number
    longitude: number
  }
  radius_meters: number
  hazard_type: string
  report_count: number
  severity_level: 'low' | 'medium' | 'high' | 'critical'
  confidence_score: number
  created_at: string
  updated_at: string
}

export interface OfficialDataFeed {
  id: string
  source: string
  feed_type: 'tsunami_warning' | 'storm_surge' | 'weather_alert' | 'sea_level' | 'current_data'
  data: Record<string, any>
  location?: {
    latitude: number
    longitude: number
  }
  valid_from: string
  valid_until?: string
  created_at: string
}

export interface ReportComment {
  id: string
  report_id: string
  user_id: string
  user_name?: string
  comment: string
  is_verified: boolean
  created_at: string
}

export interface Department {
  id: string
  name: string
  contact_email: string
  contact_phone?: string
  jurisdiction?: {
    type: 'polygon' | 'circle'
    coordinates: number[][]
    radius?: number
  }
  responsibilities: string[]
  created_at: string
}

export interface AlertNotification {
  id: string
  title: string
  message: string
  alert_type: 'tsunami' | 'storm_surge' | 'flooding' | 'general'
  severity: 'low' | 'medium' | 'high' | 'critical'
  target_roles: string[]
  target_locations?: {
    type: 'polygon' | 'circle'
    coordinates: number[][]
    radius?: number
  }
  sent_at?: string
  created_at: string
  created_by: string
}

// Legacy interfaces for backward compatibility
export interface Report extends OceanHazardReport {
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to?: string
  resolved_at?: string
}

export interface CivicIssue extends Report {
  reporter_id: string
  reporter_name: string
  reporter_email: string
  images: string[]
}