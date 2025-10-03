/**
 * Gemini AI Service for SamudraSetu
 * Leverages Google's Gemini models for advanced AI-powered ocean hazard analysis
 */

import { GoogleGenerativeAI, GenerativeModel, Content, Part } from '@google/generative-ai';

// Types for AI analysis
export interface HazardAnalysis {
  hazard_type: 'tsunami' | 'storm_surge' | 'flooding' | 'erosion' | 'marine_pollution' | 'unusual_tides' | 'weather_anomaly' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  keywords: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  location_confidence: number;
  urgency_indicators: string[];
  recommended_actions: string[];
  risk_assessment: string;
}

export interface SocialMediaAnalysis {
  relevance_score: number;
  hazard_classification: HazardAnalysis;
  language_detected: string;
  location_extracted?: {
    lat: number;
    lng: number;
    place_name: string;
    confidence: number;
  };
  verification_status: 'verified' | 'unverified' | 'false_positive';
  verification_notes?: string;
}

export interface ReportAnalysis {
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  confidence: number;
  keywords: string[];
  reasoning: string;
  suggested_actions: string[];
  risk_factors: string[];
  similar_incidents?: string[];
}

export interface BatchAnalysisResult {
  total_processed: number;
  high_priority_count: number;
  critical_alerts: number;
  summary: string;
  recommendations: string[];
  trend_analysis: string;
}

class GeminiAIService {
  private genAI: GoogleGenerativeAI;
  private geminiFlash: GenerativeModel;
  private geminiPro: GenerativeModel;
  private isEnabled: boolean;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    this.isEnabled = !!apiKey && process.env.ENABLE_GEMINI_AI === 'true';
    
