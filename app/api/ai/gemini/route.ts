/**
 * Gemini AI API Routes
 * Handles AI-powered analysis requests using Google's Gemini models
 */

import { NextRequest, NextResponse } from 'next/server';
import { geminiAI } from '@/lib/gemini-ai';

// Ensure Node.js runtime for @google/generative-ai SDK
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    if (!geminiAI.isServiceAvailable()) {
      return NextResponse.json(
        { error: 'Gemini AI service not available. Please check API key configuration.' },
        { status: 503 }
      );
    }

    switch (action) {
      case 'analyze_social_media':
        const socialAnalysis = await geminiAI.analyzeSocialMediaContent(data.content, data.metadata);
        return NextResponse.json({ success: true, data: socialAnalysis });

      case 'analyze_report':
        const reportAnalysis = await geminiAI.analyzeCitizenReport(data.title, data.description, data.location);
        return NextResponse.json({ success: true, data: reportAnalysis });

      case 'batch_analyze':
        const batchAnalysis = await geminiAI.batchAnalyzeReports(data.reports);
        return NextResponse.json({ success: true, data: batchAnalysis });

      case 'analyze_image':
        const imageAnalysis = await geminiAI.analyzeHazardImage(data.imageData, data.description);
        return NextResponse.json({ success: true, data: imageAnalysis });

      case 'generate_prediction':
        const prediction = await geminiAI.generateHazardPrediction(data.currentData);
        return NextResponse.json({ success: true, data: prediction });

      case 'generate_multilingual_alert':
        const alert = await geminiAI.generateMultilingualAlert(data.alertData, data.languages);
        return NextResponse.json({ success: true, data: alert });

      default:
        return NextResponse.json(
          { error: 'Invalid action specified' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Gemini AI API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const status = geminiAI.getServiceStatus();
    return NextResponse.json({ success: true, data: status });
  } catch (error) {
    console.error('Error getting Gemini AI status:', error);
    return NextResponse.json(
      { error: 'Failed to get service status' },
      { status: 500 }
    );
  }
}
