'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { 
  Twitter, 
  Youtube, 
  Facebook, 
  Instagram,
  TrendingUp,
  MessageCircle,
  Heart,
  Share2,
  ExternalLink,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Settings,
  Download,
  Upload,
  AlertTriangle,
  BarChart3,
  Activity
} from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface SocialMediaPost {
  id: string
  platform: 'twitter' | 'youtube' | 'facebook' | 'instagram'
  content: string
  author?: string
  sentiment_score?: number
  hazard_keywords: string[]
  relevance_score: number
  language: string
  created_at: string
  verified?: boolean
  verification_notes?: string
  verified_at?: string
  location?: {
    latitude: number
    longitude: number
  }
}

interface SocialAnalytics {
  total_posts: number
  verified_posts: number
  sentiment_distribution: {
    positive: number
    negative: number
    neutral: number
  }
  platform_distribution: Record<string, number>
  trending_keywords: Array<{ keyword: string; count: number }>
  hourly_activity: Array<{ hour: number; count: number }>
}

const platformIcons = {
  twitter: Twitter,
  youtube: Youtube,
  facebook: Facebook,
  instagram: Instagram
}

const platformColors = {
  twitter: 'text-blue-500',
  youtube: 'text-red-500',
  facebook: 'text-blue-600',
  instagram: 'text-pink-500'
}

