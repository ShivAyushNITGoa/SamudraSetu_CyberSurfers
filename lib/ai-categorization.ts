// AI-powered categorization and priority suggestion service
// Enhanced with Gemini AI integration for advanced analysis

export interface IssueAnalysis {
  suggestedCategory: string;
  suggestedPriority: 'low' | 'medium' | 'high' | 'urgent';
  confidence: number;
  keywords: string[];
  reasoning: string;
}

// Category definitions with keywords and patterns
const CATEGORY_PATTERNS = {
  infrastructure: {
    keywords: ['road', 'street', 'bridge', 'pothole', 'traffic', 'light', 'signal', 'sidewalk', 'drainage', 'sewer', 'water', 'electricity', 'power', 'cable', 'internet', 'construction', 'repair', 'maintenance'],
    priority_indicators: {
      urgent: ['emergency', 'dangerous', 'accident', 'flooding', 'power outage', 'gas leak'],
      high: ['blocked', 'broken', 'damaged', 'hazard', 'unsafe'],
      medium: ['maintenance', 'repair', 'improvement'],
      low: ['cosmetic', 'minor', 'suggestion']
    }
  },
  environment: {
    keywords: ['garbage', 'waste', 'pollution', 'air', 'water', 'noise', 'tree', 'park', 'garden', 'recycling', 'litter', 'dump', 'smell', 'smoke', 'dust', 'chemical', 'toxic'],
    priority_indicators: {
      urgent: ['toxic', 'hazardous', 'contamination', 'emergency'],
      high: ['health risk', 'pollution', 'blocking', 'overflowing'],
      medium: ['maintenance', 'cleaning', 'improvement'],
      low: ['cosmetic', 'minor', 'suggestion']
    }
  },
  safety: {
    keywords: ['crime', 'theft', 'vandalism', 'assault', 'robbery', 'safety', 'security', 'police', 'emergency', 'accident', 'injury', 'fire', 'medical', 'ambulance', 'hospital', 'dangerous', 'threat', 'violence'],
    priority_indicators: {
      urgent: ['emergency', 'medical', 'fire', 'crime in progress', 'life threatening'],
      high: ['safety risk', 'dangerous', 'threat', 'recent crime'],
      medium: ['security concern', 'prevention', 'monitoring'],
      low: ['general inquiry', 'information']
    }
  },
  transportation: {
    keywords: ['bus', 'train', 'metro', 'taxi', 'parking', 'vehicle', 'public transport', 'route', 'schedule', 'delay', 'breakdown', 'ticket', 'fare', 'station', 'stop', 'accessibility', 'wheelchair'],
    priority_indicators: {
      urgent: ['emergency', 'breakdown', 'stuck', 'evacuation'],
      high: ['major delay', 'service disruption', 'accessibility issue'],
      medium: ['schedule change', 'route modification', 'maintenance'],
      low: ['information', 'suggestion', 'feedback']
    }
  },
  utilities: {
    keywords: ['water', 'electricity', 'gas', 'internet', 'phone', 'cable', 'utility', 'service', 'billing', 'meter', 'connection', 'outage', 'restoration', 'maintenance', 'upgrade'],
    priority_indicators: {
      urgent: ['outage', 'emergency', 'no service', 'dangerous'],
      high: ['service disruption', 'billing error', 'connection issue'],
      medium: ['maintenance', 'upgrade', 'scheduled work'],
      low: ['information', 'billing inquiry', 'general question']
    }
  },
  health: {
    keywords: ['hospital', 'clinic', 'medical', 'health', 'doctor', 'nurse', 'ambulance', 'emergency', 'treatment', 'medicine', 'pharmacy', 'vaccination', 'testing', 'quarantine', 'pandemic'],
    priority_indicators: {
      urgent: ['emergency', 'medical emergency', 'life threatening', 'ambulance needed'],
      high: ['health risk', 'contamination', 'outbreak', 'urgent care'],
      medium: ['appointment', 'routine care', 'information'],
      low: ['general inquiry', 'feedback', 'suggestion']
    }
  },
  education: {
    keywords: ['school', 'university', 'college', 'student', 'teacher', 'education', 'learning', 'classroom', 'library', 'campus', 'admission', 'exam', 'curriculum', 'facility', 'safety'],
    priority_indicators: {
      urgent: ['emergency', 'safety issue', 'evacuation', 'medical emergency'],
      high: ['safety concern', 'facility issue', 'accessibility problem'],
      medium: ['maintenance', 'improvement', 'policy question'],
      low: ['information', 'general inquiry', 'feedback']
    }
  },
  general: {
    keywords: ['complaint', 'suggestion', 'feedback', 'information', 'inquiry', 'question', 'help', 'support', 'other', 'miscellaneous'],
    priority_indicators: {
      urgent: ['emergency', 'urgent', 'immediate attention'],
      high: ['important', 'priority', 'time sensitive'],
      medium: ['general', 'routine', 'standard'],
      low: ['information', 'inquiry', 'suggestion']
    }
  }
};

