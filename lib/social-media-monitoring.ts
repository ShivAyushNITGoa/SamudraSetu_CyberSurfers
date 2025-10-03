// Social Media Monitoring Service for SamudraSetu
import { supabase } from './supabase'
import { SocialMediaConfig } from './enhanced-database'

export class SocialMediaMonitoringService {
  private configs: SocialMediaConfig[] = []
  private isRunning = false

  constructor() {
    this.loadConfigurations()
  }

  private async loadConfigurations(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('social_media_feeds')
        .select('*')
        .eq('is_active', true)

      if (error) throw error
      this.configs = data || []
      console.log(`📱 Loaded ${this.configs.length} social media configurations`)
    } catch (error) {
      console.error('❌ Error loading social media configurations:', error)
    }
  }

  public async startMonitoring(): Promise<void> {
    if (this.isRunning) return
    this.isRunning = true
    console.log('🚀 Starting social media monitoring service...')

    for (const config of this.configs) {
      this.startPlatformMonitoring(config)
    }
  }

  public stopMonitoring(): void {
    this.isRunning = false
    console.log('🛑 Social media monitoring service stopped')
  }

  private startPlatformMonitoring(config: SocialMediaConfig): void {
    const intervalMs = config.update_frequency_minutes * 60 * 1000

    setInterval(async () => {
      try {
        await this.monitorPlatform(config)
    } catch (error) {
        console.error(`❌ Error monitoring ${config.platform}:`, error)
      }
    }, intervalMs)

    this.monitorPlatform(config)
  }

  private async monitorPlatform(config: SocialMediaConfig): Promise<void> {
    console.log(`🔍 Monitoring ${config.platform}...`)

    switch (config.platform) {
      case 'twitter':
        await this.monitorTwitter(config)
        break
      case 'youtube':
        await this.monitorYouTube(config)
        break
      case 'news_rss':
        await this.monitorNewsRSS(config)
        break
      default:
        console.warn(`⚠️ Unsupported platform: ${config.platform}`)
    }
  }

  private async monitorTwitter(config: SocialMediaConfig): Promise<void> {
    try {
      const { bearer_token } = config.api_credentials
      if (!bearer_token) throw new Error('Twitter Bearer Token not configured')

      const query = this.buildTwitterQuery(config)
      const response = await fetch(
        `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=100&tweet.fields=created_at,author_id,geo`,
        {
          headers: {
            'Authorization': `Bearer ${bearer_token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) throw new Error(`Twitter API error: ${response.status}`)

      const data = await response.json()
      const tweets = data.data || []

      for (const tweet of tweets) {
        await this.processSocialMediaPost({
            platform: 'twitter',
            post_id: tweet.id,
          content: tweet.text,
            author: tweet.author_id,
          created_at: tweet.created_at
        }, config)
      }

      console.log(`📊 Processed ${tweets.length} tweets from Twitter`)
    } catch (error) {
      console.error('❌ Twitter monitoring error:', error)
    }
  }

  private async monitorYouTube(config: SocialMediaConfig): Promise<void> {
    try {
      const { api_key } = config.api_credentials
      if (!api_key) throw new Error('YouTube API Key not configured')

      for (const keyword of config.keywords) {
        const searchQuery = `${keyword} ocean hazard coastal flood`
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=20&key=${api_key}`
        )

        if (!response.ok) continue

        const data = await response.json()
        const videos = data.items || []

        for (const video of videos) {
          await this.processSocialMediaPost({
            platform: 'youtube',
            post_id: video.id.videoId,
            content: `${video.snippet.title} - ${video.snippet.description}`,
            author: video.snippet.channelTitle,
            created_at: video.snippet.publishedAt
          }, config)
        }
      }
    } catch (error) {
      console.error('❌ YouTube monitoring error:', error)
    }
  }

  private async monitorNewsRSS(config: SocialMediaConfig): Promise<void> {
    try {
      const { rss_feeds } = config.api_credentials
      if (!rss_feeds) return

      for (const feedUrl of rss_feeds) {
        try {
          const response = await fetch(feedUrl)
          if (!response.ok) continue

          const xmlText = await response.text()
          const items = this.parseRSSFeed(xmlText)

          for (const item of items) {
            if (this.containsHazardKeywords(`${item.title} ${item.description}`, config.keywords)) {
              await this.processSocialMediaPost({
                platform: 'news_rss',
                post_id: `rss_${item.guid || item.link}`,
                content: `${item.title} - ${item.description}`,
                author: item.author || 'News Source',
                created_at: item.pubDate || new Date().toISOString()
              }, config)
            }
          }
        } catch (feedError) {
          console.error(`❌ Error processing RSS feed ${feedUrl}:`, feedError)
        }
      }
    } catch (error) {
      console.error('❌ News RSS monitoring error:', error)
    }
  }

  private async processSocialMediaPost(post: any, config: SocialMediaConfig): Promise<void> {
    try {
      const { data: existing } = await supabase
        .from('social_media_feeds')
        .select('id')
        .eq('platform', post.platform)
        .eq('post_id', post.post_id)
        .single()

      if (existing) return

      const hazardKeywords = this.extractHazardKeywords(post.content, config.keywords)
      const relevanceScore = this.calculateRelevanceScore(post.content, config.keywords)

      const { error } = await supabase
        .from('social_media_feeds')
        .insert({
          platform: post.platform,
          post_id: post.post_id,
          content: post.content,
          author: post.author,
          hazard_keywords: hazardKeywords,
          relevance_score: relevanceScore,
          language: this.detectLanguage(post.content)
        })

      if (error) throw error

      console.log(`✅ Processed ${post.platform} post: ${post.post_id}`)
    } catch (error) {
      console.error('❌ Error processing social media post:', error)
    }
  }

  private buildTwitterQuery(config: SocialMediaConfig): string {
    const keywords = config.keywords.map(k => `"${k}"`).join(' OR ')
    const languages = config.languages.map(l => `lang:${l}`).join(' OR ')
    return `(${keywords}) (${languages}) -is:retweet -is:reply`
  }

  private containsHazardKeywords(text: string, keywords: string[]): boolean {
    const lowerText = text.toLowerCase()
    return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()))
  }

  private extractHazardKeywords(text: string, keywords: string[]): string[] {
    const lowerText = text.toLowerCase()
    return keywords.filter(keyword => lowerText.includes(keyword.toLowerCase()))
  }

  private calculateRelevanceScore(text: string, keywords: string[]): number {
    const foundKeywords = this.extractHazardKeywords(text, keywords)
    return Math.min(foundKeywords.length / keywords.length, 1.0)
  }

  private detectLanguage(text: string): string {
    const hindiRegex = /[\u0900-\u097F]/
    const tamilRegex = /[\u0B80-\u0BFF]/
    const bengaliRegex = /[\u0980-\u09FF]/
    
    if (hindiRegex.test(text)) return 'hi'
    if (tamilRegex.test(text)) return 'ta'
    if (bengaliRegex.test(text)) return 'bn'
    return 'en'
  }

  private parseRSSFeed(xmlText: string): any[] {
    const items: any[] = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match

    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemXml = match[1]
      const title = this.extractXmlValue(itemXml, 'title')
      const description = this.extractXmlValue(itemXml, 'description')
      const link = this.extractXmlValue(itemXml, 'link')
      const guid = this.extractXmlValue(itemXml, 'guid')
      const pubDate = this.extractXmlValue(itemXml, 'pubDate')
      const author = this.extractXmlValue(itemXml, 'author')

      if (title) {
        items.push({ title, description, link, guid, pubDate, author })
      }
    }

    return items
  }

  private extractXmlValue(xml: string, tag: string): string | null {
    const regex = new RegExp(`<${tag}>(.*?)<\/${tag}>`, 'i')
    const match = xml.match(regex)
    return match ? match[1].trim() : null
  }
}

export const socialMediaMonitoring = new SocialMediaMonitoringService()