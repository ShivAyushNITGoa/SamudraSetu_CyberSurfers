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

    // Fetch recent social posts
    const { data, error } = await supabase
      .from('social_media_feeds')
      .select('id, content')
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw error

    // Placeholder NLP: basic keyword sentiment
    const rows = (data || []).map((r: any) => ({
      source_type: 'social_media',
      source_id: r.id,
      content: r.content,
      language: 'en',
      sentiment_score: 0,
      sentiment_label: 'neutral',
      hazard_classification: { keywords: [] },
      confidence_score: 0.1
    }))

    if (rows.length) {
      const { error: insErr } = await supabase.from('nlp_processing_results').insert(rows)
      if (insErr) throw insErr
    }

    return NextResponse.json({ success: true, processed: rows.length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}