export async function analyzeIssue(title: string, description: string): Promise<IssueAnalysis> {
  // Try Gemini AI first, fallback to pattern matching
  try {
    const { geminiAI } = await import('./gemini-ai');
    if (geminiAI.isServiceAvailable()) {
      const geminiAnalysis = await geminiAI.analyzeCitizenReport(title, description);
      return {
        suggestedCategory: geminiAnalysis.category,
        suggestedPriority: geminiAnalysis.priority,
        confidence: geminiAnalysis.confidence,
        keywords: geminiAnalysis.keywords,
        reasoning: geminiAnalysis.reasoning
      };
    }
  } catch (error) {
    console.warn('Gemini AI not available, using fallback analysis:', error);
  }

  // Fallback to pattern matching
  return analyzeIssueFallback(title, description);
}

export function analyzeIssueFallback(title: string, description: string): IssueAnalysis {
  const text = `${title} ${description}`.toLowerCase();
  const words = text.split(/\s+/);
  
  let bestCategory = 'general';
  let bestScore = 0;
  let matchedKeywords: string[] = [];
  
  // Analyze each category
  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    if (category === 'general') continue; // Skip general, use as fallback
    
    const categoryKeywords = patterns.keywords;
    const matched = categoryKeywords.filter(keyword => 
      text.includes(keyword) || words.some(word => word.includes(keyword))
    );
    
    const score = matched.length / categoryKeywords.length;
    
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
      matchedKeywords = matched;
    }
  }
  
  // Determine priority based on urgency indicators
  let suggestedPriority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
  const categoryPatterns = CATEGORY_PATTERNS[bestCategory as keyof typeof CATEGORY_PATTERNS];
  
  for (const [priority, indicators] of Object.entries(categoryPatterns.priority_indicators)) {
    const hasUrgentIndicator = indicators.some(indicator => 
      text.includes(indicator) || words.some(word => word.includes(indicator))
    );
    
    if (hasUrgentIndicator) {
      suggestedPriority = priority as 'low' | 'medium' | 'high' | 'urgent';
      break;
    }
  }
  
  // Calculate confidence based on keyword matches and text length
  const confidence = Math.min(0.95, Math.max(0.3, bestScore + (matchedKeywords.length * 0.1)));
  
  // Generate reasoning
  const reasoning = generateReasoning(bestCategory, suggestedPriority, matchedKeywords, confidence);
  
  return {
    suggestedCategory: bestCategory,
    suggestedPriority,
    confidence: Math.round(confidence * 100) / 100,
    keywords: matchedKeywords,
    reasoning
  };
}

function generateReasoning(
  category: string, 
  priority: string, 
  keywords: string[], 
  confidence: number
): string {
  const confidenceLevel = confidence > 0.8 ? 'high' : confidence > 0.6 ? 'medium' : 'low';
  
  let reasoning = `Based on ${confidenceLevel} confidence analysis, this issue appears to be `;
  
  if (keywords.length > 0) {
    reasoning += `related to ${category} based on keywords: ${keywords.slice(0, 3).join(', ')}`;
    if (keywords.length > 3) {
      reasoning += ` and ${keywords.length - 3} more`;
    }
  } else {
    reasoning += `a general ${category} issue`;
  }
  
  reasoning += `. Priority is set to ${priority} based on urgency indicators in the description.`;
  
  return reasoning;
}

// Batch analysis for multiple issues
export async function analyzeIssues(issues: Array<{title: string, description: string}>): Promise<IssueAnalysis[]> {
  // Try Gemini AI batch analysis first
  try {
    const { geminiAI } = await import('./gemini-ai');
    if (geminiAI.isServiceAvailable()) {
      const batchResult = await geminiAI.batchAnalyzeReports(issues);
      // For now, return individual analyses with batch insights
      const individualAnalyses = await Promise.all(
        issues.map(issue => analyzeIssue(issue.title, issue.description))
      );
      return individualAnalyses;
    }
  } catch (error) {
    console.warn('Gemini AI batch analysis not available, using individual analysis:', error);
  }

  // Fallback to individual analysis
  return Promise.all(issues.map(issue => analyzeIssue(issue.title, issue.description)));
}

// Get category statistics
export function getCategoryStats(analyses: IssueAnalysis[]) {
  const stats = analyses.reduce((acc, analysis) => {
    acc[analysis.suggestedCategory] = (acc[analysis.suggestedCategory] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(stats)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

// Get priority distribution
export function getPriorityStats(analyses: IssueAnalysis[]) {
  const stats = analyses.reduce((acc, analysis) => {
    acc[analysis.suggestedPriority] = (acc[analysis.suggestedPriority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(stats)
    .map(([priority, count]) => ({ priority, count }))
    .sort((a, b) => b.count - a.count);
}
