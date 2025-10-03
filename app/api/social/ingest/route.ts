import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const revalidate = 60

export async function POST() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      return NextResponse.json({ error: 'Supabase env missing' }, { status: 500 })
    }
    const supabase = createClient(url, key)

    // Placeholder ingestion: upsert a sample record to validate pipeline
    const sample = {
      platform: 'news_rss',
      post_id: 'sample-' + Date.now(),
      content: 'Sample ingestion placeholder',
      author: 'system',
      sentiment_score: 0,
      hazard_keywords: ['sample'],
      relevance_score: 0.1,
      language: 'en',
      verified: false
    }
    const { error } = await supabase.from('social_media_feeds').insert([sample])
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}



import { createClient } from '@supabase/supabase-js'

export const revalidate = 60

export async function POST() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      return NextResponse.json({ error: 'Supabase env missing' }, { status: 500 })
    }
    const supabase = createClient(url, key)

    // Placeholder ingestion: upsert a sample record to validate pipeline
    const sample = {
      platform: 'news_rss',
      post_id: 'sample-' + Date.now(),
      content: 'Sample ingestion placeholder',
      author: 'system',
      sentiment_score: 0,
      hazard_keywords: ['sample'],
      relevance_score: 0.1,
      language: 'en',
      verified: false
    }
    const { error } = await supabase.from('social_media_feeds').insert([sample])
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}


