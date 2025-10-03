/**
 * Social Media Processor for SamudraSetu
 * Handles real-time social media monitoring and NLP processing
 */

import { createClient } from '@supabase/supabase-js';

// Types for social media processing
export interface SocialMediaPost {
  id: string;
  platform: 'twitter' | 'youtube' | 'facebook' | 'instagram';
  post_id: string;
  content: string;
  author: string;
  location?: {
    lat: number;
    lng: number;
  };
  sentiment_score: number;
  hazard_keywords: string[];
  relevance_score: number;
  language: string;
  verified: boolean;
  verification_notes?: string;
  verified_at?: string;
  created_at: string;
  processed_at: string;
}

export interface HazardAnalysis {
  hazard_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  keywords: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  location_confidence: number;
}

export interface SocialMediaConfig {
  twitter: {
    bearer_token: string;
    keywords: string[];
    languages: string[];
  };
  youtube: {
    api_key: string;
    keywords: string[];
    channels: string[];
  };
  facebook: {
    access_token: string;
    pages: string[];
    keywords: string[];
  };
}

class SocialMediaProcessor {
  private supabase: any;
  private config: SocialMediaConfig;

  constructor(supabaseUrl: string, supabaseKey: string, config: SocialMediaConfig) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.config = config;
  }

  /**
   * Process incoming social media posts with NLP
   */
  async processPost(post: Partial<SocialMediaPost>): Promise<SocialMediaPost | null> {
    try {
      // Analyze content for hazard relevance
      const analysis = await this.analyzeHazardContent(post.content || '');
      
      if (analysis.confidence < 0.3) {
        return null; // Not relevant enough
      }

      // Extract location if available
      const location = await this.extractLocation(post.content || '', post.location);

      // Determine hazard type and severity
      const hazardType = this.determineHazardType(analysis.keywords);
      const severity = this.determineSeverity(analysis.confidence, analysis.sentiment);

      const processedPost: SocialMediaPost = {
        id: post.id || crypto.randomUUID(),
        platform: post.platform || 'twitter',
        post_id: post.post_id || '',
        content: post.content || '',
        author: post.author || 'unknown',
        location: location,
        sentiment_score: this.getSentimentScore(analysis.sentiment),
        hazard_keywords: analysis.keywords,
        relevance_score: analysis.confidence,
        language: this.detectLanguage(post.content || ''),
        verified: false,
        created_at: post.created_at || new Date().toISOString(),
        processed_at: new Date().toISOString(),
      };

      // Save to database
      await this.saveToDatabase(processedPost);

      return processedPost;
    } catch (error) {
      console.error('Error processing social media post:', error);
      return null;
    }
  }

  /**
   * Analyze content for hazard-related information using Gemini AI
   */
  private async analyzeHazardContent(content: string): Promise<HazardAnalysis> {
    // Try Gemini AI first
    try {
      const { geminiAI } = await import('./gemini-ai');
      if (geminiAI.isServiceAvailable()) {
        const geminiAnalysis = await geminiAI.analyzeSocialMediaContent(content);
        return {
          hazard_type: geminiAnalysis.hazard_classification.hazard_type as any,
          severity: geminiAnalysis.hazard_classification.severity,
          confidence: geminiAnalysis.hazard_classification.confidence,
          keywords: geminiAnalysis.hazard_classification.keywords,
          sentiment: geminiAnalysis.hazard_classification.sentiment,
          location_confidence: geminiAnalysis.hazard_classification.location_confidence
        };
      }
    } catch (error) {
      console.warn('Gemini AI not available for social media analysis, using fallback:', error);
    }

    // Fallback to original analysis
    return this.analyzeHazardContentFallback(content);
  }

  /**
   * Fallback hazard content analysis using pattern matching
   */
  private async analyzeHazardContentFallback(content: string): Promise<HazardAnalysis> {
    const hazardKeywords = [
      // Tsunami related
      'tsunami', 'tidal wave', 'seismic wave', 'earthquake', 'undersea',
      // Storm surge
      'storm surge', 'cyclone', 'hurricane', 'typhoon', 'high waves', 'rough seas',
      // Flooding
      'flood', 'flooding', 'inundation', 'water level', 'rising water',
      // Coastal erosion
      'erosion', 'beach erosion', 'coastal erosion', 'shoreline', 'coastline',
      // Marine pollution
      'oil spill', 'marine pollution', 'water pollution', 'contamination',
      // Unusual tides
      'high tide', 'low tide', 'unusual tide', 'tide level', 'tidal',
      // Weather anomalies
      'extreme weather', 'severe weather', 'weather warning', 'storm warning',
      // Hindi keywords
      'सुनामी', 'बाढ़', 'तूफान', 'समुद्री प्रदूषण', 'अनोखा ज्वार',
      // Tamil keywords
      'சுனாமி', 'வெள்ளம்', 'புயல்', 'கடல் மாசுபாடு',
      // Bengali keywords
      'সুনামি', 'বন্যা', 'ঝড়', 'সমুদ্র দূষণ'
    ];

    const contentLower = content.toLowerCase();
    const foundKeywords: string[] = [];
    let relevanceScore = 0;

    // Check for hazard keywords
    hazardKeywords.forEach(keyword => {
      if (contentLower.includes(keyword.toLowerCase())) {
        foundKeywords.push(keyword);
        relevanceScore += 0.1;
      }
    });

    // Check for urgency indicators
    const urgencyWords = ['urgent', 'emergency', 'danger', 'warning', 'alert', 'critical', 'immediate'];
    urgencyWords.forEach(word => {
      if (contentLower.includes(word)) {
        relevanceScore += 0.05;
      }
    });

    // Check for location indicators
    const locationWords = ['coast', 'beach', 'shore', 'harbor', 'port', 'bay', 'creek'];
    let locationConfidence = 0;
    locationWords.forEach(word => {
      if (contentLower.includes(word)) {
        locationConfidence += 0.1;
      }
    });

    // Determine sentiment
    const positiveWords = ['safe', 'normal', 'calm', 'peaceful', 'good'];
    const negativeWords = ['dangerous', 'scary', 'worried', 'afraid', 'terrible', 'disaster'];
    
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    let sentimentScore = 0;

    positiveWords.forEach(word => {
      if (contentLower.includes(word)) {
        sentimentScore += 0.1;
      }
    });

    negativeWords.forEach(word => {
      if (contentLower.includes(word)) {
        sentimentScore -= 0.1;
      }
    });

    if (sentimentScore > 0.1) sentiment = 'positive';
    else if (sentimentScore < -0.1) sentiment = 'negative';

    return {
      hazard_type: this.determineHazardType(foundKeywords),
      severity: this.determineSeverity(relevanceScore, sentiment),
      confidence: Math.min(relevanceScore, 1.0),
      keywords: foundKeywords,
      sentiment,
      location_confidence: Math.min(locationConfidence, 1.0)
    };
  }

  /**
   * Determine hazard type from keywords
   */
  private determineHazardType(keywords: string[]): string {
    const keywordMap: { [key: string]: string } = {
      'tsunami': 'tsunami',
      'tidal wave': 'tsunami',
      'seismic wave': 'tsunami',
      'storm surge': 'storm_surge',
      'cyclone': 'storm_surge',
      'hurricane': 'storm_surge',
      'flood': 'flooding',
      'flooding': 'flooding',
      'erosion': 'erosion',
      'beach erosion': 'erosion',
      'oil spill': 'marine_pollution',
      'marine pollution': 'marine_pollution',
      'high tide': 'unusual_tides',
      'unusual tide': 'unusual_tides'
    };

    for (const keyword of keywords) {
      if (keywordMap[keyword.toLowerCase()]) {
        return keywordMap[keyword.toLowerCase()];
      }
    }

    return 'other';
  }

  /**
   * Determine severity based on confidence and sentiment
   */
  private determineSeverity(confidence: number, sentiment: string): 'low' | 'medium' | 'high' | 'critical' {
    if (confidence >= 0.8 && sentiment === 'negative') return 'critical';
    if (confidence >= 0.6) return 'high';
    if (confidence >= 0.4) return 'medium';
    return 'low';
  }

  /**
   * Extract location from content or use provided location
   */
  private async extractLocation(content: string, providedLocation?: any): Promise<any> {
    if (providedLocation) {
      return providedLocation;
    }

    // Simple location extraction from text
    const locationPatterns = [
      /(?:near|at|in|on)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:beach|coast|shore|harbor|port)/g
    ];

    for (const pattern of locationPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        // In a real implementation, you would geocode these location names
        return null; // Placeholder
      }
    }

    return null;
  }

  /**
   * Detect language of content
   */
  private detectLanguage(content: string): string {
    // Simple language detection based on character sets
    if (/[\u0900-\u097F]/.test(content)) return 'hi'; // Hindi
    if (/[\u0B80-\u0BFF]/.test(content)) return 'ta'; // Tamil
    if (/[\u0980-\u09FF]/.test(content)) return 'bn'; // Bengali
    return 'en'; // Default to English
  }

  /**
   * Get sentiment score (-1 to 1)
   */
  private getSentimentScore(sentiment: string): number {
    switch (sentiment) {
      case 'positive': return 0.5;
      case 'negative': return -0.5;
      default: return 0;
    }
  }

  /**
   * Save processed post to database
   */
  private async saveToDatabase(post: SocialMediaPost): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('social_media_feeds')
        .insert([post]);

      if (error) {
        console.error('Error saving social media post:', error);
      }
    } catch (error) {
      console.error('Database error:', error);
    }
  }

  /**
   * Fetch recent posts from Twitter API
   */
  async fetchTwitterPosts(): Promise<void> {
    try {
      const response = await fetch('https://api.twitter.com/2/tweets/search/recent', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.twitter.bearer_token}`,
          'Content-Type': 'application/json',
        },
        // Note: In a real implementation, you would add query parameters
      });

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Process each tweet
      for (const tweet of data.data || []) {
        await this.processPost({
          platform: 'twitter',
          post_id: tweet.id,
          content: tweet.text,
          author: tweet.author_id,
          created_at: tweet.created_at,
        });
      }
    } catch (error) {
      console.error('Error fetching Twitter posts:', error);
    }
  }

  /**
   * Fetch recent posts from YouTube API
   */
  async fetchYouTubePosts(): Promise<void> {
    try {
      // YouTube API implementation would go here
      // This is a placeholder for the actual implementation
      console.log('YouTube API integration pending');
    } catch (error) {
      console.error('Error fetching YouTube posts:', error);
    }
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring(): void {
    // Fetch Twitter posts every 5 minutes
    setInterval(() => {
      this.fetchTwitterPosts();
    }, 5 * 60 * 1000);

    // Fetch YouTube posts every 10 minutes
    setInterval(() => {
      this.fetchYouTubePosts();
    }, 10 * 60 * 1000);

    console.log('Social media monitoring started');
  }
}

export default SocialMediaProcessor;
