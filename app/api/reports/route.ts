import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const severity = searchParams.get('severity')
    const status = searchParams.get('status')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const q = searchParams.get('q')
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10) || 100, 500)

    let query = supabase.from('ocean_hazard_reports').select('*')

    if (type) query = query.eq('hazard_type', type)
    if (severity) query = query.eq('severity', severity)
    if (status) query = query.eq('status', status)
    if (from) query = query.gte('created_at', new Date(from).toISOString())
    if (to) query = query.lte('created_at', new Date(to).toISOString())
    if (q) query = query.ilike('title', `%${q}%`)

    const { data, error } = await query.order('created_at', { ascending: false }).limit(limit)
    if (error) throw error

    // Short cache for GETs to improve UX
    return new NextResponse(JSON.stringify({ success: true, data }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=60, stale-while-revalidate=120'
      }
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      description,
      hazard_type,
      severity,
      address,
      location,
      media_urls,
      user_id,
    } = body

    const payload: any = {
      title,
      description,
      hazard_type,
      severity,
      address: address || '',
      location: location ? `POINT(${location.longitude} ${location.latitude})` : null,
      media_urls: media_urls || [],
      user_id,
      status: 'unverified',
      is_public: true,
      confidence_score: 0.5,
      social_media_indicators: {},
    }

    const { data, error } = await supabase
      .from('ocean_hazard_reports')
      .insert([payload])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}


