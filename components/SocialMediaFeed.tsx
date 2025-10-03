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
  RefreshCw
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
  location?: {
    latitude: number
    longitude: number
  }
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

export default function SocialMediaFeed() {
  const [posts, setPosts] = useState<SocialMediaPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all')
  const [minRelevance, setMinRelevance] = useState<number>(0.3)

  const fetchSocialMediaPosts = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('social_media_feeds')
        .select('*')
        .gte('relevance_score', minRelevance)
        .order('created_at', { ascending: false })
        .limit(20)

      if (selectedPlatform !== 'all') {
        query = query.eq('platform', selectedPlatform)
      }
      if (selectedLanguage !== 'all') {
        query = query.eq('language', selectedLanguage)
      }

      const { data, error } = await query

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching social media posts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSocialMediaPosts()
  }, [selectedPlatform, selectedLanguage, minRelevance])

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('social_media_feeds')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'social_media_feeds'
      }, (payload) => {
        console.log('New social media post:', payload)
        fetchSocialMediaPosts()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

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

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Social Media Feed
        </h3>
        <button
          onClick={fetchSocialMediaPosts}
          className="p-1 text-gray-400 hover:text-gray-600"
          title="Refresh Feed"
          aria-label="Refresh Feed"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Platform
          </label>
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Platform"
            title="Platform"
          >
            {platforms.map((platform) => (
              <option key={platform.value} value={platform.value}>
                {platform.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Language
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Language"
            title="Language"
          >
            {languages.map((language) => (
              <option key={language.value} value={language.value}>
                {language.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            <span id="min-relevance-label" className="block text-xs font-medium text-gray-700 mb-1">
              Min Relevance: {minRelevance}
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            aria-labelledby="min-relevance-label"
            title="Minimum Relevance"
            value={minRelevance}
            onChange={(e) => setMinRelevance(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-4">
            <MessageCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No social media posts found</p>
          </div>
        ) : (
          posts.map((post) => {
            const PlatformIcon = platformIcons[post.platform]
            const platformColor = platformColors[post.platform]

            return (
              <div
                key={post.id}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-1 rounded ${platformColor}`}>
                    <PlatformIcon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium text-gray-900">
                          {post.author || 'Unknown'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(post.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className={`text-xs ${getSentimentColor(post.sentiment_score)}`}>
                          {getSentimentLabel(post.sentiment_score)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {(post.relevance_score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-800 mb-2 line-clamp-2">
                      {post.content}
                    </p>
                    
                    {post.hazard_keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {post.hazard_keywords.slice(0, 3).map((keyword, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                          >
                            {keyword}
                          </span>
                        ))}
                        {post.hazard_keywords.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            +{post.hazard_keywords.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="uppercase">{post.platform}</span>
                      <div className="flex items-center space-x-2">
                        <span className="flex items-center">
                          <Heart className="h-3 w-3 mr-1" />
                          {Math.floor(Math.random() * 100)}
                        </span>
                        <span className="flex items-center">
                          <Share2 className="h-3 w-3 mr-1" />
                          {Math.floor(Math.random() * 50)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {posts.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Showing {posts.length} of {posts.length} posts
          </p>
        </div>
      )}
    </div>
  )
}
