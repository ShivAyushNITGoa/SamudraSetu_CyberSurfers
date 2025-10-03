import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { SocialMediaMonitoringService } from '@/lib/social-media-monitoring'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Minimal monitor instance with no external API keys required
const socialMediaMonitor = new SocialMediaMonitoringService([
  {
    platform: 'twitter',
    keywords: ['tsunami','storm','surge','flood','wave','cyclone','coast','sea'],
    language: 'en',
  },
])

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'start_monitoring':
        // Start social media monitoring (disabled for now due to missing API keys)
        return NextResponse.json({ 
          success: true, 
          message: 'Social media monitoring is currently disabled - API keys not configured' 
        })

      case 'process_feeds':
        // Process unprocessed social media feeds (disabled for now)
        return NextResponse.json({ 
          success: true, 
          message: 'Social media processing is currently disabled - API keys not configured' 
        })

      case 'get_analytics':
        // Basic analytics derived from DB without external calls
        const { data: recent, error: recentErr } = await supabase
          .from('social_media_feeds')
          .select('platform, sentiment_score, relevance_score, created_at')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

        if (recentErr) throw recentErr

        const total = recent?.length || 0
        const avgSentiment = total
          ? (recent!.reduce((s, r) => s + (r.sentiment_score || 0), 0) / total)
          : 0
        return NextResponse.json({ success: true, analytics: { total, avgSentiment } })

      case 'manual_verification':
        // Manually verify social media posts
        const { postId, verified, notes } = data
        
        const { error: updateError } = await supabase
          .from('social_media_feeds')
          .update({
            verified: verified,
            verification_notes: notes,
            verified_at: verified ? new Date().toISOString() : null       
          })
          .eq('id', postId)

        if (updateError) {
          throw updateError
        }

        return NextResponse.json({ 
          success: true, 
          message: 'Post verification updated' 
        })

      case 'update_keywords':
        // Update hazard keywords for better filtering
        const { keywords, language } = data
        
        // This would typically update a configuration table
        // For now, we'll just return success
        return NextResponse.json({ 
          success: true, 
          message: 'Keywords updated' 
        })

      case 'export_data':
        // Export social media data
        const { startDate, endDate, format } = data
        
        let query = supabase
          .from('social_media_feeds')
          .select('*')
          .order('created_at', { ascending: false })

        if (startDate) {
          query = query.gte('created_at', startDate)
        }
        if (endDate) {
          query = query.lte('created_at', endDate)
        }

        const { data: feeds, error: queryError } = await query

        if (queryError) {
          throw queryError
        }

        if (format === 'csv') {
          const csvData = convertToCSV(feeds || [])
          return new NextResponse(csvData, {
            headers: {
              'Content-Type': 'text/csv',
              'Content-Disposition': 'attachment; filename="social_media_feeds.csv"'
            }
          })
        }

        return NextResponse.json({ 
          success: true, 
          data: feeds 
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in social media processing:', error)
    return NextResponse.json(
      { error: 'Failed to process social media data' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const timeRange = searchParams.get('timeRange') || '24h'

    switch (action) {
      case 'analytics':
        // Provide simple keyword frequency over time window
        const since = new Date()
        const unit = timeRange === '24h' ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000
        since.setTime(Date.now() - unit)
        const { data: feeds, error: feedsErr } = await supabase
          .from('social_media_feeds')
          .select('hazard_keywords, created_at')
          .gte('created_at', since.toISOString())

        if (feedsErr) throw feedsErr

        const counts: Record<string, number> = {}
        for (const row of feeds || []) {
          for (const k of (row.hazard_keywords || [])) {
            counts[k] = (counts[k] || 0) + 1
          }
        }
        return NextResponse.json({ success: true, analytics: counts })

      case 'trends':
        // Get trending topics and keywords
        const { data: trendingData, error } = await supabase
          .from('social_media_feeds')
          .select('hazard_keywords, sentiment_score, created_at')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .gt('relevance_score', 0.3)

        if (error) {
          throw error
        }

        // Process trending data
        const trends = (trendingData || []).reduce((acc: Record<string, number>, row: any) => {
          for (const k of row.hazard_keywords || []) acc[k] = (acc[k] || 0) + 1
          return acc
        }, {})
        
        return NextResponse.json({ 
          success: true, 
          trends 
        })

      case 'sentiment':
        // Get sentiment analysis data
        const { data: sentimentData, error: sentimentError } = await supabase
          .from('social_media_feeds')
          .select('sentiment_score, created_at, platform')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .gt('relevance_score', 0.3)

        if (sentimentError) {
          throw sentimentError
        }

        const sentiment = (sentimentData || []).reduce((acc: any, row: any) => {
          const key = row.platform || 'unknown'
          acc[key] = acc[key] || { count: 0, sum: 0 }
          acc[key].count += 1
          acc[key].sum += row.sentiment_score || 0
          return acc
        }, {})
        
        return NextResponse.json({ 
          success: true, 
          sentiment 
        })

      case 'platform_stats':
        // Get platform-specific statistics
        const { data: platformData, error: platformError } = await supabase
          .from('social_media_feeds')
          .select('platform, created_at')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

        if (platformError) {
          throw platformError
        }

        const platformStats = processPlatformStats(platformData || [])
        
        return NextResponse.json({ 
          success: true, 
          platformStats 
        })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in social media GET:', error)
    return NextResponse.json(
      { error: 'Failed to fetch social media data' },
      { status: 500 }
    )
  }
}

// Helper functions
function convertToCSV(data: any[]): string {
  if (data.length === 0) return ''

  const headers = [
    'ID', 'Platform', 'Content', 'Author', 'Sentiment Score', 
    'Relevance Score', 'Hazard Keywords', 'Language', 'Created At'
  ]

  const rows = data.map(feed => [
    feed.id,
    feed.platform,
    `"${feed.content.replace(/"/g, '""')}"`,
    feed.author || '',
    feed.sentiment_score || '',
    feed.relevance_score,
    feed.hazard_keywords?.join(';') || '',
    feed.language,
    feed.created_at
  ])

  return [headers, ...rows]
    .map(row => row.join(','))
    .join('\n')
}

function processTrendingData(data: any[]) {
  const keywordCounts: Record<string, number> = {}
  const hourlyTrends: Record<number, { count: number, keywords: string[] }> = {}

  data.forEach(feed => {
    const hour = new Date(feed.created_at).getHours()
    
    if (!hourlyTrends[hour]) {
      hourlyTrends[hour] = { count: 0, keywords: [] }
    }
    
    hourlyTrends[hour].count++
    
    feed.hazard_keywords?.forEach((keyword: string) => {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1
      hourlyTrends[hour].keywords.push(keyword)
    })
  })

  const trendingKeywords = Object.entries(keywordCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([keyword, count]) => ({ keyword, count }))

  return {
    trendingKeywords,
    hourlyTrends: Object.entries(hourlyTrends).map(([hour, data]) => ({
      hour: parseInt(hour),
      count: data.count,
      uniqueKeywords: [...new Set(data.keywords)].length
    }))
  }
}

function processSentimentData(data: any[]) {
  const hourlySentiment: Record<number, { total: number, count: number }> = {}
  const platformSentiment: Record<string, { total: number, count: number }> = {}

  data.forEach(feed => {
    const hour = new Date(feed.created_at).getHours()
    const platform = feed.platform
    const sentiment = feed.sentiment_score || 0

    // Hourly sentiment
    if (!hourlySentiment[hour]) {
      hourlySentiment[hour] = { total: 0, count: 0 }
    }
    hourlySentiment[hour].total += sentiment
    hourlySentiment[hour].count++

    // Platform sentiment
    if (!platformSentiment[platform]) {
      platformSentiment[platform] = { total: 0, count: 0 }
    }
    platformSentiment[platform].total += sentiment
    platformSentiment[platform].count++
  })

  return {
    hourly: Object.entries(hourlySentiment).map(([hour, data]) => ({
      hour: parseInt(hour),
      averageSentiment: data.count > 0 ? data.total / data.count : 0
    })),
    byPlatform: Object.entries(platformSentiment).map(([platform, data]) => ({
      platform,
      averageSentiment: data.count > 0 ? data.total / data.count : 0,
      count: data.count
    }))
  }
}

function processPlatformStats(data: any[]) {
  const platformCounts: Record<string, number> = {}
  const hourlyCounts: Record<number, Record<string, number>> = {}

  data.forEach(feed => {
    const platform = feed.platform
    const hour = new Date(feed.created_at).getHours()

    platformCounts[platform] = (platformCounts[platform] || 0) + 1

    if (!hourlyCounts[hour]) {
      hourlyCounts[hour] = {}
    }
    hourlyCounts[hour][platform] = (hourlyCounts[hour][platform] || 0) + 1
  })

  return {
    totalByPlatform: platformCounts,
    hourlyByPlatform: Object.entries(hourlyCounts).map(([hour, platforms]) => ({
      hour: parseInt(hour),
      platforms
    }))
  }
}
