# Gemini AI Integration Setup Guide

This guide will help you set up Google's Gemini AI integration for the SamudraSetu ocean hazard monitoring platform.

## Prerequisites

1. **Google AI Studio Account**: You need a Google account to access Google AI Studio
2. **API Key**: Obtain a Gemini API key from Google AI Studio
3. **Node.js Environment**: Ensure you have Node.js 18+ installed

## Step 1: Get Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click on "Get API Key" in the left sidebar
4. Create a new API key or use an existing one
5. Copy the API key (it will look like: `AIzaSy...`)

## Step 2: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp env.samudra-setu.example .env.local
   ```

2. Edit `.env.local` and add your Gemini API key:
   ```env
   # AI/ML Services
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ENABLE_GEMINI_AI=true
   ```

## Step 3: Install Dependencies

The required package is already installed, but if you need to reinstall:

```bash
npm install @google/generative-ai
```

## Step 4: Verify Installation

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the AI Insights dashboard: `http://localhost:3002/dashboard/ai-insights`
   - Note: If port 3002 is different on your machine, use the port printed by `npm run dev`.

3. Look for the "Gemini AI Available" status indicator

## Features Enabled with Gemini AI

### 1. Advanced Social Media Analysis
- **Multilingual Support**: Analyzes content in English, Hindi, Tamil, Bengali
- **Hazard Classification**: Automatically categorizes ocean hazards
- **Sentiment Analysis**: Detects public sentiment and urgency
- **Location Extraction**: Identifies geographic references
- **Verification Scoring**: Assesses content reliability

### 2. Intelligent Report Analysis
- **Smart Categorization**: AI-powered issue classification
- **Priority Assessment**: Automatic priority scoring
- **Risk Analysis**: Identifies potential risk factors
- **Similar Incident Detection**: Finds related historical reports
- **Actionable Recommendations**: Suggests response actions

### 3. Predictive Analytics
- **Hazard Prediction**: Forecasts potential ocean hazards
- **Trend Analysis**: Identifies patterns in hazard data
- **Risk Assessment**: Evaluates threat levels
- **Early Warning**: Generates proactive alerts

### 4. Multimodal Processing
- **Image Analysis**: Analyzes photos for hazard indicators
- **Video Processing**: Extracts information from video content
- **Document Analysis**: Processes official reports and documents

### 5. Multilingual Alert Generation
- **Automatic Translation**: Generates alerts in multiple languages
- **Cultural Adaptation**: Tailors messages for local contexts
- **Urgency Scaling**: Adjusts tone based on severity

## API Usage Examples

### Social Media Analysis
```typescript
import { geminiAI } from '@/lib/gemini-ai';

const analysis = await geminiAI.analyzeSocialMediaContent(
  "High waves hitting the coast in Chennai! Very dangerous!",
  { platform: 'twitter', location: 'Chennai' }
);
```

### Report Analysis
```typescript
const reportAnalysis = await geminiAI.analyzeCitizenReport(
  "Unusual tidal activity",
  "The water level is much higher than normal today. Beach is flooded.",
  { lat: 13.0827, lng: 80.2707 }
);
```

### Image Analysis
```typescript
const imageAnalysis = await geminiAI.analyzeHazardImage(
  base64ImageData,
  "Photo of coastal flooding"
);
```

### Multilingual Alerts
```typescript
const alerts = await geminiAI.generateMultilingualAlert(
  {
    hazard_type: 'tsunami',
    severity: 'high',
    affected_areas: ['Chennai', 'Puducherry']
  },
  ['en', 'hi', 'ta']
);
```

## Rate Limits and Quotas

### Free Tier Limits
- **Gemini 2.0 Flash**: 1,500 requests per minute, 1 million tokens per minute
- **Gemini 2.0 Pro**: 25 requests per day (limited free access)
- **Daily Token Limit**: Varies by model

### Best Practices
1. **Batch Processing**: Group multiple requests when possible
2. **Caching**: Cache results to reduce API calls
3. **Fallback Logic**: Always have fallback analysis methods
4. **Error Handling**: Implement robust error handling

## Monitoring and Debugging

### Service Status
Check if Gemini AI is available:
```typescript
const status = geminiAI.getServiceStatus();
console.log('Gemini Available:', status.available);
console.log('Capabilities:', status.capabilities);
```

### Error Handling
```typescript
try {
  const result = await geminiAI.analyzeSocialMediaContent(content);
} catch (error) {
  console.error('Gemini AI Error:', error);
  // Fallback to pattern matching
  const fallback = analyzeWithPatternMatching(content);
}
```

## Security Considerations

1. **API Key Protection**: Never expose your API key in client-side code
2. **Environment Variables**: Keep API keys in server-side environment variables
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Data Privacy**: Be aware that free tier data may be used for model improvement

## Troubleshooting

### Common Issues

1. **"Gemini AI service not available"**
   - Check if `GEMINI_API_KEY` is set correctly
   - Verify `ENABLE_GEMINI_AI=true` in environment variables
   - Ensure API key is valid and active

2. **Rate limit exceeded**
   - Implement exponential backoff
   - Use batch processing
   - Consider upgrading to paid tier

3. **Invalid API responses**
   - Check JSON parsing
   - Implement fallback mechanisms
   - Log API responses for debugging

### Debug Mode
Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=gemini:*
```

## Performance Optimization

1. **Async Processing**: Use async/await for non-blocking operations
2. **Connection Pooling**: Reuse API connections when possible
3. **Response Caching**: Cache frequent analysis results
4. **Batch Operations**: Process multiple items together

## Integration with Existing Features

The Gemini AI integration seamlessly works with:

- **Social Media Monitoring**: Enhanced content analysis
- **Citizen Reports**: Intelligent categorization and prioritization
- **Alert System**: AI-generated multilingual alerts
- **Dashboard**: Advanced insights and predictions
- **Mobile App**: Real-time AI analysis (when implemented)

## Support and Resources

- **Google AI Studio**: [https://aistudio.google.com/](https://aistudio.google.com/)
- **Gemini API Documentation**: [https://ai.google.dev/docs](https://ai.google.dev/docs)
- **Community Support**: [Google AI Developer Community](https://developers.googleblog.com/2023/12/how-its-made-gemini-multimodal-prompting.html)

## Next Steps

1. **Test the Integration**: Use the AI Insights dashboard to verify functionality
2. **Monitor Performance**: Track API usage and response times
3. **Customize Prompts**: Adjust AI prompts for your specific use cases
4. **Scale Up**: Consider paid tiers for production workloads
5. **Feedback Loop**: Implement user feedback to improve AI accuracy

---

**Note**: This integration leverages Google's free tier, which has usage limits. For production deployments with high volume, consider upgrading to paid tiers for better performance and higher limits.