    if (this.isEnabled && apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      // Prefer stable, generally available models
      // Fast path
      this.geminiFlash = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      // Reasoning/longer responses
      this.geminiPro = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    }
  }

  /**
   * Safely parse JSON returned by LLMs (handles fenced code blocks and trailing text)
   */
  private parseModelJson<T = any>(text: string): T {
    if (!text) throw new Error('Empty model response');
    const trimmed = text.trim();
    // Extract from ```json ... ``` or ``` ... ``` if present
    const fenceMatch = trimmed.match(/```(?:json)?\n([\s\S]*?)\n```/i);
    const candidate = fenceMatch ? fenceMatch[1] : trimmed;
    // Attempt to locate first and last brace for a valid JSON object
    const firstBrace = candidate.indexOf('{');
    const lastBrace = candidate.lastIndexOf('}');
    const jsonSlice = firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace
      ? candidate.slice(firstBrace, lastBrace + 1)
      : candidate;
    return JSON.parse(jsonSlice) as T;
  }

  /**
   * Analyze social media content for ocean hazard relevance using Gemini Flash
   */
  async analyzeSocialMediaContent(content: string, metadata?: any): Promise<SocialMediaAnalysis> {
    if (!this.isEnabled) {
      return this.getFallbackAnalysis(content);
    }

    try {
      const prompt = `
Analyze this social media post for ocean hazard relevance and provide a comprehensive assessment.

Post Content: "${content}"
${metadata ? `Additional Metadata: ${JSON.stringify(metadata)}` : ''}

Please analyze and return a JSON response with the following structure:
{
  "relevance_score": number (0-1),
  "hazard_classification": {
    "hazard_type": "tsunami" | "storm_surge" | "flooding" | "erosion" | "marine_pollution" | "unusual_tides" | "weather_anomaly" | "other",
    "severity": "low" | "medium" | "high" | "critical",
    "confidence": number (0-1),
    "keywords": string[],
    "sentiment": "positive" | "negative" | "neutral",
    "location_confidence": number (0-1),
    "urgency_indicators": string[],
    "recommended_actions": string[],
    "risk_assessment": string
  },
  "language_detected": string (ISO code),
  "location_extracted": {
    "lat": number,
    "lng": number,
    "place_name": string,
    "confidence": number
  } | null,
  "verification_status": "verified" | "unverified" | "false_positive",
  "verification_notes": string
}

Focus on:
1. Ocean hazard keywords in multiple languages (English, Hindi, Tamil, Bengali)
2. Urgency indicators and emergency language
3. Location references (coastal areas, beaches, harbors, etc.)
4. Sentiment analysis for public safety concerns
5. Verification likelihood based on content quality

Return only valid JSON, no additional text.
      `;

      const result = await this.geminiFlash.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return this.parseModelJson<SocialMediaAnalysis>(text);
    } catch (error) {
      console.error('Gemini AI analysis error:', error);
      return this.getFallbackAnalysis(content);
    }
  }

  /**
   * Analyze citizen reports using Gemini Pro for complex reasoning
   */
  async analyzeCitizenReport(title: string, description: string, location?: any): Promise<ReportAnalysis> {
    if (!this.isEnabled) {
      return this.getFallbackReportAnalysis(title, description);
    }

    try {
      const prompt = `
Analyze this citizen report about ocean hazards and provide comprehensive insights.

Title: "${title}"
Description: "${description}"
${location ? `Location: ${JSON.stringify(location)}` : ''}

Please analyze and return a JSON response with the following structure:
{
  "category": string,
  "priority": "low" | "medium" | "high" | "urgent",
  "confidence": number (0-1),
  "keywords": string[],
  "reasoning": string,
  "suggested_actions": string[],
  "risk_factors": string[],
  "similar_incidents": string[]
}

Consider:
1. Hazard type classification (tsunami, storm surge, flooding, erosion, pollution, etc.)
2. Severity assessment based on urgency indicators
3. Location-based risk factors
4. Historical context and similar incidents
5. Recommended response actions
6. Risk assessment for public safety

Return only valid JSON, no additional text.
      `;

      const result = await this.geminiPro.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return this.parseModelJson<ReportAnalysis>(text);
    } catch (error) {
      console.error('Gemini AI report analysis error:', error);
      return this.getFallbackReportAnalysis(title, description);
    }
  }

  /**
   * Batch analyze multiple reports for trend analysis
   */
  async batchAnalyzeReports(reports: Array<{title: string, description: string, location?: any}>): Promise<BatchAnalysisResult> {
    if (!this.isEnabled) {
      return this.getFallbackBatchAnalysis(reports);
    }

    try {
      const reportsText = reports.map((report, index) => 
        `Report ${index + 1}: "${report.title}" - ${report.description}`
      ).join('\n\n');

      const prompt = `
Analyze these multiple ocean hazard reports and provide comprehensive batch analysis.

Reports:
${reportsText}

Please analyze and return a JSON response with the following structure:
{
  "total_processed": number,
  "high_priority_count": number,
  "critical_alerts": number,
  "summary": string,
  "recommendations": string[],
  "trend_analysis": string
}

Focus on:
1. Overall pattern recognition across reports
2. Geographic clustering of incidents
3. Temporal trends and urgency patterns
4. Resource allocation recommendations
5. Early warning indicators
6. Cross-validation of similar reports

Return only valid JSON, no additional text.
      `;

      const result = await this.geminiPro.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return this.parseModelJson<BatchAnalysisResult>(text);
    } catch (error) {
      console.error('Gemini AI batch analysis error:', error);
      return this.getFallbackBatchAnalysis(reports);
    }
  }

  /**
   * Analyze images for hazard detection (multimodal capability)
   */
  async analyzeHazardImage(imageData: string, description?: string): Promise<{
    hazard_detected: boolean;
    hazard_type?: string;
    severity?: string;
    confidence: number;
    description: string;
    recommended_actions: string[];
  }> {
    if (!this.isEnabled) {
      return {
        hazard_detected: false,
        confidence: 0,
        description: 'Image analysis not available',
        recommended_actions: []
      };
    }

    try {
      const prompt = `
Analyze this image for ocean hazard indicators. Look for:
- Tsunami damage or unusual wave patterns
- Storm surge effects
- Coastal flooding
- Erosion patterns
- Marine pollution
- Unusual tidal conditions
- Weather anomalies

${description ? `Image description: ${description}` : ''}

Return JSON with:
{
  "hazard_detected": boolean,
  "hazard_type": string | null,
  "severity": "low" | "medium" | "high" | "critical" | null,
  "confidence": number (0-1),
  "description": string,
  "recommended_actions": string[]
}
      `;

      const imagePart: Part = {
        inlineData: {
          data: imageData,
          mimeType: 'image/jpeg'
        }
      };

      const result = await this.geminiFlash.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();
      return this.parseModelJson(text);
    } catch (error) {
      console.error('Gemini AI image analysis error:', error);
      return {
        hazard_detected: false,
        confidence: 0,
        description: 'Image analysis failed',
        recommended_actions: []
      };
    }
  }

  /**
   * Generate hazard prediction based on current data
   */
  async generateHazardPrediction(currentData: any): Promise<{
    prediction: string;
    confidence: number;
    time_horizon: string;
    affected_areas: string[];
    recommended_preparations: string[];
  }> {
    if (!this.isEnabled) {
      return {
        prediction: 'Prediction service not available',
        confidence: 0,
        time_horizon: 'unknown',
        affected_areas: [],
        recommended_preparations: []
      };
    }

    try {
      const prompt = `
Based on the current ocean hazard data, provide a predictive analysis.

Current Data: ${JSON.stringify(currentData)}

Return JSON with:
{
  "prediction": string,
  "confidence": number (0-1),
  "time_horizon": string,
  "affected_areas": string[],
  "recommended_preparations": string[]
}

Consider:
1. Historical patterns
2. Current weather conditions
3. Oceanographic data
4. Social media sentiment
5. Citizen report patterns
6. Official warnings
      `;

      const result = await this.geminiPro.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return this.parseModelJson(text);
    } catch (error) {
      console.error('Gemini AI prediction error:', error);
      return {
        prediction: 'Prediction failed',
        confidence: 0,
        time_horizon: 'unknown',
        affected_areas: [],
        recommended_preparations: []
      };
    }
  }

  /**
   * Generate multilingual alerts and notifications
   */
  async generateMultilingualAlert(alertData: any, languages: string[] = ['en', 'hi', 'ta', 'bn']): Promise<{
    [language: string]: {
      title: string;
      message: string;
      instructions: string[];
    }
  }> {
    if (!this.isEnabled) {
      return {
        en: {
          title: 'Ocean Hazard Alert',
          message: 'Alert generation not available',
          instructions: ['Stay informed', 'Follow official guidance']
        }
      };
    }

    try {
      const prompt = `
Generate multilingual ocean hazard alerts for the following data:

Alert Data: ${JSON.stringify(alertData)}
Languages: ${languages.join(', ')}

Return JSON with translations for each language:
{
  "en": {"title": string, "message": string, "instructions": string[]},
  "hi": {"title": string, "message": string, "instructions": string[]},
  "ta": {"title": string, "message": string, "instructions": string[]},
  "bn": {"title": string, "message": string, "instructions": string[]}
}

Make alerts:
1. Clear and actionable
2. Culturally appropriate
3. Include specific safety instructions
4. Use appropriate urgency level
      `;

      const result = await this.geminiFlash.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return this.parseModelJson(text);
    } catch (error) {
      console.error('Gemini AI multilingual alert error:', error);
      return {
        en: {
          title: 'Ocean Hazard Alert',
          message: 'Alert generation failed',
          instructions: ['Stay informed', 'Follow official guidance']
        }
      };
    }
  }

  // Fallback methods when Gemini AI is not available
  private getFallbackAnalysis(content: string): SocialMediaAnalysis {
    return {
      relevance_score: 0.3,
      hazard_classification: {
        hazard_type: 'other',
        severity: 'low',
        confidence: 0.3,
        keywords: [],
        sentiment: 'neutral',
        location_confidence: 0,
        urgency_indicators: [],
        recommended_actions: ['Manual review required'],
        risk_assessment: 'Low confidence analysis - manual review needed'
      },
      language_detected: 'en',
      verification_status: 'unverified',
      verification_notes: 'AI analysis not available'
    };
  }

  private getFallbackReportAnalysis(title: string, description: string): ReportAnalysis {
    return {
      category: 'general',
      priority: 'medium',
      confidence: 0.3,
      keywords: [],
      reasoning: 'AI analysis not available - manual review required',
      suggested_actions: ['Manual review', 'Field verification'],
      risk_factors: ['Unknown risk level'],
      similar_incidents: []
    };
  }

  private getFallbackBatchAnalysis(reports: any[]): BatchAnalysisResult {
    return {
      total_processed: reports.length,
      high_priority_count: 0,
      critical_alerts: 0,
      summary: 'Batch analysis not available - manual review required',
      recommendations: ['Manual review of all reports', 'Individual assessment needed'],
      trend_analysis: 'Trend analysis not available'
    };
  }

  /**
   * Check if Gemini AI service is available
   */
  isServiceAvailable(): boolean {
    return this.isEnabled;
  }

  /**
   * Get service status and capabilities
   */
  getServiceStatus(): {
    available: boolean;
    models: string[];
    capabilities: string[];
  } {
    return {
      available: this.isEnabled,
      models: this.isEnabled ? ['gemini-1.5-flash', 'gemini-1.5-pro'] : [],
      capabilities: this.isEnabled ? [
        'text_analysis',
        'image_analysis',
        'multimodal_processing',
        'batch_analysis',
        'multilingual_support',
        'hazard_prediction',
        'structured_output'
      ] : []
    };
  }
}

// Export singleton instance
export const geminiAI = new GeminiAIService();
export default geminiAI;
