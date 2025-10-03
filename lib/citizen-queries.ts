import { supabase } from '@/lib/supabase'

// Simple category mapping for now - in production, this should come from the database
const categoryMapping: { [key: string]: string } = {
  'infrastructure': 'infrastructure',
  'environment': 'environment', 
  'safety': 'safety',
  'transport': 'transport',
  'utilities': 'utilities',
  'other': 'other'
}

export interface CitizenReport {
  id: string
  title: string
  description: string
  hazard_type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'unverified' | 'verified' | 'false_alarm' | 'resolved'
  address: string
  location?: {
    latitude: number
    longitude: number
  }
  latitude?: number
  longitude?: number
  media_urls: string[]
  user_id: string
  reporter_name?: string
  comments_count?: number
  upvotes_count?: number
  has_upvoted?: boolean
  confidence_score: number
  social_media_indicators?: {
    tweet_count?: number
    sentiment_score?: number
    trending_keywords?: string[]
  }
  created_at: string
  updated_at: string
}

export interface ReportComment {
  id: string
  report_id: string
  user_id: string
  user_name?: string | null
  comment: string
  created_at: string
}

export async function getCitizenReports(currentUserId?: string): Promise<CitizenReport[]> {
  try {
    console.log('🔍 Starting getCitizenReports...')
    console.log('🔗 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing')
    console.log('🔑 Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing')
    
    const { data, error } = await supabase
      .from('ocean_hazard_reports')
      .select(`
        *,
        profiles:user_id ( name ),
        report_comments(count)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(50)

    console.log('📊 Query result:', { data: data?.length || 0, error })

    if (error) {
      console.error('❌ Error fetching citizen reports:', error)
      throw error
    }

    // Handle case where there's no data
    if (!data || data.length === 0) {
      console.log('ℹ️ No reports found in database')
      return []
    }

    const transformedData = data.map((report: any) => {
      // Parse PostGIS POINT data
      let latitude = 0
      let longitude = 0
      
      if (report.location) {
        if (typeof report.location === 'string') {
          // PostGIS POINT format: "POINT(lng lat)"
          const match = report.location.match(/POINT\(([^)]+)\)/)
          if (match) {
            const coords = match[1].split(' ')
            longitude = parseFloat(coords[0])
            latitude = parseFloat(coords[1])
          }
        } else if (report.location.latitude && report.location.longitude) {
          // Already parsed object
          latitude = report.location.latitude
          longitude = report.location.longitude
        }
      }

      return {
      ...report,
      reporter_name: report.profiles?.name || 'Anonymous',
        latitude,
        longitude,
      comments_count: Array.isArray(report.report_comments) ? report.report_comments[0]?.count ?? 0 : 0,
        upvotes_count: 0, // No upvotes in new schema
        has_upvoted: false,
        confidence_score: report.confidence_score || 0.5,
        social_media_indicators: report.social_media_indicators || {}
      }
    })

    console.log('✅ Successfully transformed data:', transformedData.length, 'reports')
    return transformedData
  } catch (error) {
    console.error('❌ Error in getCitizenReports:', error)
    throw error
  }
}

export async function getCitizenReportById(id: string, currentUserId?: string): Promise<CitizenReport | null> {
  try {
    const { data, error } = await supabase
      .from('ocean_hazard_reports')
      .select(`
        *,
        profiles:user_id ( name ),
        report_comments(count)
      `)
      .eq('id', id)
      .eq('is_public', true)
      .single()

    if (error) {
      console.error('Error fetching citizen report:', error)
      return null
    }

    try {
      // Parse PostGIS POINT data
      let latitude = 0
      let longitude = 0
      
      if (data.location) {
        if (typeof data.location === 'string') {
          // PostGIS POINT format: "POINT(lng lat)"
          const match = data.location.match(/POINT\(([^)]+)\)/)
          if (match) {
            const coords = match[1].split(' ')
            longitude = parseFloat(coords[0])
            latitude = parseFloat(coords[1])
          }
        } else if (data.location.latitude && data.location.longitude) {
          // Already parsed object
          latitude = data.location.latitude
          longitude = data.location.longitude
        }
      }

      return {
        ...data,
        reporter_name: (data as any).profiles?.name || 'Anonymous',
        latitude,
        longitude,
        comments_count: Array.isArray((data as any).report_comments) ? (data as any).report_comments[0]?.count ?? 0 : 0,
        upvotes_count: 0, // No upvotes in new schema
        has_upvoted: false,
        confidence_score: (data as any).confidence_score || 0.5,
        social_media_indicators: (data as any).social_media_indicators || {}
      }
    } catch (error) {
      console.error('Error transforming report data:', error, data)
      return {
        ...data,
        reporter_name: 'Anonymous',
        latitude: 0,
        longitude: 0,
        comments_count: 0,
        upvotes_count: 0,
        has_upvoted: false,
        confidence_score: 0.5,
        social_media_indicators: {}
      }
    }
  } catch (error) {
    console.error('Error in getCitizenReportById:', error)
    return null
  }
}

export async function getReportComments(reportId: string): Promise<ReportComment[]> {
  const { data, error } = await supabase
    .from('report_comments')
    .select('*')
    .eq('report_id', reportId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching report comments:', error)
    throw error
  }

  return (data || []) as ReportComment[]
}

export async function addReportComment(params: {
  reportId: string
  userId: string
  userName?: string
  comment: string
}): Promise<ReportComment> {
  const { data, error } = await supabase
    .from('report_comments')
    .insert([
      {
        report_id: params.reportId,
        user_id: params.userId,
        user_name: params.userName ?? null,
        comment: params.comment,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error('Error adding comment:', error)
    throw error
  }

  return data as ReportComment
}

// Upvote functions removed - not available in new schema

// Subscriptions
export async function isSubscribed(reportId: string, userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('report_id', reportId)
    .eq('user_id', userId)
    .maybeSingle()
  if (error) return false
  return !!data
}

export async function subscribeToReport(reportId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('subscriptions')
    .insert({ report_id: reportId, user_id: userId })
  if (error && !String(error.message).includes('duplicate')) throw error
}

export async function unsubscribeFromReport(reportId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('subscriptions')
    .delete()
    .eq('report_id', reportId)
    .eq('user_id', userId)
  if (error) throw error
}

export async function createCitizenReport(reportData: {
  title: string
  description: string
  hazard_type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  address: string
  location?: {
    latitude: number
    longitude: number
  }
  user_id: string
  media_urls?: string[]
}): Promise<CitizenReport> {
  try {
    const { data, error } = await supabase
      .from('ocean_hazard_reports')
      .insert([{
        title: reportData.title,
        description: reportData.description,
        hazard_type: reportData.hazard_type,
        severity: reportData.severity,
        address: reportData.address,
        location: reportData.location ? `POINT(${reportData.location.longitude} ${reportData.location.latitude})` : null,
        user_id: reportData.user_id,
        media_urls: reportData.media_urls || [],
        status: 'unverified',
        is_public: true,
        confidence_score: 0.5,
        social_media_indicators: {}
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating citizen report:', error)
      throw error
    }

    return {
      ...data,
      reporter_name: 'Anonymous',
      latitude: reportData.location?.latitude || 0,
      longitude: reportData.location?.longitude || 0,
      comments_count: 0,
      upvotes_count: 0,
      has_upvoted: false,
      confidence_score: 0.5,
      social_media_indicators: {}
    }
  } catch (error) {
    console.error('Error in createCitizenReport:', error)
    throw error
  }
}

export async function getUserReports(userId: string): Promise<CitizenReport[]> {
  try {
    console.log('🔍 Starting getUserReports for user:', userId)
    console.log('🔗 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing')
    console.log('🔑 Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing')
    
    const { data, error } = await supabase
      .from('ocean_hazard_reports')
      .select(`
        *,
        profiles:user_id (
          name
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    console.log('📊 getUserReports query result:', { data: data?.length || 0, error })

    if (error) {
      console.error('❌ Error fetching user reports:', error)
      console.error('❌ Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      
      // If the table doesn't exist or there's a permission issue, return empty array
      if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('ℹ️ Table may not exist or user may not have permission, returning empty array')
        return []
      }
      
      throw error
    }

    const transformedData = data?.map((report: any) => {
      // Parse PostGIS POINT data
      let latitude = 0
      let longitude = 0
      
      if (report.location) {
        if (typeof report.location === 'string') {
          // PostGIS POINT format: "POINT(lng lat)"
          const match = report.location.match(/POINT\(([^)]+)\)/)
          if (match) {
            const coords = match[1].split(' ')
            longitude = parseFloat(coords[0])
            latitude = parseFloat(coords[1])
          }
        } else if (report.location.latitude && report.location.longitude) {
          // Already parsed object
          latitude = report.location.latitude
          longitude = report.location.longitude
        }
      }

      return {
      ...report,
      reporter_name: report.profiles?.name || 'Anonymous',
        latitude,
        longitude,
        comments_count: 0,
        upvotes_count: 0,
        has_upvoted: false,
        confidence_score: report.confidence_score || 0.5,
        social_media_indicators: report.social_media_indicators || {}
      }
    }) || []

    return transformedData
  } catch (error) {
    console.error('Error in getUserReports:', error)
    throw error
  }
}