export default function SocialMonitoring() {
  const [posts, setPosts] = useState<SocialMediaPost[]>([])
  const [analytics, setAnalytics] = useState<SocialAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all')
  const [minRelevance, setMinRelevance] = useState<number>(0.3)
  const [searchTerm, setSearchTerm] = useState('')
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false)
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [page, setPage] = useState(0)
  const pageSize = 30

  // Fetch social media posts
  const fetchPosts = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('v_social_with_nlp')
        .select('*')
        .gte('relevance_score', minRelevance)
        .order('created_at', { ascending: false })
        .range(page * pageSize, page * pageSize + pageSize - 1)

      if (selectedPlatform !== 'all') {
        query = query.eq('platform', selectedPlatform)
      }
      if (selectedLanguage !== 'all') {
        query = query.eq('language', selectedLanguage)
      }
      if (showVerifiedOnly) {
        query = query.eq('verified', true)
      }

      const { data, error } = await query

      if (error) throw error
      if (page === 0) setPosts(data || [])
      else setPosts(prev => [...prev, ...(data || [])])
    } catch (error) {
      console.error('Error fetching social media posts:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('v_social_with_nlp')
        .select('*')
        .gte('nlp_processed_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      if (error) throw error

      const totalPosts = data?.length || 0
      const verifiedPosts = data?.filter(p => p.verified).length || 0

      const sentimentDistribution = {
        positive: data?.filter(p => (p.nlp_sentiment_score || 0) > 0.2).length || 0,
        negative: data?.filter(p => (p.nlp_sentiment_score || 0) < -0.2).length || 0,
        neutral: data?.filter(p => Math.abs(p.nlp_sentiment_score || 0) <= 0.2).length || 0
      }

      const platformDistribution = data?.reduce((acc: any, post: any) => {
        acc[post.platform] = (acc[post.platform] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const keywordCounts: Record<string, number> = {}
      data?.forEach((post: any) => {
        (post.hazard_keywords || []).forEach((keyword: string) => {
          keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1
        })
      })
      const trendingKeywords = Object.entries(keywordCounts)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([keyword, count]) => ({ keyword, count }))

      const hourlyActivity: Record<number, number> = {}
      data?.forEach((post: any) => {
        const hour = new Date(post.created_at).getHours()
        hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1
      })
      const hourlyActivityArray = Object.entries(hourlyActivity)
        .map(([hour, count]) => ({ hour: parseInt(hour), count }))
        .sort((a, b) => a.hour - b.hour)

      setAnalytics({
        total_posts: totalPosts,
        verified_posts: verifiedPosts,
        sentiment_distribution: sentimentDistribution,
        platform_distribution: platformDistribution,
        trending_keywords: trendingKeywords,
        hourly_activity: hourlyActivityArray
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  useEffect(() => {
    setPage(0)
    ;(async () => { await fetchPosts() })()
    fetchAnalytics()
  }, [selectedPlatform, selectedLanguage, minRelevance, showVerifiedOnly])

  // Set up real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('social_media_feeds')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'social_media_feeds'
      }, (payload) => {
        console.log('Real-time social media update:', payload)
        fetchPosts()
        fetchAnalytics()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Verify post
  const verifyPost = async (postId: string, verified: boolean, notes?: string) => {
    try {
      // optimistic update
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? {
                ...p,
                verified,
                verification_notes: notes,
                verified_at: verified ? new Date().toISOString() : undefined
              }
            : p
        )
      )
      const { error } = await supabase
        .from('social_media_feeds')
        .update({
          verified: verified,
          verification_notes: notes,
          verified_at: verified ? new Date().toISOString() : null
        })
        .eq('id', postId)

      if (error) throw error
    } catch (error) {
      console.error('Error verifying post:', error)
      // revert on error
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, verified: !verified } : p))
    }
  }

  // Bulk verify posts
  const bulkVerifyPosts = async (verified: boolean) => {
    try {
      const { error } = await supabase
        .from('social_media_feeds')
        .update({
          verified: verified,
          verified_at: verified ? new Date().toISOString() : null
        })
        .in('id', selectedPosts)

      if (error) throw error
      setSelectedPosts([])
      fetchPosts()
    } catch (error) {
      console.error('Error bulk verifying posts:', error)
    }
  }

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchTerm === '' || 
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const platforms = [
    { value: 'all', label: 'All Platforms' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' }
  ]

  const languages = [
    { value: 'all', label: 'All Languages' },
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'Hindi' },
    { value: 'ta', label: 'Tamil' },
    { value: 'bn', label: 'Bengali' }
  ]

  const getSentimentColor = (score?: number) => {
    if (!score) return 'text-gray-500'
    if (score > 0.2) return 'text-green-600'
    if (score < -0.2) return 'text-red-600'
    return 'text-yellow-600'
  }

  const getSentimentLabel = (score?: number) => {
    if (!score) return 'Neutral'
    if (score > 0.2) return 'Positive'
    if (score < -0.2) return 'Negative'
    return 'Neutral'
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading social media monitoring...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Social Media Monitoring</h1>
              <p className="text-gray-600">Monitor and verify social media posts for ocean hazards</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  fetchPosts()
                  fetchAnalytics()
                }}
                className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Posts</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.total_posts}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Verified Posts</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.verified_posts}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Positive Sentiment</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.sentiment_distribution.positive}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Negative Sentiment</p>
                  <p className="text-3xl font-bold text-gray-900">{analytics.sentiment_distribution.negative}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Filters */}
              <div className="p-6 border-b">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <label className="sr-only" htmlFor="platform-select">
                      Platform
                    </label>
                    <select
                      id="platform-select"
                      value={selectedPlatform}
                      onChange={(e) => setSelectedPlatform(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {platforms.map((platform) => (
                        <option key={platform.value} value={platform.value}>
                          {platform.label}
                        </option>
                      ))}
                    </select>
                    <label className="sr-only" htmlFor="language-select">
                      Language
                    </label>
                    <select
                      id="language-select"
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {languages.map((language) => (
                        <option key={language.value} value={language.value}>
                          {language.label}
                        </option>
                      ))}
                    </select>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={showVerifiedOnly}
                        onChange={(e) => setShowVerifiedOnly(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Verified only</span>
                    </label>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label className="text-sm text-gray-700">
                      <span id="min-relevance-label" className="text-sm text-gray-700">
                        Min Relevance: {minRelevance}
                      </span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      aria-labelledby="min-relevance-label"
                      title="Minimum relevance"
                      value={minRelevance}
                      onChange={(e) => setMinRelevance(parseFloat(e.target.value))}
                      className="w-32"
                    />
                  </div>
                  {selectedPosts.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => bulkVerifyPosts(true)}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                      >
                        Verify Selected
                      </button>
                      <button
                        onClick={() => bulkVerifyPosts(false)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                      >
                        Reject Selected
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Posts List */}
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading posts...</p>
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No posts found</p>
                  </div>
                ) : (
                  filteredPosts.map((post) => {
                    const PlatformIcon = platformIcons[post.platform]
                    const platformColor = platformColors[post.platform]

                    return (
                      <div
                        key={post.id}
                        className="p-6 border-b border-gray-200 hover:bg-gray-50"
                      >
                        <div className="flex items-start space-x-4">
                          <label className="sr-only" htmlFor={`select-post-${post.id}`}>
                            Select post
                          </label>
                          <input
                            id={`select-post-${post.id}`}
                            type="checkbox"
                            checked={selectedPosts.includes(post.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPosts([...selectedPosts, post.id])
                              } else {
                                setSelectedPosts(selectedPosts.filter(id => id !== post.id))
                              }
                            }}
                            className="mt-1"
                          />
                          
                          <div className={`p-2 rounded ${platformColor}`}>
                            <PlatformIcon className="h-5 w-5" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-3">
                                <span className="text-sm font-medium text-gray-900">
                                  {post.author || 'Unknown'}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {formatTimeAgo(post.created_at)}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  post.verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {post.verified ? 'Verified' : 'Unverified'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`text-xs ${getSentimentColor((post as any).nlp_sentiment_score ?? post.sentiment_score)}`}>
                                  {getSentimentLabel((post as any).nlp_sentiment_score ?? post.sentiment_score)}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {(post.relevance_score * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-800 mb-3">{post.content}</p>
                            
                            {post.hazard_keywords.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {post.hazard_keywords.slice(0, 5).map((keyword, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                  >
                                    {keyword}
                                  </span>
                                ))}
                                {post.hazard_keywords.length > 5 && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                    +{post.hazard_keywords.length - 5} more
                                  </span>
                                )}
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span className="uppercase">{post.platform}</span>
                                <span>{post.language}</span>
                                {post.location && (
                                  <span>📍 {post.location.latitude.toFixed(2)}, {post.location.longitude.toFixed(2)}</span>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                {!post.verified ? (
                                  <>
                                    <button
                                      onClick={() => verifyPost(post.id, true)}
                                      className="p-1 text-green-600 hover:text-green-800"
                                      title="Verify"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => verifyPost(post.id, false)}
                                      className="p-1 text-red-600 hover:text-red-800"
                                      title="Reject"
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => verifyPost(post.id, false)}
                                    className="p-1 text-gray-400 hover:text-gray-600"
                                    title="Unverify"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                )}
                                <button className="p-1 text-blue-600 hover:text-blue-800" title="View Details">
                                  <Eye className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
              <div className="p-4 flex justify-center">
                <button
                  onClick={() => { setPage(prev => prev + 1); fetchPosts() }}
                  className="px-4 py-2 bg-gray-100 rounded text-sm hover:bg-gray-200"
                  disabled={loading}
                >
                  {loading ? 'Loading…' : 'Load More'}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Keywords */}
            {analytics && (
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Trending Keywords</h3>
                <div className="space-y-2">
                  {analytics.trending_keywords.slice(0, 10).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">{item.keyword}</span>
                      <span className="text-xs text-gray-500">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Platform Distribution */}
            {analytics && (
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Distribution</h3>
                <div className="space-y-2">
                  {Object.entries(analytics.platform_distribution).map(([platform, count]) => (
                    <div key={platform} className="flex items-center justify-between">
                      <span className="text-sm text-gray-900 capitalize">{platform}</span>
                      <span className="text-xs text-gray-500">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sentiment Distribution */}
            {analytics && (
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Analysis</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600">Positive</span>
                    <span className="text-sm font-medium">{analytics.sentiment_distribution.positive}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-yellow-600">Neutral</span>
                    <span className="text-sm font-medium">{analytics.sentiment_distribution.neutral}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-600">Negative</span>
                    <span className="text-sm font-medium">{analytics.sentiment_distribution.negative}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
