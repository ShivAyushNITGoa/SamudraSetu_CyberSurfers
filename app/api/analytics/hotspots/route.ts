import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const revalidate = 300 // cache for 5 minutes on the edge/CDN

export async function GET(request: NextRequest) {
  try {
    // Attempt to trigger server-side hotspot calculation if function exists
    await supabase.rpc('calculate_hazard_hotspots').catch(() => undefined)

    const { data, error } = await supabase
      .from('hazard_hotspots')
      .select('*')
      .order('confidence_score', { ascending: false })
      .limit(200)

    if (error) throw error

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
        }
      }
    )
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    // Refresh all ML hotspots members
    const { data: ml, error: mlErr } = await supabase.from('hazard_hotspots_ml').select('id').limit(500)
    if (mlErr) return NextResponse.json({ error: mlErr.message }, { status: 500 })
    for (const row of ml || []) {
      await supabase.rpc('refresh_hotspot_ml', { hotspot: row.id })
    }
    // Return counts for dashboard usage
    const { data: refreshed, error } = await supabase.from('v_hotspots_ml_with_counts').select('*').order('member_count', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data: refreshed })
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 })
  }
}


